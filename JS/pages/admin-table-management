/**
 * admin-table-management.js - Logic controller cho trang admin-table-management
 */

function renderTables() {
      const zone = document.getElementById("zoneFilter").value;
      const status = document.getElementById("statusFilter").value;

      let tables = Store.getTables();

      if (zone !== "all") {
        tables = tables.filter(t => t.zone.includes(zone));
      }
      if (status !== "all") {
        tables = tables.filter(t => t.status === status);
      }

      const container = document.getElementById("tablesContainer");
      if (tables.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <h4>Không có bàn nào phù hợp tiêu chí lọc</h4>
          </div>
        `;
        return;
      }

      container.innerHTML = tables.map(t => {
        let statusBadge = '<span class="badge" style="background:#DCFCE7; color:#166534;">Trống</span>';
        let statusClass = "table-status-available";

        if (t.status === "occupied") {
          statusBadge = '<span class="badge" style="background:#FEE2E2; color:#B91C1C;">Đang có khách</span>';
          statusClass = "table-status-occupied";
        } else if (t.status === "reserved") {
          statusBadge = '<span class="badge" style="background:#FEF3C7; color:#B45309;">Đã đặt trước</span>';
          statusClass = "table-status-reserved";
        }

        return `
          <div class="table-visual-card ${statusClass}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <div class="table-num-large">${t.number}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${t.zone}</div>
              </div>
              ${statusBadge}
            </div>

            <div style="font-size:0.85rem; color:var(--secondary); margin-bottom:14px;">
              👥 Sức chứa: <strong>${t.capacity} chỗ ngồi</strong>
              ${t.currentOrderId ? `<div style="font-size:0.78rem; color:var(--primary); margin-top:2px;">Đơn active: #${t.currentOrderId}</div>` : ''}
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;">
              <button class="btn btn-secondary btn-sm" style="flex:1; padding:4px 8px; font-size:0.75rem;" onclick="viewQrCode('${t.id}', '${t.number}')">
                📱 Xem QR
              </button>
              <button class="btn btn-secondary btn-sm" style="flex:1; padding:4px 8px; font-size:0.75rem;" onclick="editTable('${t.id}')">
                ✏️ Sửa
              </button>
              <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteTableItem('${t.id}')">
                🗑️
              </button>
            </div>

            <div style="margin-top:10px; padding-top:8px; border-top:1px dashed var(--border-color); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Đổi trạng thái:</span>
              <select style="font-size:0.75rem; padding:2px 6px; border-radius:4px; border:1px solid #CBD5E1;" onchange="quickChangeTableStatus('${t.id}', this.value)">
                <option value="available" ${t.status === 'available' ? 'selected' : ''}>Trống</option>
                <option value="occupied" ${t.status === 'occupied' ? 'selected' : ''}>Có khách</option>
                <option value="reserved" ${t.status === 'reserved' ? 'selected' : ''}>Đặt trước</option>
              </select>
            </div>
          </div>
        `;
      }).join("");
    }

    function quickChangeTableStatus(id, newStatus) {
      Store.updateTableStatus(id, newStatus);
      showToast(`Đã cập nhật trạng thái bàn sang: ${newStatus}!`, "info");
      renderTables();
    }

    function openTableModal(table = null) {
      document.getElementById("tableForm").reset();
      const title = document.getElementById("tableModalTitle");
      const idInput = document.getElementById("formTableId");

      if (table) {
        title.innerText = `Chỉnh Sửa: ${table.number}`;
        idInput.value = table.id;
        document.getElementById("formTableNumber").value = table.number;
        document.getElementById("formTableZone").value = table.zone;
        document.getElementById("formTableCapacity").value = table.capacity;
        document.getElementById("formTableStatus").value = table.status;
      } else {
        title.innerText = "Thêm Bàn Ăn Mới";
        idInput.value = "";
      }
      openModal("tableModal");
    }

    function editTable(id) {
      const table = Store.getTables().find(t => t.id === id);
      if (table) openTableModal(table);
    }

    function deleteTableItem(id) {
      const table = Store.getTables().find(t => t.id === id);
      if (table && confirm(`Bạn có chắc muốn xóa ${table.number}?`)) {
        Store.deleteTable(id);
        showToast(`Đã xóa ${table.number}!`, "warning");
        renderTables();
      }
    }

    function handleSaveTable(e) {
      e.preventDefault();
      const id = document.getElementById("formTableId").value;
      const number = document.getElementById("formTableNumber").value.trim();
      const zone = document.getElementById("formTableZone").value;
      const capacity = parseInt(document.getElementById("formTableCapacity").value);
      const status = document.getElementById("formTableStatus").value;

      const payload = { number, zone, capacity, status };
      if (id) payload.id = id;

      Store.saveTable(payload);
      closeModal("tableModal");
      showToast(`Đã lưu thông tin ${number} thành công!`, "success");
      renderTables();
    }

    function viewQrCode(tableId, tableNumber) {
      document.getElementById("qrModalTitle").innerText = `Mã QR: ${tableNumber}`;
      document.getElementById("qrDesc").innerText = `Khách quét để gọi món cho ${tableNumber}`;
      openModal("qrModal");
    }

    function printQrCode() {
      showToast("Đã gửi lệnh in mã QR tem bàn tới máy in nhiệt!", "success");
    }

    document.addEventListener("DOMContentLoaded", renderTables);
