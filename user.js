// ========================= USER.JS =========================
// This script manages user authentication, product browsing,
// cart management, order placement, and profile data using localStorage.
// It connects with the same data structure used by admin.js.
// ============================================================

// ===== DOM ELEMENT REFERENCES =====
// Grabbing references for forms, buttons, and sections in user.html
const authContainer = document.getElementById("auth-container");
const userPanel = document.getElementById("user-panel");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logoutNav = document.getElementById("logout-nav");
const uploadForm = document.getElementById("upload-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");

const productName = document.getElementById("product-name");
const productDescription = document.getElementById("product-description");
const productPrice = document.getElementById("product-price");

// Product elements for displaying user's products and orders
const myProductList = document.getElementById("my-product-list");
const orderList = document.getElementById("order-list");

// ===== LOCALSTORAGE HELPERS =====
// Functions to get and set data (accounts, products, orders) from localStorage
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

// ===== INITIALIZE DEFAULT DATA =====
// Sets up default admin/user accounts and product data if none exists
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

  // Default products (if empty)
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
}

// ===== REGISTER USER =====
// Handles new user registration and stores the account data
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = registerEmail.value;
  const password = registerPassword.value;

  let accounts = getAccounts();
  if (accounts.find((acc) => acc.email === email)) {
    alert("Email already registered!");
    return;
  }

  accounts.push({ email, password, role: "user" });
  saveAccounts(accounts);

  alert("User registered successfully!");
  registerForm.reset();
});

// ===== USER LOGIN =====
// Authenticates user and shows user panel after successful login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;

  let accounts = getAccounts();
  const user = accounts.find(
    (acc) =>
      acc.email === email && acc.password === password && acc.role === "user"
  );

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    authContainer.style.display = "none";
    userPanel.style.display = "block";
    logoutNav.style.display = "block";
    renderMyProducts();
    renderMyOrders();
  } else {
    alert("Invalid credentials!");
  }
});

// ===== LOGOUT FUNCTION =====
// Logs out the current user and resets UI visibility
logoutNav.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  authContainer.style.display = "block";
  userPanel.style.display = "none";
  logoutNav.style.display = "none";
});

// ===== UPLOAD PRODUCT =====
// Allows a logged-in user to upload a new product
uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = productName.value;
  const description = productDescription.value;
  const price = productPrice.value;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return alert("Please login first!");

  let products = getProducts();
  products.push({
    name,
    description,
    price: "₹" + price, // price in Indian Rupee
    userId: currentUser.email,
  });
  saveProducts(products);

  uploadForm.reset();
  renderMyProducts();
  alert("Product uploaded successfully");
});

// ===== MY PRODUCTS =====
// Displays all products uploaded by the logged-in user
function renderMyProducts() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const products = getProducts().filter((p) => p.userId === currentUser.email);
  myProductList.innerHTML = "";
  products.forEach((product, idx) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Price: ${product.price}</p>
      <button onclick="deleteMyProduct('${product.name}', '${currentUser.email}')">Delete</button>
    `;
    myProductList.appendChild(productDiv);
  });
}

// ===== DELETE PRODUCT =====
// Deletes a specific product uploaded by the logged-in user
function deleteMyProduct(name, userId) {
  let products = getProducts().filter(
    (p) => !(p.name === name && p.userId === userId)
  );
  saveProducts(products);
  renderMyProducts();
}

// ===== MY ORDERS =====
// Displays all orders belonging to the currently logged-in user
function renderMyOrders() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const orders = getOrders().filter((o) => o.userId === currentUser.email);
  orderList.innerHTML = "";
  orders.forEach((order, idx) => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-item";
    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${idx + 1}</p>
      <p><strong>Product:</strong> ${order.productId}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    `;
    orderList.appendChild(orderDiv);
  });
}

// ===== INITIAL PAGE LOAD =====
// Loads defaults and restores user session if already logged in
document.addEventListener("DOMContentLoaded", () => {
  initializeDefaults(); // Load default data

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.role === "user") {
    authContainer.style.display = "none";
    userPanel.style.display = "block";
    logoutNav.style.display = "block";
    renderMyProducts();
    renderMyOrders();
  }
});
