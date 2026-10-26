/**
 * MenuMind - Main Frontend Controller & Shared Components
 */

function formatVND(amount) {
  return (amount || 0).toLocaleString("vi-VN") + " ₫";
}

function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  toast.innerHTML = `<span style="font-weight:bold; font-size:1.1rem">${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add("show");
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove("show");
}

function renderRoleQuickBar() {
  const currentPath = window.location.pathname;
  let activeRole = "diner";
  if (currentPath.includes("kitchen")) activeRole = "kitchen";
  else if (currentPath.includes("manager")) activeRole = "manager";
  else if (currentPath.includes("admin")) activeRole = "admin";
  else if (currentPath.includes("index") || currentPath.endsWith("/")) activeRole = "home";

  const bar = document.createElement("div");
  bar.className = "role-quick-bar";
  bar.innerHTML = `
    <div class="role-bar-left">
      <span class="role-bar-badge">CSE122 • NHÓM BTL-09</span>
      <span style="font-weight:600; color:#FDBA74;">MenuMind Demo:</span>
      <div class="role-bar-nav">
        <a href="index.html" class="role-btn ${activeRole === 'home' ? 'active' : ''}">🏠 Tổng quan dự án</a>
        <a href="diner-menu.html" class="role-btn ${activeRole === 'diner' ? 'active' : ''}">🍽️ Khách hàng (Diner)</a>
        <a href="kitchen-board.html" class="role-btn ${activeRole === 'kitchen' ? 'active' : ''}">👨‍🍳 Nhân viên bếp (Kitchen)</a>
        <a href="manager-menu-management.html" class="role-btn ${activeRole === 'manager' ? 'active' : ''}">📊 Quản lý (Manager)</a>
        <a href="admin-table-management.html" class="role-btn ${activeRole === 'admin' ? 'active' : ''}">⚙️ Quản trị viên (Admin)</a>
      </div>
    </div>
    <div class="role-bar-actions">
      <button class="btn-reset-data" onclick="handleResetData()" title="Khôi phục lại dữ liệu mẫu 6 thực thể">🔄 Reset Mock Data</button>
      <a href="login.html" style="color:#A5B4FC; font-size:0.8rem; text-decoration:underline;">Đổi tài khoản</a>
    </div>
  `;

  document.body.prepend(bar);
}

function handleResetData() {
  if (confirm("Khôi phục toàn bộ dữ liệu mẫu (Món ăn, Bàn ăn, Đơn hàng, Phản hồi, Nhân sự)?")) {
    Store.resetAllData();
    showToast("Đã khôi phục dữ liệu mẫu ban đầu thành công!", "success");
    setTimeout(() => window.location.reload(), 600);
  }
}

function updateFloatingCartCount() {
  const badge = document.getElementById("cartCountBadge");
  if (badge) {
    const cart = Store.getCart();
    const count = cart.reduce((sum, it) => sum + it.quantity, 0);
    badge.innerText = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderRoleQuickBar();
  updateFloatingCartCount();

  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });
});
