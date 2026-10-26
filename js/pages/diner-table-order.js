/**
 * diner-table-order.js - Quản lý giỏ hàng và tiến trình đơn tại bàn
 */

const currentTableId = "T-04"; // Bàn hiện tại
let activeSentOrder = null;    // Đơn hàng đang được bếp nấu

function loadOrderPage() {
  const allOrders = Store.getOrders();
  // Tìm đơn hàng đang phục vụ của bàn này
  activeSentOrder = allOrders.find(o => o.tableId === currentTableId && o.status !== "completed" && o.status !== "cancelled");

  renderActiveOrderTimeline();
  renderDraftCart();
  calculateTotals();
}

// Cập nhật trạng thái thanh tiến trình Timeline 4 bước
function renderActiveOrderTimeline() {
  const card = document.getElementById("orderProgressCard");
  const list = document.getElementById("kitchenCookingItemsList");

  // Nếu bàn chưa gửi đơn nào -> ẩn thanh timeline
  if (!activeSentOrder) {
    card.style.display = "none";
    return;
  }

  card.style.display = "block";
  document.getElementById("activeOrderIdBadge").innerText = `Mã đơn: ${activeSentOrder.id}`;

  const steps = ["step-pending", "step-preparing", "step-ready", "step-served"];
  steps.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.className = "timeline-step";
  });

  // Đổi trạng thái hiển thị theo từng nấc
  if (activeSentOrder.status === "pending") {
    document.getElementById("step-pending").className = "timeline-step active";
    document.getElementById("activeOrderStatusText").innerText = "Chờ Bếp tiếp nhận đơn";
  } else if (activeSentOrder.status === "preparing") {
    document.getElementById("step-pending").className = "timeline-step completed";
    document.getElementById("step-preparing").className = "timeline-step active";
    document.getElementById("activeOrderStatusText").innerText = "Đang chế biến trên chảo/lò";
  } else if (activeSentOrder.status === "ready") {
    document.getElementById("step-pending").className = "timeline-step completed";
    document.getElementById("step-preparing").className = "timeline-step completed";
    document.getElementById("step-ready").className = "timeline-step active";
    document.getElementById("activeOrderStatusText").innerText = "Món đã nấu xong! Sắp được mang lên bàn";
  } else if (activeSentOrder.status === "served") {
    steps.forEach(s => document.getElementById(s).className = "timeline-step completed");
    document.getElementById("activeOrderStatusText").innerText = "Đã phục vụ đầy đủ trên bàn";
  }

  list.innerHTML = activeSentOrder.items.map(it => {
    let badgeColor = "#FEF3C7; color:#B45309;";
    let statusTxt = "Chờ nấu";
    if (it.status === "preparing") { badgeColor = "#E0F2FE; color:#0369A1;"; statusTxt = "Đang nấu"; }
    else if (it.status === "ready") { badgeColor = "#DCFCE7; color:#15803D;"; statusTxt = "Đã nấu xong"; }
    else if (it.status === "served") { badgeColor = "#F1F5F9; color:#475569;"; statusTxt = "Đã dọn lên bàn"; }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:8px 12px; border-radius:var(--radius-sm); border:1px solid #E2E8F0;">
        <div>
          <strong style="color:var(--secondary); font-size:0.9rem;">${it.name}</strong> 
          <span style="font-size:0.85rem; color:var(--text-muted);">x${it.quantity}</span>
          <div style="font-size:0.75rem; color:#DC2626;">Ghi chú: ${it.note || "Chuẩn vị"}</div>
        </div>
        <span class="badge" style="background:${badgeColor}; font-size:0.75rem;">${statusTxt}</span>
      </div>
    `;
  }).join("");
}

// Render các món đang trong giỏ hàng nháp (chưa gửi bếp)
function renderDraftCart() {
  const cart = Store.getCart();
  const list = document.getElementById("draftCartList");
  const emptyState = document.getElementById("emptyDraftState");
  const sendForm = document.getElementById("sendOrderForm");
  const badge = document.getElementById("draftCountBadge");

  badge.innerText = `${cart.length} món`;

  if (cart.length === 0) {
    list.innerHTML = "";
    emptyState.style.display = "block";
    sendForm.style.opacity = "0.5";
    document.getElementById("btnSubmitOrder").disabled = true;
    return;
  }

  emptyState.style.display = "none";
  sendForm.style.opacity = "1";
  document.getElementById("btnSubmitOrder").disabled = false;

  list.innerHTML = cart.map((it, idx) => `
    <div class="cart-item-card">
      <div style="flex:1;">
        <h4 style="font-size:1rem; color:var(--secondary); margin-bottom:4px;">${it.name}</h4>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">
          Ghi chú: <span style="color:var(--primary);">${it.note || "Chuẩn vị"}</span>
        </div>
        <strong style="color:var(--primary); font-size:0.95rem;">${formatVND(it.price)}</strong>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="item-qty-badge">
          <button class="btn-qty" onclick="updateItemQuantity(${idx}, -1)">-</button>
          <span>${it.quantity}</span>
          <button class="btn-qty" onclick="updateItemQuantity(${idx}, 1)">+</button>
        </div>
        <button onclick="removeCartItem(${idx})" style="background:none; border:none; color:#EF4444; font-size:1.1rem; cursor:pointer;" title="Xóa món">🗑️</button>
      </div>
    </div>
  `).join("");
}

// Tăng giảm số lượng món trong giỏ
function updateItemQuantity(idx, delta) {
  const cart = Store.getCart();
  if (cart[idx]) {
    const newQty = cart[idx].quantity + delta;
    Store.updateCartItemQuantity(idx, newQty);
    renderDraftCart();
    calculateTotals();
    updateFloatingCartCount();
  }
}

// Xóa 1 món khỏi giỏ
function removeCartItem(idx) {
  if (confirm("Bạn muốn xóa món này khỏi giỏ?")) {
    Store.updateCartItemQuantity(idx, 0);
    showToast("Đã xóa món khỏi giỏ", "warning");
    renderDraftCart();
    calculateTotals();
    updateFloatingCartCount();
  }
}

// Tính tiền: Tạm tính, Thuế VAT (8%), Giảm giá và Tổng thanh toán
function calculateTotals() {
  const cart = Store.getCart();
  const draftTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const sentTotal = activeSentOrder ? activeSentOrder.totalAmount : 0;

  const subtotal = draftTotal + sentTotal;
  const vat = Math.round(subtotal * 0.08);     // VAT 8%
  const discount = Math.round(subtotal * 0.05);// Giảm giá thành viên 5%
  const grandTotal = subtotal + vat - discount;

  document.getElementById("draftTotalAmount").innerText = formatVND(draftTotal);
  document.getElementById("sentTotalAmount").innerText = formatVND(sentTotal);
  document.getElementById("vatAmount").innerText = formatVND(vat);
  document.getElementById("discountAmount").innerText = `- ${formatVND(discount)}`;
  document.getElementById("grandTotalAmount").innerText = formatVND(grandTotal);
}

// Gửi giỏ hàng nháp xuống cho Bếp nấu
function handleSubmitDraftOrder() {
  const cart = Store.getCart();
  if (cart.length === 0) {
    showToast("Giỏ hàng của bạn đang trống!", "error");
    return;
  }

  const custName = document.getElementById("custNameInput").value.trim() || "Khách Bàn 04";
  const custPhone = document.getElementById("custPhoneInput").value.trim() || "0900000004";

  const itemsToCook = cart.map(it => ({
    dishId: it.dishId,
    name: it.name,
    quantity: it.quantity,
    price: it.price,
    note: it.note,
    status: "pending",
    station: "saute"
  }));

  // Tạo đơn hàng mới trong LocalStorage
  const newOrder = Store.createOrder({
    tableId: currentTableId,
    tableNumber: "Bàn 04 (Bàn của bạn)",
    customerName: custName,
    phone: custPhone,
    totalAmount: cart.reduce((s, it) => s + (it.price * it.quantity), 0),
    items: itemsToCook
  });

  Store.clearCart(); // Dọn sạch giỏ nháp
  showToast(`Đã gửi thành công đơn #${newOrder.id} xuống màn hình Bếp!`, "success");
  loadOrderPage();
  updateFloatingCartCount();
}

function handleCallStaff() {
  showToast("🔔 Đã phát chuông gọi nhân viên phục vụ tới Bàn 04!", "info");
}

function handleRequestBill() {
  if (confirm("Yêu cầu in hóa đơn tạm tính và thanh toán tại Bàn 04?")) {
    showToast("✓ Đã gửi yêu cầu thanh toán tới Quầy thu ngân & Nhân viên phục vụ!", "success");
  }
}

function openFeedbackModal() {
  openModal("feedbackModal");
}

function submitCustomerFeedback() {
  const custName = document.getElementById("fbCustName").value.trim() || "Khách Bàn 04";
  const rating = parseInt(document.getElementById("fbRating").value);
  const theme = document.getElementById("fbTheme").value;
  const comment = document.getElementById("fbComment").value.trim();

  if (!comment) {
    alert("Vui lòng nhập lời nhận xét chi tiết của bạn!");
    return;
  }

  Store.addFeedback({
    customerName: custName,
    tableNumber: "Bàn 04",
    rating: rating,
    theme: theme,
    dishName: "Tổng thể thực đơn",
    comment: comment,
    sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative"
  });

  closeModal("feedbackModal");
  showToast("Cảm ơn quý khách đã gửi đánh giá quý báu cho MenuMind!", "success");
}

document.addEventListener("DOMContentLoaded", loadOrderPage);
