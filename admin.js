// ========================= ADMIN.JS =========================
// This script manages admin authentication, profile, products,
// orders, and catering reservations using localStorage.
// It includes default dummy data for demo purposes.
// ============================================================

// ===== DOM ELEMENT REFERENCES =====
const authContainer = document.getElementById("auth-container");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logoutBtn = document.getElementById("logout-btn");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");

// Profile section elements
const profileDetails = document.getElementById("profile-details");
const editProfileBtn = document.getElementById("edit-profile-btn");
const profileForm = document.getElementById("profile-form");
const profileName = document.getElementById("profile-name");
const profileAddress = document.getElementById("profile-address");

// Product management elements
const allProductList = document.getElementById("all-product-list");
const addProductForm = document.getElementById("add-product-form");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");

// Order management elements
const orderList = document.getElementById("order-list");
const placeOrderForm = document.getElementById("place-order-form");
const orderUserId = document.getElementById("order-user-id");
const orderProductId = document.getElementById("order-product-id");
const orderQuantity = document.getElementById("order-quantity");

// Reservation management elements
const reservationList = document.getElementById("reservation-list");

// ===== LOCALSTORAGE HELPERS =====
// Helper functions for getting and saving data to localStorage.
function getAccounts() {
  return JSON.parse(localStorage.getItem("accounts")) || [];
}
function saveAccounts(accounts) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}
function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}
function getReservations() {
  return JSON.parse(localStorage.getItem("reservations")) || [];
}
function saveReservations(res) {
  localStorage.setItem("reservations", JSON.stringify(res));
}

// ===== INITIALIZE DEFAULT DATA =====
// Creates default admin and user accounts, products, and a demo reservation.
function initializeDefaults() {
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  // Default Admin Account
  if (!accounts.find((acc) => acc.email === "admin@demo.com")) {
    accounts.push({
      email: "admin@demo.com",
      password: "admin123",
      role: "admin",
      name: "Administrator",
      address: "Head Office",
    });
  }

  // Default User Account
  if (!accounts.find((acc) => acc.email === "user@demo.com")) {
    accounts.push({
      email: "user@demo.com",
      password: "user123",
      role: "user",
      name: "Demo User",
      address: "Mumbai, India",
    });
  }

  localStorage.setItem("accounts", JSON.stringify(accounts));

  // Default Products
  let products = JSON.parse(localStorage.getItem("products")) || [];
  if (products.length === 0) {
    products = [
      {
        name: "Paneer Butter Masala",
        price: "₹250",
        description: "Rich and creamy paneer curry with butter and spices",
      },
      {
        name: "Chicken Biryani",
        price: "₹350",
        description: "Fragrant rice dish with chicken and aromatic spices",
      },
      {
        name: "Masala Dosa",
        price: "₹120",
        description: "Crispy rice crepe filled with spiced potato filling",
      },
      {
        name: "Chai Tea",
        price: "₹50",
        description: "Traditional Indian spiced tea with milk",
      },
    ];
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Default Reservation
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
  if (reservations.length === 0) {
    reservations = [
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "9876543210",
        date: "2025-10-20",
        time: "19:00",
        guests: 30,
        menu: "buffet",
        occasion: "Wedding Reception",
        pickupOrDelivery: "delivery",
        requests: "Include both vegetarian and non-vegetarian options",
        status: "submitted",
      },
    ];
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }
}

// ===== REGISTER NEW ADMIN =====
// Handles new admin registration and saves to localStorage.
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = registerEmail.value;
  const password = registerPassword.value;

  let accounts = getAccounts();
  if (accounts.find((acc) => acc.email === email)) {
    alert("Email already registered!");
    return;
  }

  accounts.push({ email, password, role: "admin", name: "", address: "" });
  saveAccounts(accounts);

  alert("Admin registered successfully!");
  registerForm.reset();
});

// ===== ADMIN LOGIN =====
// Validates admin credentials and opens admin panel upon success.
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;

  let accounts = getAccounts();
  const user = accounts.find(
    (acc) =>
      acc.email === email && acc.password === password && acc.role === "admin"
  );

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    authContainer.style.display = "none";
    adminPanel.style.display = "block";
    renderAllProducts();
    renderAllOrders();
    renderReservations();
    renderProfile();
  } else {
    alert("Invalid credentials!");
  }
});

// ===== LOGOUT FUNCTION =====
// Clears the current user session and hides the admin panel.
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  authContainer.style.display = "block";
  adminPanel.style.display = "none";
});

// ===== PROFILE MANAGEMENT =====
// Displays and updates admin profile data.
function renderProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;
  profileDetails.innerHTML = `
    <p><strong>Name:</strong> ${currentUser.name || ""}</p>
    <p><strong>Email:</strong> ${currentUser.email}</p>
    <p><strong>Address:</strong> ${currentUser.address || ""}</p>
  `;
  profileName.value = currentUser.name || "";
  profileAddress.value = currentUser.address || "";
}

editProfileBtn.addEventListener("click", () => {
  profileForm.style.display = "block";
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let accounts = getAccounts();

  accounts = accounts.map((acc) =>
    acc.email === currentUser.email
      ? { ...acc, name: profileName.value, address: profileAddress.value }
      : acc
  );
  saveAccounts(accounts);

  currentUser = {
    ...currentUser,
    name: profileName.value,
    address: profileAddress.value,
  };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  renderProfile();
  profileForm.style.display = "none";
  alert("Profile updated successfully");
});

// ===== PRODUCT MANAGEMENT =====
// Displays all products, allows adding and deleting.
function renderAllProducts() {
  const products = getProducts();
  allProductList.innerHTML = "";
  products.forEach((product, idx) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">${product.price}</p>
      <button onclick="deleteProduct(${idx})">Delete</button>
    `;
    allProductList.appendChild(productDiv);
  });
}

// Deletes a product by index and re-renders the list.
function deleteProduct(idx) {
  let products = getProducts();
  products.splice(idx, 1);
  saveProducts(products);
  renderAllProducts();
}

// Adds a new product to the list.
addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let products = getProducts();
  products.push({
    name: productName.value,
    price: productPrice.value,
    description: productDescription.value,
  });
  saveProducts(products);
  addProductForm.reset();
  renderAllProducts();
  alert("Product added successfully");
});

// ===== ORDER MANAGEMENT =====
// Displays all orders and allows admin to delete or add new orders.
function renderAllOrders() {
  const orders = getOrders();
  orderList.innerHTML = "";
  orders.forEach((order, idx) => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-item";
    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${idx + 1}</p>
      <p><strong>User ID:</strong> ${order.userId}</p>
      <p><strong>Product:</strong> ${order.productId}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <button onclick="deleteOrder(${idx})">Delete</button>
    `;
    orderList.appendChild(orderDiv);
  });
}

// Deletes an order and updates the list.
function deleteOrder(index) {
  let orders = getOrders();
  if (confirm("Are you sure you want to delete this order?")) {
    orders.splice(index, 1);
    saveOrders(orders);
    renderAllOrders();
    alert("Order deleted successfully!");
  }
}

// Handles new order creation from admin panel.
placeOrderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let orders = getOrders();
  orders.push({
    userId: orderUserId.value,
    productId: orderProductId.value,
    quantity: orderQuantity.value,
    status: "placed",
  });
  saveOrders(orders);
  placeOrderForm.reset();
  renderAllOrders();
  alert("Order placed successfully");
});

// ===== RESERVATION MANAGEMENT =====
// Displays catering reservations and allows approving or rejecting.
function renderReservations() {
  const reservations = getReservations();
  reservationList.innerHTML = "";

  if (reservations.length === 0) {
    reservationList.innerHTML = "<p>No reservations found.</p>";
    return;
  }

  reservations.forEach((res, idx) => {
    const resDiv = document.createElement("div");
    resDiv.className = "reservation-item";
    resDiv.innerHTML = `
      <p><strong>ID:</strong> ${idx + 1}</p>
      <p><strong>Name:</strong> ${res.name}</p>
      <p><strong>Email:</strong> ${res.email}</p>
      <p><strong>Phone:</strong> ${res.phone}</p>
      <p><strong>Date:</strong> ${res.date} at ${res.time}</p>
      <p><strong>Guests:</strong> ${res.guests}</p>
      <p><strong>Menu:</strong> ${res.menu}</p>
      <p><strong>Occasion:</strong> ${res.occasion}</p>
      <p><strong>Pickup/Delivery:</strong> ${res.pickupOrDelivery}</p>
      <p><strong>Requests:</strong> ${res.requests || "-"}</p>
      <p><strong>Status:</strong> ${res.status}</p>
      <button onclick="updateReservationStatus(${idx}, 'approved')">Approve</button>
      <button onclick="updateReservationStatus(${idx}, 'rejected')">Reject</button>
    `;
    reservationList.appendChild(resDiv);
  });
}

// Updates reservation status (approved/rejected) and saves it.
function updateReservationStatus(idx, newStatus) {
  let reservations = getReservations();
  reservations[idx].status = newStatus;
  saveReservations(reservations);
  renderReservations();
  alert(`Reservation ${newStatus}!`);
}

// ===== INITIAL LOAD =====
// Initializes default data and checks for existing admin login session.
document.addEventListener("DOMContentLoaded", () => {
  initializeDefaults(); // Ensure default data exists

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.role === "admin") {
    authContainer.style.display = "none";
    adminPanel.style.display = "block";
    renderAllProducts();
    renderAllOrders();
    renderReservations();
    renderProfile();
  }
});
