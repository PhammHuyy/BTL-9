/**
 * MenuMind - Data Store & LocalStorage Controller
 * Quản lý trạng thái tập trung và CRUD đồng bộ cho 6 thực thể
 */

const STORAGE_KEYS = {
  MENU: "menumind_menuItems",
  ORDERS: "menumind_orders",
  TABLES: "menumind_tables",
  FEEDBACK: "menumind_feedback",
  STAFF: "menumind_staff",
  SETTINGS: "menumind_settings",
  CURRENT_CART: "menumind_current_cart",
  CURRENT_ROLE: "menumind_current_role",
  CURRENT_TABLE: "menumind_current_table"
};

const Store = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      this.resetAllData();
    }
  },

  resetAllData() {
    if (typeof INITIAL_MOCK_DATA === "undefined") {
      console.error("INITIAL_MOCK_DATA not loaded");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MOCK_DATA.menuItems));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_MOCK_DATA.orders));
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_MOCK_DATA.tables));
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_MOCK_DATA.feedback));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_MOCK_DATA.staff));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_MOCK_DATA.settings));
    localStorage.setItem(STORAGE_KEYS.CURRENT_TABLE, "T-04");
    
    const initialCart = [
      { dishId: "dish-01", name: "Bò Wagyu Nướng Sốt Tiêu Đen", price: 289000, quantity: 1, note: "Ăn tái vừa", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" },
      { dishId: "dish-08", name: "Trà Đào Cam Sả Hạt Chia", price: 55000, quantity: 2, note: "Ít đá", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80" }
    ];
    localStorage.setItem(STORAGE_KEYS.CURRENT_CART, JSON.stringify(initialCart));
    console.log("MenuMind: Đã nạp lại dữ liệu khởi tạo mặc định thành công!");
  },

  getCurrentRole() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || "diner";
  },

  setCurrentRole(role) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  },

  getCurrentTableId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_TABLE) || "T-04";
  },

  setCurrentTableId(tableId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TABLE, tableId);
  },

  getMenuItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || "[]");
  },

  getMenuItemById(id) {
    const items = this.getMenuItems();
    return items.find(item => item.id === id) || null;
  },

  saveMenuItem(dishData) {
    const items = this.getMenuItems();
    if (dishData.id) {
      const index = items.findIndex(i => i.id === dishData.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...dishData };
      } else {
        items.push(dishData);
      }
    } else {
      const newDish = {
        ...dishData,
        id: "dish-" + Date.now().toString().slice(-4),
        rating: 5.0,
        reviewCount: 0
      };
      items.unshift(newDish);
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    return true;
  },

  deleteMenuItem(id) {
    let items = this.getMenuItems();
    items = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    return true;
  },

  toggleDishStatus(id) {
    const items = this.getMenuItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.status = item.status === "available" ? "sold_out" : "available";
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
      return item.status;
    }
    return null;
  },

  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
  },

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: "ORD-" + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString(),
      status: "pending",
      waitMinutes: 1,
      priority: "normal",
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (newOrder.tableId) {
      this.updateTableStatus(newOrder.tableId, "occupied", newOrder.id);
    }
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === "ready") {
        order.items.forEach(it => it.status = "ready");
      } else if (newStatus === "served" || newStatus === "completed") {
        order.items.forEach(it => it.status = "served");
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  updateOrderItemStatus(orderId, itemIndex, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order && order.items && order.items[itemIndex]) {
      order.items[itemIndex].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  updateOrderPriority(orderId, priority) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.priority = priority;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  getTables() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || "[]");
  },

  saveTable(tableData) {
    const tables = this.getTables();
    if (tableData.id) {
      const idx = tables.findIndex(t => t.id === tableData.id);
      if (idx !== -1) {
        tables[idx] = { ...tables[idx], ...tableData };
      }
    } else {
      const newTable = {
        id: "T-" + String(tables.length + 1).padStart(2, "0"),
        status: "available",
        currentOrderId: null,
        ...tableData
      };
      tables.push(newTable);
    }
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    return true;
  },

  deleteTable(id) {
    let tables = this.getTables();
    tables = tables.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    return true;
  },

  updateTableStatus(tableId, status, orderId = null) {
    const tables = this.getTables();
    const table = tables.find(t => t.id === tableId);
    if (table) {
      table.status = status;
      table.currentOrderId = orderId;
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      return true;
    }
    return false;
  },

  getFeedback() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || "[]");
  },

  addFeedback(fbData) {
    const feedbackList = this.getFeedback();
    const newFb = {
      id: "FB-" + String(feedbackList.length + 1).padStart(2, "0"),
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      replied: false,
      replyText: "",
      ...fbData
    };
    feedbackList.unshift(newFb);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
    return newFb;
  },

  replyFeedback(id, replyText) {
    const list = this.getFeedback();
    const item = list.find(f => f.id === id);
    if (item) {
      item.replied = true;
      item.replyText = replyText;
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteFeedback(id) {
    let list = this.getFeedback();
    list = list.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(list));
    return true;
  },

  getStaff() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || "[]");
  },

  saveStaff(staffData) {
    const staff = this.getStaff();
    if (staffData.id) {
      const idx = staff.findIndex(s => s.id === staffData.id);
      if (idx !== -1) {
        staff[idx] = { ...staff[idx], ...staffData };
      }
    } else {
      const newStaff = {
        id: "ST-" + String(staff.length + 1).padStart(2, "0"),
        status: "active",
        ...staffData
      };
      staff.push(newStaff);
    }
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    return true;
  },

  deleteStaff(id) {
    let staff = this.getStaff();
    staff = staff.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    return true;
  },

  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}");
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_CART) || "[]");
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CART, JSON.stringify(cart));
  },

  addToCart(dish, quantity = 1, note = "") {
    const cart = this.getCart();
    const existing = cart.find(item => item.dishId === dish.id && item.note === note);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: quantity,
        note: note || "Tiêu chuẩn",
        image: dish.image || ""
      });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartItemQuantity(index, quantity) {
    const cart = this.getCart();
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else if (cart[index]) {
      cart[index].quantity = quantity;
    }
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CART, "[]");
  }
};

Store.init();
window.Store = Store;

