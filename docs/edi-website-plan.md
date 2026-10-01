# Tài liệu Website Landing Page EDI Soft

Tài liệu mô tả nội dung, thiết kế và cách vận hành website giới thiệu năng lực của **EDI Soft** (EDI Team), hiện chạy tại [edi-soft.vercel.app](https://edi-soft.vercel.app/).

Cách chạy và deploy: [deployment-guide.md](deployment-guide.md). Quy ước git: [git-convention.md](git-convention.md).

---

## 1. Định vị & nguyên tắc nội dung

- **Định vị**: team tư vấn và triển khai **Odoo ERP (Community & Enterprise) kết hợp AI & tự động hóa** cho doanh nghiệp **SME dưới 300 nhân sự**. Thành lập 07/2024.
- **Thông điệp chính**: *"Chúng tôi không bán phần mềm, chúng tôi triển khai giải pháp tối ưu vận hành."*
- **Nguyên tắc khi viết nội dung**:
  - Chỉ nói những gì làm được và chứng minh được. Không dùng "24/7", "tuyệt đối", "trọn đời", "hàng đầu", "SME & Enterprise".
  - Không nhắc tới "sản phẩm phần mềm", để khớp với thông điệp "không bán phần mềm".
  - Mỗi ý chỉ xuất hiện ở một section, không lặp giữa "Về chúng tôi", "Lợi thế" và "Cam kết".
  - Cam kết thời gian phản hồi thống nhất một câu: **"trong 1 ngày làm việc"**.
  - Tiêu đề tiếng Việt viết hoa kiểu câu (chỉ viết hoa chữ đầu và tên riêng). Bản tiếng Anh dùng Title Case.
  - Nút hành động chính: **"Nhận tư vấn"** (header, menu mobile), **"Nhận tư vấn giải pháp"** (hero), **"Gửi yêu cầu tư vấn"** (form).
- **Pháp lý**: EDI hiện là team startup, **chưa có pháp nhân**. Không hiển thị tên công ty, MST hay địa chỉ văn phòng.

---

## 2. Cấu trúc trang

| # | Section (`id`) | Nội dung |
|---|---|---|
| 1 | Header | Logo, menu 4 mục **Giới thiệu · Dịch vụ · Quy trình · Dự án**, nút VI/EN, nút sáng/tối, CTA "Nhận tư vấn". Menu hamburger khi màn hình ≤ 900px. Menu mobile và footer dùng cùng 4 mục. "Lợi thế" được tính là một phần của Giới thiệu, "Đội ngũ" là một phần của Dự án (menu sáng theo mục cha khi cuộn qua) |
| 2 | Hero (`#hero`) | Badge "Odoo ERP · AI Agent · Tự động hóa quy trình", thông điệp chính, 2 CTA (tư vấn → `#contact`, xem dự án → `#portfolio`), đồ họa lõi EDI với các icon Odoo / AI / Chatbot / OCR / RPA / API / Mobile / DevOps. Ngay dưới hero: **dải công nghệ** Odoo 10 → 19 · Python · PostgreSQL · Django · Laravel · Flutter · Claude AI · MCP |
| 3 | Về chúng tôi (`#about`) | Sứ mệnh; 3 chỉ số: **2024** thành lập · **6** dự án tiêu biểu · **SME** dưới 300 nhân sự; 3 điểm: Delivery Team chuyên sâu, hiểu vận hành doanh nghiệp Việt, chi phí phù hợp SME |
| 4 | Lợi thế (`#strengths`) | 6 card: chuyên sâu Odoo CE & EE, BA & Developer đồng hành, ERP kết hợp AI & tự động hóa, quy trình triển khai chuẩn, giải pháp "may đo", đồng hành dài hạn |
| 5 | Dịch vụ (`#services`) | 6 dịch vụ đánh số 01–06: tư vấn & khảo sát, thiết kế giải pháp ERP, triển khai & tùy biến Odoo, đào tạo & chuyển giao, bảo trì, hỗ trợ & nâng cấp, **phát triển ứng dụng mobile (Flutter)** kết nối Odoo |
| 5b | AI & tự động hóa (`#ai`) | Use case thực tế: **Claude AI kết nối Odoo qua MCP** để tạo dự án, tạo & giao nhiệm vụ, log work (timesheet), thống kê tình trạng dự án. Khung chat **có nhãn "Minh họa"**, dùng dự án giả "Công ty ABC" (không dùng tên khách thật). Sơ đồ: Claude AI ⇄ MCP Server ⇄ Odoo. Menu sáng "Dịch vụ" |
| 6 | Hình thức hợp tác (`#engagement`) | 4 card: Khảo sát & tư vấn · Triển khai trọn gói · Phát triển theo yêu cầu · Bảo trì & đồng hành, mỗi card có mục "Phù hợp khi". **Không công khai giá**: "Chi phí được báo giá theo phạm vi sau buổi khảo sát" + nút Nhận tư vấn. Khi cuộn tới, menu sáng "Dịch vụ" |
| 7 | Quy trình (`#process`) | Timeline 6 bước: khảo sát → thiết kế & kế hoạch → cấu hình & phát triển → UAT → Go-live → hỗ trợ sau Go-live. Bước đang xem tự sáng lên khi cuộn |
| 8 | Dự án (`#portfolio`) | 6 dự án, hiển thị **tên và địa chỉ thật** của khách hàng (xem mục 3). Mỗi card có dòng **"Giá trị mang lại"** (định tính, chỉ diễn đạt lại phạm vi đã làm, không có số liệu). Nhận xét khách hàng: bản nháp chờ duyệt ở [testimonial-drafts.md](testimonial-drafts.md), **chưa đưa lên web** |
| 9 | Đội ngũ (`#team`) | Card **Đàm Công Hiến** (Founder & Solution Architect, có ảnh và LinkedIn) và card tóm tắt "4 thành viên chuyên sâu Odoo". Chỉ công khai thông tin của founder |
| 10 | Cam kết | Chất lượng & tiến độ · Bảo mật dữ liệu (sẵn sàng ký NDA) · Minh bạch phạm vi & chi phí |
| 11 | FAQ (`#faq`) | 7 câu hỏi dạng accordion (`<details>`, không cần JS): CE hay EE · thời gian triển khai · license Odoo · chuyển dữ liệu cũ · cloud hay máy chủ riêng · tích hợp AI/OCR vào Odoo đang dùng · hỗ trợ sau Go-live. Câu trả lời **không đưa con số thời gian hay giá** chưa xác nhận |
| 12 | Liên hệ (`#contact`) | Email, hotline, **Zalo** (zalo.me/0363729276), **Messenger** (m.me/edisoft.vn), Facebook; form liên hệ (xem mục 4). Góc dưới bên phải có nút nổi xếp chồng từ dưới lên: **Zalo → Messenger → back-to-top** (class chung `.chat-float`, khoảng cách chỉnh bằng biến `--float-edge` / `--float-step`) |
| 13 | Footer | Mô tả ngắn, cùng 4 link như menu, bản quyền |

**Sửa FAQ:** nội dung câu hỏi và trả lời nằm ở 3 chỗ, phải sửa cả 3 cho khớp: `index.html` (bản VI mặc định), `src/js/i18n.js` (key `faq-N-q` / `faq-N-a`, cả `vi` và `en`), và node `FAQPage` trong JSON-LD ở `<head>` (bản VI).

---

## 3. Dự án tiêu biểu

| # | Khách hàng | Địa chỉ | Giải pháp |
|---|---|---|---|
| 1 | Enkei Vietnam Co., Ltd | KCN Thăng Long, Thiên Lộc, Hà Nội | CRM, Purchase, Inventory |
| 2 | Krapower (KRA Group JSC) | Số 23 Louis VII, KĐT Louis, Hoàng Mai, Hà Nội | CRM, Sales, Project, Inventory, HRM |
| 3 | Công ty Cổ phần VTE (VTE.JSC) | Thôn Cổ Điển A, Tứ Hiệp, Thanh Trì, Hà Nội | CRM, MRP, Inventory, HRM |
| 4 | Pack Vitus GmbH | Siegfriedstr. 182, 10365 Berlin, Germany | POS, Sales, Inventory, Accounting |
| 5 | Velora Vietnam Travel | The Manor Central Park, Định Công, Hà Nội | CRM, Website |
| 6 | Công ty Cổ phần Đầu tư và Công nghệ THG | Lô B12/D21 KĐT mới Cầu Giấy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội | DMS (quản lý tài liệu, tích hợp OnlyOffice, đánh mã & template xuất báo cáo) |

**Thêm một dự án mới:**
1. Sao chép một khối `.portfolio-card` trong `index.html`, đổi key thành `p7-*` (`p7-client`, `p7-location`, `p7-tag`, `p7-role-1..4`).
2. Thêm các key đó vào **cả hai** khối `vi` và `en` trong `src/js/i18n.js`. Nội dung mặc định trong HTML phải giống hệt bản `vi`.
3. Cập nhật con số "6 dự án tiêu biểu" ở section Về chúng tôi.

---

## 4. Form liên hệ

- Dữ liệu được gửi thẳng vào Google Form ([forms.gle/DLQCKXufRs3km3WE9](https://forms.gle/DLQCKXufRs3km3WE9)). Không cần backend.
- Cấu hình nằm trong `src/js/main.js`:
  - `GOOGLE_FORM_URL`: link `.../formResponse` của form.
  - `GOOGLE_FORM_FIELDS`: map từ ô trên web sang `entry.<id>` của từng câu hỏi (Tên, Email, Số điện thoại, Tên doanh nghiệp, Nhu cầu).
- **Nếu sửa câu hỏi trong Google Form**, ID `entry.*` sẽ thay đổi. Lấy lại ID (xem biến `FB_PUBLIC_LOAD_DATA_` trong mã nguồn trang form) rồi cập nhật `GOOGLE_FORM_FIELDS`. Form **không được** bật "Yêu cầu đăng nhập".
- Google không trả về kết quả cho website (request `no-cors`), nên web chỉ phát hiện được lỗi mạng. Khi lỗi, web hiện thông báo kèm số hotline.
- **Validation:**
  - Họ tên: bắt buộc.
  - Số điện thoại: di động Việt Nam `0xxxxxxxxx` hoặc `+84xxxxxxxxx`, chấp nhận dấu cách và dấu chấm.
  - Email: bắt buộc, đúng định dạng.
  - Ô đồng ý sử dụng thông tin: bắt buộc.

---

## 5. Thiết kế

### Màu & theme
- Gradient thương hiệu lấy từ logo: tím `#8A2BE2` → xanh dương `#1E90FF` → teal `#00F5FF` (bản sáng dùng teal `#0d9488`).
- Có Dark và Light mode. Toàn bộ màu nằm trong CSS variables ở `:root`; bản sáng chỉ override lại trong `[data-theme="light"]`.
- Lần truy cập đầu, trang theo cài đặt sáng/tối của hệ điều hành. Chỉ khi người dùng bấm nút thì lựa chọn mới được lưu vào `localStorage` (`theme`).
- Theme được áp dụng bằng script inline trong `<head>` trước khi trang hiển thị, nên không bị nháy màn hình.

### Hiệu ứng
- **Hover** dùng một kiểu thống nhất cho mọi card (card thường, dịch vụ, timeline): nổi lên 4px, viền màu nhấn, phát sáng xanh nhẹ. Khung form và khung cam kết không có hiệu ứng hover.
- **Scroll-reveal:** các section hiện dần khi cuộn tới. **Timeline:** bước đang xem tự sáng lên. **Menu:** tự đánh dấu mục tương ứng section đang xem.
- Tôn trọng cài đặt `prefers-reduced-motion`: tắt animation với người dùng đã chọn giảm chuyển động.

### Responsive

| Mốc | Thay đổi |
|---|---|
| > 900px | Menu desktop 4 mục (vừa từ ~860px với bản EN) |
| ≤ 900px | Menu hamburger (vẫn giữ nút "Nhận tư vấn" ở header đến 768px) |
| ≤ 1024px | Hero 1 cột; giảm padding section xuống 80px |
| 601–768px | Lưới "Lợi thế" và "Dự án" giữ 2 cột |
| ≤ 768px | Bố cục mobile; timeline 1 cột; padding section 64px |
| ≤ 500px | Giảm cỡ chữ tiêu đề và padding card |

- Hero cao tối thiểu `min(90vh, 860px)`, tránh khoảng trống lớn trên màn hình dọc.
- Các lớp glow nền được bọc trong `.bg-glows` (`overflow-x: clip`) để trang **không bao giờ cuộn ngang**. Không đặt `overflow` trên `html`/`body` để thay thế: thuộc tính đó bị truyền lên viewport và vẫn cho cuộn ngang trên mobile.
- Vùng bấm trên mobile ≥ 40px (nút hamburger 44×44px).

---

## 6. Đa ngôn ngữ (i18n)

- Có tiếng Việt (mặc định) và tiếng Anh. Lựa chọn lưu trong `localStorage` (`preferred-lang`).
- Phần tử được dịch gắn thuộc tính `data-i18n` (nội dung chữ), `data-i18n-aria`, `data-i18n-title` hoặc `data-i18n-placeholder`. Hàm `applyLanguage()` trong `src/js/i18n.js` cập nhật DOM theo các thuộc tính này.
- **Lưu ý khi viết HTML:**
  - `data-i18n` ghi đè **toàn bộ** nội dung chữ của phần tử. Không đặt nó lên phần tử có thẻ con cần giữ lại (ví dụ dấu `*` bắt buộc); hãy bọc riêng phần chữ trong `<span data-i18n="...">`.
  - Mọi key phải có ở cả `vi` và `en`, và nội dung mặc định trong HTML phải trùng với bản `vi`.

---

## 7. Kỹ thuật

- **HTML / CSS / JS thuần**, không framework, không cần build. Mở được trực tiếp qua `file://`.
  - Chỉ dùng đường dẫn tương đối.
  - Không dùng `type="module"` hay `import` / `export`.
  - `i18n.js` phải nạp trước `main.js`.
- Font: Inter (nội dung) và Outfit (tiêu đề), tải từ Google Fonts.
- **SEO:**
  - Title khoảng 56 ký tự và description khoảng 154 ký tự; canonical, Open Graph và Twitter card trỏ về `https://edi-soft.vercel.app/`.
  - Ảnh chia sẻ `assets/img/og-image.png` kích thước 1200×630. Khi đổi thông điệp chính, nhớ làm lại ảnh này.
  - JSON-LD trong `<head>` gồm `Organization` (dịch vụ, liên hệ, Facebook), `Person` (founder, LinkedIn), `WebSite` và `FAQPage` (7 câu hỏi, bản VI). Không khai báo địa chỉ vì team chưa có pháp nhân.
  - `robots.txt` và `sitemap.xml` ở thư mục gốc. Cập nhật `<lastmod>` trong sitemap mỗi khi nội dung thay đổi đáng kể.
  - Thứ bậc heading: 1 `h1`; mỗi section một `h2`; card dùng `h3`, nhãn con dùng `h4`; không nhảy cóc cấp heading.
  - Mọi `<img>` phải có `width` và `height` để trang không bị nhảy bố cục khi tải.
- Deploy trên Vercel theo cấu hình tĩnh trong `vercel.json`. Mỗi lần push lên `main` Vercel tự deploy.

```text
├── assets/img/        # favicon.png, icon.png (logo), hiendc.jpg (avatar founder, 200×200)
├── docs/              # Tài liệu, hồ sơ năng lực (PDF)
├── src/
│   ├── js/i18n.js     # Bản dịch VI/EN + applyLanguage()
│   ├── js/main.js     # Theme, ngôn ngữ, menu, scroll-reveal, timeline, form → Google Form
│   └── styles/main.css
├── index.html
└── vercel.json
```

---

## 8. Việc còn lại (đề xuất)

- Thêm use case AI khi đã làm thực tế (ví dụ OCR hóa đơn → bút toán, chatbot tra tồn kho).
- Gửi khách duyệt nhận xét và số liệu theo [testimonial-drafts.md](testimonial-drafts.md), rồi đưa câu đã duyệt lên card dự án.
- Sau khi deploy: khai báo `sitemap.xml` trong Google Search Console, đo Core Web Vitals bằng PageSpeed Insights, kiểm tra JSON-LD bằng Rich Results Test.
- Trang tiếng Anh riêng (`/en/`) nếu muốn được index cho thị trường nước ngoài. Hiện bản EN chỉ sinh ra bằng JavaScript nên Google gần như chỉ index bản tiếng Việt.
- Analytics (Vercel Analytics hoặc GA4) và theo dõi số lần gửi form.
- Email theo tên miền riêng thay cho `@gmail.com`.
