const state = {
  users: [
    { user_id: 1001, name: "Aiman Ahmad", email: "customer@coffee.com", password: "password123", role: "Customer", phone: "0123456789", registration_date: "2026-06-15T09:00:00" },
    { user_id: 2001, name: "Siti Nur", email: "staff@coffee.com", password: "staffpass", role: "Staff", phone: "0191234567", registration_date: "2026-06-10T08:00:00" },
    { user_id: 3001, name: "Admin Raja", email: "admin@coffee.com", password: "adminpass", role: "Admin", phone: "0117654321", registration_date: "2026-06-01T07:45:00" }
  ],
  menu: [
    { item_id: "ITM001", item_name: "Matcha Latte", category: "Drink", price: 12.00, availability: true, description: "Premium matcha with steamed milk", image: "matcha.jpg" },
    { item_id: "ITM002", item_name: "Classic Latte", category: "Drink", price: 11.00, availability: true, description: "Smooth espresso with steamed milk", image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=300&h=200&fit=crop" },
    { item_id: "ITM003", item_name: "Cold Brew", category: "Drink", price: 10.00, availability: true, description: "Slow-brewed coffee with rich flavour", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop" },
    { item_id: "ITM004", item_name: "Chocolate Muffin", category: "Dessert", price: 8.50, availability: true, description: "Freshly baked muffin with dark chocolate", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&h=200&fit=crop" },
    { item_id: "ITM005", item_name: "Almond Croissant", category: "Food", price: 9.00, availability: false, description: "Flaky pastry with almond filling", image: "croissant.jpg" },
    { item_id: "ITM006", item_name: "Caramel Macchiato", category: "Drink", price: 12.00, availability: true, description: "Smooth espresso with steamed milk and caramel drizzle + cold foam", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=300&h=200&fit=crop" }
  ],
  orders: [
    { order_id: 20260001, customer_id: 1001, order_date: "2026-06-15T09:15:00", total_amount: 36.00, order_status: "Completed", payment_status: "Paid", items: [{ item_id: "ITM001", item_name: "Matcha Latte", quantity: 3, subtotal: 36.00 }] }
  ],
  payments: [],
  cart: [],
  currentUser: null,
  currentOrderId: null,
  alert: null
};

const navEndpoints = [
  { label: "Home", route: "#home", roles: ["Guest", "Customer", "Staff", "Admin"] },
  { label: "Menu", route: "#menu", roles: ["Customer"] },
  { label: "Cart", route: "#cart", roles: ["Customer"] },
  { label: "Orders", route: "#orders", roles: ["Customer"] },
  { label: "Staff Orders", route: "#staff-orders", roles: ["Staff"] },
  { label: "Kitchen Slip", route: "#staff-slip", roles: ["Staff"] },
  { label: "Admin Menu", route: "#admin-menu", roles: ["Admin"] },
  { label: "User Management", route: "#admin-users", roles: ["Admin"] },
  { label: "Reports", route: "#admin-reports", roles: ["Admin"] },
  { label: "Login", route: "#login", roles: ["Guest"] },
  { label: "Register", route: "#register", roles: ["Guest"] },
  { label: "Logout", route: "#logout", roles: ["Customer", "Staff", "Admin"] }
];

function formatCurrency(value) {
  return `RM ${value.toFixed(2)}`;
}

function getCurrentRole() {
  return state.currentUser ? state.currentUser.role : "Guest";
}

function setAlert(message) {
  state.alert = message;
  render();
  window.setTimeout(() => {
    state.alert = null;
    render();
  }, 3500);
}

function saveState() {
  const next = {
    cart: state.cart,
    currentUser: state.currentUser,
    currentOrderId: state.currentOrderId
  };
  localStorage.setItem("heSheOmsState", JSON.stringify(next));
}

function loadState() {
  const stored = localStorage.getItem("heSheOmsState");
  if (!stored) return;
  try {
    const next = JSON.parse(stored);
    state.cart = next.cart || [];
    state.currentUser = next.currentUser || null;
    state.currentOrderId = next.currentOrderId || null;
  } catch (error) {
    console.warn("Failed to restore state", error);
  }
}

function renderNav() {
  const nav = document.getElementById("nav-links");
  nav.innerHTML = "";
  const role = getCurrentRole();

  navEndpoints.forEach((item) => {
    if (!item.roles.includes(role)) return;
    const link = document.createElement("a");
    link.href = item.route;
    link.textContent = item.label;
    link.className = "nav-link";

    if (window.location.hash === item.route) {
      link.classList.add("active");
    }

    if (item.route === "#logout") {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
    }

    nav.appendChild(link);
  });
}

function render() {
  renderNav();
  const view = document.getElementById("view");
  const hash = window.location.hash || "#home";
  const route = hash.split("/")[0];
  const [mainRoute, extra] = route.split("-");

  let html = "";

  if (state.alert) {
    html += `<div class=\"alert\">${state.alert}</div>`;
  }

  switch (route) {
    case "#home":
      html += renderHome();
      break;
    case "#register":
      html += renderRegister();
      break;
    case "#login":
      html += renderLogin();
      break;
    case "#menu":
      html += renderMenu();
      break;
    case "#cart":
      html += renderCart();
      break;
    case "#checkout":
      html += renderCheckout();
      break;
    case "#payment":
      html += renderPayment();
      break;
    case "#orders":
      html += renderOrders();
      break;
    case "#staff-orders":
      html += renderStaffOrders();
      break;
    case "#staff-slip":
      html += renderKitchenSlip();
      break;
    case "#admin-menu":
      html += renderAdminMenu();
      break;
    case "#admin-users":
      html += renderAdminUsers();
      break;
    case "#admin-reports":
      html += renderAdminReports();
      break;
    default:
      if (route.startsWith("#track")) {
        html += renderTracking(route);
      } else {
        html += renderNotFound();
      }
  }

  view.innerHTML = html;
  attachPageEvents();
}

function navigateToHash(hash) {
  window.location.hash = hash;
}

function renderHome() {
  const role = getCurrentRole();
  let cardsHtml = "";

  if (role === "Customer") {
    cardsHtml = `
      <div class="card">
        <h3>Your Order Menu</h3>
        <p>Browse our menu, customize your drinks, and order directly to the kitchen.</p>
        <button data-action="go-menu" style="margin-top:1rem;">Go to Menu</button>
      </div>
      <div class="card">
        <h3>Your Cart & Orders</h3>
        <p>Review items in your cart, track your order history and live status.</p>
        <button data-action="go-orders" style="margin-top:1rem;">View Orders</button>
      </div>
    `;
  } else if (role === "Staff") {
    cardsHtml = `
      <div class="card">
        <h3>Incoming Orders</h3>
        <p>Update order status, confirm incoming tickets, and prepare items.</p>
        <button data-action="go-staff-orders" style="margin-top:1rem;">View Staff Orders</button>
      </div>
      <div class="card">
        <h3>Kitchen Slips</h3>
        <p>View and print current orders in a simplified format for the kitchen.</p>
        <button data-action="go-kitchen-slip" style="margin-top:1rem;">View Kitchen Slips</button>
      </div>
    `;
  } else if (role === "Admin") {
    cardsHtml = `
      <div class="card">
        <h3>Menu Management</h3>
        <p>Add, edit, or remove menu items. Control stock availability.</p>
        <button data-action="go-admin-menu" style="margin-top:1rem;">Manage Menu</button>
      </div>
      <div class="card">
        <h3>System & Reports</h3>
        <p>View detailed sales reports and manage system user accounts.</p>
        <button data-action="go-admin-reports" style="margin-top:1rem;">View Reports</button>
      </div>
    `;
  } else {
    cardsHtml = `
      <div class="card">
        <h3>Customer Portal</h3>
        <p>Browse menu, add items to cart, checkout, and track orders.</p>
        <ul>
          <li><strong>Menu</strong> with availability badges</li>
          <li><strong>Cart</strong> quantity updates</li>
          <li><strong>Mock payment</strong> and order history</li>
        </ul>
      </div>
      <div class="card">
        <h3>Staff & Admin</h3>
        <p>Process orders, create kitchen slips, manage menu, and view reports.</p>
        <ul>
          <li><strong>Staff</strong> can update order status</li>
          <li><strong>Kitchen slip</strong> with total quantity counts</li>
          <li><strong>Admin</strong> menu CRUD and user management</li>
        </ul>
      </div>
    `;
  }

  const welcomeBottom = state.currentUser
    ? `<p style="text-align:center; font-size:1.2rem; color:var(--accent); margin-top:1.5rem;">Have a great day, ${state.currentUser.name}!</p>`
    : "";

  return `
    <section class="card">
      <h2>Welcome to the He & She Coffee OMS prototype.</h2>
      <div class="grid grid-2">
        ${cardsHtml}
      </div>
      ${welcomeBottom}
    </section>
  `;
}

function renderNotFound() {
  return `
    <section class="card">
      <h2>Page not found</h2>
      <p class="info-line">The route you requested does not exist. Use the navigation links to continue.</p>
    </section>
  `;
}

function renderRegister() {
  return `
    <section class="card">
      <h2>Customer Registration</h2>
      <form id="register-form">
        <div class="grid grid-2">
          <div class="input-group">
            <label for="register-name">Full Name</label>
            <input id="register-name" type="text" required />
          </div>
          <div class="input-group">
            <label for="register-email">Email</label>
            <input id="register-email" type="email" required />
          </div>
        </div>
        <div class="grid grid-2">
          <div class="input-group">
            <label for="register-phone">Phone</label>
            <input id="register-phone" type="tel" required />
          </div>
          <div class="input-group">
            <label for="register-password">Password</label>
            <input id="register-password" type="password" required />
          </div>
        </div>
        <button type="submit">Create account</button>
      </form>
    </section>
  `;
}

function renderLogin() {
  return `
    <section class="card">
      <h2>Login</h2>
      <form id="login-form">
        <div class="input-group">
          <label for="login-email">Email</label>
          <input id="login-email" type="email" required />
        </div>
        <div class="input-group">
          <label for="login-password">Password</label>
          <input id="login-password" type="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p class="info-line">Use sample accounts:<br />Customer: customer@coffee.com / password123<br />Staff: staff@coffee.com / staffpass<br />Admin: admin@coffee.com / adminpass</p>
    </section>
  `;
}

function renderMenu() {
  const menuHtml = state.menu.map((item) => {
    const disabled = !item.availability;
    const imgHtml = item.image ? `<img src="${item.image}" alt="${item.item_name}" class="menu-image" />` : '';
    return `
      <article class="menu-card">
        ${imgHtml}
        <div>
          <h3>${item.item_name}</h3>
          <p>${item.description}</p>
          <p class="price">${formatCurrency(item.price)}</p>
        </div>
        <div class="summary-row">
          <span class="badge ${disabled ? "badge-unavailable" : "badge-available"}">${disabled ? "Out of Stock" : "Available"}</span>
          <button data-action="add-to-cart" data-id="${item.item_id}" ${disabled ? "disabled" : ""}>Add to cart</button>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="card">
      <h2>Menu</h2>
      <div class="grid grid-2">${menuHtml}</div>
    </section>
  `;
}

function renderCart() {
  if (!state.cart.length) {
    return `
      <section class="card">
        <h2>Your cart is empty</h2>
        <p class="info-line">Add items from the menu to begin your order.</p>
      </section>
    `;
  }

  const rows = state.cart.map((item) => `
    <tr>
      <td>${item.item_name}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>
        <button data-action="decrease-qty" data-id="${item.item_id}">−</button>
        ${item.quantity}
        <button data-action="increase-qty" data-id="${item.item_id}">+</button>
      </td>
      <td>${formatCurrency(item.subtotal)}</td>
      <td><button data-action="remove-item" data-id="${item.item_id}">Remove</button></td>
    </tr>
  `).join("");

  const total = state.cart.reduce((sum, item) => sum + item.subtotal, 0);

  return `
    <section class="card">
      <h2>Cart</h2>
      <table class="table">
        <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary-row" style="margin-top: 1rem; gap: 1rem; align-items: center;">
        <strong>Total</strong>
        <strong>${formatCurrency(total)}</strong>
      </div>
      <div style="margin-top: 1rem; display:flex; gap: 1rem; flex-wrap: wrap;">
        <button data-action="go-checkout">Proceed to checkout</button>
      </div>
    </section>
  `;
}

function renderCheckout() {
  if (!state.cart.length) {
    return `
      <section class="card">
        <h2>No items in cart</h2>
        <p class="info-line">Add menu items before checking out.</p>
      </section>
    `;
  }

  const total = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const customer = state.currentUser || { name: "Guest" };

  return `
    <section class="card">
      <h2>Checkout</h2>
      <p class="info-line">Review your order and select a mock payment method.</p>
      <div class="card">
        <h3>Order summary</h3>
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Items:</strong> ${state.cart.reduce((count, item) => count + item.quantity, 0)}</p>
        <p><strong>Total:</strong> ${formatCurrency(total)}</p>
      </div>
      <form id="checkout-form">
        <div class="input-group">
          <label for="payment-method">Payment method</label>
          <select id="payment-method" required>
            <option value="FPX">FPX</option>
            <option value="E-wallet">E-wallet</option>
          </select>
        </div>
        <button type="submit">Pay ${formatCurrency(total)}</button>
      </form>
    </section>
  `;
}

function renderPayment() {
  const order = state.orders.find((order) => order.order_id === state.currentOrderId);
  if (!order) {
    return `
      <section class="card">
        <h2>Payment not found</h2>
        <p class="info-line">Return to the menu to place a new order.</p>
      </section>
    `;
  }

  return `
    <section class="card">
      <h2>Payment confirmation</h2>
      <p>Order <strong>#${order.order_id}</strong> has been marked as <strong>${order.payment_status}</strong>.</p>
      <p class="info-line">You can track your order and view it in history.</p>
      <div class="summary-row" style="margin-top: 1rem;">
        <strong>Total paid</strong>
        <strong>${formatCurrency(order.total_amount)}</strong>
      </div>
      <button data-action="go-orders">View order history</button>
    </section>
  `;
}

function renderOrders() {
  if (!state.currentUser) {
    return `
      <section class="card">
        <h2>Login to view orders</h2>
        <p class="info-line">Please login as a customer to review your order history.</p>
      </section>
    `;
  }

  const customerOrders = state.orders.filter((order) => order.customer_id === state.currentUser.user_id);
  if (!customerOrders.length) {
    return `
      <section class="card">
        <h2>No past orders</h2>
        <p class="info-line">Place an order from the menu to see it appear here.</p>
      </section>
    `;
  }

  const rows = customerOrders.map((order) => `
    <tr>
      <td>#${order.order_id}</td>
      <td>${new Date(order.order_date).toLocaleString()}</td>
      <td>${formatCurrency(order.total_amount)}</td>
      <td>${order.order_status}</td>
      <td>${order.payment_status}</td>
      <td><button data-action="track-order" data-id="${order.order_id}">Track</button></td>
    </tr>
  `).join("");

  return `
    <section class="card">
      <h2>Order History</h2>
      <table class="table">
        <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTracking(route) {
  const orderId = parseInt(route.replace("#track-", ""), 10);
  const order = state.orders.find((item) => item.order_id === orderId);
  if (!order) {
    return `
      <section class="card">
        <h2>Order not found</h2>
        <p class="info-line">Enter a valid order reference to track your order.</p>
      </section>
    `;
  }

  return `
    <section class="card">
      <h2>Track Order #${order.order_id}</h2>
      <p class="info-line">Current status: <strong>${order.order_status}</strong></p>
      <div class="card">
        <p>Order date: ${new Date(order.order_date).toLocaleString()}</p>
        <p>Payment: ${order.payment_status}</p>
        <p>Items:</p>
        <ul>${order.items.map((item) => `<li>${item.item_name} × ${item.quantity}</li>`).join("")}</ul>
      </div>
    </section>
  `;
}

function renderStaffOrders() {
  if (getCurrentRole() !== "Staff") {
    return `
      <section class="card">
        <h2>Staff access only</h2>
        <p class="info-line">Login with a Staff role to manage incoming orders.</p>
      </section>
    `;
  }

  const rows = state.orders.map((order) => `
    <tr>
      <td>#${order.order_id}</td>
      <td>${new Date(order.order_date).toLocaleString()}</td>
      <td>${formatCurrency(order.total_amount)}</td>
      <td>${order.order_status}</td>
      <td>${order.payment_status}</td>
      <td>
        <button data-action="update-status" data-id="${order.order_id}" data-status="Confirmed">Confirm</button>
        <button data-action="update-status" data-id="${order.order_id}" data-status="Preparing">Preparing</button>
        <button data-action="update-status" data-id="${order.order_id}" data-status="Ready">Ready</button>
      </td>
    </tr>
  `).join("");

  return `
    <section class="card">
      <h2>Staff Orders</h2>
      <table class="table">
        <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderKitchenSlip() {
  if (getCurrentRole() !== "Staff") {
    return `
      <section class="card">
        <h2>Staff access only</h2>
        <p class="info-line">Login as Staff to view kitchen slips.</p>
      </section>
    `;
  }

  const slipHtml = state.orders.map((order) => {
    const totalCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemLines = order.items.map((item) => `  ${item.item_name.padEnd(18, ' ')} × ${item.quantity}`).join("\n");
    return `<div class="kitchen-slip">ORDER #${order.order_id} — ${new Date(order.order_date).toLocaleDateString()}, ${new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n────────────────────────────────\n${itemLines}\n────────────────────────────────\nTOTAL ITEMS: ${totalCount}\nTOTAL AMOUNT: ${formatCurrency(order.total_amount)}</div>`;
  }).join("\n");

  return `
    <section class="card">
      <h2>Kitchen Slip</h2>
      <div class="grid grid-2">${slipHtml}</div>
      <button data-action="print-slip" style="margin-top: 1rem;">Print Slips</button>
    </section>
  `;
}

function renderAdminMenu() {
  if (getCurrentRole() !== "Admin") {
    return `
      <section class="card">
        <h2>Admin access only</h2>
        <p class="info-line">Login as Admin to manage menu items.</p>
      </section>
    `;
  }

  const rows = state.menu.map((item) => `
    <tr>
      <td>${item.item_id}</td>
      <td>${item.item_name}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${item.availability ? "Yes" : "No"}</td>
      <td>
        <button data-action="toggle-availability" data-id="${item.item_id}">${item.availability ? "Disable" : "Enable"}</button>
        <button data-action="edit-menu" data-id="${item.item_id}">Edit</button>
      </td>
    </tr>
  `).join("");

  return `
    <section class="card">
      <h2>Admin Menu Management</h2>
      <div class="card">
        <h3>Add new item</h3>
        <form id="add-menu-item-form" class="grid grid-2">
          <div class="input-group"><label for="new-name">Name</label><input id="new-name" required /></div>
          <div class="input-group"><label for="new-category">Category</label><input id="new-category" required /></div>
          <div class="input-group"><label for="new-price">Price</label><input id="new-price" type="number" step="0.01" required /></div>
          <div class="input-group"><label for="new-availability">Available</label><select id="new-availability"><option value="true">Yes</option><option value="false">No</option></select></div>
          <div class="input-group" style="grid-column: span 2;"><label for="new-image">Image URL or Local Filename</label><input id="new-image" placeholder="e.g. matcha.jpg or https://..." /></div>
          <div class="input-group" style="grid-column: span 2;"><label for="new-description">Description</label><textarea id="new-description" rows="3" required></textarea></div>
        </form>
        <button data-action="create-menu-item">Create item</button>
      </div>
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderAdminUsers() {
  if (getCurrentRole() !== "Admin") {
    return `
      <section class="card">
        <h2>Admin access only</h2>
        <p class="info-line">Login as Admin to view accounts.</p>
      </section>
    `;
  }

  const rows = state.users.map((user) => `
    <tr>
      <td>${user.user_id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.phone}</td>
      <td><button data-action="delete-user" data-id="${user.user_id}">Delete</button></td>
    </tr>
  `).join("");

  return `
    <section class="card">
      <h2>Admin User Management</h2>
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderAdminReports() {
  if (getCurrentRole() !== "Admin") {
    return `
      <section class="card">
        <h2>Admin access only</h2>
        <p class="info-line">Login as Admin to view sales reports.</p>
      </section>
    `;
  }

  const totalSales = state.orders.reduce((sum, order) => sum + order.total_amount, 0);
  const orderCount = state.orders.length;
  const reportRows = state.orders.map((order) => `
    <tr>
      <td>#${order.order_id}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td>${formatCurrency(order.total_amount)}</td>
      <td>${order.order_status}</td>
      <td>${order.payment_status}</td>
    </tr>
  `).join("");

  // Group sales by month for the graph
  const salesByMonth = {};
  state.orders.forEach(order => {
    const d = new Date(order.order_date);
    const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!salesByMonth[month]) salesByMonth[month] = 0;
    salesByMonth[month] += order.total_amount;
  });

  const maxSales = Math.max(...Object.values(salesByMonth), 1);
  const chartHtml = Object.keys(salesByMonth).map(month => {
    const height = (salesByMonth[month] / maxSales) * 100;
    return `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:150px; gap:0.5rem; flex: 1; max-width: 80px;">
        <div style="background:var(--accent); width:100%; height:${Math.max(5, height)}%; border-radius:4px 4px 0 0; transition: height 0.3s;" title="${formatCurrency(salesByMonth[month])}"></div>
        <span style="font-size:0.8rem; color:var(--muted);">${month}</span>
      </div>
    `;
  }).join("");

  return `
    <section class="card">
      <h2>Sales Reports</h2>
      <div class="grid grid-2">
        <div class="card"><h3>Total sales</h3><p>${formatCurrency(totalSales)}</p></div>
        <div class="card"><h3>Orders</h3><p>${orderCount}</p></div>
      </div>
      
      <div class="card" style="margin-top:1rem;">
        <h3>Monthly Sales Graph</h3>
        <div style="display:flex; gap:1.5rem; align-items:flex-end; padding-top:1rem; border-bottom:1px solid var(--border); min-height: 180px;">
          ${chartHtml || "<p class='info-line'>No sales data available yet.</p>"}
        </div>
      </div>

      <table class="table" style="margin-top:1rem;">
        <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
        <tbody>${reportRows}</tbody>
      </table>
    </section>
  `;
}

function attachPageEvents() {
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout);
  }

  const menuButtons = document.querySelectorAll("button[data-action='add-to-cart']");
  menuButtons.forEach((button) => button.addEventListener("click", handleAddToCart));

  const cartButtons = document.querySelectorAll("button[data-action='decrease-qty'], button[data-action='increase-qty'], button[data-action='remove-item'], button[data-action='go-checkout']");
  cartButtons.forEach((button) => {
    const action = button.dataset.action;
    if (action === "decrease-qty" || action === "increase-qty" || action === "remove-item") {
      button.addEventListener("click", handleCartUpdate);
    }
    if (action === "go-checkout") {
      button.addEventListener("click", () => navigateToHash("#checkout"));
    }
  });

  const trackButtons = document.querySelectorAll("button[data-action='track-order']");
  trackButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigateToHash(`#track-${button.dataset.id}`);
    });
  });

  const updateStatusButtons = document.querySelectorAll("button[data-action='update-status']");
  updateStatusButtons.forEach((button) => button.addEventListener("click", handleStatusUpdate));

  const createMenuButton = document.querySelector("button[data-action='create-menu-item']");
  if (createMenuButton) {
    createMenuButton.addEventListener("click", handleCreateMenuItem);
  }

  const editButtons = document.querySelectorAll("button[data-action='edit-menu']");
  editButtons.forEach((button) => button.addEventListener("click", handleEditMenuItem));

  const toggleButtons = document.querySelectorAll("button[data-action='toggle-availability']");
  toggleButtons.forEach((button) => button.addEventListener("click", handleToggleAvailability));

  const deleteButtons = document.querySelectorAll("button[data-action='delete-user']");
  deleteButtons.forEach((button) => button.addEventListener("click", handleDeleteUser));

  const printButton = document.querySelector("button[data-action='print-slip']");
  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  // Handle dynamic routing buttons on home page
  const homeNavButtons = document.querySelectorAll("button[data-action^='go-']");
  homeNavButtons.forEach(btn => {
    // Only attach if it's one of the dynamic home buttons
    const action = btn.dataset.action;
    if (['go-menu', 'go-orders', 'go-staff-orders', 'go-kitchen-slip', 'go-admin-menu', 'go-admin-reports'].includes(action)) {
      btn.addEventListener("click", () => {
        const route = action.replace("go-", "");
        navigateToHash(`#${route}`);
      });
    }
  });
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const phone = document.getElementById("register-phone").value.trim();
  const password = document.getElementById("register-password").value;

  if (state.users.some((user) => user.email === email)) {
    setAlert("Email already exists. Please use another email.");
    return;
  }

  const user = {
    user_id: Date.now(),
    name,
    email,
    password,
    role: "Customer",
    phone,
    registration_date: new Date().toISOString()
  };

  state.users.push(user);
  state.currentUser = user;
  setAlert("Registration successful. You are now logged in.");
  saveState();
  navigateToHash("#menu");
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;
  const user = state.users.find((user) => user.email === email && user.password === password);

  if (!user) {
    setAlert("Login failed. Check email and password.");
    return;
  }

  state.currentUser = user;
  setAlert(`Logged in as ${user.role}.`);
  saveState();

  if (user.role === "Customer") {
    navigateToHash("#menu");
  } else if (user.role === "Staff") {
    navigateToHash("#staff-orders");
  } else {
    navigateToHash("#admin-menu");
  }
}

function handleAddToCart(event) {
  const id = event.currentTarget.dataset.id;
  const item = state.menu.find((item) => item.item_id === id);
  if (!item) return;

  const existing = state.cart.find((entry) => entry.item_id === item.item_id);
  if (existing) {
    existing.quantity += 1;
    existing.subtotal = existing.quantity * existing.price;
  } else {
    state.cart.push({ item_id: item.item_id, item_name: item.item_name, price: item.price, quantity: 1, subtotal: item.price });
  }
  setAlert(`${item.item_name} added to cart.`);
  saveState();
  render();
}

function handleCartUpdate(event) {
  const { action, id } = event.currentTarget.dataset;
  const item = state.cart.find((entry) => entry.item_id === id);
  if (!item) return;

  if (action === "decrease-qty") {
    item.quantity = Math.max(1, item.quantity - 1);
  }
  if (action === "increase-qty") {
    item.quantity += 1;
  }
  if (action === "remove-item") {
    state.cart = state.cart.filter((entry) => entry.item_id !== id);
  }

  if (item) {
    item.subtotal = item.quantity * item.price;
  }
  saveState();
  render();
}

function handleCheckout(event) {
  event.preventDefault();
  if (!state.currentUser) {
    setAlert("Login as a customer to complete checkout.");
    navigateToHash("#login");
    return;
  }

  const orderId = Date.now();
  const total = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const order = {
    order_id: orderId,
    customer_id: state.currentUser.user_id,
    order_date: new Date().toISOString(),
    total_amount: total,
    order_status: "Pending",
    payment_status: "Unpaid",
    items: state.cart.map((item) => ({ ...item }))
  };

  state.orders.push(order);
  state.currentOrderId = orderId;
  state.payments.push({
    payment_id: Date.now() + 1,
    order_id: orderId,
    amount: total,
    method: document.getElementById("payment-method").value,
    transaction_id: `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    payment_date: new Date().toISOString()
  });

  order.payment_status = "Paid";
  state.cart = [];
  saveState();
  setAlert("Payment successful. Order created.");
  navigateToHash("#payment");
}

function handleStatusUpdate(event) {
  const orderId = parseInt(event.currentTarget.dataset.id, 10);
  const nextStatus = event.currentTarget.dataset.status;
  const order = state.orders.find((order) => order.order_id === orderId);
  if (!order) return;
  order.order_status = nextStatus;
  saveState();
  setAlert(`Order #${orderId} status updated to ${nextStatus}.`);
  render();
}

function handleCreateMenuItem() {
  const name = document.getElementById("new-name").value.trim();
  const category = document.getElementById("new-category").value.trim();
  const price = parseFloat(document.getElementById("new-price").value);
  const availability = document.getElementById("new-availability").value === "true";
  const image = document.getElementById("new-image").value.trim();
  const description = document.getElementById("new-description").value.trim();

  if (!name || !category || Number.isNaN(price) || !description) {
    setAlert("Complete all fields before adding a menu item.");
    return;
  }

  const newItem = {
    item_id: `ITM${Math.floor(Math.random() * 9000 + 1000)}`,
    item_name: name,
    category,
    price,
    availability,
    image: image || "https://placehold.co/300x200?text=No+Image",
    description
  };

  state.menu.push(newItem);
  saveState();
  setAlert("Menu item created.");
  render();
}

function handleEditMenuItem(event) {
  const id = event.currentTarget.dataset.id;
  const item = state.menu.find((item) => item.item_id === id);
  if (!item) return;

  const name = prompt("Item name:", item.item_name);
  if (name === null) return;
  const category = prompt("Category:", item.category);
  if (category === null) return;
  const price = parseFloat(prompt("Price:", item.price));
  if (Number.isNaN(price)) {
    setAlert("Invalid price.");
    return;
  }
  const image = prompt("Image URL/Path:", item.image || "");
  if (image === null) return;
  const description = prompt("Description:", item.description);
  if (description === null) return;

  item.item_name = name;
  item.category = category;
  item.price = price;
  item.image = image;
  item.description = description;
  saveState();
  setAlert("Menu item updated.");
  render();
}

function handleToggleAvailability(event) {
  const id = event.currentTarget.dataset.id;
  const item = state.menu.find((item) => item.item_id === id);
  if (!item) return;
  item.availability = !item.availability;
  saveState();
  render();
}

function handleDeleteUser(event) {
  const id = parseInt(event.currentTarget.dataset.id, 10);
  state.users = state.users.filter((user) => user.user_id !== id);
  saveState();
  setAlert("User removed.");
  render();
}

function logout() {
  state.currentUser = null;
  state.cart = [];
  state.currentOrderId = null;
  saveState();
  setAlert("Logged out successfully.");
  navigateToHash("#home");
}

window.addEventListener("hashchange", render);
window.addEventListener("load", () => {
  loadState();
  if (!window.location.hash) {
    window.location.hash = "#home";
  }
  render();
});
