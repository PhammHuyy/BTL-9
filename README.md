<!-- # BTL-09 – MenuMind – Thực Đơn Thông Minh & Điều Phối Đơn Hàng

> **Học phần:** PHÁT TRIỂN ỨNG DỤNG WEB CƠ BẢN – CSE122  
> **Lĩnh vực:** Nhà hàng / F&B (Food & Beverage)  
> **Nhóm thực hiện:** Nhóm BTL-09 (3 sinh viên SV1, SV2, SV3)  
> **Loại sản phẩm:** Ứng dụng Web Frontend tương tác đa vai trò, LocalStorage CRUD đồng bộ, Responsive và mô phỏng 3 trải nghiệm AI theo quy trình chuẩn.

---

## 1. Giới thiệu tổng quan

**MenuMind** giải quyết bài toán cốt lõi trong vận hành nhà hàng hiện đại:
- **Khách hàng:** Thường khó khăn khi chọn món trong menu dài, không rõ món nào phù hợp với khẩu vị cá nhân, kiêng khem dị ứng hoặc ngân sách.
- **Nhân viên bếp:** Dễ bị nghẽn đơn vào giờ cao điểm, trôi phiếu order hoặc lệch thông tin ghi chú với phục vụ.
- **Quản lý & Quản trị:** Thiếu công cụ nắm bắt dữ liệu doanh thu thời gian thực, thời gian chờ trung bình của các trạm chế biến và cảm nhận của thực khách.

---

## 2. Bảng kiểm kê 12 màn hình nền tảng bắt buộc (Mục 8)

| STT | Tệp HTML | Vai trò | CRUD | Chức năng nghiệp vụ chính | Trải nghiệm AI |
|:---:|---|---|:---:|---|---|
| 1 | `diner-menu.html` | Khách hàng | R | Xem menu, tìm kiếm, lọc danh mục, giỏ hàng nổi | **AI-1: Taste Recommender** |
| 2 | `diner-dish-detail.html` | Khách hàng | C/R/U | Tùy chọn kích cỡ, độ cay, ghi chú, đánh giá món | Gợi ý món ăn kèm |
| 3 | `diner-table-order.html` | Khách hàng | C/R/U/D | Giỏ hàng bàn, gửi order bếp, timeline nấu món | Cảnh báo trễ tự động |
| 4 | `kitchen-board.html` | Nhân viên bếp | R / U | Bảng Kanban 4 cột (Pending/Prep/Ready/Served) | Trạm lọc công suất |
| 5 | `kitchen-order-detail.html` | Nhân viên bếp | C/R/U | Trạng thái từng món, checklist nguyên liệu, ghi chú | Điều chỉnh thời gian |
| 6 | `kitchen-wait-time-alerts.html` | Nhân viên bếp | C/R/U/D | Giám sát đơn trễ > 20m, giải tỏa nghẽn trạm | **AI-2: Kitchen Load Predictor** |
| 7 | `manager-menu-management.html` | Quản lý | C/R/U/D | CRUD món ăn, giá bán, công tắc còn/hết món | Xuất dữ liệu JSON |
| 8 | `manager-sales-insights.html` | Quản lý | C/R/U | KPI doanh thu, biểu đồ theo giờ, Top 5 món hot | Hiệu suất 4 trạm bếp |
| 9 | `manager-feedback-center.html` | Quản lý | C/R/U/D | Phản hồi khách, lọc sao/chủ đề, trả lời review | **AI-3: Feedback Theme Extractor** |
| 10 | `admin-table-management.html` | Quản trị viên | C/R/U/D | Sơ đồ bàn, trạng thái Trống/Có khách, tạo mã QR | Tạo QR tem bàn |
| 11 | `admin-user-management.html` | Quản trị viên | C/R/U/D | CRUD tài khoản nhân sự, phân quyền 4 vai trò | Đổi ca làm việc |
| 12 | `admin-settings.html` | Quản trị viên | C/R/U/D | Cấu hình quán, thuế VAT, Reset Mock Data | Gemini 3.8 Flash |

### Màn hình bổ trợ dùng chung:
- `index.html`: Cổng thông tin dự án, bảng kiểm kê tương tác và trình chuyển đổi vai trò.
- `login.html`: Trang đăng nhập nhanh 1 chạm cho 4 vai trò.
- `404.html`: Trang báo lỗi 404 phong cách ẩm thực.

---

## 3. Hiện thực 3 tính năng AI bắt buộc

Hệ thống tuân thủ nghiêm ngặt quy trình trải nghiệm AI theo đề bài:
`Người dùng nhập → Kiểm tra hợp lệ → AI đang xử lý (Loading/Skeleton) → Kết quả AI → Vì sao có kết quả này? → Chấp nhận / Sửa / Từ chối / Lưu`
đồng thời bao phủ trường hợp **AI thất bại / Không chắc chắn**.

1. **AI-1: Taste Recommender (Gợi ý món theo khẩu vị):**
   - Vị trí: `diner-menu.html`
   - Đầu vào: Khẩu vị (cay/ngọt/thanh đạm/chay), ngân sách, dị ứng (không tôm cua, không gluten, không sữa), số người.
   - Đầu ra: Combo 3 món tối ưu, % phù hợp, giải thích chi tiết và nút thêm cả combo vào bàn.
2. **AI-2: Kitchen Load Predictor (Mô phỏng thời gian chờ & tải bếp):**
   - Vị trí: `kitchen-wait-time-alerts.html` & `kitchen-board.html`
   - Đầu vào: Quét số lượng vé order đang mở, tỷ lệ món nướng/xào/lẩu, số đầu bếp trong ca.
   - Đầu ra: Cảnh báo điểm nghẽn (ví dụ: Bếp nướng quá tải 85%), thời gian trễ dự kiến và giải pháp điều phối nhân sự.
3. **AI-3: Feedback Theme Extractor (Phân tích & nhóm phản hồi theo chủ đề):**
   - Vị trí: `manager-feedback-center.html`
   - Đầu vào: Toàn bộ đánh giá của khách hàng từ các bàn ăn.
   - Đầu ra: Tỷ lệ cảm xúc (% hài lòng), các cụm chủ đề (Chất lượng món, Thời gian chờ, Phục vụ, Giá cả) và khuyến nghị cải thiện.

---

## 4. Hướng dẫn chạy & Kiểm thử

1. Mở trực tiếp tệp `index.html` bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Edge, Firefox). Không cần cài đặt NodeJS hay web server phức tạp.
2. Sử dụng thanh **Role Switcher Banner** cố định ở trên cùng để chuyển đổi nhanh giữa các vai trò.
3. Bấm nút **"🔄 Reset Mock Data"** bất cứ lúc nào để nạp lại dữ liệu khởi tạo chuẩn.
 -->
