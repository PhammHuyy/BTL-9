/**
 * admin-settings.js - Logic controller cho trang admin-settings
 */

function loadSettings() {
      const s = Store.getSettings();

      document.getElementById("settingRestName").value = s.restaurantName || "MenuMind Restaurant & Bistro";
      document.getElementById("settingHotline").value = s.hotline || "1900 8899";
      document.getElementById("settingAddress").value = s.address || "Tầng 3, Trung tâm Ẩm thực CSE122, TP.HCM";
      document.getElementById("settingHours").value = s.openingHours || "10:00 - 23:00 hàng ngày";
      document.getElementById("settingVat").value = s.vatRate !== undefined ? s.vatRate : 8;
      document.getElementById("settingServiceFee").value = s.serviceFee !== undefined ? s.serviceFee : 5;
      document.getElementById("settingAlertDelay").value = s.kitchenAlertDelayMinutes || 20;
      document.getElementById("settingAutoPrint").checked = !!s.autoPrintBill;
      document.getElementById("settingAllowCancel").checked = !!s.allowDinerCancelPending;
      document.getElementById("settingAiModel").value = s.aiModel || "Gemini 3.8 Flash";
    }

    function saveAllSettings() {
      const payload = {
        restaurantName: document.getElementById("settingRestName").value.trim(),
        hotline: document.getElementById("settingHotline").value.trim(),
        address: document.getElementById("settingAddress").value.trim(),
        openingHours: document.getElementById("settingHours").value.trim(),
        vatRate: parseInt(document.getElementById("settingVat").value) || 0,
        serviceFee: parseInt(document.getElementById("settingServiceFee").value) || 0,
        kitchenAlertDelayMinutes: parseInt(document.getElementById("settingAlertDelay").value) || 20,
        autoPrintBill: document.getElementById("settingAutoPrint").checked,
        allowDinerCancelPending: document.getElementById("settingAllowCancel").checked,
        aiModel: document.getElementById("settingAiModel").value
      };

      Store.saveSettings(payload);
      showToast("✓ Đã lưu toàn bộ cài đặt hệ thống thành công!", "success");
    }

    function exportFullBackup() {
      const backup = {
        menuItems: Store.getMenuItems(),
        orders: Store.getOrders(),
        tables: Store.getTables(),
        feedback: Store.getFeedback(),
        staff: Store.getStaff(),
        settings: Store.getSettings(),
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `menumind_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Đã tải xuống file sao lưu hệ thống toàn vẹn!", "success");
    }

    function handleFullDatabaseReset() {
      if (confirm("Khôi phục toàn bộ dữ liệu gốc về trạng thái ban đầu (Xóa các order và món tự thêm)?")) {
        Store.resetAllData();
        showToast("✓ Đã khôi phục toàn bộ cơ sở dữ liệu mẫu thành công!", "success");
        setTimeout(() => window.location.reload(), 600);
      }
    }

    document.addEventListener("DOMContentLoaded", loadSettings);
