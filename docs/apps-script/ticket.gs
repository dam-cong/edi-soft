/**
 * EDI Ticket — Google Apps Script gắn vào file Google Sheet.
 *
 * Gồm 3 chức năng (website gọi qua một Web app):
 *   1) Form liên hệ            → ghi 1 dòng vào sheet "Thông tin liên hệ"          (doPost, action = contact)
 *   2) Khách tạo ticket hỗ trợ → ghi 1 dòng vào sheet "Ticket", trả về mã ticket   (doPost, action = ticket_create)
 *   3) Theo dõi ticket         → đọc sheet "Ticket" theo mã + SĐT                    (doGet, lookup / lookup_many)
 * Nhân viên cũng có thể tự thêm dòng ở sheet "Ticket": mã được sinh tự động khi có Khách hàng + SĐT.
 *
 * Cách dùng: xem docs/ticket-setup.md. Chạy setup() một lần (kể cả khi cập nhật bản mới), sau đó Deploy thành Web app.
 */

// ====== CẤU HÌNH (có thể sửa) ======
const SHEET_CONTACT = 'Thông tin liên hệ';
const SHEET_TICKET = 'Ticket';
const NOTIFY_EMAIL = '';          // điền email để nhận thông báo khi có liên hệ / ticket mới; để trống = không gửi
const MAX_LOOKUP_TRIES = 5;       // số lần tra cứu sai tối đa cho một mã trong LOOKUP_WINDOW_SEC
const MAX_GLOBAL_FAILS = 60;      // số lần tra cứu sai tối đa của toàn hệ thống trong LOOKUP_WINDOW_SEC
const LOOKUP_WINDOW_SEC = 900;    // 15 phút
const MAX_TICKETS_PER_PHONE_DAY = 5;   // số ticket tối đa một SĐT được tạo trong một ngày
const MAX_TICKETS_PER_DAY = 200;       // trần toàn hệ thống mỗi ngày (chống spam)
const TZ = 'Asia/Ho_Chi_Minh';
const SEQ_DIGITS = 4;             // số chữ số của NNNN trong mã ticket (EDI-YYMM-NNNN)

// ====== CẤU TRÚC SHEET ======
const CONTACT_HEADERS = ['Thời gian gửi', 'Họ và tên', 'Số điện thoại', 'Email', 'Tên doanh nghiệp', 'Nhu cầu cần tư vấn', 'Ngôn ngữ', 'Trạng thái xử lý'];
const TICKET_HEADERS = ['Mã ticket', 'Ngày tạo', 'Khách hàng', 'Số điện thoại', 'Email', 'Doanh nghiệp', 'Loại yêu cầu', 'Mức độ', 'Tiêu đề', 'Mô tả chi tiết', 'Link đính kèm', 'Nguồn', 'Trạng thái', 'Người phụ trách', 'Ghi chú cho khách', 'Ghi chú nội bộ', 'Cập nhật lần cuối', 'Ngày hoàn thành'];
const COL = {
  code: 1, created: 2, name: 3, phone: 4, email: 5, company: 6, category: 7, priority: 8, subject: 9,
  description: 10, link: 11, source: 12, status: 13, owner: 14, publicNote: 15, internalNote: 16, updated: 17, completed: 18
};

// Nhãn trong Sheet ↔ khóa không dấu trao đổi với website (website tự dịch theo ngôn ngữ)
const STATUSES = [
  { label: 'Mới', key: 'new', color: '#e5e7eb' },
  { label: 'Đã tiếp nhận', key: 'received', color: '#bfdbfe' },
  { label: 'Đang xử lý', key: 'in_progress', color: '#fde68a' },
  { label: 'Chờ khách phản hồi', key: 'waiting', color: '#fed7aa' },
  { label: 'Hoàn thành', key: 'done', color: '#bbf7d0' },
  { label: 'Đã hủy', key: 'cancelled', color: '#fecaca' }
];
const CATEGORIES = [
  { label: 'Báo lỗi', key: 'bug' },
  { label: 'Hỗ trợ sử dụng', key: 'usage' },
  { label: 'Yêu cầu tính năng', key: 'feature' },
  { label: 'Khác', key: 'other' }
];
const PRIORITIES = [
  { label: 'Thường', key: 'normal' },
  { label: 'Gấp', key: 'urgent' }
];
const DONE_LABEL = 'Hoàn thành';
const SOURCE_WEB = 'Website';
const SOURCE_STAFF = 'Nhân viên';
const CONTACT_STATES = ['Chưa liên hệ', 'Đã liên hệ'];

// ====== 1. CHẠY MỘT LẦN (và mỗi khi cập nhật script): dựng / di trú 2 sheet ======
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let contact = ss.getSheetByName(SHEET_CONTACT);
  if (!contact) {
    const first = ss.getSheets()[0];
    if (['Sheet1', 'Trang tính1', 'Trang tính 1'].indexOf(first.getName()) !== -1) {
      first.setName(SHEET_CONTACT);
      contact = first;
    } else {
      contact = ss.insertSheet(SHEET_CONTACT, 0);
    }
  }
  const ticket = ss.getSheetByName(SHEET_TICKET) || ss.insertSheet(SHEET_TICKET);

  migrateTicketSheet_(ticket);   // bản cũ 12 cột → bản mới 18 cột, giữ nguyên dữ liệu
  prepareSheet_(contact, CONTACT_HEADERS);
  prepareSheet_(ticket, TICKET_HEADERS);

  // Sheet "Thông tin liên hệ"
  const cRows = contact.getMaxRows() - 1;
  contact.getRange(2, 2, cRows, 7).setNumberFormat('@');   // văn bản thuần: giữ số 0 đầu, không thành công thức
  contact.getRange(2, 1, cRows, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  contact.getRange(2, 8, cRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(CONTACT_STATES, true).setAllowInvalid(true).build()
  );

  // Sheet "Ticket"
  const tRows = ticket.getMaxRows() - 1;
  ticket.getRange(2, COL.code, tRows, 1).setNumberFormat('@');
  ticket.getRange(2, COL.name, tRows, COL.internalNote - COL.name + 1).setNumberFormat('@');
  [COL.created, COL.updated, COL.completed].forEach(function (c) {
    ticket.getRange(2, c, tRows, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  });
  ticket.getRange(2, COL.category, tRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(CATEGORIES.map(function (x) { return x.label; }), true).setAllowInvalid(true).build()
  );
  ticket.getRange(2, COL.priority, tRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(PRIORITIES.map(function (x) { return x.label; }), true).setAllowInvalid(true).build()
  );
  ticket.getRange(2, COL.status, tRows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES.map(function (s) { return s.label; }), true).setAllowInvalid(false).build()
  );

  // Tô màu trạng thái, in đậm đỏ mức độ "Gấp"
  const statusRange = ticket.getRange(2, COL.status, tRows, 1);
  const priorityRange = ticket.getRange(2, COL.priority, tRows, 1);
  const rules = STATUSES.map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s.label).setBackground(s.color).setRanges([statusRange]).build();
  });
  // Màu theo loại yêu cầu (cột G) và mức độ (cột H): Gấp = nền đỏ nhạt + chữ đỏ đậm
  const categoryRange = ticket.getRange(2, COL.category, tRows, 1);
  [['Báo lỗi', '#fef3c7'], ['Hỗ trợ sử dụng', '#e0f2fe'], ['Yêu cầu tính năng', '#e0e7ff'], ['Khác', '#e2e8f0']].forEach(function (c) {
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(c[0]).setBackground(c[1]).setRanges([categoryRange]).build());
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Gấp').setBackground('#fee2e2').setFontColor('#b91c1c').setBold(true).setRanges([priorityRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Thường').setBackground('#dcfce7').setRanges([priorityRange]).build());
  ticket.setConditionalFormatRules(rules);

  // Độ rộng cột dễ đọc
  [[COL.subject, 240], [COL.description, 340], [COL.publicNote, 280], [COL.internalNote, 280], [COL.link, 200], [COL.company, 170], [COL.category, 150]].forEach(function (w) {
    ticket.setColumnWidth(w[0], w[1]);
  });

  // Cột tự động: chỉ cảnh báo khi sửa tay (script vẫn ghi được). Xóa bảo vệ cũ để không lẫn vị trí cột.
  ticket.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
    if (String(p.getDescription()).indexOf('EDI-auto-') === 0) p.remove();
  });
  [COL.code, COL.created, COL.source, COL.updated, COL.completed].forEach(function (c) {
    ticket.getRange(2, c, tRows, 1).protect().setDescription('EDI-auto-' + c).setWarningOnly(true);
  });

  // Trigger chỉnh sửa (installable) để tự sinh mã cho dòng nhân viên thêm tay và cập nhật ngày
  const has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onEditInstalled'; });
  if (!has) ScriptApp.newTrigger('onEditInstalled').forSpreadsheet(ss).onEdit().create();

  SpreadsheetApp.getActive().toast('Đã dựng xong 2 sheet. Bước tiếp theo: Deploy → Manage deployments → New version.', 'EDI Ticket', 8);
}

// Bản cũ (12 cột, "Nội dung hỗ trợ" ở cột F) → chèn cột mới, không mất dữ liệu
function migrateTicketSheet_(sheet) {
  if (sheet.getLastColumn() < 7) return;
  const head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (head[5] !== 'Nội dung hỗ trợ' || head[6] !== 'Trạng thái') return;

  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
    if (String(p.getDescription()).indexOf('EDI-auto-') === 0) p.remove();
  });
  sheet.insertColumnsBefore(6, 4);   // F..I mới (Doanh nghiệp, Loại, Mức độ, Tiêu đề); "Nội dung hỗ trợ" thành J
  sheet.insertColumnsAfter(10, 2);   // K, L mới (Link, Nguồn); "Trạng thái" thành M
  sheet.getRange(1, 1, 1, TICKET_HEADERS.length).setValues([TICKET_HEADERS]);
  const last = sheet.getLastRow();
  if (last >= 2) sheet.getRange(2, COL.source, last - 1, 1).setValue(SOURCE_STAFF);
}

function prepareSheet_(sheet, headers) {
  if (sheet.getRange(1, 1).isBlank()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold').setBackground('#0a1628').setFontColor('#ffffff').setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length).setVerticalAlignment('top').setWrap(true);
  sheet.setColumnWidths(1, headers.length, 150);
}

// ====== 2. POST: liên hệ hoặc tạo ticket ======
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'ticket_create') return json_(saveTicket_(body));
    return json_(saveContact_(body));   // thiếu action hoặc action = contact
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

function saveContact_(body) {
  if (body.website) return { ok: true };  // ô bẫy (honeypot): giả vờ thành công, không ghi gì

  const name = clean_(body.name, 100);
  const phone = normalizePhone_(body.phone);
  const email = clean_(body.email, 120);
  const company = clean_(body.company, 150);
  const message = clean_(body.message, 2000);
  const lang = body.lang === 'en' ? 'en' : 'vi';

  const valid = name &&
    /^0(3|5|7|8|9)\d{8}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    body.consent === true;
  if (!valid) return { ok: false, error: 'invalid' };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONTACT);
  if (!sheet) return { ok: false, error: 'server' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet.appendRow([new Date(), name, phone, email, company, message, lang, 'Chưa liên hệ']);
  } finally {
    lock.releaseLock();
  }

  notify_('Liên hệ mới từ website: ' + name,
    'Họ tên: ' + name + '\nSĐT: ' + phone + '\nEmail: ' + email + '\nDoanh nghiệp: ' + company + '\n\nNhu cầu:\n' + message);
  return { ok: true };
}

// Khách tạo ticket trên website → 1 dòng ở sheet "Ticket", trả về mã
function saveTicket_(body) {
  if (body.website) return { ok: true, code: '' };  // honeypot

  const name = clean_(body.name, 100);
  const phone = normalizePhone_(body.phone);
  const email = clean_(body.email, 120);
  const company = clean_(body.company, 150);
  const subject = clean_(body.subject, 120);
  const description = clean_(body.description, 3000);
  const link = clean_(body.link, 300);
  const category = pick_(CATEGORIES, body.category);
  const priority = pick_(PRIORITIES, body.priority);

  const valid = name && subject && description.length >= 10 && category && priority &&
    /^0(3|5|7|8|9)\d{8}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    (link === '' || /^https?:\/\/\S+$/i.test(link)) &&
    body.consent === true;
  if (!valid) return { ok: false, error: 'invalid' };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TICKET);
  if (!sheet) return { ok: false, error: 'server' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  let code;
  try {
    // Giới hạn tần suất: mỗi SĐT và toàn hệ thống theo ngày
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), TZ, 'yyMMdd');
    const phoneKey = 'rl_' + day + '_' + phone;
    const dayKey = 'rl_' + day;
    const total = Number(props.getProperty(dayKey) || 0);
    if (total === 0) purgeOldCounters_(day);
    const count = Number(props.getProperty(phoneKey) || 0);
    if (count >= MAX_TICKETS_PER_PHONE_DAY || total >= MAX_TICKETS_PER_DAY) return { ok: false, error: 'rate_limited' };

    code = nextCode_(sheet);
    const now = new Date();
    sheet.appendRow([code, now, name, phone, email, company, category.label, priority.label, subject, description, link, SOURCE_WEB, 'Mới', '', '', '', now, '']);
    props.setProperty(phoneKey, String(count + 1));
    props.setProperty(dayKey, String(total + 1));
  } finally {
    lock.releaseLock();
  }

  notify_('Ticket mới ' + code + (priority.key === 'urgent' ? ' [GẤP]' : '') + ': ' + subject,
    'Mã: ' + code + '\nKhách hàng: ' + name + ' (' + phone + ', ' + email + ')\nDoanh nghiệp: ' + company +
    '\nLoại: ' + category.label + ' · Mức độ: ' + priority.label + '\n\n' + description + (link ? '\n\nLink: ' + link : ''));
  return { ok: true, code: code };
}

// Xóa bộ đếm của các ngày trước để Script Properties không phình ra
function purgeOldCounters_(today) {
  const props = PropertiesService.getScriptProperties();
  Object.keys(props.getProperties()).forEach(function (k) {
    if (k.indexOf('rl_') === 0 && k.indexOf('rl_' + today) !== 0) props.deleteProperty(k);
  });
}

// ====== 3. GET: tra cứu ticket ======
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action === 'lookup') return json_(lookupTicket_(p.code, p.phone));
    if (p.action === 'lookup_many') return json_(lookupMany_(p.codes, p.phone));
    return json_({ ok: false, error: 'bad_request' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

function normalizeCode_(v) {
  return String(v || '').toUpperCase().replace(/\s+/g, '');
}

function lookupTicket_(codeRaw, phoneRaw) {
  const code = normalizeCode_(codeRaw);
  const phone = normalizePhone_(phoneRaw);
  if (!/^EDI-\d{4}-\d{4,}$/.test(code) || !phone) return { ok: false, error: 'not_found' };
  return checkTicket_(code, phone);
}

// Nhiều mã cùng một SĐT (danh sách "Ticket của tôi"). Không có API liệt kê theo SĐT: phải biết mã.
function lookupMany_(codesRaw, phoneRaw) {
  const phone = normalizePhone_(phoneRaw);
  if (!phone) return { ok: false, error: 'not_found' };
  const seen = {};
  const codes = String(codesRaw || '').split(',').map(normalizeCode_).filter(function (c) {
    if (!/^EDI-\d{4}-\d{4,}$/.test(c) || seen[c]) return false;
    seen[c] = true;
    return true;
  }).slice(0, 10);

  const results = codes.map(function (code) {
    const r = checkTicket_(code, phone);
    r.code = code;
    return r;
  });
  return { ok: true, results: results };
}

// code và phone đã được chuẩn hóa. Sai mã, sai SĐT hay không có mã: cùng một kết quả (không lộ mã nào tồn tại).
function checkTicket_(code, phone) {
  const cache = CacheService.getScriptCache();
  const tryKey = 'try_' + code;
  const tries = Number(cache.get(tryKey) || 0);
  const globalFails = Number(cache.get('global_fail') || 0);
  if (tries >= MAX_LOOKUP_TRIES || globalFails >= MAX_GLOBAL_FAILS) return { ok: false, error: 'rate_limited' };

  const row = findTicketRow_(code);
  if (!row || normalizePhone_(row[COL.phone - 1]) !== phone) {
    cache.put(tryKey, String(tries + 1), LOOKUP_WINDOW_SEC);
    cache.put('global_fail', String(globalFails + 1), LOOKUP_WINDOW_SEC);
    return { ok: false, error: 'not_found' };
  }
  cache.remove(tryKey);
  return publicTicket_(row);
}

function findTicketRow_(code) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TICKET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const hit = sheet.getRange(2, COL.code, sheet.getLastRow() - 1, 1)
    .createTextFinder(code).matchEntireCell(true).matchCase(false).findNext();
  return hit ? sheet.getRange(hit.getRow(), 1, 1, COL.completed).getValues()[0] : null;
}

// Chỉ các trường dành cho khách. Không bao giờ trả email, mô tả, link, người phụ trách, ghi chú nội bộ.
function publicTicket_(row) {
  const status = keyOf_(STATUSES, row[COL.status - 1], 'new');
  return {
    ok: true,
    status: status,
    subject: String(row[COL.subject - 1] || '').trim(),
    category: keyOf_(CATEGORIES, row[COL.category - 1], 'other'),
    priority: keyOf_(PRIORITIES, row[COL.priority - 1], 'normal'),
    createdAt: iso_(row[COL.created - 1]),
    updatedAt: iso_(row[COL.updated - 1]),
    completedAt: iso_(row[COL.completed - 1]),
    publicNote: String(row[COL.publicNote - 1] || '').trim()
  };
}

// ====== 4. TỰ ĐỘNG TRÊN SHEET "Ticket" (trigger chỉnh sửa) ======
function onEditInstalled(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_TICKET) return;

  const r1 = e.range.getRow();
  const r2 = r1 + e.range.getNumRows() - 1;
  const c1 = e.range.getColumn();
  const c2 = c1 + e.range.getNumColumns() - 1;

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    for (let row = Math.max(2, r1); row <= r2; row++) processTicketRow_(sheet, row, c1, c2);
  } finally {
    lock.releaseLock();
  }
}

function processTicketRow_(sheet, row, c1, c2) {
  const v = sheet.getRange(row, 1, 1, COL.completed).getValues()[0];
  const now = new Date();
  const hasCode = String(v[COL.code - 1]).trim() !== '';
  const ready = String(v[COL.name - 1]).trim() !== '' && String(v[COL.phone - 1]).trim() !== '';

  // Dòng nhân viên thêm tay, đã có Khách hàng + SĐT → sinh mã
  if (!hasCode && ready) {
    sheet.getRange(row, COL.code).setValue(nextCode_(sheet));
    sheet.getRange(row, COL.created).setValue(now);
    sheet.getRange(row, COL.updated).setValue(now);
    if (!String(v[COL.status - 1]).trim()) sheet.getRange(row, COL.status).setValue('Mới');
    if (!String(v[COL.source - 1]).trim()) sheet.getRange(row, COL.source).setValue(SOURCE_STAFF);
    return;
  }
  if (!hasCode) return;

  const statusTouched = c1 <= COL.status && COL.status <= c2;
  const noteTouched = c1 <= COL.publicNote && COL.publicNote <= c2;
  if (statusTouched || noteTouched) sheet.getRange(row, COL.updated).setValue(now);

  if (statusTouched) {
    const done = String(sheet.getRange(row, COL.status).getValue()).trim() === DONE_LABEL;
    const cell = sheet.getRange(row, COL.completed);
    if (done) {
      if (cell.isBlank()) cell.setValue(now);
    } else {
      cell.clearContent();
    }
  }
}

// Mã ticket: EDI-YYMM-NNNN. Số thứ tự NNNN bắt đầu lại từ 1 vào đầu mỗi tháng. Gọi bên trong lock.
function nextCode_(sheet) {
  const props = PropertiesService.getScriptProperties();
  const month = Utilities.formatDate(new Date(), TZ, 'yyMM');
  const key = 'seq_' + month;
  let n = Number(props.getProperty(key) || 0);
  let code;
  do {
    n += 1;
    code = 'EDI-' + month + '-' + ('0000000000' + n).slice(-Math.max(SEQ_DIGITS, String(n).length));
  } while (codeExists_(sheet, code));   // an toàn cả khi bộ đếm bị mất: không bao giờ trùng mã đã có
  props.setProperty(key, String(n));
  return code;
}

function codeExists_(sheet, code) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  return !!sheet.getRange(2, COL.code, last - 1, 1).createTextFinder(code).matchEntireCell(true).findNext();
}

// ====== TIỆN ÍCH ======
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

// 0912 345 678 / +84912345678 / 84912345678 / 912345678 → 0912345678
function normalizePhone_(v) {
  let s = String(v == null ? '' : v).replace(/[\s.\-()]/g, '');
  if (/^\+?84/.test(s)) s = '0' + s.replace(/^\+?84/, '');
  if (/^[35789]\d{8}$/.test(s)) s = '0' + s;   // ô Sheet bị mất số 0 đầu
  return s;
}

function iso_(d) {
  if (!d) return '';
  if (Object.prototype.toString.call(d) === '[object Date]') {
    return Utilities.formatDate(d, TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  return String(d);
}

// Tìm mục theo khóa (khóa không dấu do website gửi) hoặc theo nhãn trong Sheet
function pick_(list, keyOrLabel) {
  const v = String(keyOrLabel == null ? '' : keyOrLabel).trim();
  const hit = list.filter(function (x) { return x.key === v || x.label === v; })[0];
  return hit || null;
}

// Nhãn trong Sheet → khóa; nhãn lạ hoặc trống → mặc định
function keyOf_(list, label, fallback) {
  const hit = pick_(list, label);
  return hit ? hit.key : fallback;
}

function notify_(subject, body) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    console.error(err);
  }
}

// ====== KIỂM THỬ: chạy trong trình soạn thảo, xem kết quả ở Execution log ======
function testContactAndLookup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contact = ss.getSheetByName(SHEET_CONTACT);
  const ticket = ss.getSheetByName(SHEET_TICKET);
  if (!contact || !ticket) throw new Error('Chưa có đủ 2 sheet. Hãy chạy setup() trước.');

  const contactRowBefore = contact.getLastRow();
  const ticketRowBefore = ticket.getLastRow();

  // 1) Form liên hệ
  Logger.log('Liên hệ hợp lệ: ' + JSON.stringify(saveContact_({ name: 'TEST EDI', phone: '0912345678', email: 'test@example.com', company: 'TEST', message: 'Dòng kiểm thử, có thể xóa', consent: true, lang: 'vi' })));
  Logger.log('Liên hệ sai SĐT: ' + JSON.stringify(saveContact_({ name: 'TEST', phone: '123', email: 'test@example.com', consent: true })));
  Logger.log('Liên hệ honeypot: ' + JSON.stringify(saveContact_({ website: 'spam' })));

  // 2) Ticket nhân viên thêm tay (mô phỏng onEdit)
  const row = ticket.getLastRow() + 1;
  ticket.getRange(row, COL.name).setValue('TEST EDI');
  ticket.getRange(row, COL.phone).setValue('0912345678');
  ticket.getRange(row, COL.description).setValue('Ticket kiểm thử');
  ticket.getRange(row, COL.publicNote).setValue('Ghi chú kiểm thử cho khách');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { processTicketRow_(ticket, row, 1, COL.completed); } finally { lock.releaseLock(); }
  const code = String(ticket.getRange(row, COL.code).getValue());
  Logger.log('Mã ticket sinh ra: ' + code + ' · Nguồn: ' + ticket.getRange(row, COL.source).getValue());

  Logger.log('Tra cứu đúng: ' + JSON.stringify(lookupTicket_(code, '0912 345 678')));
  Logger.log('Tra cứu sai SĐT: ' + JSON.stringify(lookupTicket_(code, '0999999999')));
  Logger.log('Tra cứu sai mã: ' + JSON.stringify(lookupTicket_('EDI-0000-0000', '0912345678')));

  // 3) Hoàn thành
  ticket.getRange(row, COL.status).setValue(DONE_LABEL);
  lock.waitLock(15000);
  try { processTicketRow_(ticket, row, COL.status, COL.status); } finally { lock.releaseLock(); }
  Logger.log('Sau khi Hoàn thành: ' + JSON.stringify(lookupTicket_(code, '0912345678')));

  // Dọn dòng kiểm thử
  if (contact.getLastRow() > contactRowBefore) contact.deleteRows(contactRowBefore + 1, contact.getLastRow() - contactRowBefore);
  if (ticket.getLastRow() > ticketRowBefore) ticket.deleteRows(ticketRowBefore + 1, ticket.getLastRow() - ticketRowBefore);
  CacheService.getScriptCache().remove('try_' + code);
  Logger.log('Đã dọn dòng kiểm thử.');
}

// Kiểm thử luồng khách tạo ticket trên website
function testTicketFlow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ticket = ss.getSheetByName(SHEET_TICKET);
  if (!ticket) throw new Error('Chưa có sheet Ticket. Hãy chạy setup() trước.');
  const before = ticket.getLastRow();
  const props = PropertiesService.getScriptProperties();
  const day = Utilities.formatDate(new Date(), TZ, 'yyMMdd');
  const phoneKey = 'rl_' + day + '_0912345678';
  const dayKey = 'rl_' + day;
  const savedPhoneCount = props.getProperty(phoneKey);
  const savedDayCount = props.getProperty(dayKey);

  const base = { name: 'TEST EDI', phone: '0912 345 678', email: 'test@example.com', company: 'TEST', category: 'bug', priority: 'urgent', subject: 'Ticket kiểm thử', description: 'Mô tả kiểm thử đủ dài để hợp lệ.', link: 'https://example.com/anh.png', consent: true };
  const merge = function (o) { return Object.assign({}, base, o); };

  Logger.log('Hợp lệ: ' + JSON.stringify(saveTicket_(base)));
  Logger.log('Thiếu tiêu đề: ' + JSON.stringify(saveTicket_(merge({ subject: '' }))));
  Logger.log('Mô tả quá ngắn: ' + JSON.stringify(saveTicket_(merge({ description: 'ngắn' }))));
  Logger.log('Link sai giao thức: ' + JSON.stringify(saveTicket_(merge({ link: 'javascript:alert(1)' }))));
  Logger.log('Loại không hợp lệ: ' + JSON.stringify(saveTicket_(merge({ category: 'hack' }))));
  Logger.log('Honeypot: ' + JSON.stringify(saveTicket_(merge({ website: 'spam' }))));

  const second = saveTicket_(base);
  Logger.log('Ticket thứ hai: ' + JSON.stringify(second));
  const first = String(ticket.getRange(before + 1, COL.code).getValue());
  Logger.log('Tra cứu 1 mã: ' + JSON.stringify(lookupTicket_(first, '0912345678')));
  Logger.log('Tra cứu nhiều mã (1 đúng, 1 sai): ' + JSON.stringify(lookupMany_(first + ',EDI-0000-0000', '0912345678')));
  Logger.log('Dòng vừa tạo: Nguồn = ' + ticket.getRange(before + 1, COL.source).getValue() + ' · Trạng thái = ' + ticket.getRange(before + 1, COL.status).getValue());

  props.setProperty(phoneKey, String(MAX_TICKETS_PER_PHONE_DAY));
  Logger.log('Vượt giới hạn trong ngày: ' + JSON.stringify(saveTicket_(base)));

  // Dọn: xóa dòng thử, trả bộ đếm về như cũ
  if (ticket.getLastRow() > before) ticket.deleteRows(before + 1, ticket.getLastRow() - before);
  if (savedPhoneCount === null) props.deleteProperty(phoneKey); else props.setProperty(phoneKey, savedPhoneCount);
  if (savedDayCount === null) props.deleteProperty(dayKey); else props.setProperty(dayKey, savedDayCount);
  CacheService.getScriptCache().remove('try_' + first);
  Logger.log('Đã dọn dòng kiểm thử.');
}
