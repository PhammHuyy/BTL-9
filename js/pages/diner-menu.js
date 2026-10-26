/**
 * diner-menu.js - Quản lý trang thực đơn
 */

let currentCategory = "all"; // Danh mục đang chọn
let lastAiResult = null;     // Kết quả gợi ý từ AI

// Render danh sách món ăn ra HTML
function renderDishes(dishes) {
  const grid = document.getElementById("dishGrid");
  const emptyState = document.getElementById("emptyState");

  // Nếu không có món nào thì hiện thông báo rỗng
  if (!dishes || dishes.length === 0) {
    grid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  // Dùng .map() tạo HTML cho từng món rồi .join("") để gộp lại
  grid.innerHTML = dishes.map(dish => `
    <article class="dish-card">
      <div class="dish-badges">
        ${dish.isBestSeller ? '<span class="badge badge-bestseller">🔥 Bán chạy</span>' : ''}
        ${dish.isVegetarian ? '<span class="badge badge-vegetarian">🌱 Món chay</span>' : ''}
        ${dish.status === 'sold_out' ? '<span class="badge" style="background:#EF4444; color:#fff;">Tạm hết</span>' : ''}
      </div>
      <div class="dish-time-badge">⏱️ ${dish.prepTime} phút</div>
      <!-- Bấm ảnh để sang trang chi tiết với id món -->
      <a href="diner-dish-detail.html?id=${dish.id}">
        <img src="${dish.image}" alt="${dish.name}" class="dish-thumb" loading="lazy">
      </a>
      <div class="dish-body">
        <h3 class="dish-title">
          <a href="diner-dish-detail.html?id=${dish.id}">${dish.name}</a>
        </h3>
        <p class="dish-desc">${dish.description}</p>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">
          <span>⭐ ${dish.rating} (${dish.reviewCount} đánh giá)</span> • 
          <span>${dish.spicyLevel > 0 ? '🌶️'.repeat(dish.spicyLevel) : 'Không cay'}</span>
        </div>
        <div class="dish-meta">
          <span class="dish-price">${formatVND(dish.price)}</span>
          ${dish.status === 'available' ? `
            <button class="btn btn-primary btn-sm" onclick="quickAddToCart('${dish.id}')">
              + Thêm món
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" disabled style="opacity:0.6;">Hết món</button>
          `}
        </div>
      </div>
    </article>
  `).join("");
}

// Lọc món theo từ khóa, danh mục, chế độ ăn và sắp xếp
function filterDishes() {
  const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
  const diet = document.getElementById("dietFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let items = Store.getMenuItems(); // Lấy dữ liệu từ LocalStorage

  // 1. Lọc theo danh mục
  if (currentCategory !== "all") {
    items = items.filter(d => d.category === currentCategory);
  }

  // 2. Tìm kiếm theo tên hoặc nguyên liệu
  if (keyword) {
    items = items.filter(d => 
      d.name.toLowerCase().includes(keyword) || 
      d.description.toLowerCase().includes(keyword) ||
      d.ingredients.some(ing => ing.toLowerCase().includes(keyword))
    );
  }

  // 3. Lọc theo chế độ ăn
  if (diet === "vegetarian") items = items.filter(d => d.isVegetarian);
  if (diet === "bestseller") items = items.filter(d => d.isBestSeller);
  if (diet === "non_spicy") items = items.filter(d => d.spicyLevel === 0);

  // 4. Sắp xếp giá / đánh giá
  if (sort === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") items.sort((a, b) => b.price - a.price);
  else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);

  renderDishes(items);
}

// Chọn danh mục món (Khai vị, Món chính...)
function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === cat);
  });
  filterDishes();
}

// Xóa trắng các bộ lọc về mặc định
function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("dietFilter").value = "all";
  document.getElementById("sortFilter").value = "default";
  selectCategory("all");
}

// Thêm nhanh 1 món vào giỏ
function quickAddToCart(dishId) {
  const dish = Store.getMenuItemById(dishId);
  if (dish) {
    Store.addToCart(dish, 1, "Tiêu chuẩn");
    showToast(`Đã thêm "${dish.name}" vào đơn của bàn!`, "success");
    updateCartBadges();
  }
}

// Cập nhật số lượng trên icon giỏ hàng
function updateCartBadges() {
  const cart = Store.getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0); // Đếm tổng số món
  document.getElementById("floatingCartCount").innerText = count;
  document.getElementById("navCartCount").innerText = count;
  updateFloatingCartCount();
}

// Mở modal AI gợi ý món
function openAITasteModal() {
  resetAiModalForm();
  openModal("aiTasteModal");
}

function resetAiModalForm() {
  document.getElementById("aiFormStep").style.display = "block";
  document.getElementById("aiLoadingStep").style.display = "none";
  document.getElementById("aiSuccessStep").style.display = "none";
  document.getElementById("aiErrorStep").style.display = "none";
  document.getElementById("btnAiAnalyze").style.display = "inline-flex";
  document.getElementById("aiResultActions").style.display = "none";
}

function toggleAiSimFailure(checked) {
  AIEngine.simulateFailureMode = checked;
}

// Chạy AI phân tích sở thích để gợi ý combo món
async function runAITasteAnalysis() {
  const flavor = document.getElementById("aiFlavorInput").value;
  const budget = parseInt(document.getElementById("aiBudgetInput").value);
  const groupSize = parseInt(document.getElementById("aiGroupSizeInput").value) || 2;
  const allergy = document.getElementById("aiAllergyInput").value;

  document.getElementById("aiFormStep").style.display = "none";
  document.getElementById("aiLoadingStep").style.display = "block";
  document.getElementById("btnAiAnalyze").style.display = "none";

  // Chờ AI xử lý (bất đồng bộ async/await)
  const result = await AIEngine.recommendDishes({ flavor, budget, groupSize, allergy });

  document.getElementById("aiLoadingStep").style.display = "none";

  if (!result.success) {
    document.getElementById("aiErrorStep").style.display = "block";
    document.getElementById("aiErrorMessage").innerText = result.error;
    return;
  }

  lastAiResult = result;
  document.getElementById("aiSuccessStep").style.display = "block";
  document.getElementById("aiResultActions").style.display = "inline-flex";

  document.getElementById("aiSummaryText").innerText = result.summary;
  document.getElementById("aiTotalComboPrice").innerText = formatVND(result.totalComboPrice);

  const budgetBadge = document.getElementById("aiBudgetCheckBadge");
  if (result.withinBudget) {
    budgetBadge.style.background = "#DCFCE7";
    budgetBadge.style.color = "#166534";
    budgetBadge.innerText = "✓ Tiết kiệm trong ngân sách";
  } else {
    budgetBadge.style.background = "#FEF3C7";
    budgetBadge.style.color = "#92400E";
    budgetBadge.innerText = "Hơi vượt ngân sách nhẹ";
  }

  const recList = document.getElementById("aiRecommendationsList");
  recList.innerHTML = result.recommendations.map(r => `
    <div style="display:flex; align-items:center; gap:12px; background:#fff; padding:10px; border-radius:var(--radius-md); border:1px solid #E2E8F0;">
      <img src="${r.dish.image}" style="width:52px; height:52px; border-radius:var(--radius-sm); object-fit:cover;">
      <div style="flex:1;">
        <div style="font-weight:700; font-size:0.95rem; color:var(--secondary);">${r.dish.name}</div>
        <div style="font-size:0.78rem; color:#6D28D9;">${r.explanation}</div>
      </div>
      <div style="text-align:right;">
        <strong style="color:var(--primary); font-size:0.95rem;">${formatVND(r.dish.price)}</strong>
        <div style="font-size:0.75rem; color:#059669; font-weight:600;">${r.score}% Match</div>
      </div>
    </div>
  `).join("");

  document.getElementById("aiReasonDetail").innerText = 
    `Mô hình đã lọc bỏ các chất gây dị ứng '${allergy}', ưu tiên mức calo và phong cách chế biến phù hợp với bàn ${groupSize} người thưởng thức vào bữa tối.`;
}

// Bấm nhận combo gợi ý từ AI -> thêm toàn bộ vào giỏ
function acceptAiCombo() {
  if (!lastAiResult || !lastAiResult.recommendations) return;
  lastAiResult.recommendations.forEach(r => {
    Store.addToCart(r.dish, 1, "Gợi ý AI");
  });
  closeModal("aiTasteModal");
  showToast(`Đã thêm thành công cả ${lastAiResult.recommendations.length} món gợi ý vào đơn của bàn!`, "success");
  updateCartBadges();
}

// Khi mở trang xong -> tự động tải danh sách món
document.addEventListener("DOMContentLoaded", () => {
  filterDishes();
  updateCartBadges();
});
