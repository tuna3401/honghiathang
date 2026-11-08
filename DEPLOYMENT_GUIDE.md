# 🚀 HƯỚNG DẪN TRIỂN KHAI & TÙY BIẾN DỰ ÁN (DEPLOYMENT GUIDE)
> **Dự án:** Landing Page Dịch Vụ Xe Riêng & Tính Giá Theo Kilomet (`honghiathang`)  
> **Chi phí vận hành:** 0đ trọn đời (Miễn phí Hosting, SSL HTTPS, CDN toàn cầu & Telegram Bot API).

---

## 📁 1. CẤU TRÚC THƯ MỤC DỰ ÁN

```
honghiathang/
├── assets/
│   ├── js/
│   │   └── pricing-config.js   # Module cấu hình & engine tính cước bậc thang theo Km
│   └── images/
│       ├── avatar.jpg          # Ảnh chân dung tài xế trên Header & Profile
│       ├── car-exterior.jpg    # Ảnh ngoại thất xe (Mazda CX-5 SUV đen bóng)
│       ├── car-interior.jpg    # Ảnh cận cảnh nội thất ghế da Nappa
│       └── car-amenities.jpg   # Ảnh tiện nghi khoang xe (nước suối, sạc nhanh)
├── index.html                  # Giao diện chính (3 trụ cột: Xe, Tài xế & Tính giá Km)
├── admin.html                  # Khoang quản trị di động (Mã PIN 4 số, chỉnh giá Km, Lễ Tết)
├── README.md                   # Giới thiệu dự án & schema
├── PROJECT_OVERVIEW.md         # Đặc tả chi tiết kiến trúc & schema
└── DEPLOYMENT_GUIDE.md         # Hướng dẫn triển khai này
```

---

## ⚙️ 2. TÙY BIẾN THÔNG TIN TÀI XẾ & BẢNG GIÁ

### A. Cấu hình Telegram Bot nhận chuông báo đơn (`index.html`)
```javascript
const TELEGRAM_BOT_TOKEN = '9202748648:AAHffIE-IEkq04lFswa1dnoyjULfy_xkyfM';
const TELEGRAM_CHAT_ID = '8485023862';
```
Khi khách gửi đơn, website sẽ tự động bắn thông báo chi tiết: Điểm đón, Điểm đến, Số Km, Loại chuyến (1 chiều / khứ hồi), Dòng xe (4 chỗ / 7 chỗ), Cước tạm tính, Số điện thoại và Ghi chú.

---

### B. Cấu hình Bảng giá theo Kilomet (`assets/js/pricing-config.js`)
Dễ dàng tùy chỉnh đơn giá bậc thang và hệ số trong file `assets/js/pricing-config.js` hoặc chỉnh trực tiếp tại giao diện `admin.html`:
```javascript
const DEFAULT_PRICING_CONFIG = {
  tier0: { maxKm: 5, flatPrice: 90000 },       // 0 - 5 km: cước mở cửa 90.000đ
  tier1: { startKm: 5, maxKm: 30, pricePerKm: 12000 },    // 6 - 30 km: 12.000đ/km
  tier2: { startKm: 30, maxKm: 100, pricePerKm: 9500 },  // 31 - 100 km: 9.500đ/km
  tier3: { startKm: 100, pricePerKm: 8000 },              // > 100 km: 8.000đ/km
  roundTripMultiplier: 1.6,                               // Khứ hồi x1.6 (chiều về giảm 40%)
  carMultipliers: { '4_seats': 1.0, '7_seats': 1.25 }     // 7 chỗ tăng 25%
};
```

---

### C. Thay đổi hình ảnh thực tế
Bạn chỉ cần chuẩn bị 4 bức ảnh thực tế định dạng `.jpg`, copy đè vào thư mục `assets/images/`:
- `avatar.jpg`: Ảnh chân dung tài xế Hồ Nghĩa Thắng.
- `car-exterior.jpg`: Ảnh ngoại thất chiếc xe của bạn.
- `car-interior.jpg`: Ảnh nội thất ghế da sạch đẹp.
- `car-amenities.jpg`: Ảnh nước suối chai, khăn lạnh, dây sạc đa năng.

---

## 🌐 3. HƯỚNG DẪN DEPLOY TRỰC TIẾP (0Đ CHI PHÍ)

### 🌟 LỰA CHỌN 1: Cloudflare Pages (Khuyên dùng - CDN siêu tốc, không giới hạn băng thông)
1. Đăng nhập [cloudflare.com](https://dash.cloudflare.com/).
2. Chọn **Workers & Pages** ➔ **Create application** ➔ Tab **Pages** ➔ **Connect to Git**.
3. Chọn repo `honghiathang` (hoặc upload thư mục trực tiếp).
4. Giữ nguyên mặc định (Framework preset: `None`), bấm **Save and Deploy**.
5. Gắn custom domain riêng nếu có (ví dụ: `honghiathang.vn`).

### LỰA CHỌN 2: Vercel
1. Đăng nhập [vercel.com](https://vercel.com/) bằng GitHub.
2. Bấm **Add New...** ➔ **Project** ➔ Import `honghiathang`.
3. Bấm **Deploy**.
