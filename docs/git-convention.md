# Quy tắc sử dụng Git

Áp dụng cho repo `edi-tech/web-edi` (GitLab). Nhánh production: `main`, deploy tự động lên Vercel.

---

## 1. Đặt tên branch

```text
<type>/<short-description>
```

| Type       | Dùng cho                     | Ví dụ                     |
| ---------- | ---------------------------- | ------------------------- |
| `feat`     | Tính năng mới                | `feat/contact-form-email` |
| `fix`      | Sửa bug                      | `fix/mobile-menu-scroll`  |
| `refactor` | Refactor, không đổi behavior | `refactor/i18n-loader`    |
| `perf`     | Tối ưu hiệu năng             | `perf/lazy-load-images`   |
| `docs`     | Tài liệu                     | `docs/deployment-guide`   |
| `test`     | Thêm/sửa test                | `test/form-validation`    |
| `chore`    | Bảo trì                      | `chore/cleanup-assets`    |
| `hotfix`   | Sửa production khẩn cấp      | `hotfix/broken-logo-path` |

- Ngắn, mô tả mục đích, dùng `kebab-case`.
- Tránh tên chung chung: `feature`, `my-branch`, `test`, `fix-bug`, `vince-work`, `dev-new`.

---

## 2. Commit message — Conventional Commits

```text
<type>(<scope>): <description>
```

**Type:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`

**Scope** gợi ý cho repo này: `header`, `hero`, `services`, `portfolio`, `team`, `contact`, `i18n`, `theme`, `style`, `deploy`, `docs`

```text
feat(contact): send form data to email service
fix(header): keep mobile menu closed after navigation
refactor(i18n): simplify language switching
docs(readme): update website url
chore(deploy): update vercel config
```

### Viết message

- Dùng **tiếng Anh**, dạng mệnh lệnh (`add`, `fix`, `prevent`...)
- Ngắn, rõ, **không** chấm `.` cuối câu
- Nói rõ **hành vi nào thay đổi**, không ghi chung chung

| ✅ Tốt | ❌ Không tốt |
| --- | --- |
| `fix(contact): reject phone numbers with invalid prefix` | `fix bug` |
| `feat(i18n): add English translation for services` | `update code` |
| `fix(theme): respect system dark mode on first visit` | `final version`, `fix again` |

Thay đổi lớn thì thêm phần body:

```text
feat(portfolio): add project detail modal

- Add modal markup and styles
- Open modal on project card click
- Add VI/EN translations
```

---

## 3. Mỗi commit làm một việc

❌ `feat(contact): add email + fix menu + format css`

✅ Tách ra:

```text
feat(contact): send form data to email service
fix(header): close mobile menu on link click
style(css): format main stylesheet
```

Giúp dễ review, `revert`, `cherry-pick`.

---

## 4. Workflow

```bash
# 1. Tạo branch từ main mới nhất
git switch main
git pull --rebase origin main
git switch -c feat/contact-form-email

# 2. Làm việc & commit
git add <files>
git commit -m "feat(contact): send form data to email service"

# 3. Push
git push -u origin feat/contact-form-email
```

4. Tạo **Merge Request → `main`** trên GitLab.
5. Review xong → merge → Vercel tự deploy.

> Dùng `git add <files>` thay vì `git add .` để tránh commit nhầm file (`.claude/`, file tạm...).

---

## 5. Không commit trực tiếp vào `main`

```text
Developer → feat/fix branch → Merge Request → Review → main → Vercel deploy
```

Cấu hình protected branch `main` trên GitLab:

- Không push trực tiếp, không force push
- Bắt buộc Merge Request
- Yêu cầu ít nhất 1 approval

---

## 6. Merge: Squash and merge

Các commit lặt vặt trên branch (`wip`, `fix`, `debug`, `final-final`...) được gộp thành **một commit** khi merge:

```text
feat(contact): send form data to email service
```

Lịch sử `main` gọn, mỗi commit = một thay đổi có ý nghĩa.

---

## 7. Checklist trước khi tạo Merge Request

- [ ] Tên branch đúng format `<type>/<short-description>`
- [ ] Commit message đúng Conventional Commits
- [ ] Mở `index.html` trực tiếp, website hiển thị và hoạt động đúng
- [ ] Đã kiểm tra cả VI/EN và Dark/Light
- [ ] Không commit file thừa
