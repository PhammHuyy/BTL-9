/**
 * kitchen-order-detail.js - Logic controller cho trang kitchen-order-detail
 */

let currentOrder = null;

    function getOrderIdFromUrl() {
      const p = new URLSearchParams(window.location.search);
      return p.get("orderId") || "ORD-101";
    }

    function initPage() {
      const orders = Store.getOrders();
      const currentId = getOrderIdFromUrl();
      currentOrder = orders.find(o => o.id === currentId) || orders[0];

      const select = document.getElementById("switchOrderSelect");
      select.innerHTML = orders.map(o => `
        <option value="${o.id}" ${o.id === currentOrder.id ? 'selected' : ''}>
          ${o.id} - ${o.tableNumber} (${o.status})
        </option>
      `).join("");

      renderOrderDetails();
    }

    function renderOrderDetails() {
      if (!currentOrder) return;

      document.getElementById("topHeaderOrderId").innerText = `Đơn #${currentOrder.id}`;
      document.getElementById("breadcrumbTitle").innerText = `Chi tiết đơn #${currentOrder.id}`;
      document.getElementById("orderTitle").innerText = `Phiếu Bếp: ${currentOrder.tableNumber}`;
      document.getElementById("custNameText").innerText = currentOrder.customerName || "Khách bàn";
      document.getElementById("custPhoneText").innerText = currentOrder.phone || "--";
      document.getElementById("orderCreatedAt").innerText = currentOrder.createdAt.replace("T", " ").slice(11, 19);
      document.getElementById("orderElapsed").innerText = `${currentOrder.waitMinutes || 10} phút`;
      document.getElementById("orderTotalItemsCount").innerText = `${currentOrder.items.length} món`;

      const badge = document.getElementById("orderStatusBadge");
      badge.innerText = currentOrder.status === "pending" ? "Chờ tiếp nhận" : currentOrder.status === "preparing" ? "Đang nấu" : currentOrder.status === "ready" ? "Nấu xong" : "Đã giao";
      badge.className = `badge badge-${currentOrder.status}`;

      const priBadge = document.getElementById("orderPriorityBadge");
      if (currentOrder.priority === "urgent") {
        priBadge.innerText = "Ưu tiên: 🔥 GẤP";
        priBadge.className = "badge badge-urgent";
      } else {
        priBadge.innerText = "Ưu tiên: Bình thường";
        priBadge.className = "badge";
        priBadge.style.background = "#FEF3C7";
        priBadge.style.color = "#B45309";
      }

      const tbody = document.getElementById("orderItemsTableBody");
      tbody.innerHTML = currentOrder.items.map((it, idx) => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 12px 10px;">
            <strong style="color:var(--secondary); font-size:0.95rem;">${it.name}</strong>
            ${it.note ? `<div style="font-size:0.8rem; color:#DC2626; margin-top:2px;">⚠️ Ghi chú: ${it.note}</div>` : ''}
          </td>
          <td style="padding: 12px 10px; text-align: center; font-weight: 700;">${it.quantity}</td>
          <td style="padding: 12px 10px;">
            <span class="badge" style="background:#F1F5F9; color:#475569;">${it.station || 'saute'}</span>
          </td>
          <td style="padding: 12px 10px;">
            <select class="form-control" style="padding: 4px 8px; font-size: 0.85rem;" onchange="changeItemStatus(${idx}, this.value)">
              <option value="pending" ${it.status === 'pending' ? 'selected' : ''}>Chờ nấu</option>
              <option value="preparing" ${it.status === 'preparing' ? 'selected' : ''}>Đang nấu</option>
              <option value="ready" ${it.status === 'ready' ? 'selected' : ''}>Đã nấu xong</option>
              <option value="served" ${it.status === 'served' ? 'selected' : ''}>Đã phục vụ</option>
            </select>
          </td>
          <td style="padding: 12px 10px; text-align: right;">
            <button class="btn btn-sm btn-secondary" onclick="quickCompleteItem(${idx})">✓ Xong</button>
          </td>
        </tr>
      `).join("");

      renderIngredientsList();
    }

    function renderIngredientsList() {
      const container = document.getElementById("ingredientsChecklist");
      let allIngs = [];

      currentOrder.items.forEach(it => {
        const dish = Store.getMenuItemById(it.dishId);
        if (dish && dish.ingredients) {
          dish.ingredients.forEach(ing => {
            if (!allIngs.includes(ing)) allIngs.push(ing);
          });
        }
      });

      if (allIngs.length === 0) {
        container.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem;">Không có nguyên liệu đặc thù.</div>`;
        return;
      }

      container.innerHTML = allIngs.map((ing, i) => `
        <label class="ingredient-check-item">
          <input type="checkbox" id="ing-${i}">
          <span>${ing}</span>
        </label>
      `).join("");
    }

    function switchOrder(orderId) {
      window.location.search = `?orderId=${orderId}`;
    }

    function changeItemStatus(itemIndex, newStatus) {
      Store.updateOrderItemStatus(currentOrder.id, itemIndex, newStatus);
      showToast(`Đã cập nhật trạng thái món thành '${newStatus}'!`, "success");
      currentOrder = Store.getOrderById(currentOrder.id);
      renderOrderDetails();
    }

    function quickCompleteItem(idx) {
      changeItemStatus(idx, "ready");
    }

    function markAllItemsReady() {
      Store.updateOrderStatus(currentOrder.id, "ready");
      showToast(`Đã hoàn tất tất cả món trong đơn #${currentOrder.id}!`, "success");
      currentOrder = Store.getOrderById(currentOrder.id);
      renderOrderDetails();
    }

    function togglePriority() {
      const newPri = currentOrder.priority === "urgent" ? "normal" : "urgent";
      Store.updateOrderPriority(currentOrder.id, newPri);
      showToast(`Đã đổi mức ưu tiên sang: ${newPri === 'urgent' ? 'GẤP' : 'Bình thường'}!`, "info");
      currentOrder = Store.getOrderById(currentOrder.id);
      renderOrderDetails();
    }

    function saveChefNote() {
      const note = document.getElementById("internalChefNote").value.trim();
      if (!note) {
        showToast("Vui lòng nhập nội dung ghi chú!", "warning");
        return;
      }
      showToast("Đã lưu ghi chú nội bộ vào phiếu bếp!", "success");
    }

    function handleReportOutOfStock() {
      if (confirm("Gửi thông báo tới quản lý và menu diner: Tạm thời hết một số nguyên liệu của đơn này?")) {
        showToast("⚠️ Đã phát cảnh báo kho nguyên liệu tới Quản lý nhà hàng!", "warning");
      }
    }

    function extendWait(minutes) {
      currentOrder.waitMinutes = (currentOrder.waitMinutes || 10) + minutes;
      const orders = Store.getOrders();
      const idx = orders.findIndex(o => o.id === currentOrder.id);
      if (idx !== -1) {
        orders[idx].waitMinutes = currentOrder.waitMinutes;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
      showToast(`Đã cộng thêm +${minutes} phút vào dự kiến thời gian giao món!`, "info");
      renderOrderDetails();
    }

    document.addEventListener("DOMContentLoaded", initPage);
