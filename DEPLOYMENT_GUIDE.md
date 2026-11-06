# 🚀 HƯỚNG DẪN TRIỂN KHAI & TÙY BIẾN DỰ ÁN (DEPLOYMENT GUIDE)
> **Dự án:** Template Landing Page Đặt Xe Riêng & Tiện Chuyến Đẳng Cấp (Executive Cockpit Travel)  
> **Chi phí vận hành:** 0đ trọn đời (Miễn phí Hosting, SSL HTTPS, CDN toàn cầu & Webhook).

---

## 📁 1. CẤU TRÚC THƯ MỤC DỰ ÁN

```
thanhai-travel/
├── assets/
│   └── images/
│       ├── avatar.jpg          # Ảnh chân dung tài xế trên Header
│       ├── car-exterior.jpg    # Ảnh ngoại thất xe (Mazda CX-5 / SUV đen bóng)
│       ├── car-interior.jpg    # Ảnh cận cảnh nội thất ghế da
│       └── car-amenities.jpg   # Ảnh tiện nghi khoang xe (nước khoáng, sạc nhanh)
├── index.html                  # Giao diện đặt xe dành cho khách (Mobile-First & Desktop)
├── admin.html                  # Khoang quản trị di động (Khóa PIN 4 số, chỉnh giá, Lễ Tết)
├── README.md                   # Giới thiệu dự án
└── DEPLOYMENT_GUIDE.md         # Tài liệu hướng dẫn này
```

---

## ⚙️ 2. BƯỚC 1: TÙY BIẾN THÔNG TIN CỦA BẠN (TRƯỚC KHI DEPLOY)

Chỉ cần mở file `index.html` và thay đổi các vị trí sau:

### A. Cấu hình Telegram Bot nhận chuông báo đơn (Dòng 790 của `index.html`)
```javascript
// ========================================================
// CẤU HÌNH TELEGRAM BOT & THÔNG BÁO TÀI XẾ (ĐIỀN VÀO ĐÂY)
// ========================================================
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Điền Token của bot Telegram
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';     // Điền Chat ID cá nhân của bạn
```

> **Cách lấy Token & Chat ID trong 2 phút:**
> 1. Mở Telegram, tìm bot **`@BotFather`** ➔ Gửi lệnh `/newbot` ➔ Làm theo hướng dẫn để đặt tên bot ➔ Bạn sẽ nhận được chuỗi **Token** (vd: `7123456789:AAH...`).
> 2. Tìm bot **`@userinfobot`** trên Telegram ➔ Bấm `Start` ➔ Bot sẽ trả về con số **Id** của bạn (vd: `987654321`). Điền số này vào `TELEGRAM_CHAT_ID`.
> 3. **Lưu ý quan trọng:** Trước khi test trên web, hãy tìm con bot vừa tạo của bạn trên Telegram và bấm **`Start`** (hoặc gửi 1 tin nhắn bất kỳ cho nó) để bot có quyền gửi tin nhắn cho bạn.

---

### B. Cấu hình Số điện thoại & Tên tài xế (Dòng 796 của `index.html`)
```javascript
let APP_CONFIG = {
  driverName: 'Tuấn Driver',            // Tên tài xế hiển thị
  driverPhone: '0912345678',            // Số điện thoại nhận cuộc gọi
  zaloPhone: '0912345678',              // Số Zalo nhận tin nhắn đặt cuốc
  ...
};
```
*Đồng thời, bạn có thể dùng tính năng `Find & Replace` (Ctrl + H) trong VS Code để thay thế toàn bộ số `0912345678` thành số điện thoại thật của bạn.*

---

### C. Thay ảnh thật của xe bạn
Bạn chỉ cần chuẩn bị 4 bức ảnh thực tế của mình (định dạng `.jpg`), đổi tên đúng theo quy chuẩn và **copy đè** vào thư mục `assets/images/`:
- `avatar.jpg`: Ảnh chân dung lịch lãm của bạn.
- `car-exterior.jpg`: Ảnh chụp ngoại thất góc nghiêng chiếc xe của bạn.
- `car-interior.jpg`: Ảnh chụp khoang ghế lái hoặc hàng ghế sau sạch đẹp.
- `car-amenities.jpg`: Ảnh chai nước suối, khăn lạnh, sạc điện thoại trên xe.

---

## 🌐 3. BƯỚC 2: CÁC CÁCH DEPLOY LÊN MẠNG INTERNET (0Đ CHI PHÍ)

Vì dự án đã có sẵn trên GitHub `https://github.com/tuna3401/thanhai-travel.git`, bạn có thể chọn 1 trong 3 nền tảng miễn phí tốt nhất hiện nay:

### 🌟 LỰA CHỌN 1: Cloudflare Pages (KHUYÊN DÙNG NHẤT - Siêu tốc, không giới hạn băng thông)
1. Truy cập [cloudflare.com](https://dash.cloudflare.com/) ➔ Đăng ký/Đăng nhập tài khoản miễn phí.
2. Tại menu bên trái, chọn **Workers & Pages** ➔ Bấm **Create application** ➔ Chọn tab **Pages** ➔ Bấm **Connect to Git**.
3. Chọn tài khoản GitHub của bạn và chọn repository **`thanhai-travel`**.
4. Cấu hình triển khai:
   - **Project name:** `thanhai-travel` (hoặc tên bạn thích).
   - **Production branch:** `main`.
   - **Framework preset:** `None`.
   - **Build command:** *(Để trống)*.
   - **Build output directory:** *(Để trống hoặc gõ `/`)*.
5. Bấm **Save and Deploy**. Sau khoảng 15 giây, website của bạn sẽ online với link dạng `https://thanhai-travel.pages.dev`.
6. *(Tùy chọn)*: Bạn có thể bấm **Custom domains** để gắn tên miền riêng của bạn (vd: `xehanoinoibai.vn`, `tuandriver.com`).

---

### LỰA CHỌN 2: Vercel (Cực nhanh, giao diện hiện đại)
1. Truy cập [vercel.com](https://vercel.com/) ➔ Đăng nhập bằng tài khoản **GitHub**.
2. Bấm **Add New...** ➔ Chọn **Project**.
3. Tìm repo **`thanhai-travel`** và bấm **Import**.
4. Giữ nguyên toàn bộ thiết lập mặc định ➔ Bấm **Deploy**.
5. Sau 20 giây, website sẽ online với link `https://thanhai-travel.vercel.app`.

---

### LỰA CHỌN 3: GitHub Pages (Đơn giản nhất, không cần đăng ký thêm dịch vụ)
1. Mở repository trên GitHub: `https://github.com/tuna3401/thanhai-travel`.
2. Bấm vào tab **Settings** (ở thanh menu trên cùng).
3. Ở menu bên trái, chọn **Pages**.
4. Tại mục **Build and deployment**:
   - **Source:** Chọn `Deploy from a branch`.
   - **Branch:** Chọn `main` và thư mục `/ (root)`.
   - Bấm **Save**.
5. Đợi 1-2 phút, GitHub sẽ cấp cho bạn đường link website dạng `https://tuna3401.github.io/thanhai-travel/`.

---

## 📱 4. BƯỚC 3: HƯỚNG DẪN QUẢN TRỊ TRÊN ĐIỆN THOẠI HÀNG NGÀY

Sau khi website đã lên mạng, bạn lưu link quản trị vào màn hình chính điện thoại (Add to Home Screen):
👉 Đường dẫn: `https://ten-mien-cua-ban.com/admin.html`

### Các thao tác quản trị:
1. **Mở khóa:** Nhập mã PIN 4 số (Mã mặc định ban đầu là: **`1990`**).
2. **Bật Phụ thu Lễ/Tết 1-chạm:**
   - Gạt công tắc sang màu xanh.
   - Chọn kiểu phụ thu: Tự động cộng **`+20%`** hoặc cộng tiền mặt cố định **`+100.000đ`**. Giá ngoài trang chủ sẽ tự động nhảy số theo thời gian thực.
3. **Cập nhật tin "Xe rỗng chiều về":**
   - Nhập nội dung (vd: *"Chiều nay 16h30 rỗng xe Nội Bài về Hà Đông chỉ 170k"*).
   - Bấm **Lưu tin**. Ngoài trang chủ thanh chạy chữ tia chớp sẽ lập tức hiển thị tin này. Khách bấm vào sẽ tự động điền sẵn chiều về.
4. **Điều chỉnh giá từng tuyến:**
   - Sửa trực tiếp số tiền của giá Bao xe và giá Ghép xe của từng lộ trình ➔ Bấm **Lưu tất cả giá**.
5. **Đổi mã PIN:** Bạn có thể đổi mã PIN mới ngay trong mục Cấu hình tài xế để tăng tính bảo mật.

---

## 🔄 5. QUY TRÌNH CẬP NHẬT CODE / ẢNH SAU KHI ĐÃ DEPLOY (CI/CD TỰ ĐỘNG)

Mỗi khi bạn muốn sửa giá, đổi câu chữ hoặc thay ảnh mới trên máy tính:
1. Bạn chỉnh sửa file trên máy tính của mình.
2. Mở Terminal và chạy 3 lệnh sau:
   ```powershell
   git add .
   git commit -m "Cập nhật thông tin mới"
   git push
   ```
3. **Hệ thống tự động cập nhật:** Cloudflare Pages hoặc Vercel sẽ tự động phát hiện commit mới và cập nhật website trực tiếp sau 15 giây mà bạn không cần phải thao tác gì thêm!

---

*Chúc bạn khai thác website hiệu quả, đón khách đều đặn và hành trình vạn dặm bình an!* 🚖✨
