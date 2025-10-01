// DOM Elements
const authContainer = document.getElementById("auth-container");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logoutBtn = document.getElementById("logout-btn");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");

// Profile
const profileDetails = document.getElementById("profile-details");
const editProfileBtn = document.getElementById("edit-profile-btn");
const profileForm = document.getElementById("profile-form");
const profileName = document.getElementById("profile-name");
const profileAddress = document.getElementById("profile-address");

// Products
const allProductList = document.getElementById("all-product-list");
const addProductForm = document.getElementById("add-product-form");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");

// Cart
const cartList = document.getElementById("cart-list");

// Orders
const orderList = document.getElementById("order-list");
const placeOrderForm = document.getElementById("place-order-form");
const orderUserId = document.getElementById("order-user-id");
const orderProductId = document.getElementById("order-product-id");
const orderQuantity = document.getElementById("order-quantity");

// ✅ Firebase objects (auth, db) come from firebase.js

// --- Register Form ---
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = registerEmail.value;
  const password = registerPassword.value;
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      registerForm.reset();
      db.collection("users").doc(cred.user.uid).set({
        email: email,
        role: "admin",
      });
    })
    .catch((err) => alert(err.message));
});

// --- Login Form ---
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => loginForm.reset())
    .catch((err) => alert(err.message));
});

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// --- Auth Listener ---
auth.onAuthStateChanged((user) => {
  if (user) {
    authContainer.style.display = "none";
    adminPanel.style.display = "block";
    displayAllProducts();
    displayMyProfile(user.uid);
    displayAllCarts();
    displayAllOrders();
  } else {
    authContainer.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// --- Profile Functions ---
const renderMyProfile = (user) => {
  profileDetails.innerHTML = `
    <p><strong>Name:</strong> ${user.name || ""}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Address:</strong> ${user.address || ""}</p>
  `;
  profileName.value = user.name || "";
  profileAddress.value = user.address || "";
};

const displayMyProfile = (userId) => {
  db.collection("users")
    .doc(userId)
    .onSnapshot((doc) => {
      renderMyProfile({ ...doc.data(), id: doc.id });
    });
};

editProfileBtn.addEventListener("click", () => {
  profileForm.style.display = "block";
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userId = auth.currentUser.uid;
  db.collection("users")
    .doc(userId)
    .update({
      name: profileName.value,
      address: profileAddress.value,
    })
    .then(() => {
      profileForm.style.display = "none";
      alert("Profile updated successfully");
    });
});

// --- Product Functions ---
const renderAllProducts = (products) => {
  allProductList.innerHTML = "";
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Price: ${product.price}</p>
      <img src="${product.imageUrl}" width="100">
      <button class="delete-btn" data-id="${product.id}">Delete</button>
    `;
    allProductList.appendChild(productDiv);
  });
};

const displayAllProducts = () => {
  db.collection("products").onSnapshot((snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    renderAllProducts(products);
  });
};

allProductList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    db.collection("products")
      .doc(id)
      .delete()
      .then(() => {
        alert("Product deleted successfully");
      });
  }
});

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("products")
    .add({
      name: productName.value,
      price: productPrice.value,
      description: productDescription.value,
      imageUrl: "",
    })
    .then(() => {
      addProductForm.reset();
      alert("Product added successfully");
    });
});

// --- Cart Functions ---
const renderAllCarts = (carts) => {
  cartList.innerHTML = "";
  carts.forEach((cart) => {
    const cartDiv = document.createElement("div");
    cartDiv.className = "cart-item";
    cartDiv.innerHTML = `
      <p><strong>User ID:</strong> ${cart.userId}</p>
      <p><strong>Product ID:</strong> ${cart.productId}</p>
      <p><strong>Quantity:</strong> ${cart.quantity}</p>
    `;
    cartList.appendChild(cartDiv);
  });
};

const displayAllCarts = () => {
  db.collection("carts").onSnapshot((snapshot) => {
    const carts = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    renderAllCarts(carts);
  });
};

// --- Order Functions ---
const renderAllOrders = (orders) => {
  orderList.innerHTML = "";
  orders.forEach((order) => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-item";
    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>User ID:</strong> ${order.userId}</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    `;
    orderList.appendChild(orderDiv);
  });
};

const displayAllOrders = () => {
  db.collection("orders").onSnapshot((snapshot) => {
    const orders = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    renderAllOrders(orders);
  });
};

placeOrderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  db.collection("orders")
    .add({
      userId: orderUserId.value,
      items: [
        { productId: orderProductId.value, quantity: orderQuantity.value },
      ],
      status: "placed",
      total: 0,
    })
    .then(() => {
      placeOrderForm.reset();
      alert("Order placed successfully");
    });
});
