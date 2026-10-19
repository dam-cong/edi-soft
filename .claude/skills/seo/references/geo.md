# AI search / GEO (AI Overviews, AI Mode, ChatGPT, Perplexity, Claude)

Quan điểm chính thức của Google: tối ưu cho AI search **vẫn là SEO** — nội dung hữu ích, crawl/index tốt, cấu trúc rõ. Coi GEO là SEO nền tảng áp dụng cho bề mặt AI, không phải bộ mẹo riêng. Khi lời khuyên cộng đồng mâu thuẫn với tài liệu Google, theo Google và ghi chú mâu thuẫn.

## Tiêu chí đánh giá
1. **Citability (25%)** — câu trả lời tự đứng được, trích được: "Odoo ERP là…", số liệu cụ thể, kết quả dự án có số. Câu trả lời trực tiếp ở đầu section; thông tin quan trọng nằm sớm trên trang.
2. **Cấu trúc (20%)** — H1→H2→H3 sạch, heading dạng câu hỏi khách tìm, đoạn ngắn 2-4 câu, bảng so sánh (Community vs Enterprise, các gói engagement), danh sách bước.
3. **Entity rõ ràng (20%)** — tên thương hiệu nhất quán (EDI Soft), người sáng lập, lĩnh vực, khu vực; schema Organization/Person với `sameAs`; cùng thông tin trên LinkedIn/GitHub/danh bạ đối tác Odoo.
4. **Tín hiệu thương hiệu (15%)** — được nhắc trên YouTube, LinkedIn, Reddit/diễn đàn, cộng đồng Odoo VN, báo ngành. Số liệu bên thứ ba (Ahrefs 2025) cho thấy brand mention tương quan với việc được AI trích dẫn mạnh hơn backlink — trích kèm nguồn nếu dùng.
5. **Truy cập kỹ thuật (10%)** — nội dung có trong HTML tĩnh (không chỉ render bằng JS), `robots.txt` không chặn crawler AI mong muốn.
6. **Đa phương tiện (10%)** — ảnh thật, video demo, sơ đồ có alt/chú thích.

## Crawler AI (robots.txt)
| Token | Mục đích | Gợi ý |
|---|---|---|
| `Googlebot` | Google Search + AI Overviews/AI Mode | luôn cho phép |
| `Google-Extended` | Dùng dữ liệu huấn luyện Gemini (không ảnh hưởng Search) | tùy chính sách |
| `OAI-SearchBot` / `ChatGPT-User` | ChatGPT search / truy cập theo yêu cầu người dùng | cho phép |
| `GPTBot` | Huấn luyện mô hình OpenAI | tùy |
| `PerplexityBot`, `Perplexity-User` | Perplexity | cho phép |
| `ClaudeBot`, `Claude-SearchBot`, `Claude-User` | Anthropic | cho phép search/user |
| `Bingbot` | Bing + Copilot | cho phép |

Site hiện `Allow: /` cho tất cả — ổn cho mục tiêu được nhìn thấy. Chỉ thêm `Disallow` theo bot khi người dùng muốn chặn huấn luyện.

## Lầm tưởng (Google xác nhận không hiệu quả)
- `llms.txt` không được Google dùng; có thể thêm cho công cụ khác nhưng ưu tiên thấp.
- Không cần "chunk" nội dung riêng cho AI, không cần viết lại kiểu AI, không spam mention.

## Kiểm tra thực tế
Hỏi trực tiếp ChatGPT/Perplexity/Gemini các câu khách hay hỏi ("đơn vị triển khai Odoo cho SME ở Việt Nam") và ghi lại EDI Soft có được nhắc/trích không — đó là leading indicator, lặp lại hàng tháng.
