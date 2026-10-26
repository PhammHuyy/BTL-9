/**
 * kitchen-board.js - Logic controller cho trang kitchen-board
 */

let currentStationFilter = "all";
    let isRushMode = false;

    function renderKanban() {
      const orders = Store.getOrders();

      const pendingOrders = [];
      const preparingOrders = [];
      const readyOrders = [];
      const servedOrders = [];

      orders.forEach(order => {
        if (currentStationFilter !== "all") {
          const hasStation = order.items.some(it => {
            const dish = Store.getMenuItemById(it.dishId);
            return (dish && dish.station === currentStationFilter) || it.station === currentStationFilter;
          });
          if (!hasStation) return;
        }

        if (order.status === "pending") pendingOrders.push(order);
        else if (order.status === "preparing") preparingOrders.push(order);
        else if (order.status === "ready") readyOrders.push(order);
        else if (order.status === "served" || order.status === "completed") servedOrders.push(order);
      });

      document.getElementById("countPending").innerText = pendingOrders.length;
      document.getElementById("countPreparing").innerText = preparingOrders.length;
      document.getElementById("countReady").innerText = readyOrders.length;
      document.getElementById("countServed").innerText = servedOrders.length;

      document.getElementById("colPendingCards").innerHTML = renderCardsList(pendingOrders, "pending");
      document.getElementById("colPreparingCards").innerHTML = renderCardsList(preparingOrders, "preparing");
      document.getElementById("colReadyCards").innerHTML = renderCardsList(readyOrders, "ready");
      document.getElementById("colServedCards").innerHTML = renderCardsList(servedOrders, "served");
    }

    function renderCardsList(ordersList, status) {
      if (ordersList.length === 0) {
        return `
          <div style="text-align:center; padding:30px 10px; color:var(--text-muted); font-size:0.85rem;">
            Không có order nào ở trạng thái này
          </div>
        `;
      }

      return ordersList.map(order => {
        const isUrgent = order.priority === "urgent" || order.waitMinutes > 20;

        return `
          <div class="kanban-card ${isUrgent ? 'border-urgent' : ''}" style="${isUrgent ? 'border-left: 4px solid #EF4444;' : ''}">
            <div class="kanban-card-top">
              <span class="kanban-order-id">#${order.id}</span>
              <span class="kanban-table-tag">${order.tableNumber}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.78rem;">
              <span style="color:var(--text-muted);">Khách: <strong>${order.customerName}</strong></span>
              <span class="badge ${isUrgent ? 'badge-urgent' : 'badge-pending'}">
                ⏱️ ${order.waitMinutes}m ${isUrgent ? '🔥 CẦN GẤP' : ''}
              </span>
            </div>

            <div style="margin: 10px 0;">
              ${order.items.map(it => `
                <div class="kanban-dish-item">
                  <div>
                    <strong style="color:var(--secondary); font-size:0.9rem;">${it.quantity}x ${it.name}</strong>
                    ${it.note ? `<div class="kanban-note">⚠️ ${it.note}</div>` : ''}
                  </div>
                  <span style="font-size:0.75rem; color:#64748B;">${it.station || 'bếp'}</span>
                </div>
              `).join("")}
            </div>

            <div style="display:flex; gap:6px; margin-top:12px; align-items:center;">
              <a href="kitchen-order-detail.html?orderId=${order.id}" class="btn btn-secondary btn-sm" style="flex:1; font-size:0.78rem; padding:6px 8px;">
                Chi tiết
              </a>

              ${status === 'pending' ? `
                <button class="btn btn-primary btn-sm" style="flex:1.5; font-size:0.78rem; padding:6px 8px;" onclick="advanceOrderStatus('${order.id}', 'preparing')">
                  👨‍🍳 Nhận nấu
                </button>
              ` : ''}

              ${status === 'preparing' ? `
                <button class="btn btn-success btn-sm" style="flex:1.5; font-size:0.78rem; padding:6px 8px;" onclick="advanceOrderStatus('${order.id}', 'ready')">
                  ✓ Đã nấu xong
                </button>
              ` : ''}

              ${status === 'ready' ? `
                <button class="btn btn-secondary btn-sm" style="flex:1.5; background:#475569; color:#fff; font-size:0.78rem; padding:6px 8px;" onclick="advanceOrderStatus('${order.id}', 'served')">
                  🚀 Giao ra bàn
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join("");
    }

    function advanceOrderStatus(orderId, nextStatus) {
      Store.updateOrderStatus(orderId, nextStatus);
      const label = nextStatus === "preparing" ? "Đang nấu" : nextStatus === "ready" ? "Nấu xong" : "Đã giao";
      showToast(`Đã chuyển đơn #${orderId} sang trạng thái: ${label}!`, "success");
      renderKanban();
    }

    function filterByStation(station) {
      currentStationFilter = station;
      const buttons = ["btnStationAll", "btnStationGrill", "btnStationSaute", "btnStationHotpot", "btnStationBar"];
      buttons.forEach(b => {
        const el = document.getElementById(b);
        if (el) el.className = "btn btn-sm btn-secondary";
      });

      const activeMap = {
        all: "btnStationAll",
        grill: "btnStationGrill",
        saute: "btnStationSaute",
        hotpot: "btnStationHotpot",
        bar: "btnStationBar"
      };
      if (document.getElementById(activeMap[station])) {
        document.getElementById(activeMap[station]).className = "btn btn-sm btn-primary";
      }

      renderKanban();
    }

    function toggleRushMode() {
      isRushMode = !isRushMode;
      const btn = document.getElementById("rushModeBtn");
      const txt = document.getElementById("rushText");
      if (isRushMode) {
        btn.style.background = "#DC2626";
        btn.style.color = "#fff";
        txt.innerText = "Chế độ Giờ cao điểm: BẬT";
        showToast("🔥 Đã kích hoạt Chế độ Giờ cao điểm! Khuyến nghị xem dự báo AI-2.", "warning");
      } else {
        btn.style.background = "#FEF2F2";
        btn.style.color = "#991B1B";
        txt.innerText = "Chế độ Giờ cao điểm: TẮT";
      }
    }

    function handleRefreshKds() {
      renderKanban();
      showToast("Đã cập nhật dữ liệu bảng KDS mới nhất!", "info");
    }

    document.addEventListener("DOMContentLoaded", renderKanban);
