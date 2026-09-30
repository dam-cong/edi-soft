# Hướng dẫn Triển khai Website EDI Soft

## 1. Yêu cầu Hệ thống

- Không cần Node.js, không cần build — website là HTML/CSS/JS tĩnh
- **Trình duyệt**: Chrome 90+, Firefox 88+, Edge 90+, Safari 15+

---

## 2. Chạy trên máy (Development)

Mở trực tiếp file `index.html` bằng trình duyệt (double-click hoặc kéo thả vào trình duyệt).

Tất cả đường dẫn trong `index.html` đều là đường dẫn tương đối và JS dùng script thường (không phải ES module), nên chạy được cả qua `file://`.

> Khi thêm file mới: dùng đường dẫn tương đối (`assets/img/...`, `src/...`), **không** dùng đường dẫn bắt đầu bằng `/`, và **không** dùng `type="module"` / `import` / `export`.

---

## 3. Cấu trúc file được deploy

```
index.html
assets/img/        # favicon, logo
src/js/i18n.js     # bản dịch VI/EN (nạp trước)
src/js/main.js     # logic chính
src/styles/main.css
```

---

## 4. Triển khai

### 4.1. Vercel (đang sử dụng)

Cấu hình nằm trong `vercel.json`: site tĩnh, không install, không build, phục vụ thư mục gốc.

1. Import Git repository trên [Vercel Dashboard](https://vercel.com/), Production Branch: `main`
2. Mỗi lần push lên `main` Vercel sẽ tự deploy
3. Hoặc dùng CLI: `npm install -g vercel` → `vercel --prod`

### 4.2. cPanel / hosting FTP

Upload `index.html`, `assets/`, `src/` vào thư mục gốc (thường là `public_html/` hoặc `www/`).

### 4.3. VPS (Nginx / Apache)

```bash
scp -r index.html assets src user@your-server:/var/www/edi-soft/
```

Ví dụ cấu hình **Nginx**:

```nginx
server {
    listen 80;
    server_name edi-soft.vn www.edi-soft.vn;

    root /var/www/edi-soft;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.4. Netlify / Cloudflare Pages

- **Build command**: để trống
- **Output / publish directory**: `/` (thư mục gốc)
---

## 5. Kiểm tra Sau Triển khai

### 5.1. Chức năng cơ bản

- [ ] Trang load không lỗi (kiểm tra Console F12)
- [ ] Dark/Light theme hoạt động
- [ ] Chuyển đổi ngôn ngữ VI/EN hoạt động
- [ ] Nav điều hướng cuộn đến đúng section
- [ ] Menu mobile hoạt động
- [ ] Timeline quy trình active khi scroll
- [ ] Form liên hệ validate đúng
- [ ] Submit form hiển thị modal thành công

### 5.2. SEO

```bash
# Kiểm tra meta tags (chạy trên server sau deploy)
curl -s https://edi-soft.vn | grep -E '<title>|<meta name="description"|<meta property="og:'
```

- [ ] Title tag hiển thị đúng
- [ ] Meta description tồn tại
- [ ] Open Graph tags hoạt động
- [ ] Lang attribute (`<html lang="vi">`) đúng

### 5.3. Hiệu năng

- **Lighthouse** (F12 → Lighthouse): target > 90 cho cả Mobile và Desktop
- **PageSpeed Insights**: kiểm tra tại https://pagespeed.web.dev/
- Gzip/Brotli compression: kiểm tra response header `content-encoding`

### 5.4. Responsive

- [ ] Desktop ≥ 1024px
- [ ] Tablet ≥ 768px
- [ ] Mobile ≥ 360px

---

## 6. Cập nhật Nội dung

Khi có thay đổi nội dung:

1. Chỉnh sửa text trong `index.html` (cập nhật hoặc thêm `data-i18n` key)
2. Thêm/cập nhật bản dịch trong `src/js/i18n.js`
3. Mở `index.html` để kiểm tra, rồi commit và push lên `main` — Vercel tự deploy lại

---

## 7. Xử lý Sự cố Thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| 404 khi refresh trang | Server không config fallback | Thêm `try_files $uri $uri/ /index.html` vào Nginx |
| Ảnh/icon không load | Đường dẫn sai | Kiểm tra đường dẫn trong `<img src="">` và thư mục `public/` |
| API form không gửi được | Dạng static site | Form submit chỉ là mô phỏng (demo). Cần tích hợp backend/form service (Google Form, Formspree, etc.) |
| Ngôn ngữ không lưu | Browser block localStorage | Kiểm tra setting Privacy & Security của trình duyệt |
