/**
 * ==============================================================================
 * HỒNG NGHĨA THẮNG - PRICING CONFIGURATION & FARE ENGINE
 * ==============================================================================
 * Cấu hình bảng giá cước minh bạch theo Kilomet (Km)
 */

const PRICING_CONFIG = {
  minFare: 100000,       // 0 - 5km đầu tiên
  tier1Rate: 12000,      // từ 6 - 30km (vnđ/km)
  tier2Rate: 9500,       // từ 31 - 100km (vnđ/km)
  tier3Rate: 8500,       // từ 101km trở lên (vnđ/km)
  roundTripDiscount: 0.4 // chiều về tính 60% (giảm 40%)
};

/**
 * Hàm tính cước chi tiết theo Kilomet
 * @param {number} km - Khoảng cách (km)
 * @param {string} tripType - 'one_way' | 'round_trip'
 * @returns {Object} Kết quả tính cước chi tiết
 */
function calculateFare(km, tripType = 'one_way') {
  const distance = Math.max(1, parseFloat(km) || 5);
  let oneWayFare = 0;
  const breakdown = [];

  // Nấc 0: 0 - 5 km
  if (distance <= 5) {
    oneWayFare = PRICING_CONFIG.minFare;
    breakdown.push({
      tier: '0 - 5 km (Mở cửa)',
      km: distance,
      rate: PRICING_CONFIG.minFare,
      subtotal: PRICING_CONFIG.minFare
    });
  } else if (distance <= 30) {
    const tier1Km = distance - 5;
    const tier1Sub = tier1Km * PRICING_CONFIG.tier1Rate;
    oneWayFare = PRICING_CONFIG.minFare + tier1Sub;
    breakdown.push({
      tier: '5 km đầu',
      km: 5,
      rate: PRICING_CONFIG.minFare,
      subtotal: PRICING_CONFIG.minFare
    });
    breakdown.push({
      tier: 'Km 6 - 30',
      km: tier1Km,
      rate: PRICING_CONFIG.tier1Rate,
      subtotal: tier1Sub
    });
  } else if (distance <= 100) {
    const tier1Km = 25;
    const tier1Sub = tier1Km * PRICING_CONFIG.tier1Rate;
    const tier2Km = distance - 30;
    const tier2Sub = tier2Km * PRICING_CONFIG.tier2Rate;
    oneWayFare = PRICING_CONFIG.minFare + tier1Sub + tier2Sub;
    breakdown.push({
      tier: '5 km đầu',
      km: 5,
      rate: PRICING_CONFIG.minFare,
      subtotal: PRICING_CONFIG.minFare
    });
    breakdown.push({
      tier: 'Km 6 - 30',
      km: tier1Km,
      rate: PRICING_CONFIG.tier1Rate,
      subtotal: tier1Sub
    });
    breakdown.push({
      tier: 'Km 31 - 100',
      km: tier2Km,
      rate: PRICING_CONFIG.tier2Rate,
      subtotal: tier2Sub
    });
  } else {
    const tier1Km = 25;
    const tier1Sub = tier1Km * PRICING_CONFIG.tier1Rate;
    const tier2Km = 70;
    const tier2Sub = tier2Km * PRICING_CONFIG.tier2Rate;
    const tier3Km = distance - 100;
    const tier3Sub = tier3Km * PRICING_CONFIG.tier3Rate;
    oneWayFare = PRICING_CONFIG.minFare + tier1Sub + tier2Sub + tier3Sub;
    breakdown.push({
      tier: '5 km đầu',
      km: 5,
      rate: PRICING_CONFIG.minFare,
      subtotal: PRICING_CONFIG.minFare
    });
    breakdown.push({
      tier: 'Km 6 - 30',
      km: tier1Km,
      rate: PRICING_CONFIG.tier1Rate,
      subtotal: tier1Sub
    });
    breakdown.push({
      tier: 'Km 31 - 100',
      km: tier2Km,
      rate: PRICING_CONFIG.tier2Rate,
      subtotal: tier2Sub
    });
    breakdown.push({
      tier: 'Trên 100 km',
      km: tier3Km,
      rate: PRICING_CONFIG.tier3Rate,
      subtotal: tier3Sub
    });
  }

  oneWayFare = Math.round(oneWayFare / 1000) * 1000;
  let totalFare = oneWayFare;
  let roundTripDiscount = 0;

  if (tripType === 'round_trip') {
    const returnLegFare = Math.round((oneWayFare * (1 - PRICING_CONFIG.roundTripDiscount)) / 1000) * 1000;
    totalFare = oneWayFare + returnLegFare;
    roundTripDiscount = (oneWayFare * 2) - totalFare;
  }

  return {
    km: distance,
    tripType,
    oneWayFare,
    totalFare,
    roundTripDiscount,
    breakdown,
    formattedTotal: totalFare.toLocaleString('vi-VN') + ' đ',
    formattedOneWay: oneWayFare.toLocaleString('vi-VN') + ' đ'
  };
}

if (typeof window !== 'undefined') {
  window.PRICING_CONFIG = PRICING_CONFIG;
  window.calculateFare = calculateFare;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRICING_CONFIG, calculateFare };
}
