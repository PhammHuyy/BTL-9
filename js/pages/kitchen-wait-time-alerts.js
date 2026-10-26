/**
 * kitchen-wait-time-alerts.js - Logic controller cho trang kitchen-wait-time-alerts
 */

function renderAlerts() {
      const orders = Store.getOrders();
      const delayedOrders = orders.filter(o => (o.waitMinutes || 0) >= 15 && o.status !== "completed");
      const list = document.getElementById("alertsList");
      const badge = document.getElementById("criticalCountBadge");

      badge.innerText = `${delayedOrders.length} bàn khẩn`;

      if (delayedOrders.length === 0) {
        list.innerHTML = `
          <div class="empty-state" style="padding:20px;">
            <div style="font-size:2rem;">✓</div>
            <h4>Tất cả các bàn đều được phục vụ đúng hạn</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">Không có bàn nào chờ quá 15 phút.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = delayedOrders.map(order => `
        <div class="alert-card">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="color:var(--secondary); font-size:1.05rem;">${order.tableNumber} (#${order.id})</strong>
              <span class="badge badge-urgent">Đã chờ: ${order.waitMinutes} phút</span>
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
              Khách: <strong>${order.customerName}</strong> • ${order.items.length} món
            </div>
            <div style="font-size:0.8rem; color:#B91C1C; margin-top:4px;">
              Món chính: ${order.items.map(i => i.name).join(", ")}
            </div>
          </div>

          <div style="display:flex; gap:8px; align-items:center;">
            <a href="kitchen-order-detail.html?orderId=${order.id}" class="btn btn-secondary btn-sm">Xem chi tiết</a>
            <button class="btn btn-success btn-sm" onclick="resolveAlert('${order.id}')">✓ Giải tỏa cảnh báo</button>
            <button class="btn btn-danger btn-sm" onclick="escalateOrder('${order.id}')">⚡ Đẩy lên VIP</button>
          </div>
        </div>
      `).join("");
    }

    function resolveAlert(orderId) {
      Store.updateOrderStatus(orderId, "ready");
      showToast(`Đã giải tỏa cảnh báo cho đơn #${orderId}! Món đã hoàn thành.`, "success");
      renderAlerts();
    }

    function escalateOrder(orderId) {
      Store.updateOrderPriority(orderId, "urgent");
      showToast(`Đã đẩy đơn #${orderId} lên ưu tiên cao nhất ca trực!`, "warning");
      renderAlerts();
    }

    function toggleAiFailure(checked) {
      AIEngine.simulateFailureMode = checked;
    }

    async function runAiKitchenPredictor() {
      document.getElementById("aiPredictIntro").style.display = "none";
      document.getElementById("aiPredictLoading").style.display = "block";
      document.getElementById("aiPredictResult").style.display = "none";
      document.getElementById("aiPredictError").style.display = "none";

      const res = await AIEngine.predictKitchenLoad();

      document.getElementById("aiPredictLoading").style.display = "none";

      if (!res.success) {
        document.getElementById("aiPredictError").style.display = "block";
        document.getElementById("aiPredictErrorMsg").innerText = res.error;
        return;
      }

      document.getElementById("aiPredictResult").style.display = "block";
      document.getElementById("aiResultSummaryTitle").innerText = `⚠️ Điểm nghẽn: ${res.bottleneckStation}`;
      document.getElementById("aiOverloadPercent").innerText = `Tải: ${res.stationOverloadPercent}%`;
      document.getElementById("aiActiveOrdersCount").innerText = `${res.activeOrdersCount} order`;
      document.getElementById("aiTotalItemsCount").innerText = `${res.totalActiveItems} món`;
      document.getElementById("aiPredictedWait").innerText = `${res.predictedAverageWait} phút`;
      document.getElementById("aiExplainText").innerText = res.explanation;
      document.getElementById("aiRecommendationText").innerText = res.aiRecommendation;
    }

    function acceptAiAdjustment() {
      showToast("✓ Đã áp dụng điều phối nhân sự: Phụ bếp Bar chuyển sang hỗ trợ trạm Nướng!", "success");
      document.getElementById("aiPredictResult").style.display = "none";
      document.getElementById("aiPredictIntro").style.display = "block";
    }

    function applyDelayToDiners() {
      showToast("✓ Đã gửi thông báo cập nhật thời gian chờ +10 phút trên giao diện thực khách!", "info");
    }

    function dismissAiPrediction() {
      document.getElementById("aiPredictResult").style.display = "none";
      document.getElementById("aiPredictIntro").style.display = "block";
    }

    function resetAiPredictor() {
      document.getElementById("aiPredictError").style.display = "none";
      document.getElementById("aiPredictIntro").style.display = "block";
    }

    function openCreateAlertModal() {
      openModal("createAlertModal");
    }

    function submitCreateAlert() {
      const table = document.getElementById("alertTableSelect").value;
      const wait = parseInt(document.getElementById("alertWaitInput").value) || 20;
      const reason = document.getElementById("alertReasonInput").value;

      showToast(`Đã tạo cảnh báo khẩn cấp cho ${table} (Chờ ${wait} phút)!`, "warning");
      closeModal("createAlertModal");
    }

    document.addEventListener("DOMContentLoaded", renderAlerts);
