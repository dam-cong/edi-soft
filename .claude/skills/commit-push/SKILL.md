---
name: commit-push
description: Commit và push code cho repo EDI Soft theo docs/git-convention.md — kiểm tra thay đổi, tách commit theo từng việc, viết message Conventional Commits bằng tiếng Anh, chọn nhánh đúng, rồi push. Dùng khi người dùng nói "commit", "push", "commit và push", "đẩy code lên git", hoặc gõ /commit-push.
argument-hint: "[main|branch] [ghi chú về nội dung thay đổi]"
---

# Commit & push — EDI Soft

Chỉ chạy khi người dùng **yêu cầu trong lượt hiện tại** (xem `CLAUDE.md`). Chi tiết quy ước: [docs/git-convention.md](../../../docs/git-convention.md). Trao đổi bằng tiếng Việt.

## Quy trình

1. **Xem trạng thái:** `git status --short`, `git branch --show-current`, `git diff --stat`, `git log --oneline -5`.
   - Không có thay đổi → báo lại, dừng.
   - File lạ (`.claude/settings.local.json`, ảnh tạm, `.env`, file bí mật, `node_modules/`) → không add, nói rõ với người dùng.
2. **Chọn nhánh:**
   - Mặc định tạo nhánh `<type>/<short-description>` (kebab-case) từ `main` và commit ở đó.
   - Người dùng nói rõ "commit vào main" → làm trên `main`, nhưng nhắc một dòng là trái mục 5 của quy ước.
   - Đang ở nhánh khác `main` và nhánh đó hợp lý → giữ nguyên.
3. **Tách commit theo từng việc:** mỗi commit một mục đích. Add từng file/nhóm file cụ thể (`git add <files>`), không dùng `git add .` / `-A`.
   - Thay đổi đan xen trong cùng file thì gộp một commit, nêu các ý trong phần body.
4. **Viết message** `type(scope): description`:
   - `type`: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`.
   - `scope` gợi ý: `header`, `hero`, `services`, `portfolio`, `team`, `contact`, `i18n`, `theme`, `style`, `deploy`, `docs`.
   - Tiếng Anh, dạng mệnh lệnh, không chấm cuối, nêu rõ hành vi thay đổi (không viết `update code`, `fix bug`).
   - Thay đổi lớn thì thêm body dạng gạch đầu dòng.
   - Cuối message thêm dòng đồng tác giả theo hướng dẫn trong system-reminder của phiên (nếu có).
5. **Kiểm tra nhanh trước khi commit** (chỉ khi đụng tới code): `node -e "new Function(require('fs').readFileSync('src/js/main.js','utf8'))"` để bắt lỗi cú pháp JS; nếu sửa `i18n.js` thì chắc chắn key mới có ở cả `vi` và `en`.
6. **Commit** bằng heredoc để giữ xuống dòng. Hook lỗi → sửa nguyên nhân, không dùng `--no-verify`.
7. **Push:**
   - Nhánh mới: `git push -u origin <branch>`; nhánh có sẵn: `git push`.
   - Push `main` kích hoạt deploy Vercel lên https://info.editech.vn → **chỉ push khi người dùng đã bảo push**; nếu chưa rõ thì hỏi.
   - Không bao giờ `--force` lên `main`. Push bị từ chối → `git pull --rebase origin <branch>` rồi thử lại, báo nếu có xung đột.
8. **Báo kết quả:** liệt kê hash + message từng commit, nhánh đã push, và nhắc bước tiếp theo (tạo PR bằng `gh pr create --base main` nếu đang ở nhánh phụ).

## Không làm

- Không tự xóa nhánh hay file; hỏi trước (xem `CLAUDE.md`).
- Không đổi git config, không bỏ qua hook hay chữ ký.
- Không commit secret; secret thuộc về Environment Variables trên Vercel.
