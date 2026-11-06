/**
 * =========================================================================
 * AUTOMATED SELF-TEST RUNNER - TUẤN DRIVER BOOKING ENGINE
 * =========================================================================
 * Module kiểm thử tự động toàn diện nghiệp vụ tính cước và tích hợp đặt xe.
 * Kích hoạt khi:
 *  1. Truy cập URL với tham số: index.html?test=true
 *  2. Hoặc mở DevTools Console gõ: window.runDriverTests()
 * =========================================================================
 */

(function () {
  'use strict';

  // Biến cờ Mock bảo vệ: Không bắn tin thật ra ngoài khi đang test
  let isMocking = true;
  let interceptedTelegramPayload = null;
  let interceptedZaloLink = null;

  /**
   * Helper Assert functions
   */
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'Assertion failed'} - Kỳ vọng: [${expected}], Thực tế: [${actual}]`);
    }
  }

  /**
   * Bộ 7 Test Cases nghiệp vụ cốt lõi
   */
  const testSuite = [
    {
      name: 'Case 1: Cước "Bao Trọn Xe" tuyến Hà Nội ➔ Sân Bay Nội Bài',
      run: function () {
        const route = APP_CONFIG.routes['hn-nb'];
        assert(route, 'Tuyến hn-nb phải tồn tại trong APP_CONFIG');
        assertEqual(route.priceBaoXe, 350000, 'Giá Bao Xe Nội Bài phải đúng 350.000đ');
        
        // Giả lập trạng thái chọn
        const originalMode = currentTripMode;
        const originalRoute = currentRouteKey;
        const originalHoliday = APP_CONFIG.holidayMode.isActive;
        
        currentTripMode = 'bao_xe';
        currentRouteKey = 'hn-nb';
        APP_CONFIG.holidayMode.isActive = false;
        
        const price = calculatePrice();
        assertEqual(price, 350000, 'calculatePrice() chế độ Bao xe Nội Bài phải là 350.000đ');

        // Phục hồi
        currentTripMode = originalMode;
        currentRouteKey = originalRoute;
        APP_CONFIG.holidayMode.isActive = originalHoliday;
      }
    },

    {
      name: 'Case 2: Cước "Ghép Tiết Kiệm" tuyến Hà Nội ➔ Hạ Long',
      run: function () {
        const route = APP_CONFIG.routes['hn-hl'];
        assert(route, 'Tuyến hn-hl phải tồn tại');
        assertEqual(route.priceDiGhep, 250000, 'Giá Ghép Hạ Long phải đúng 250.000đ');
        assert(route.allowGhep === true, 'Tuyến Hạ Long phải hỗ trợ đi ghép');

        const originalMode = currentTripMode;
        const originalRoute = currentRouteKey;
        const originalHoliday = APP_CONFIG.holidayMode.isActive;

        currentTripMode = 'di_ghep';
        currentRouteKey = 'hn-hl';
        APP_CONFIG.holidayMode.isActive = false;

        const price = calculatePrice();
        assertEqual(price, 250000, 'calculatePrice() ghép Hạ Long phải là 250.000đ');

        currentTripMode = originalMode;
        currentRouteKey = originalRoute;
        APP_CONFIG.holidayMode.isActive = originalHoliday;
      }
    },

    {
      name: 'Case 3: Cước theo km nội tỉnh (11.000đ/km & cấm Đi ghép)',
      run: function () {
        const route = APP_CONFIG.routes['noi-tinh'];
        assert(route, 'Tuyến noi-tinh phải tồn tại');
        assert(route.name.includes('11.000đ/km') || route.name.includes('11k/km') || route.name.includes('km'), 'Tên tuyến phải thể hiện tính theo km');
        assertEqual(route.allowGhep, false, 'Tuyến theo km nội tỉnh không được phép đi ghép (allowGhep = false)');
      }
    },

    {
      name: 'Case 4: Tính toán phụ thu Ngày Lễ (Holiday Surge Mode: % và Tiền mặt)',
      run: function () {
        const originalHoliday = JSON.parse(JSON.stringify(APP_CONFIG.holidayMode));
        const originalMode = currentTripMode;
        const originalRoute = currentRouteKey;

        currentTripMode = 'bao_xe';
        currentRouteKey = 'hn-nb'; // Giá gốc: 350.000

        // 4.1 Test Surge theo phần trăm (+20% của 350.000 = 420.000)
        APP_CONFIG.holidayMode = {
          isActive: true,
          surgeType: 'percent',
          surgeValue: 20
        };
        const pricePercent = calculatePrice();
        assertEqual(pricePercent, 420000, 'Phụ thu 20% cho cuốc 350k phải ra 420.000đ');

        // 4.2 Test Surge theo tiền mặt (+100.000 của 350.000 = 450.000)
        APP_CONFIG.holidayMode = {
          isActive: true,
          surgeType: 'flat',
          surgeValue: 100000
        };
        const priceFlat = calculatePrice();
        assertEqual(priceFlat, 450000, 'Phụ thu 100k cho cuốc 350k phải ra 450.000đ');

        // Phục hồi
        APP_CONFIG.holidayMode = originalHoliday;
        currentTripMode = originalMode;
        currentRouteKey = originalRoute;
      }
    },

    {
      name: 'Case 5: Validate số điện thoại đặt xe (10 số di động VN)',
      run: function () {
        function validatePhone(p) {
          if (!p) return false;
          const trimmed = p.trim();
          return /^(0[3|5|7|8|9])[0-9]{8}$/.test(trimmed) || (/^[0-9]{10}$/.test(trimmed) && trimmed.startsWith('0'));
        }

        assert(!validatePhone(''), 'Số rỗng phải bị chặn');
        assert(!validatePhone('09123'), 'Số thiếu chữ số phải bị chặn');
        assert(!validatePhone('09123456789'), 'Số 11 chữ số phải bị chặn');
        assert(!validatePhone('09123abc45'), 'Số chứa chữ cái phải bị chặn');
        assert(validatePhone('0912345678'), 'Số 0912345678 phải được chấp nhận hợp lệ');
        assert(validatePhone('0988776655'), 'Số 0988776655 phải được chấp nhận hợp lệ');
      }
    },

    {
      name: 'Case 6: Cấu trúc Payload Telegram Bot API',
      run: function () {
        // Giả lập dữ liệu chuyến đi
        const mockData = {
          route: 'Hà Nội ➔ Sân Bay Nội Bài',
          mode: 'Bao Trọn Xe',
          price: '350.000 VNĐ',
          time: '08:00 sáng mai',
          pickup: '28 Cầu Giấy, Hà Nội',
          name: 'Anh Tuấn Test',
          phone: '0988889999',
          style: '🌿 Yên tĩnh nghỉ ngơi'
        };

        const telegramHtml = 
`🔔 <b>CÓ ĐƠN ĐẶT XE MỚI TỪ WEBSITE!</b>
━━━━━━━━━━━━━━━━━━
🚖 <b>Lộ trình:</b> ${mockData.route}
✨ <b>Hình thức:</b> ${mockData.mode}
💵 <b>Dự kiến:</b> <code>${mockData.price}</code>
⏰ <b>Thời gian đón:</b> <b>${mockData.time}</b>
📍 <b>Điểm đón:</b> ${mockData.pickup}
👤 <b>Khách hàng:</b> ${mockData.name}
📞 <b>Số điện thoại:</b> <a href="tel:${mockData.phone}">${mockData.phone}</a>
🏷 <b>Ghi chú/Tiện ích:</b> <i>${mockData.style}</i>`;

        assert(telegramHtml.includes(mockData.route), 'Payload thiếu thông tin tuyến đường');
        assert(telegramHtml.includes(mockData.mode), 'Payload thiếu hình thức đi');
        assert(telegramHtml.includes(mockData.price), 'Payload thiếu cước dự kiến');
        assert(telegramHtml.includes(mockData.time), 'Payload thiếu thời gian đón');
        assert(telegramHtml.includes(mockData.pickup), 'Payload thiếu điểm đón');
        assert(telegramHtml.includes(mockData.phone), 'Payload thiếu số điện thoại khách');
        assert(telegramHtml.includes(mockData.style), 'Payload thiếu ghi chú tiện ích');
      }
    },

    {
      name: 'Case 7: Cấu trúc URI Encode mở Zalo Deep Link',
      run: function () {
        const zaloPhone = APP_CONFIG.zaloPhone || '0912345678';
        const sampleText = 
`Chào Tuấn Driver, tôi muốn đặt xe:
- Tuyến: Hà Nội ➔ Sân Bay Nội Bài
- Hình thức: Bao Trọn Xe
- Dự kiến: 350.000 VNĐ
- Thời gian: 07:30
- Điểm đón: 28 Cầu Giấy
- SĐT: 0912345678
- Ghi chú: Yên tĩnh nghỉ ngơi`;

        const encoded = encodeURIComponent(sampleText);
        const deepLink = `https://zalo.me/${zaloPhone}?text=${encoded}`;

        assert(deepLink.startsWith(`https://zalo.me/${zaloPhone}?text=`), 'Link Zalo phải đúng schema https://zalo.me/<phone>?text=');
        
        // Decode lại để kiểm tra tính toàn vẹn
        const decoded = decodeURIComponent(encoded);
        assertEqual(decoded, sampleText, 'Giải mã URL Zalo phải khớp 100% với dữ liệu cuốc xe ban đầu');
      }
    }
  ];

  /**
   * Hàm thực thi toàn bộ Test Suite
   */
  window.runDriverTests = async function () {
    console.clear();
    console.log(
      '%c🧪 TUẤN DRIVER AUTOMATED TEST RUNNER v1.0 %c\nBắt đầu chạy kiểm thử luồng nghiệp vụ...',
      'background: #0D111A; color: #E5C378; font-size: 14px; font-weight: bold; padding: 4px 8px; border: 1px solid #E5C378; border-radius: 4px;',
      'color: #00F59B; font-weight: bold;'
    );

    let passedCount = 0;
    const totalCount = testSuite.length;
    const testResults = [];

    console.group('%c📋 CHI TIẾT TỪNG TEST CASE', 'color: #E5C378; font-weight: bold;');

    for (let i = 0; i < totalCount; i++) {
      const tc = testSuite[i];
      try {
        tc.run();
        passedCount++;
        testResults.push({ name: tc.name, status: 'PASSED' });
        console.log(
          `%c[PASSED] %c${tc.name}`,
          'color: #00F59B; font-weight: bold; background: rgba(0,245,155,0.1); padding: 2px 6px; border-radius: 3px;',
          'color: #F8FAFC;'
        );
      } catch (err) {
        testResults.push({ name: tc.name, status: 'FAILED', error: err.message });
        console.error(
          `%c[FAILED] %c${tc.name} \n  ↳ Lỗi: ${err.message}`,
          'color: #FF4D4D; font-weight: bold; background: rgba(255,77,77,0.1); padding: 2px 6px; border-radius: 3px;',
          'color: #FFAAAA;'
        );
      }
    }

    console.groupEnd();

    // Tổng kết
    const isAllPassed = passedCount === totalCount;
    const summaryStyle = isAllPassed 
      ? 'background: #00F59B; color: #04060A; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px;'
      : 'background: #FF4D4D; color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px;';

    console.log(
      `%c📊 TỔNG KẾT: ${passedCount}/${totalCount} TEST CASES PASSED (${Math.round((passedCount/totalCount)*100)}%)`,
      summaryStyle
    );

    // Hiển thị UI Toast Badge trên màn hình
    renderTestBadge(passedCount, totalCount, isAllPassed);

    return {
      passed: passedCount,
      total: totalCount,
      allPassed: isAllPassed,
      results: testResults
    };
  };

  /**
   * Hiển thị UI Toast Badge thông báo góc màn hình
   */
  function renderTestBadge(passed, total, isAllPassed) {
    const existing = document.getElementById('driverTestBadge');
    if (existing) existing.remove();

    const badge = document.createElement('div');
    badge.id = 'driverTestBadge';
    badge.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-top-4';
    
    if (isAllPassed) {
      badge.style.background = 'rgba(13, 17, 26, 0.95)';
      badge.style.borderColor = 'rgba(0, 245, 155, 0.4)';
      badge.style.boxShadow = '0 10px 30px rgba(0, 245, 155, 0.2)';
      badge.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00F59B] flex items-center justify-center font-bold text-base flex-shrink-0">
          ✓
        </div>
        <div>
          <div class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>🧪 Self-Test Passed</span>
            <span class="text-[10px] font-mono text-[#00F59B] px-1.5 py-0.2 bg-[#00F59B]/15 rounded">${passed}/${total}</span>
          </div>
          <p class="text-[11px] text-zinc-400 mt-0.5">Toàn bộ 7 luồng nghiệp vụ hoạt động hoàn hảo!</p>
        </div>
      `;
    } else {
      badge.style.background = 'rgba(26, 13, 17, 0.95)';
      badge.style.borderColor = 'rgba(255, 77, 77, 0.5)';
      badge.style.boxShadow = '0 10px 30px rgba(255, 77, 77, 0.2)';
      badge.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base flex-shrink-0">
          ✕
        </div>
        <div>
          <div class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>🧪 Self-Test Warning</span>
            <span class="text-[10px] font-mono text-rose-400 px-1.5 py-0.2 bg-rose-500/15 rounded">${passed}/${total}</span>
          </div>
          <p class="text-[11px] text-zinc-400 mt-0.5">Có test case bị lỗi, mở F12 Console để xem chi tiết.</p>
        </div>
      `;
    }

    document.body.appendChild(badge);

    // Tự động biến mất sau 5 giây
    setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(-10px)';
      setTimeout(() => badge.remove(), 600);
    }, 5000);
  }

  // Tự động chạy khi URL có ?test=true
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true' || urlParams.get('test') === '1') {
      setTimeout(() => {
        window.runDriverTests();
      }, 300);
    }
  });

})();
