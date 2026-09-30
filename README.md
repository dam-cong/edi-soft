# EDI Soft - Landing Page

Website giới thiệu năng lực của **EDI Soft** (EDI Team) — tư vấn, thiết kế và triển khai giải pháp Odoo Community & Enterprise tích hợp AI Agent, Chatbot, OCR và tự động hóa quy trình cho doanh nghiệp SME.

🌐 **Website**: [edi-soft.vercel.app](https://edi-soft.vercel.app/)

---

## Công nghệ

- **HTML / CSS / JS thuần** — không framework, không cần build
- **CSS Variables** — Dark/Light theme
- **IntersectionObserver** — scroll-reveal, timeline
- **i18n tự xây dựng** — Tiếng Việt & Tiếng Anh

## Tính năng

- Dark/Light mode (nhớ lựa chọn, theo hệ thống)
- Chuyển ngôn ngữ VI/EN
- Scroll-reveal animations, timeline quy trình tương tác
- Form liên hệ có validation, gửi dữ liệu về Google Form (cấu hình `GOOGLE_FORM_URL` / `GOOGLE_FORM_FIELDS` trong `src/js/main.js`)
- Responsive (mobile, tablet, desktop)

## Chạy trên máy

Mở trực tiếp file `index.html` bằng trình duyệt — không cần cài đặt hay build.

Khi sửa code, giữ quy ước để vẫn mở được qua `file://`:
- Dùng đường dẫn tương đối (`assets/img/...`, `src/...`), không bắt đầu bằng `/`
- Không dùng `type="module"`, `import`, `export`; `i18n.js` phải nạp trước `main.js`

## Triển khai

Deploy trên **Vercel** từ nhánh `main` — mỗi lần push lên `main` Vercel tự deploy.
Cấu hình trong `vercel.json`: site tĩnh, không install/build, phục vụ thư mục gốc.

Chi tiết và các cách deploy khác: [docs/deployment-guide.md](docs/deployment-guide.md)

## Cấu trúc thư mục

```
├── assets/img/           # Favicon, logo, ảnh founder, ảnh chia sẻ (og-image)
├── docs/                 # Tài liệu nội bộ — KHÔNG deploy (xem .vercelignore)
├── src/
│   ├── js/
│   │   ├── i18n.js       # Bản dịch VI/EN
│   │   └── main.js       # Logic chính
│   └── styles/
│       └── main.css      # Styles
├── index.html            # Trang chính
├── robots.txt, sitemap.xml
├── google*.html          # File xác minh Google Search Console (không xóa)
├── .vercelignore         # Loại docs/ khỏi bản deploy
└── vercel.json           # Cấu hình Vercel
```

## Nhánh

Nhánh production là `main`, mỗi lần merge vào `main` Vercel tự deploy. Tính năng mới làm trên nhánh `<type>/<mô-tả>` rồi tạo Pull Request, theo [docs/git-convention.md](docs/git-convention.md).

## Liên hệ

- **Email**: hiendc.edi@gmail.com
- **Hotline**: 036 3729 276
- **Facebook**: [facebook.com/edisoft.vn](https://www.facebook.com/edisoft.vn)
