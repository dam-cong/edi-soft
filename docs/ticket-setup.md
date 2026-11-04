# Hướng dẫn thiết lập Google Sheet: Liên hệ + Ticket hỗ trợ

Tài liệu dành cho người quản trị (không deploy lên website). Lần đầu làm theo thứ tự **A → B → C**. Khi **cập nhật bản script mới** làm theo mục **E**. Mục **D** dành cho nhân viên dùng hằng ngày.

- File Sheet: <https://docs.google.com/spreadsheets/d/1LzA9p6-lGXqTTM8MU1DKglBTbmEaqS-SEmP6AfCRDiA/edit?gid=0>
- Mã script: [apps-script/ticket.gs](apps-script/ticket.gs)
- Trang cho khách: `ticket.html` (Trung tâm hỗ trợ)

## Tổng quan

| Chức năng | Ai dùng | Ở đâu |
|---|---|---|
| **1. Liên hệ** | Khách bấm "Gửi yêu cầu tư vấn" trên trang chủ | Ghi 1 dòng vào sheet **Thông tin liên hệ** |
| **2. Gửi ticket hỗ trợ** | Khách vào `ticket.html` → tab "Gửi yêu cầu hỗ trợ" | Ghi 1 dòng vào sheet **Ticket**, khách nhận ngay mã ticket |
| **3. Theo dõi ticket** | Khách vào `ticket.html` → tab "Theo dõi ticket" | Đọc sheet **Ticket**; nhân viên đổi trạng thái ở sheet là khách thấy |

```
Khách ──► trang chủ (form liên hệ) ──► Apps Script ──► Sheet "Thông tin liên hệ"

Khách ──► ticket.html (gửi ticket) ──► Apps Script ──► Sheet "Ticket" (Nguồn = Website) ──► trả mã ticket
Nhân viên ──► Sheet "Ticket" (xử lý, đổi Trạng thái, viết Ghi chú cho khách)
Khách ──► ticket.html (mã + SĐT, hoặc "Ticket của tôi") ──► Apps Script ──► đọc Sheet "Ticket" ──► hiển thị trạng thái
```

Gửi form liên hệ **không** tự tạo ticket. Nhân viên cũng có thể tự thêm ticket ở sheet **Ticket** (Nguồn = Nhân viên).

---

## A. Chuẩn bị (khoảng 10 phút)

1. Mở file Sheet ở link trên, đăng nhập bằng **tài khoản chủ file** (nên là tài khoản công ty).
2. Trên thanh menu chọn **Tiện ích mở rộng (Extensions) → Apps Script**. Một tab mới mở ra.
3. Trong trình soạn thảo, **xóa toàn bộ mã cũ**, rồi **dán toàn bộ nội dung file `ticket.gs`**.
4. Bấm biểu tượng **Lưu** (hình đĩa mềm). Đặt tên dự án ở góc trên bên trái, ví dụ `EDI Ticket`.
5. *(Tùy chọn)* Muốn nhận email khi có liên hệ hoặc ticket mới: sửa dòng `const NOTIFY_EMAIL = '';` thành `const NOTIFY_EMAIL = 'ten@congty.vn';` rồi lưu lại. Script **không** gửi email cho khách.
6. Ở thanh công cụ, ô chọn hàm: chọn **`setup`**, bấm **Chạy (Run)**.
7. Lần đầu Google hỏi quyền:
   - Bấm **Xem lại quyền (Review permissions)** → chọn tài khoản của bạn.
   - Nếu thấy cảnh báo **"Google chưa xác minh ứng dụng này"**: bấm **Nâng cao (Advanced)** → **Đi tới EDI Ticket (không an toàn)** → **Cho phép (Allow)**. Đây là script của chính bạn nên an toàn.
8. Quay lại file Sheet, kiểm tra:
   - Có **2 tab**: `Thông tin liên hệ` và `Ticket`, hàng 1 là tiêu đề nền xanh đậm.
   - Tab `Ticket` có **18 cột (A → R)**, cột **M (Trạng thái)** có dropdown 6 giá trị, cột **G (Loại yêu cầu)** và **H (Mức độ)** có dropdown.

> `setup()` **không xóa dữ liệu có sẵn**. Chỉ ghi tiêu đề khi ô A1 còn trống. Có thể chạy lại bất cứ lúc nào.
> Mỗi lần cập nhật `ticket.gs`, chạy lại `setup()` một lần để có màu mới: cột **Loại yêu cầu** (Báo lỗi vàng, Hỗ trợ sử dụng xanh dương, Yêu cầu tính năng chàm, Khác xám) và **Mức độ** (Gấp = nền đỏ + chữ đỏ đậm, Thường = xanh lá).

### Các cột của tab `Ticket`

| Cột | Nội dung | Ai điền |
|---|---|---|
| A | **Mã ticket** `EDI-YYMM-NNNN` | Tự động |
| B | Ngày tạo | Tự động |
| C | Khách hàng | Website / nhân viên |
| D | **Số điện thoại** (dùng để xác thực khi khách tra cứu) | Website / nhân viên |
| E | Email | Website / nhân viên |
| F | Doanh nghiệp | Website |
| G | Loại yêu cầu: Báo lỗi · Hỗ trợ sử dụng · Yêu cầu tính năng · Khác | Website |
| H | Mức độ: Thường · **Gấp** (chữ đỏ đậm) | Website |
| I | Tiêu đề | Website |
| J | Mô tả chi tiết | Website |
| K | Link đính kèm (ảnh/tài liệu khách dán) | Website |
| L | Nguồn: Website · Nhân viên | Tự động |
| M | **Trạng thái** | **Nhân viên** |
| N | Người phụ trách | Nhân viên |
| O | **Ghi chú cho khách** (khách thấy khi theo dõi) | **Nhân viên** |
| P | Ghi chú nội bộ (khách **không bao giờ** thấy) | Nhân viên |
| Q | Cập nhật lần cuối | Tự động |
| R | Ngày hoàn thành | Tự động |

**Mã ticket** có dạng `EDI-2511-0007`: `2511` là tháng 11/2025, `0007` là ticket thứ 7 của tháng đó. **Số thứ tự bắt đầu lại từ `0001` vào đầu mỗi tháng.**

## B. Triển khai thành Web app (để website gọi được)

1. Trong Apps Script, bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**.
2. Bấm biểu tượng bánh răng cạnh "Chọn loại" → chọn **Ứng dụng web (Web app)**.
3. Điền:
   - **Mô tả**: `EDI Ticket v1`
   - **Thực thi dưới tên (Execute as)**: **Tôi (Me)**
   - **Ai có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)**
4. Bấm **Triển khai (Deploy)**. Sao chép **URL ứng dụng web**, dạng `https://script.google.com/macros/s/AKfycb…/exec`.
5. Dán URL vào hằng `SHEET_API_URL` ở `src/js/main.js` (website đã được gắn URL này; chỉ cần làm lại khi URL đổi). Chưa có URL thì form liên hệ và trang hỗ trợ báo lỗi.

> "Anyone" nghĩa là ai có URL đều gọi được script. Script kiểm tra dữ liệu, có ô bẫy chống spam, giới hạn **5 ticket/SĐT/ngày** và giới hạn số lần tra cứu sai. Tra cứu chỉ trả về trạng thái, tiêu đề, ngày và **Ghi chú cho khách**; không trả email, mô tả, link hay ghi chú nội bộ.

## C. Kiểm thử

1. **Trong Apps Script**, chạy lần lượt hai hàm và xem **Nhật ký thực thi (Execution log)**:
   - **`testContactAndLookup`**: ghi một liên hệ giả, thêm một ticket do nhân viên nhập, kiểm tra sinh mã và tra cứu đúng/sai SĐT.
   - **`testTicketFlow`**: tạo ticket như khách (hợp lệ, thiếu tiêu đề, mô tả quá ngắn, link sai, loại sai, honeypot), tra cứu một mã và nhiều mã, kiểm tra giới hạn trong ngày.
   Các dòng kiểm thử tự được xóa khỏi Sheet.
2. **Trên website**:
   - Trang chủ: gửi thử form liên hệ → tab `Thông tin liên hệ` có dòng mới.
   - Mở `ticket.html` (hoặc bấm "Gửi yêu cầu hỗ trợ" ở trang chủ) → điền và gửi ticket → thấy **mã ticket**; tab `Ticket` có dòng mới với **Nguồn = Website**, **Trạng thái = Mới**.
   - Ở tab `Ticket` đổi **Trạng thái** (cột M) sang `Đang xử lý`, viết **Ghi chú cho khách** (cột O) → ở `ticket.html` tab "Theo dõi ticket" bấm **Làm mới** → thấy trạng thái và ghi chú mới.
   - Tra cứu thử bằng mã + SĐT sai → báo không tìm thấy.

---

## D. Vận hành hằng ngày (nhân viên)

### Xử lý ticket khách gửi từ website
1. Mở tab `Ticket`, lọc **L: Nguồn = Website** và **M: Trạng thái = Mới** (**Dữ liệu → Tạo bộ lọc**).
2. Ưu tiên các ticket **H: Mức độ = Gấp** (chữ đỏ đậm). Đọc **I: Tiêu đề**, **J: Mô tả chi tiết** và **K: Link đính kèm**.
3. Nhận xử lý: điền **N: Người phụ trách**, đổi **M: Trạng thái** sang `Đã tiếp nhận` rồi `Đang xử lý`.
4. Cần khách cung cấp thêm: đổi trạng thái `Chờ khách phản hồi` và viết rõ việc khách cần làm ở **O: Ghi chú cho khách**.
5. Xong: chọn `Hoàn thành` (cột **R: Ngày hoàn thành** tự điền).

### Tự thêm ticket cho khách (gọi điện, Zalo…)
1. Chọn dòng trống đầu tiên bên dưới dữ liệu.
2. Điền **C: Khách hàng**, **D: Số điện thoại** (bắt buộc) và nội dung ở **J: Mô tả chi tiết**; có thể điền các cột khác.
3. Ngay khi có đủ Khách hàng + SĐT, các cột tự động xuất hiện: **A: Mã ticket**, **B: Ngày tạo**, **L: Nguồn = Nhân viên**, **M: Trạng thái = Mới**.
4. Gửi **mã ticket** cho khách và nhắc khách theo dõi tại `https://info.editech.vn/ticket.html`.

> Các cột A, B, L, Q, R do hệ thống điền. Nếu bấm sửa tay, Google sẽ cảnh báo; đừng sửa.

### Cập nhật trạng thái
- Ở cột **M: Trạng thái** chọn trong dropdown: `Mới` → `Đã tiếp nhận` → `Đang xử lý` → `Chờ khách phản hồi` → `Hoàn thành` (hoặc `Đã hủy`).
- Mỗi lần đổi trạng thái hoặc sửa **O: Ghi chú cho khách**, cột **Q: Cập nhật lần cuối** tự đổi.
- Chọn **Hoàn thành** → **R: Ngày hoàn thành** tự điền; đổi sang trạng thái khác thì R tự xóa.

### Hai loại ghi chú, đừng nhầm
| Cột | Khách có thấy không? | Dùng để |
|---|---|---|
| **O: Ghi chú cho khách** | **Có**, hiện ở màn hình theo dõi | Thông báo tiến độ, việc khách cần làm |
| **P: Ghi chú nội bộ** | **Không bao giờ** | Trao đổi nội bộ, chi tiết kỹ thuật, chi phí |

Chỉ viết vào cột O những gì có thể công khai: không ghi mật khẩu, thông tin tài chính, dữ liệu cá nhân.

### Gửi mã cho khách
Gửi mã và đường dẫn theo dõi (mã tự điền sẵn, khách chỉ cần nhập thêm **số điện thoại**):

```
https://info.editech.vn/ticket.html?ticket=EDI-2511-0007
```

### Tìm và quản lý ticket
- Tìm theo mã hoặc tên: **Ctrl + F** (Mac: ⌘ + F).
- Lọc theo trạng thái, mức độ, loại hoặc nguồn: **Dữ liệu (Data) → Tạo bộ lọc (Create a filter)**.
- **Ticket nhập nhầm hoặc spam:** đổi trạng thái thành **Đã hủy**, **không xóa dòng** (giữ lịch sử và mã đã gửi cho khách).

### Tab `Thông tin liên hệ`
- Mỗi lần khách gửi form tư vấn có thêm 1 dòng. Cột **H: Trạng thái xử lý** có dropdown `Chưa liên hệ` / `Đã liên hệ` để nhân viên tự đánh dấu.
- Dữ liệu hai tab không tự liên kết: nếu liên hệ cần theo dõi hỗ trợ lâu dài, tạo ticket riêng ở tab `Ticket`.

---

## E. Cập nhật script về sau (và cập nhật lên bản mới này)

Mỗi lần sửa hoặc thay mã trong Apps Script, bản đang chạy **không tự đổi**. Làm đúng thứ tự:

1. Dán mã mới vào Apps Script và **Lưu**.
2. Chọn hàm **`setup`** → **Chạy**. Lần này `setup()` **tự di trú** tab `Ticket` từ bản cũ 12 cột sang bản 18 cột **mà không mất dữ liệu** (chèn thêm cột Doanh nghiệp, Loại yêu cầu, Mức độ, Tiêu đề, Link đính kèm, Nguồn; các dòng cũ được đánh dấu Nguồn = Nhân viên).
3. **Triển khai (Deploy) → Quản lý bản triển khai (Manage deployments)** → biểu tượng **bút chì** → ở **Phiên bản (Version)** chọn **Phiên bản mới (New version)** → **Triển khai (Deploy)**.

URL **giữ nguyên**. Chỉ khi chọn "Tùy chọn triển khai mới" thì URL mới đổi và phải cập nhật lại `SHEET_API_URL`.

> **Quan trọng:** luôn chạy `setup()` **trước** khi triển khai phiên bản mới. Nếu làm ngược lại, web app mới sẽ ghi dữ liệu vào cột chưa đúng vị trí.

## F. Bảo mật và sao lưu

- Chỉ chia sẻ quyền **Chỉnh sửa** cho người thật sự cần. Chủ file nên là tài khoản công ty. Không để ai sửa mã Apps Script ngoài người quản trị.
- Khôi phục dữ liệu bị sửa nhầm: **Tệp (File) → Lịch sử phiên bản (Version history) → Xem lịch sử phiên bản**.
- Nên tải bản sao định kỳ: **Tệp → Tải xuống → Microsoft Excel (.xlsx)**.
- Sheet chứa tên, SĐT, email của khách: chỉ dùng cho mục đích liên hệ và hỗ trợ, không chia sẻ cho bên thứ ba.
- Trên máy khách, mã ticket và SĐT chỉ được lưu **khi khách bật "Ghi nhớ trên thiết bị này"** và chỉ nằm trong trình duyệt của khách. Máy dùng chung: bấm "Xóa tất cả" ở màn hình theo dõi.
- Spam: mỗi SĐT tối đa 5 ticket/ngày và toàn hệ thống tối đa 200 ticket/ngày (hằng `MAX_TICKETS_PER_PHONE_DAY`, `MAX_TICKETS_PER_DAY`). Vẫn nên thỉnh thoảng xem lại sheet và đặt `Đã hủy` cho ticket rác.

## G. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Form (liên hệ hoặc ticket) báo lỗi khi gửi | `SHEET_API_URL` sai/trống, hoặc chưa Deploy "Anyone" | Kiểm tra mục B; mở URL `/exec` trên trình duyệt, nếu thấy `{"ok":false,"error":"bad_request"}` là script đang chạy bình thường |
| Báo "gửi quá nhiều yêu cầu hôm nay" | SĐT đã tạo đủ 5 ticket trong ngày | Khách gọi điện hoặc nhắn Zalo; hoặc nhân viên tự thêm ticket ở sheet |
| Ticket tạo từ web nằm lệch cột | Triển khai bản mới **trước khi** chạy `setup()` | Chạy `setup()` ở bản mới, kiểm tra dòng lệch và sửa tay; lần sau làm đúng thứ tự mục E |
| Gửi form báo thành công nhưng Sheet không có dòng | Tab bị đổi tên | Đổi tên tab về đúng `Thông tin liên hệ` / `Ticket`, hoặc sửa hằng `SHEET_CONTACT` / `SHEET_TICKET` rồi Deploy phiên bản mới |
| Thêm dòng ticket tay nhưng không có mã | Thiếu **Khách hàng** hoặc **SĐT**; hoặc trigger chưa cài | Điền đủ hai cột; chạy lại `setup()` để cài lại trigger |
| Tra cứu báo "không tìm thấy" | Sai mã hoặc SĐT khác với SĐT trong dòng ticket (cột D) | So lại mã và SĐT; SĐT có thể viết `0912 345 678` hoặc `+84…`, hệ thống tự chuẩn hóa |
| Tra cứu báo "thử quá nhiều lần" | Sai quá 5 lần cho một mã trong 15 phút | Chờ 15 phút rồi thử lại |
| Chạy script báo "Authorization is required" | Chưa cấp quyền | Chạy lại `setup()` và làm theo bước A7 |
| Script lỗi "Exceeded maximum execution time" hoặc "Service invoked too many times" | Vượt hạn mức của Google | Thử lại sau; hạn mức thường đủ cho quy mô hiện tại |
| Muốn xem lỗi chi tiết | | Apps Script → **Số lần thực thi (Executions)** |

## H. Ghi chú kỹ thuật (cho người phát triển)

- Website gọi web app bằng `fetch`: `POST` JSON dạng `text/plain` (tránh preflight CORS) với `action` = `contact` (mặc định) hoặc `ticket_create`; `GET ?action=lookup&code=…&phone=…` và `GET ?action=lookup_many&phone=…&codes=A,B,C` (tối đa 10 mã) để theo dõi. **Không có** API liệt kê ticket theo SĐT: phải biết mã.
- Trạng thái, loại, mức độ trao đổi dạng khóa không dấu: `new, received, in_progress, waiting, done, cancelled`; `bug, usage, feature, other`; `normal, urgent`. Website dịch sang VI/EN.
- Các ô văn bản trong Sheet được đặt định dạng *Plain text* để giữ số 0 đầu của SĐT và không bao giờ bị hiểu thành công thức.
- Mã sinh trong `LockService`; bộ đếm tháng lưu ở Script Properties (`seq_YYMM`) và luôn kiểm tra không trùng mã đang có trong sheet.
- Mã giao diện: `ticket.html` + `src/js/ticket.js` (chỉ nạp ở trang này, dùng chung `SHEET_API_URL`, `PHONE_REGEX`, `normalizePhone` từ `main.js`).
