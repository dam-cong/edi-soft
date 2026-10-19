---
name: commit-push
description: Commit (và push nếu được yêu cầu) code của repo website EDI Soft theo đúng docs/git-convention.md — Conventional Commits tiếng Anh, chia commit theo từng thay đổi logic, git add từng file, chạy kiểm tra trước khi commit, rồi kiểm tra Vercel đã deploy. Dùng skill này bất cứ khi nào người dùng nói "commit", "push", "đẩy code", "lên main", "commit và push", "đưa lên git/GitHub", "deploy lên Vercel", hoặc gõ /commit-push — kể cả khi họ chỉ nói ngắn gọn như "commit cho tôi".
---

# Commit & push — website EDI Soft

Repo: `dam-cong/edi-soft` (GitHub), nhánh production `main`, mỗi lần push lên `main` Vercel tự deploy `https://info.editech.vn/`. Quy ước đầy đủ: [docs/git-convention.md](../../../docs/git-convention.md). Trao đổi với người dùng bằng **tiếng Việt**; commit message bằng **tiếng Anh**.

## Nguyên tắc (và lý do)

- **Chỉ làm đúng phạm vi được yêu cầu.** "Commit" ≠ "push". Nếu người dùng chỉ nói commit thì commit rồi dừng, báo lệnh push để họ tự quyết. Một lần cho phép push trước đó không áp dụng cho lần sau — push lên `main` là deploy production ngay lập tức.
- **`git add` từng file, không `git add .` / `-A`.** Thư mục `.claude/` (skill, CLAUDE.md, cấu hình máy cá nhân) và file tạm không được lên repo.
- **Mỗi commit một thay đổi logic** (dễ review, revert). Khi các thay đổi khác loại nằm lẫn trong cùng file (thường gặp với `index.html`, `src/js/i18n.js`, `src/styles/main.css`) và không tách được bằng file, gộp vào một commit với body liệt kê từng ý — đừng cố tách từng hunk.
- **Không bao giờ** `--no-verify`, `--force`, `--amend` commit đã push, hay sửa lịch sử `main`. Nếu hook/push lỗi, đọc lỗi và sửa nguyên nhân.
- **Không commit file có dấu hiệu bí mật** (`.env`, khóa API, token). Nếu thấy, dừng lại và hỏi.

## Quy trình

### 1. Xem hiện trạng

```bash
git status --short
git branch --show-current
git fetch -q origin && git status -sb | head -1     # ahead/behind so với origin
git diff --stat
```

- Nếu nhánh local **behind** `origin`: `git pull --rebase origin <branch>` trước (người dùng có thể đã tự push từ máy khác). Có conflict thì dừng và báo.
- Đọc diff (`git diff <file>`) đủ để hiểu mỗi file thay đổi gì — message phải nói đúng hành vi thay đổi.

### 2. Chọn nhánh

- Người dùng nói rõ "lên main" → commit trên `main`.
- Không nói rõ và đang ở `main` → theo convention nên tạo nhánh `<type>/<short-description>` (kebab-case) rồi Pull Request. Hỏi ngắn: commit thẳng `main` hay tạo nhánh?
- Đang ở nhánh khác → commit trên nhánh đó.

### 3. Kiểm tra trước khi commit

```bash
node .claude/skills/commit-push/scripts/precheck.js
```

Script kiểm tra: cú pháp JS, key i18n đủ cả VI/EN và khớp các `data-i18n*` trong `index.html`, JSON-LD parse được, không có file bị chặn (`.claude/`, `.env`…) trong danh sách thay đổi. Có lỗi → sửa (hoặc báo người dùng) trước khi commit. Cảnh báo (WARN) thì nêu trong báo cáo nhưng không chặn.

### 4. Lên kế hoạch commit

Nhóm file theo thay đổi logic, chọn `type(scope)`:

| type | Khi nào |
|---|---|
| `feat` | Tính năng/section/nội dung mới |
| `fix` | Sửa lỗi hiển thị, logic |
| `style` | Chỉ CSS/định dạng, không đổi hành vi |
| `refactor` | Tổ chức lại code, không đổi hành vi |
| `perf` | Tối ưu tốc độ |
| `docs` | README, `docs/*.md` |
| `chore` | Cấu hình, deploy, dọn dẹp (`.vercelignore`, `vercel.json`, sitemap…) |

Scope gợi ý: `header`, `hero`, `about`, `services`, `ai`, `portfolio`, `team`, `faq`, `contact`, `i18n`, `theme`, `style`, `responsive`, `seo`, `deploy`, `docs`, `content`.

Message: `<type>(<scope>): <mô tả>` — tiếng Anh, mệnh lệnh (`add`, `fix`, `remove`…), không chấm cuối, ≤ 72 ký tự, nói rõ hành vi thay đổi. Thay đổi lớn thêm body gạch đầu dòng. Luôn kết thúc bằng trailer attribution theo hướng dẫn hiện hành của phiên làm việc (system reminder), ví dụ `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Ví dụ:
- `feat(ai): add Claude + MCP project management section`
- `fix(contact): accept +84 phone numbers in form validation`
- `chore(deploy): exclude docs from Vercel deployment`
- `docs: document chat buttons in website plan`

### 5. Commit

Dùng heredoc để message nhiều dòng không bị shell làm hỏng:

```bash
git add <file1> <file2>
git commit -q -F - <<'EOF'
feat(scope): short imperative summary

- Detail 1
- Detail 2

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Lặp lại cho từng nhóm. Sau cùng `git status --short` phải chỉ còn những file cố ý không commit (ví dụ `.claude/`).

### 6. Push (chỉ khi được yêu cầu)

```bash
git push origin <branch>          # nhánh mới: git push -u origin <branch>
```

- Nhánh feature: đề xuất tạo PR (`gh pr create --base main` nếu có `gh`), squash and merge theo convention.
- Push lên `main`: kiểm tra deploy **một lần** sau ~1 phút (không chạy vòng lặp chờ):

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://info.editech.vn/
```

Nếu cần, grep một chuỗi đặc trưng của thay đổi vừa push trong HTML trả về để xác nhận bản mới đã lên. Chưa thấy thì báo người dùng đợi thêm, không poll liên tục.

### 7. Báo cáo

Ngắn gọn, tiếng Việt:
- Danh sách commit (`git log --oneline -<n>`) và nội dung chính mỗi commit
- Đã push hay chưa; nếu chưa, đưa lệnh push
- Kết quả precheck (kể cả cảnh báo) và kết quả kiểm tra deploy (nếu có)
- File còn lại chưa commit và lý do
