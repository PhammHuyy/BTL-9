/**
 * login.js - Logic controller cho trang login
 */

function quickLoginRole(role) {
      Store.setCurrentRole(role);
      showToast(`Đăng nhập thành công với vai trò: ${role}!`, "success");

      setTimeout(() => {
        if (role === "diner") window.location.href = "diner-menu.html";
        else if (role === "kitchen") window.location.href = "kitchen-board.html";
        else if (role === "manager") window.location.href = "manager-menu-management.html";
        else if (role === "admin") window.location.href = "admin-table-management.html";
      }, 300);
    }

    function handleFormLogin(e) {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      if (email.includes("chef") || email.includes("kitchen") || email.includes("cook")) {
        quickLoginRole("kitchen");
      } else if (email.includes("manager")) {
        quickLoginRole("manager");
      } else if (email.includes("admin")) {
        quickLoginRole("admin");
      } else {
        quickLoginRole("diner");
      }
    }
