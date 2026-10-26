/**
 * manager-menu-management.js - Logic controller cho trang manager-menu-management
 */

function renderManagerDishes() {
      const keyword = document.getElementById("mgrSearchInput").value.toLowerCase().trim();
      const cat = document.getElementById("mgrCategoryFilter").value;
      const status = document.getElementById("mgrStatusFilter").value;

      let items = Store.getMenuItems();

      if (cat !== "all") {
        items = items.filter(d => d.category === cat);
      }
      if (status !== "all") {
        items = items.filter(d => d.status === status);
      }
      if (keyword) {
        items = items.filter(d => 
          d.name.toLowerCase().includes(keyword) || 
          d.id.toLowerCase().includes(keyword) ||
          d.description.toLowerCase().includes(keyword)
        );
      }

      document.getElementById("totalDishCountBadge").innerText = `${items.length} món`;

      const tbody = document.getElementById("mgrDishesTableBody");
      const empty = document.getElementById("mgrEmptyTableState");

      if (items.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
      }

      empty.style.display = "none";
      tbody.innerHTML = items.map(dish => {
        const isAvailable = dish.status === "available";

        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 12px 16px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${dish.image}" alt="${dish.name}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover; border:1px solid #E2E8F0;">
                <div>
                  <strong style="color:var(--secondary); font-size:0.95rem;">${dish.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">Mã: ${dish.id}</div>
                  ${dish.isVegetarian ? '<span class="badge badge-vegetarian" style="font-size:0.65rem; padding:1px 6px;">Chay</span>' : ''}
                  ${dish.isBestSeller ? '<span class="badge badge-bestseller" style="font-size:0.65rem; padding:1px 6px;">Hot</span>' : ''}
                </div>
              </div>
            </td>
            <td style="padding: 12px;">
              <span class="badge" style="background:#F1F5F9; color:#475569;">${dish.categoryName || dish.category}</span>
            </td>
            <td style="padding: 12px; font-weight:700; color:var(--primary);">
              ${formatVND(dish.price)}
            </td>
            <td style="padding: 12px; font-size:0.85rem; color:var(--secondary-muted);">
              ${dish.station || 'saute'}
            </td>
            <td style="padding: 12px; font-size:0.85rem;">
              ⏱️ ${dish.prepTime}m
            </td>
            <td style="padding: 12px; font-size:0.85rem; color:#D97706;">
              ⭐ ${dish.rating}
            </td>
            <td style="padding: 12px; text-align:center;">
              <label class="switch-toggle">
                <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleDishAvailability('${dish.id}')">
                <span class="slider"></span>
              </label>
            </td>
            <td style="padding: 12px 16px; text-align:right;">
              <div style="display:flex; justify-content:flex-end; gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="editDish('${dish.id}')">✏️ Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDish('${dish.id}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    function toggleDishAvailability(id) {
      const newStatus = Store.toggleDishStatus(id);
      showToast(`Đã đổi trạng thái món: ${newStatus === 'available' ? 'Còn món phục vụ' : 'Tạm hết món'}!`, "info");
      renderManagerDishes();
    }

    function openDishModal(dish = null) {
      document.getElementById("dishForm").reset();
      const title = document.getElementById("dishModalTitle");
      const idInput = document.getElementById("dishFormId");

      if (dish) {
        title.innerText = `Chỉnh Sửa: ${dish.name}`;
        idInput.value = dish.id;
        document.getElementById("formDishName").value = dish.name;
        document.getElementById("formDishCategory").value = dish.category;
        document.getElementById("formDishStation").value = dish.station || "saute";
        document.getElementById("formDishPrice").value = dish.price;
        document.getElementById("formDishPrepTime").value = dish.prepTime;
        document.getElementById("formDishImage").value = dish.image;
        document.getElementById("formDishIngredients").value = (dish.ingredients || []).join(", ");
        document.getElementById("formDishDesc").value = dish.description || "";
        document.getElementById("formDishVegetarian").checked = !!dish.isVegetarian;
        document.getElementById("formDishBestSeller").checked = !!dish.isBestSeller;
        document.getElementById("formDishChefSpecial").checked = !!dish.isChefSpecial;
      } else {
        title.innerText = "Thêm Món Ăn Mới";
        idInput.value = "";
      }

      openModal("dishModal");
    }

    function editDish(id) {
      const dish = Store.getMenuItemById(id);
      if (dish) openDishModal(dish);
    }

    function deleteDish(id) {
      const dish = Store.getMenuItemById(id);
      if (dish && confirm(`Bạn có chắc chắn muốn xóa món "${dish.name}" khỏi thực đơn?`)) {
        Store.deleteMenuItem(id);
        showToast(`Đã xóa món "${dish.name}" thành công!`, "warning");
        renderManagerDishes();
      }
    }

    function handleSaveDish(e) {
      e.preventDefault();

      const id = document.getElementById("dishFormId").value;
      const name = document.getElementById("formDishName").value.trim();
      const category = document.getElementById("formDishCategory").value;
      const station = document.getElementById("formDishStation").value;
      const price = parseInt(document.getElementById("formDishPrice").value);
      const prepTime = parseInt(document.getElementById("formDishPrepTime").value);
      const image = document.getElementById("formDishImage").value.trim() || "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
      const ingStr = document.getElementById("formDishIngredients").value;
      const description = document.getElementById("formDishDesc").value.trim();
      const isVegetarian = document.getElementById("formDishVegetarian").checked;
      const isBestSeller = document.getElementById("formDishBestSeller").checked;
      const isChefSpecial = document.getElementById("formDishChefSpecial").checked;

      const catNames = {
        appetizer: "Món khai vị",
        main: "Món chính",
        hotpot: "Lẩu & Nướng",
        dessert: "Tráng miệng",
        drink: "Đồ uống"
      };

      const ingredients = ingStr ? ingStr.split(",").map(i => i.trim()).filter(Boolean) : ["Gia vị tự nhiên"];

      const dishPayload = {
        name,
        category,
        categoryName: catNames[category] || "Món chính",
        station,
        price,
        prepTime,
        image,
        ingredients,
        description,
        isVegetarian,
        isBestSeller,
        isChefSpecial,
        status: "available",
        calories: 450,
        spicyLevel: 1
      };

      if (id) dishPayload.id = id;

      Store.saveMenuItem(dishPayload);
      closeModal("dishModal");
      showToast(`Đã lưu thông tin món "${name}" thành công!`, "success");
      renderManagerDishes();
    }

    function exportMenuJson() {
      const data = JSON.stringify(Store.getMenuItems(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menumind_menu_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showToast("Đã tải xuống file dữ liệu menu JSON!", "success");
    }

    document.addEventListener("DOMContentLoaded", renderManagerDishes);
