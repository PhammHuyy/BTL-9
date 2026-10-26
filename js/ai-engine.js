/**
 * MenuMind - AI Simulation Engine
 * Hiện thực 3 tính năng AI bắt buộc: Taste Recommender, Kitchen Load Predictor, Feedback Theme Extractor
 */

const AIEngine = {
  simulateFailureMode: false,

  async recommendDishes(params) {
    const {
      flavor = "balanced",
      budget = 500000,
      allergy = "none",
      groupSize = 2,
      mood = "dinner"
    } = params;

    await new Promise(r => setTimeout(r, 800));

    if (this.simulateFailureMode) {
      return {
        success: false,
        error: "Không đủ dữ liệu ẩm thực phù hợp với các tiêu chí kiêng khem quá khắt khe.",
        confidence: 0.15,
        suggestions: ["Bỏ chọn bớt dị ứng", "Tăng mức ngân sách", "Duyệt thực đơn thủ công"]
      };
    }

    const allDishes = Store.getMenuItems().filter(d => d.status === "available");
    
    let filtered = allDishes.filter(dish => {
      if (allergy === "seafood" && dish.allergens && dish.allergens.includes("Hải sản")) return false;
      if (allergy === "dairy" && dish.allergens && dish.allergens.includes("Sữa/Bơ")) return false;
      if (allergy === "gluten" && dish.allergens && dish.allergens.includes("Gluten")) return false;
      return true;
    });

    let scoredDishes = filtered.map(dish => {
      let score = 70;
      let reasons = [];

      if (flavor === "vegetarian" && dish.isVegetarian) {
        score += 30;
        reasons.push("Món chay thanh tịnh đúng chuẩn 100% thực vật");
      }
      if (flavor === "spicy" && dish.spicyLevel >= 1) {
        score += 25;
        reasons.push(`Vị cay nồng cấp độ ${dish.spicyLevel} kích thích vị giác`);
      }
      if (flavor === "light" && (dish.calories < 350 || dish.category === "appetizer")) {
        score += 25;
        reasons.push("Lượng calo thấp, thanh đạm dễ tiêu hóa");
      }
      if (flavor === "savory" && (dish.category === "main" || dish.isChefSpecial)) {
        score += 25;
        reasons.push("Hương vị sốt đậm đà, bí quyết từ Bếp trưởng");
      }
      if (flavor === "meat_lover" && (dish.id === "dish-01" || dish.id === "dish-06")) {
        score += 30;
        reasons.push("Thịt bò Wagyu/sườn cừu cao cấp mềm mọng giàu đạm");
      }

      if (dish.isBestSeller) {
        score += 15;
        reasons.push("Thuộc Top món được yêu thích nhất tại nhà hàng");
      }

      if (dish.rating >= 4.8) {
        score += 10;
        reasons.push(`Đánh giá xuất sắc ${dish.rating}★ từ thực khách trước`);
      }

      return {
        dish,
        score: Math.min(score, 99),
        explanation: reasons.length > 0 ? reasons.join(" • ") : "Món ăn hài hòa, cân bằng dinh dưỡng"
      };
    });

    scoredDishes.sort((a, b) => b.score - a.score);
    const recommendedList = scoredDishes.slice(0, 3);
    const totalComboPrice = recommendedList.reduce((sum, item) => sum + item.dish.price, 0);

    return {
      success: true,
      confidence: 0.94,
      aiModel: "MenuMind TasteEngine v3.8",
      summary: `AI đã phân tích ${allDishes.length} món dựa trên khẩu vị '${flavor}', ngân sách ${budget.toLocaleString()}đ cho bàn ${groupSize} người.`,
      recommendations: recommendedList,
      totalComboPrice,
      withinBudget: totalComboPrice <= budget,
      confidenceText: "Độ tin cậy AI: 94% (Rất cao)",
      actions: ["Chấp nhận thêm vào bàn", "Tùy chỉnh khẩu vị", "Gợi ý lại", "Dùng thực đơn thủ công"]
    };
  },

  async predictKitchenLoad(customInput = null) {
    await new Promise(r => setTimeout(r, 700));

    if (this.simulateFailureMode) {
      return {
        success: false,
        error: "Không thể kết nối cảm biến trạm bếp hoặc thiếu dữ liệu ca trực.",
        confidence: 0.2,
        action: "Vui lòng kiểm tra lại thủ công hoặc liên hệ Quản lý ca."
      };
    }

    const orders = Store.getOrders();
    const activeOrders = orders.filter(o => o.status === "pending" || o.status === "preparing");
    
    let stationCounts = { grill: 0, saute: 0, hotpot: 0, bar: 0 };
    let totalItems = 0;

    activeOrders.forEach(ord => {
      ord.items.forEach(it => {
        const dish = Store.getMenuItemById(it.dishId);
        const st = (dish && dish.station) || it.station || "saute";
        stationCounts[st] = (stationCounts[st] || 0) + it.quantity;
        totalItems += it.quantity;
      });
    });

    let bottleneckStation = "grill";
    let maxCount = -1;
    for (const [st, cnt] of Object.entries(stationCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        bottleneckStation = st;
      }
    }

    const stationNames = {
      grill: "Trạm Bếp Nướng (Than & Lò)",
      saute: "Trạm Bếp Xào & Chảo",
      hotpot: "Trạm Nước Dùng & Lẩu",
      bar: "Quầy Pha Chế & Tráng Miệng"
    };

    const isHeavy = totalItems > 6;
    const baseWait = isHeavy ? 24 : 14;
    const overloadPercent = Math.min(95, 45 + totalItems * 8);

    return {
      success: true,
      activeOrdersCount: activeOrders.length,
      totalActiveItems: totalItems,
      bottleneckStation: stationNames[bottleneckStation] || bottleneckStation,
      stationOverloadPercent: overloadPercent,
      predictedAverageWait: baseWait,
      maxWaitTable: "Bàn 07 (chờ 28 phút)",
      confidence: 0.91,
      explanation: `Hệ thống ghi nhận ${activeOrders.length} order đang mở với ${totalItems} món. Trạm '${stationNames[bottleneckStation]}' đang có khối lượng tập trung cao nhất (${maxCount} món). Cần thêm ${Math.round(baseWait * 0.4)} phút xử lý các món nướng chín kỹ.`,
      aiRecommendation: isHeavy 
        ? "Đề xuất: Chuyển tạm thời 01 phụ bếp từ trạm Bar sang hỗ trợ trạm Nướng; cảnh báo khách mới thời gian chờ 20-25 phút."
        : "Tải bếp ổn định ở mức tiêu chuẩn. Tiếp tục duy trì quy trình tiếp nhận bình thường.",
      suggestedActions: [
        { id: "balance_staff", label: "Chấp nhận: Điều phối lại phụ bếp", isPrimary: true },
        { id: "extend_time", label: "Cập nhật cảnh báo chờ +10 phút trên Menu", isPrimary: false },
        { id: "dismiss", label: "Bỏ qua & giữ nguyên", isPrimary: false }
      ]
    };
  },

  async extractFeedbackThemes() {
    await new Promise(r => setTimeout(r, 750));

    if (this.simulateFailureMode) {
      return {
        success: false,
        error: "Chưa đủ lượng phản hồi trong tuần qua để phân cụm chủ đề tin cậy (Cần tối thiểu 3 đánh giá).",
        confidence: 0.1
      };
    }

    const feedbackList = Store.getFeedback();
    if (feedbackList.length === 0) {
      return {
        success: false,
        error: "Hiện tại chưa có phản hồi nào trong hệ thống.",
        confidence: 0.0
      };
    }

    const themesCount = {};
    let positive = 0, neutral = 0, negative = 0;

    feedbackList.forEach(fb => {
      const th = fb.theme || "Khác";
      themesCount[th] = (themesCount[th] || 0) + 1;

      if (fb.rating >= 5) positive++;
      else if (fb.rating >= 4) positive++;
      else if (fb.rating === 3) neutral++;
      else negative++;
    });

    const total = feedbackList.length;
    const positivePercent = Math.round((positive / total) * 100);
    const neutralPercent = Math.round((neutral / total) * 100);
    const negativePercent = 100 - positivePercent - neutralPercent;

    return {
      success: true,
      totalFeedbackAnalyzed: total,
      sentiment: {
        positive: positivePercent,
        neutral: neutralPercent,
        negative: negativePercent
      },
      themesDistribution: themesCount,
      topPositiveInsight: "Món Bò Wagyu nướng sốt tiêu và Lẩu nấm chay được khen ngợi nhiều nhất về hương vị tươi ngon và AI gợi ý chuẩn khẩu vị.",
      topIssueInsight: "Có phản ánh về thời gian chờ món nướng lâu vào khung giờ cao điểm 18h-19h và giá cá hồi hơi cao so với định lượng.",
      aiActionSuggestion: "Khuyến nghị: Sơ chế sẵn cốt sốt tiêu đen và ướp thịt bò trước 17h30; cân nhắc kèm thêm bánh mì bơ tỏi nhỏ cho món cá hồi để nâng giá trị cảm nhận.",
      explanation: `Dựa trên phân tích nội dung ngôn ngữ tự nhiên từ ${total} đánh giá của thực khách thực tế tại bàn.`
    };
  }
};

window.AIEngine = AIEngine;
