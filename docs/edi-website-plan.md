# Tài liệu Triển khai Website Landing Page EDI Soft

Tài liệu này tổng hợp chi tiết các nội dung, giao diện và giải pháp công nghệ đã được triển khai cho website Landing Page giới thiệu năng lực của **EDI Soft** (EDI Team) tại thư mục `D:\sourcecode\website\web-edi`.

---

## 1. Tổng quan Dự án & Ý tưởng Thiết kế

### Ý tưởng Chủ đạo (Concept)
- **Phong cách**: Thiết kế theo xu hướng **Deep Dark Space Tech** hiện đại, mang tính tương lai, phản ánh đúng đặc thù của một doanh nghiệp công nghệ thông tin chuyên sâu về ERP và tích hợp.
- **Màu sắc thương hiệu**: Sử dụng dải màu gradient trích xuất trực tiếp từ logo chính thức của EDI ([icon.png](file:///d:/sourcecode/website/edi-web/icon.png)):
  - **Tím** (`#8A2BE2`)
  - **Xanh dương** (`#1E90FF`)
  - **Xanh ngọc/Teal** (`#00F5FF`)
- **Hiệu ứng thị giác (Visual FX)**:
   - **Glassmorphism**: Các thẻ nội dung được thiết kế dạng kính mờ (nền bán trong suốt với hiệu ứng `backdrop-filter: blur()`).
   - **Neon Glow Border**: Viền các phần tử tự động phát sáng nhẹ khi di chuột qua.
   - **Scroll-Reveal**: Các phần nội dung tự động xuất hiện mượt mà khi người dùng cuộn trang tới.

### Floating Tech Icons (Hero Visual)
- 7 icon công nghệ nổi (Odoo, AI, Chatbot, DevOps, API, Website, iOS, Android) được bố trí xung quanh đồ họa SVG trung tâm.
- Mỗi icon có hiệu ứng **float-drift** (lên xuống nhẹ) với thời gian và độ trễ khác nhau, tạo cảm giác sống động.
- Thiết kế dạng pill badge (kính mờ) với icon + label, màu sắc tự động thích ứng theme.
- Ẩn bớt icon trên màn hình nhỏ (≤1024px ẩn AI & API, ≤500px ẩn Chatbot).

### Chế độ Giao diện (Theme)
- Hỗ trợ **Dark Mode** (mặc định) và **Light Mode** đầy đủ.
- Nút chuyển đổi hình mặt trời/mặt trăng ở góc phải Header.
- **Tự động phát hiện**: Lần đầu truy cập, website đọc cấu hình `prefers-color-scheme` từ hệ điều hành/trình duyệt để chọn theme phù hợp.
- **Ghi nhớ lựa chọn**: Khi người dùng tự chuyển đổi, lựa chọn được lưu vào `localStorage` và ưu tiên hơn cấu hình hệ thống ở các lần truy cập sau.
- **CSS Variables**: Toàn bộ màu sắc được kiểm soát qua CSS Variables tập trung, chỉ cần override trong block `[data-theme="light"]` để chuyển đổi toàn bộ giao diện.

### Đa Ngôn ngữ (i18n)
- Hỗ trợ **Tiếng Việt** (mặc định) và **Tiếng Anh** đầy đủ.
- Nút chuyển đổi **VI/EN** hình tròn ở Header, cạnh nút theme toggle.
- **Ghi nhớ lựa chọn**: Ngôn ngữ được lưu vào `localStorage` (`preferred-lang`) và khôi phục ở các lần truy cập sau.
- **Cơ chế hoạt động**: Tất cả text trong HTML được gắn `data-i18n` key, JS đọc từ object translations và cập nhật DOM khi chuyển ngôn ngữ.
- **Hỗ trợ đầy đủ**: Placeholder form, aria-label, title, và form validation messages đều được dịch.

---

## 2. Các Phân hệ Nội dung đã Triển khai (Sections)

Website được xây dựng theo cấu trúc Single Page Application (SPA) gồm các phân vùng nội dung logic:

1. **Header (Thanh điều hướng)**
   - Logo tròn EDI Soft và tên thương hiệu nổi bật.
   - Thanh menu điều hướng nhanh đến các phần nội dung chính.
   - Nút kêu gọi hành động (CTA) *"Nhận tư vấn ngay"* hướng trực tiếp xuống form liên hệ.
   - Menu Hamburger di động tối ưu cho màn hình nhỏ.

2. **Hero Section (Màn hình đầu trang)**
   - Khẩu hiệu đắt giá (Slogan): **"Chúng tôi không bán phần mềm, chúng tôi triển khai giải pháp tối ưu vận hành."**
   - Đồ họa SVG tương tác động với các liên kết quỹ đạo mô phỏng dòng chảy dữ liệu ERP quanh lõi EDI Soft.
   - Các nút CTA hướng nghiệp vụ giúp tăng tỷ lệ chuyển đổi khách hàng.

3. **Về chúng tôi (About Us)**
   - Tóm tắt hành trình hoạt động từ tháng 7/2024.
   - Nêu rõ mô hình hoạt động chuyên sâu **Delivery Team** và định vị phân khúc khách hàng mục tiêu là doanh nghiệp **SME dưới 300 nhân sự**.

4. **Lợi thế cạnh tranh (Why Us - Giá trị nổi bật)**
   Tiêu đề: **"Tại sao doanh nghiệp lựa chọn EDI Soft?"**
   Khắc họa rõ nét 6 điểm mạnh cốt lõi giúp EDI Soft nổi bật hoàn toàn so với các đối tác Odoo khác:
   - **Chuyên sâu Odoo Community & Enterprise**: Năng lực tư vấn toàn diện trên cả hai nền tảng Odoo Community và Enterprise.
   - **Business Analyst & Developer Đồng Hành**: Đảm bảo nghiệp vụ thực tế được chuyển dịch chính xác thành giải pháp phần mềm.
   - **ERP Kết Hợp AI & Tự Động Hóa**: Sẵn sàng tích hợp AI Agent, Chatbot, OCR, RPA và tự động hóa quy trình.
   - **Quy Trình Triển Khai Chuẩn**: Phương pháp luận rõ ràng, quản lý chặt chẽ từng giai đoạn.
   - **Giải Pháp "May Đo" Theo Doanh Nghiệp**: Thiết kế riêng theo mô hình vận hành của từng khách hàng.
   - **Đồng Hành Phát Triển Dài Hạn**: Cam kết đồng hành vận hành, tối ưu và mở rộng hệ thống liên tục.

5. **Dịch vụ Cung cấp (Core Services)**
   Mô tả chi tiết 5 nhóm dịch vụ chính:
   - Tư vấn & khảo sát nghiệp vụ.
   - Thiết kế giải pháp ERP.
   - Triển khai & Tùy biến Odoo.
   - Đào tạo người dùng & chuyển giao.
   - Bảo trì, hỗ trợ & nâng cấp.

6. **Quy trình triển khai 6 bước (ERP Implementation Process)**
   Thể hiện dưới dạng dòng thời gian (Interactive Timeline) liên kết cuộn trang tự động kích hoạt:
   - *Bước 1: Khảo sát & Phân tích hiện trạng* (Tài liệu BRD)
   - *Bước 2: Thiết kế giải pháp & Lên kế hoạch* (Chốt Scope)
   - *Bước 3: Cấu hình & Phát triển phần mềm* (Code Review)
   - *Bước 4: UAT & Hiệu chỉnh lỗi* (Nghiệm thu UAT)
   - *Bước 5: Go-live & Chạy chính thức* (Vận hành thực tế)
   - *Bước 6: Hỗ trợ & Vận hành sau Go-live* (Hỗ trợ lâu dài)

7. **Dự án Tiêu biểu (Case Studies)**
   Trình bày 4 case study thực tế từ profile của EDI:
   - **ENKEI**: Phân hệ CRM, Inventory, Purchase (Mua hàng & Kho vận).
   - **KRA**: Phân hệ CRM, Sale, Project, Inventory, HRM (Nhân sự & Bán hàng).
   - **VTE**: Phân hệ CRM, MRP, Inventory, HRM (Quản trị sản xuất & Kho).
   - **VITUS**: Phân hệ POS, Sale, Inventory, Accounting (Bán lẻ & Kế toán).
   - Tổng kết giá trị: Chuẩn hóa quy trình, dữ liệu tập trung real-time, giảm Excel thủ công.

8. **Đội ngũ chuyên gia (Our Team)**
   Thông tin chi tiết về 5 thành viên sáng lập & chuyên gia Odoo/BA thực chiến, đính kèm link LinkedIn:
   - **Đàm Công Hiến**: Founder / Technical Lead
   - **Lê Mạnh Dũng**: BA Lead
   - **Cao Thị Linh**: BA Odoo
   - **Đỗ Văn Quyết**: Developer Odoo
   - **Lê Hoàng Duy**: BA Odoo

9. **Liên hệ & Tư vấn (Contact Section)**
   - Form điền thông tin đăng ký tư vấn hiện đại.
   - Tích hợp kiểm duyệt dữ liệu (Validation) tức thì đối với Họ tên, Số điện thoại (định dạng Việt Nam) và Email.
   - Popup thông báo gửi thành công kính mờ (Glassmorphism) đẹp mắt sau khi gửi form.

---

## 3. Kiến trúc Công nghệ sử dụng (Tech Stack)

Để tối ưu hóa tốc độ tải trang, điểm SEO tối đa và dễ bảo trì, website được triển khai trên nền tảng tối giản hiệu năng cao:

- **Build Tool / Bundler**: **Vite** (Vanilla JS) giúp bundle tài nguyên siêu nhanh và hỗ trợ Hot Module Replacement khi phát triển.
- **HTML**: Sử dụng cấu trúc HTML5 semantic đầy đủ kết hợp các thẻ meta tối ưu hóa **SEO** (Title, Meta Description, Keywords) và thẻ **Open Graph** chia sẻ mạng xã hội.
- **CSS**: Sử dụng Vanilla CSS thuần túy tận dụng CSS Variables, Grid Layout, Flexbox và CSS Animations. Không phụ thuộc vào các thư viện ngoài cồng kềnh. Hỗ trợ **Dark/Light Theme** thông qua attribute `data-theme="dark|light"` trên thẻ `<html>`.
- **Javascript**: Sử dụng các API ES6+ hiện đại, tận dụng `IntersectionObserver` để tự động hóa hiệu ứng scroll-reveal và highlight timeline quy trình. Theme toggle sử dụng `localStorage` để ghi nhớ lựa chọn và `matchMedia('prefers-color-scheme')` để phát hiện cấu hình hệ thống.
- **Đa ngôn ngữ (i18n)**: Xây dựng thủ công không dùng thư viện. File `src/js/i18n.js` chứa object translations cho cả VI và EN (~300 keys). Hàm `applyLanguage()` quét DOM tìm `[data-i18n]`, `[data-i18n-aria]`, `[data-i18n-title]`, `[data-i18n-placeholder]` và cập nhật nội dung tương ứng. Ngôn ngữ được lưu trong `localStorage`.

---

## 4. Cấu trúc Thư mục Dự án

```text
edi-web/
├── dist/                     # Mã nguồn tối ưu sau khi build sản xuất
├── node_modules/             # Các dependency của dự án (Vite)
├── public/
│   ├── favicon.png           # Biểu tượng trang web trên tab trình duyệt
│   └── icon.png              # Logo gốc của EDI Soft
├── src/
│   ├── js/
│   │   ├── i18n.js           # Translations VI/EN (~300 keys) + hàm applyLanguage()
│   │   └── main.js           # Logic tương tác: theme toggle, lang toggle, validation form, animation, scroll-reveal
│   └── styles/
│       └── main.css          # Định nghĩa giao diện, màu sắc, responsive và lang toggle styles
├── index.html                # Cấu trúc HTML chính của website (có data-i18n attributes)
├── package.json              # Khai báo script chạy/build dự án
├── vite.config.js            # Cấu hình Vite dev server và build path
└── edi-website-plan.md       # Tài liệu này (Tổng quan triển khai)
```
