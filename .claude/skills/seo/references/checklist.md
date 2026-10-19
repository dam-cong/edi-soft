# Checklist SEO kỹ thuật & on-page

Mức: **C** Critical (chặn index/xếp hạng) · **H** High · **M** Medium · **L** Low.

## Crawl & index
- [C] Không có `noindex` trong meta robots hay header `X-Robots-Tag`; `robots.txt` không `Disallow: /`.
- [C] `canonical` tuyệt đối, https, trỏ đúng bản chính; khớp `og:url` và có trong `sitemap.xml`.
- [H] `robots.txt` khai báo `Sitemap:`; `sitemap.xml` hợp lệ, chỉ chứa URL trả 200, canonical, indexable. `lastmod` = ngày nội dung đổi thật (không cập nhật giả). Google bỏ qua `priority`/`changefreq`.
- [H] Một domain chính duy nhất. Nếu sau này có domain riêng → redirect 301 từ `*.vercel.app` qua `vercel.json` `redirects`, đổi canonical/OG/sitemap/JSON-LD đồng loạt, khai báo đổi địa chỉ trong Search Console.
- [M] Trang 404 tùy chỉnh (`404.html` ở gốc — Vercel tự dùng).
- [L] IndexNow (Bing/Yandex/Naver/Seznam) nếu muốn index nhanh trên Bing.

## Bảo mật & header (`vercel.json`)
- [H] HTTPS + HSTS (Vercel có sẵn).
- [M] `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`; CSP nếu kiểm soát được nguồn script (Google Fonts, inline JSON-LD/theme script → cần `'unsafe-inline'` hoặc hash).
- [M] Cache dài cho `assets/` và `src/` (`Cache-Control: public, max-age=31536000, immutable` chỉ khi tên file có version; nếu không thì `max-age` ngắn + `must-revalidate`).

## On-page
- [C] Đúng **một** `<h1>` chứa chủ đề chính; heading không nhảy cấp (h2 → h4).
- [H] `<title>` ~50-60 ký tự, chứa từ khóa chính ở đầu + thương hiệu; duy nhất mỗi trang.
- [H] Meta description 70-160 ký tự, có lợi ích + lời kêu gọi; Google có thể viết lại nhưng vẫn ảnh hưởng CTR.
- [H] `<html lang>` đúng; nếu có URL riêng cho EN (`/en/`) thì thêm `hreflang` vi/en/x-default hai chiều. Hiện EN chỉ đổi bằng JS → không phải trang riêng, đừng thêm hreflang trỏ cùng URL.
- [M] Ảnh: `alt` mô tả (ảnh trang trí `alt=""`), `width`/`height`, `loading="lazy"` cho ảnh dưới màn hình đầu, WebP/AVIF, <200 KB. Ảnh LCP không lazy, có thể `fetchpriority="high"`.
- [M] Anchor nội bộ (`#section`) đều tồn tại; link ngoài mở tab mới có `rel="noopener"`. Anchor text mô tả, không "xem thêm" chung chung.
- [M] OG/Twitter đầy đủ, `og:image` 1200×630 tuyệt đối, `og:locale` = `vi_VN` (+ `og:locale:alternate` `en_US`).
- [L] `meta keywords` bị Google bỏ qua — không cần tối ưu.

## Hiệu năng (Core Web Vitals, ngưỡng p75)
| Chỉ số | Tốt | Cần cải thiện | Kém |
|---|---|---|---|
| LCP | ≤ 2.5s | 2.5-4s | > 4s |
| INP | ≤ 200ms | 200-500ms | > 500ms |
| CLS | ≤ 0.1 | 0.1-0.25 | > 0.25 |

INP thay FID từ 2024-03-12 — không nhắc FID. Dấu hiệu từ source: Google Fonts chặn render (dùng `display=swap`, `preconnect`, giới hạn số weight), CSS/JS lớn trong `<head>` không `defer`, ảnh thiếu kích thước, animation dùng thuộc tính gây layout, listener scroll nặng. Số thật: PageSpeed Insights / CrUX / Search Console.

## Nội dung & E-E-A-T
Ngưỡng tối thiểu tham khảo: homepage ≥ 500 từ; trang dịch vụ ≥ 800; bài blog ≥ 1.500 (độ sâu quan trọng hơn số từ).
- **Experience:** dự án thật (tên khách hàng nếu được phép, ngành, quy mô, kết quả đo được), ảnh/screenshot thật.
- **Expertise:** người đứng sau (Person + chức danh, kinh nghiệm Odoo, chứng chỉ thật), giải thích kỹ thuật cụ thể.
- **Authoritativeness:** trích dẫn/đề cập từ bên ngoài, đối tác, GitHub, LinkedIn (`sameAs`).
- **Trust:** thông tin liên hệ rõ, địa chỉ/pháp nhân, chính sách, testimonial thật có tên.
- Intent: mỗi section trả lời một câu hỏi khách hàng thật sự tìm ("Odoo là gì / tốn bao lâu / chi phí / khác gì phần mềm khác"). Câu trả lời trực tiếp ở 1-2 câu đầu section.
- Một trang không thể xếp hạng cho mọi từ khóa → khi `/seo plan` cân nhắc thêm trang riêng (`/dich-vu/odoo-erp/`, `/blog/...`) — đây là quyết định kiến trúc, phải hỏi người dùng trước.

## Off-page (gợi ý, không tự làm)
- Google Business Profile (nếu có địa chỉ), hồ sơ trên Odoo partner directory/apps store, GitHub, LinkedIn công ty, bài khách mời trên cộng đồng Odoo Việt Nam, case study được khách hàng dẫn link.
- Không mua link, không trao đổi link hàng loạt.
