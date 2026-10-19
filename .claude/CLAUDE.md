# Quy tắc làm việc

- Trao đổi bằng tiếng Việt.
- Viết code ngắn gọn nhất có thể.
- Không tự ý xóa file — phải hỏi và được xác nhận trước.
- Chỉ thực hiện git (commit, push, tạo/xóa/đổi nhánh...) khi được yêu cầu.
- Khi làm git, tuân theo [docs/git-convention.md](../docs/git-convention.md).

# Deploy (Vercel)

- Site tĩnh deploy lên Vercel, tự deploy khi push `main` (https://info.editech.vn). Không có build — không thêm Node/bundler/framework nếu chưa được đồng ý.
- Cấu hình deploy chỉ nằm trong `vercel.json` (headers, redirects, rewrites, cache...). Không đề xuất Nginx/Apache/cPanel.
- File không muốn deploy (tài liệu nội bộ...) đặt trong `docs/` hoặc thêm vào `.vercelignore`.
- Dùng đường dẫn tương đối, không dùng ES module (chạy được cả qua `file://`).
- Không xóa/đổi tên `google325a807a1bdab251.html`, `robots.txt`, `sitemap.xml`.
- Cần xử lý phía server (gửi mail, API key...) → dùng Vercel Serverless Functions trong `api/` + Environment Variables trên Vercel, không để secret trong code client.
