# Schema.org (JSON-LD)

Dùng JSON-LD trong `<head>` (Google khuyến nghị), đặt trong HTML tĩnh — không sinh bằng JS. Ưu tiên một khối `@graph`, các node liên kết qua `@id` (`https://info.editech.vn/#organization`...). Mọi `url`/`logo`/`image` là URL tuyệt đối.

## Trạng thái loại schema (đến 10/2026)
- **Dùng thoải mái:** Organization / ProfessionalService (LocalBusiness con), WebSite, WebPage, Person, ProfilePage, Service, Offer/OfferCatalog, BreadcrumbList, Article/BlogPosting, VideoObject, ImageObject, SoftwareApplication, Event, Course, QAPage.
- **Không còn rich result, giữ nếu đã có:** FAQPage (Google bỏ cho mọi site từ 2026-05-07). Không xóa, không thêm mới vì SERP.
- **Không bao giờ đề xuất:** HowTo (2023), SpecialAnnouncement, CourseInfo, EstimatedSalary, LearningVideo, ClaimReview (cho SERP), VehicleListing.
- Review/AggregateRating: chỉ khi review thật, hiển thị trên trang, không tự đánh giá chính mình (self-serving review không được hiển thị sao cho Organization/LocalBusiness).

## Lỗi hay gặp
Thiếu `@context`/`@type` · URL tương đối · ngày sai ISO 8601 · dữ liệu trong schema không có trên trang · placeholder quên điền · `sameAs` trỏ trang chết · trùng `@id` cho hai thực thể khác nhau.

## Kiểm chứng
`precheck.js`/`seo-check.js` chỉ kiểm cú pháp. Kiểm ngữ nghĩa: Rich Results Test (https://search.google.com/test/rich-results) và Schema Markup Validator (https://validator.schema.org/) — nhắc người dùng chạy với URL live sau deploy.

## Mẫu phù hợp EDI Soft

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://info.editech.vn/#organization",
      "name": "EDI Soft",
      "url": "https://info.editech.vn/",
      "logo": "https://info.editech.vn/assets/img/icon.png",
      "image": "https://info.editech.vn/assets/img/og-image.png",
      "description": "Tư vấn và triển khai Odoo ERP kết hợp AI cho doanh nghiệp SME.",
      "areaServed": { "@type": "Country", "name": "Vietnam" },
      "knowsAbout": ["Odoo ERP", "AI Agent", "OCR", "Tự động hóa quy trình"],
      "founder": { "@id": "https://info.editech.vn/#founder" },
      "sameAs": ["[CẦN ĐIỀN: LinkedIn/GitHub/Facebook]"],
      "contactPoint": { "@type": "ContactPoint", "contactType": "sales", "email": "[CẦN ĐIỀN]", "availableLanguage": ["vi", "en"] }
    },
    {
      "@type": "Person",
      "@id": "https://info.editech.vn/#founder",
      "name": "[CẦN ĐIỀN]",
      "jobTitle": "[CẦN ĐIỀN]",
      "worksFor": { "@id": "https://info.editech.vn/#organization" },
      "sameAs": ["[CẦN ĐIỀN: LinkedIn]"]
    },
    {
      "@type": "WebSite",
      "@id": "https://info.editech.vn/#website",
      "url": "https://info.editech.vn/",
      "name": "EDI Soft",
      "inLanguage": "vi",
      "publisher": { "@id": "https://info.editech.vn/#organization" }
    },
    {
      "@type": "Service",
      "name": "Triển khai Odoo ERP",
      "serviceType": "ERP implementation",
      "provider": { "@id": "https://info.editech.vn/#organization" },
      "areaServed": "VN"
    }
  ]
}
```

Bài blog (nếu sau này có `/blog/<slug>/`): `BlogPosting` với `headline`, `datePublished`, `dateModified`, `author` → `@id` Person, `image`, `mainEntityOfPage`, kèm `BreadcrumbList`.
