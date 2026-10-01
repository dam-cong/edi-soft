# Nhận xét khách hàng — BẢN NHÁP

> ⚠️ **NHÁP – CHƯA ĐƯỢC KHÁCH DUYỆT. KHÔNG đưa lên website** cho tới khi khách xác nhận bằng văn bản (email/Zalo) đồng ý nội dung, tên và chức danh hiển thị.
> File nằm trong `docs/` nên không được deploy (xem `.vercelignore`).

Quy trình: gửi khách mẫu tin nhắn (mục 1) kèm câu nhận xét gợi ý (mục 3) → khách sửa/duyệt → cập nhật vào website (`p{n}-quote` trong `index.html` + `src/js/i18n.js`).

---

## 1. Mẫu tin nhắn gửi khách

> Chào anh/chị [Tên],
>
> EDI Soft đang hoàn thiện website giới thiệu năng lực và rất mong được chia sẻ dự án [Tên dự án] đã triển khai cùng [Công ty]. Anh/chị có thể dành 2 phút xem giúp đoạn nhận xét dưới đây — anh/chị cứ sửa thoải mái hoặc viết lại theo ý mình:
>
> "[Câu nhận xét gợi ý]"
>
> Nếu đồng ý, anh/chị cho em xin thêm: tên và chức danh muốn hiển thị (hoặc chỉ hiển thị chức danh), và 1–2 số liệu nếu có (mục 2). Nếu chưa tiện công khai, EDI Soft hoàn toàn tôn trọng.
>
> Cảm ơn anh/chị!

## 2. Số liệu nên hỏi (chỉ dùng số khách xác nhận)

- Thời gian nhập liệu / lập báo cáo **trước và sau** khi dùng Odoo (giờ/ngày, giờ/tuần)
- Số người dùng, số phòng ban đang dùng hệ thống
- Thời gian từ khảo sát đến Go-live
- Số file Excel / công cụ rời rạc đã thay thế
- Sai lệch tồn kho, thời gian chốt sổ cuối tháng (với dự án kho/kế toán)

## 3. Câu nhận xét gợi ý theo từng dự án

| # | Khách hàng | Câu gợi ý (để khách sửa/duyệt) | Người xác nhận | Trạng thái |
|---|---|---|---|---|
| 1 | Enkei Vietnam Co., Ltd | "Quy trình mua hàng và quản lý kho giờ nằm trên một hệ thống, số liệu tồn kho rõ ràng hơn và đội ngũ không còn phải đối chiếu nhiều file Excel." | | Chưa gửi |
| 2 | Krapower (KRA Group JSC) | "Bán hàng, dự án và nhân sự được quản lý tập trung trên Odoo, ban lãnh đạo theo dõi tình hình nhanh hơn. Đội EDI hỗ trợ sát sao trong suốt quá trình triển khai." | | Chưa gửi |
| 3 | Công ty Cổ phần VTE (VTE.JSC) | "EDI Soft hiểu quy trình sản xuất của nhà máy và tùy biến hệ thống đúng cách chúng tôi vận hành, từ nguyên vật liệu, BOM đến tồn kho." | | Chưa gửi |
| 4 | Pack Vitus GmbH | "Our stores, inventory and accounting are now in sync on one system. The EDI team was responsive throughout Go-live and beyond." | | Chưa gửi |
| 5 | Velora Vietnam Travel | "Khách hàng từ website được tiếp nhận và chăm sóc ngay trên CRM, đội kinh doanh không bỏ sót yêu cầu nào." | | Chưa gửi |
| 6 | Công ty CP Đầu tư và Công nghệ THG | "Tài liệu được lưu trữ, soạn thảo trực tiếp và xuất báo cáo theo mẫu ngay trên hệ thống, tiết kiệm nhiều thời gian tìm kiếm và tổng hợp." | | Chưa gửi |

Khi khách duyệt: điền "Người xác nhận" + ngày, đổi trạng thái thành **Đã duyệt**, rồi báo để đưa lên website.
