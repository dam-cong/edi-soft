# EDI Soft - Landing Page

Website giới thiệu năng lực của **EDI Soft** (EDI Team) — tư vấn, thiết kế và triển khai giải pháp Odoo Community & Enterprise tích hợp AI Agent, Chatbot, OCR và tự động hóa quy trình cho doanh nghiệp SME.

🌐 **Website**: [web-edi.vercel.app](https://web-edi.vercel.app/)

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
- Form liên hệ có validation (hiện chỉ mô phỏng gửi, chưa nối backend)
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
├── assets/img/           # Favicon, logo
├── docs/                 # Tài liệu
├── src/
│   ├── js/
│   │   ├── i18n.js       # Bản dịch VI/EN
│   │   └── main.js       # Logic chính
│   └── styles/
│       └── main.css      # Styles
├── index.html            # Trang chính
└── vercel.json           # Cấu hình Vercel
```

## Nhánh

Quy tắc đặt tên branch, commit, merge: [docs/git-convention.md](docs/git-convention.md)

| Nhánh | Nội dung |
|---|---|
| `main` | Website EDI Soft hiện tại (deploy Vercel) |
| `edi-2.0` | Bản EDI Soft dùng Vite (trước khi chuyển sang HTML tĩnh) |
| `main-2.0` | Backup website EDI Tech nhiều trang (bản `main` cũ) |
| `main-1.0`, `edi-1.0` | Các phiên bản 1.0 cũ |

## Liên hệ

- **Email**: hiendc.edi@gmail.com
- **Hotline**: 036 3729 276
- **Facebook**: [facebook.com/edisoft.vn](https://www.facebook.com/edisoft.vn)
