/**
 * diner-dish-detail.js - Quản lý trang chi tiết món ăn
 */

let currentDish = null;       // Món ăn hiện tại
let selectedQuantity = 1;     // Số lượng
let selectedSize = "standard";// Kích cỡ
let selectedSpice = "standard";// Độ cay

// Lấy ID món từ URL (?id=...)
function getDishIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "dish-01";
}

// Nạp dữ liệu món ăn vào giao diện
function loadDishDetail() {
  const dishId = getDishIdFromUrl();
  currentDish = Store.getMenuItemById(dishId);

  // Không tìm thấy món thì quay về trang menu
  if (!currentDish) {
    window.location.href = "diner-menu.html";
    return;
  }

  document.title = `${currentDish.name} | MenuMind`;
  document.getElementById("dishName").innerText = currentDish.name;
  document.getElementById("breadcrumbName").innerText = currentDish.name;
  document.getElementById("breadcrumbCategory").innerText = currentDish.categoryName || "Thực đơn";
  document.getElementById("dishCategoryName").innerText = currentDish.categoryName || "Món ăn";
  document.getElementById("dishPrice").innerText = formatVND(currentDish.price);
  document.getElementById("dishDescription").innerText = currentDish.description;
  document.getElementById("dishImage").src = currentDish.image;
  document.getElementById("dishRating").innerText = `⭐ ${currentDish.rating} (${currentDish.reviewCount} đánh giá)`;
  document.getElementById("dishPrepTime").innerText = `${currentDish.prepTime} phút`;
  document.getElementById("dishCalories").innerText = `${currentDish.calories} kcal`;
  document.getElementById("dishSpicyText").innerText = currentDish.spicyLevel > 0 ? `Cấp ${currentDish.spicyLevel}` : "Không cay";

  const badgesContainer = document.getElementById("dishBadges");
  badgesContainer.innerHTML = `
    ${currentDish.isBestSeller ? '<span class="badge badge-bestseller">🔥 Bán chạy</span>' : ''}
    ${currentDish.isVegetarian ? '<span class="badge badge-vegetarian">🌱 Chay</span>' : ''}
    ${currentDish.isChefSpecial ? '<span class="badge" style="background:#EDE9FE; color:#6D28D9;">👑 Đặc quyền Bếp trưởng</span>' : ''}
  `;

  // Render nguyên liệu
  document.getElementById("dishIngredients").innerHTML = currentDish.ingredients.map(ing => `
    <span class="ingredient-tag">${ing}</span>
  `).join("");

  // Cảnh báo chất dị ứng nếu có
  if (currentDish.allergens && currentDish.allergens.length > 0) {
    document.getElementById("allergenSection").style.display = "block";
    document.getElementById("dishAllergens").innerHTML = currentDish.allergens.map(al => `
      <span class="allergen-pill">${al}</span>
    `).join("");
  }

  updatePriceCalculation();
  loadDishReviews(dishId);
  updateCartBadge();
}

// Chọn size hoặc độ cay
function selectOption(group, element) {
  const container = element.parentElement;
  container.querySelectorAll(".option-pill").forEach(p => p.classList.remove("active"));
  element.classList.add("active");

  if (group === "size") selectedSize = element.dataset.size;
  else if (group === "spicy") selectedSpice = element.dataset.spice;
  updatePriceCalculation();
}

// Tăng / giảm số lượng
function adjustQty(delta) {
  selectedQuantity = Math.max(1, selectedQuantity + delta); // Tối thiểu là 1
  document.getElementById("qtyDisplay").innerText = selectedQuantity;
  updatePriceCalculation();
}

// Tính lại giá tiền (nếu chọn size lớn +35k)
function updatePriceCalculation() {
  if (!currentDish) return;
  let basePrice = currentDish.price;
  if (selectedSize === "large") basePrice += 35000;
  const total = basePrice * selectedQuantity;
  document.getElementById("submitPriceDisplay").innerText = formatVND(total);
}

// Thêm món vào giỏ kèm ghi chú
function handleAddToCart(e) {
  e.preventDefault();
  if (!currentDish) return;

  const customNote = document.getElementById("customNote").value.trim();
  let finalNoteParts = [];
  if (selectedSize === "large") finalNoteParts.push("Khẩu phần lớn (+35k)");
  if (selectedSpice === "no-spicy") finalNoteParts.push("Không cay");
  else if (selectedSpice === "extra-spicy") finalNoteParts.push("Cay nồng thêm ớt");
  if (customNote) finalNoteParts.push(customNote);

  const finalNote = finalNoteParts.length > 0 ? finalNoteParts.join(" • ") : "Tiêu chuẩn";

  Store.addToCart(currentDish, selectedQuantity, finalNote);
  showToast(`Đã thêm ${selectedQuantity}x "${currentDish.name}" vào đơn của bàn!`, "success");
  updateCartBadge();
}

// Cập nhật số lượng giỏ hàng
function updateCartBadge() {
  const cart = Store.getCart();
  const count = cart.reduce((s, it) => s + it.quantity, 0);
  document.getElementById("navCartCount").innerText = count;
  updateFloatingCartCount();
}

// Tải đánh giá khách hàng về món
function loadDishReviews(dishId) {
  const allFeedback = Store.getFeedback();
  const reviews = allFeedback.filter(f => f.dishId === dishId);
  const container = document.getElementById("dishReviewsList");

  if (reviews.length === 0) {
    container.innerHTML = `<div style="font-size:0.9rem; color:var(--text-muted); padding:10px 0;">Chưa có đánh giá chi tiết riêng cho món này.</div>`;
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div style="padding:14px; background:var(--bg-subtle); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <strong style="color:var(--secondary); font-size:0.95rem;">${r.customerName} (${r.tableNumber})</strong>
        <span style="color:#D97706; font-size:0.85rem;">⭐ ${r.rating} sao • ${r.date}</span>
      </div>
      <p style="font-size:0.88rem; color:var(--secondary-muted); margin-bottom:8px;">"${r.comment}"</p>
      ${r.replied ? `
        <div style="background:#fff; padding:8px 12px; border-left:3px solid var(--primary); border-radius:4px; font-size:0.8rem; color:var(--secondary-muted);">
          <strong>Quản lý phản hồi:</strong> ${r.replyText}
        </div>
      ` : ''}
    </div>
  `).join("");
}

// Tự động chạy khi nạp trang xong
document.addEventListener("DOMContentLoaded", loadDishDetail);
