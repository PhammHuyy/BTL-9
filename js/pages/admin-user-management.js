/**
 * admin-user-management.js - Logic controller cho trang admin-user-management
 */

function renderStaffTable() {
      const keyword = document.getElementById("staffSearchInput").value.toLowerCase().trim();
      const roleFilter = document.getElementById("staffRoleFilter").value;

      let staffList = Store.getStaff();

      if (roleFilter !== "all") {
        staffList = staffList.filter(s => s.role === roleFilter);
      }

      if (keyword) {
        staffList = staffList.filter(s => 
          s.name.toLowerCase().includes(keyword) || 
          s.phone.includes(keyword) || 
          s.email.toLowerCase().includes(keyword)
        );
      }

      document.getElementById("staffCountBadge").innerText = `${staffList.length} nhân viên`;
      const tbody = document.getElementById("staffTableBody");

      const roleBadges = {
        admin: '<span class="badge" style="background:#1E293B; color:#fff;">Admin</span>',
        manager: '<span class="badge" style="background:#E0F2FE; color:#0369A1;">Quản lý</span>',
        kitchen: '<span class="badge" style="background:#FFEDD5; color:#C2410C;">Đầu bếp</span>',
        waiter: '<span class="badge" style="background:#DCFCE7; color:#15803D;">Phục vụ</span>'
      };

      tbody.innerHTML = staffList.map(s => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 12px 16px;">
            <strong style="color:var(--secondary); font-size:0.95rem;">${s.name}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">Mã: ${s.id}</div>
          </td>
          <td style="padding: 12px;">
            ${roleBadges[s.role] || s.role}
          </td>
          <td style="padding: 12px; font-size:0.85rem;">${s.phone}</td>
          <td style="padding: 12px; font-size:0.85rem; color:var(--text-muted);">${s.email}</td>
          <td style="padding: 12px; font-size:0.85rem;">${s.shift || 'Toàn thời gian'}</td>
          <td style="padding: 12px; text-align:center;">
            <span class="badge" style="${s.status === 'active' ? 'background:#DCFCE7; color:#166534;' : 'background:#F1F5F9; color:#64748B;'}">
              ${s.status === 'active' ? 'Đang làm' : 'Tạm nghỉ'}
            </span>
          </td>
          <td style="padding: 12px 16px; text-align:right;">
            <div style="display:flex; justify-content:flex-end; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="editStaffItem('${s.id}')">✏️ Sửa</button>
              <button class="btn btn-danger btn-sm" onclick="deleteStaffItem('${s.id}')">🗑️ Xóa</button>
            </div>
          </td>
        </tr>
      `).join("");
    }

    function openStaffModal(staff = null) {
      document.getElementById("staffForm").reset();
      const title = document.getElementById("staffModalTitle");
      const idInput = document.getElementById("formStaffId");

      if (staff) {
        title.innerText = `Chỉnh Sửa: ${staff.name}`;
        idInput.value = staff.id;
        document.getElementById("formStaffName").value = staff.name;
        document.getElementById("formStaffRole").value = staff.role;
        document.getElementById("formStaffShift").value = staff.shift;
        document.getElementById("formStaffPhone").value = staff.phone;
        document.getElementById("formStaffEmail").value = staff.email;
        document.getElementById("formStaffStatus").value = staff.status;
      } else {
        title.innerText = "Thêm Nhân Sự Mới";
        idInput.value = "";
      }
      openModal("staffModal");
    }

    function editStaffItem(id) {
      const s = Store.getStaff().find(st => st.id === id);
      if (s) openStaffModal(s);
    }

    function deleteStaffItem(id) {
      const s = Store.getStaff().find(st => st.id === id);
      if (s && confirm(`Bạn có chắc muốn xóa nhân viên "${s.name}"?`)) {
        Store.deleteStaff(id);
        showToast(`Đã xóa nhân viên ${s.name}!`, "warning");
        renderStaffTable();
      }
    }

    function handleSaveStaff(e) {
      e.preventDefault();
      const id = document.getElementById("formStaffId").value;
      const name = document.getElementById("formStaffName").value.trim();
      const role = document.getElementById("formStaffRole").value;
      const shift = document.getElementById("formStaffShift").value;
      const phone = document.getElementById("formStaffPhone").value.trim();
      const email = document.getElementById("formStaffEmail").value.trim();
      const status = document.getElementById("formStaffStatus").value;

      const roleNames = {
        admin: "Quản trị viên",
        manager: "Quản lý nhà hàng",
        kitchen: "Bếp trưởng / Đầu bếp",
        waiter: "Nhân viên phục vụ"
      };

      const payload = {
        name,
        role,
        roleName: roleNames[role] || role,
        shift,
        phone,
        email,
        status
      };

      if (id) payload.id = id;

      Store.saveStaff(payload);
      closeModal("staffModal");
      showToast(`Đã lưu nhân sự ${name} thành công!`, "success");
      renderStaffTable();
    }

    document.addEventListener("DOMContentLoaded", renderStaffTable);
