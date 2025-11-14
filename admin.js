// ========================= ADMIN.JS =========================
// Handles admin authentication, profile, products, cart, and orders.
// Fixes: "Checking authentication..." stuck issue.
// ============================================================================

// ===== WAIT UNTIL FIREBASE LOADED =====
document.addEventListener("DOMContentLoaded", () => {
  // Pastikan Firebase sudah siap
  const checkFirebase = setInterval(() => {
    if (window.auth && window.firestore && window.db) {
      clearInterval(checkFirebase);
      initAdminDashboard();
    }
  }, 300);
});

function initAdminDashboard() {
  console.log("✅ Firebase detected, starting Admin Dashboard...");

  // ===== DOM ELEMENTS =====
  const authContainer = document.getElementById("auth-container");
  const adminPanel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const logoutNav = document.getElementById("logout-nav");

  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");

  const profileDetails = document.getElementById("profile-details");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const profileForm = document.getElementById("profile-form");
  const profileName = document.getElementById("profile-name");
  const profileAddress = document.getElementById("profile-address");

  const allProductList = document.getElementById("all-product-list");
  const addToCartForm = document.getElementById("add-to-cart-form");
  const cartProductId = document.getElementById("cart-product-id");
  const cartQuantity = document.getElementById("cart-quantity");
  const cartList = document.getElementById("cart-list");

  const orderList = document.getElementById("order-list");
  const placeOrderForm = document.getElementById("place-order-form");
  const orderProductId = document.getElementById("order-product-id");
  const orderQuantity = document.getElementById("order-quantity");

  // ===== LOADING STATE =====
  const loadingScreen = document.createElement("div");
  loadingScreen.textContent = "Checking authentication...";
  loadingScreen.style.textAlign = "center";
  loadingScreen.style.padding = "2rem";
  loadingScreen.style.fontWeight = "bold";
  document.body.prepend(loadingScreen);

  authContainer.style.display = "none";
  adminPanel.style.display = "none";

  // ===== SETUP AUTH LISTENER =====
  window.auth.onAuthStateChanged(window.auth.getAuth(), async (user) => {
    loadingScreen.remove();

    if (user) {
      try {
        const docRef = window.firestore.doc(window.db, "users", user.uid);
        const docSnap = await window.firestore.getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === "admin") {
          console.log("👑 Admin authenticated:", user.email);
          authContainer.style.display = "none";
          adminPanel.style.display = "block";
          if (logoutNav) logoutNav.style.display = "inline-block";
          renderProfile(user);
          renderAllProducts();
          renderCart();
          renderOrders();
        } else {
          alert("Access Denied: Not an admin account.");
          await window.auth.signOut(window.auth.getAuth());
          authContainer.style.display = "block";
          adminPanel.style.display = "none";
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        authContainer.style.display = "block";
        adminPanel.style.display = "none";
      }
    } else {
      console.log("ℹ️ No user logged in");
      authContainer.style.display = "block";
      adminPanel.style.display = "none";
      if (logoutNav) logoutNav.style.display = "none";
    }
  });

  // ===== LOGIN =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        const userCredential = await window.auth.signInWithEmailAndPassword(
          window.auth.getAuth(),
          email,
          password
        );
        const user = userCredential.user;

        console.log("✅ Logged in:", user.email);
        alert("Login successful!");

        authContainer.style.display = "none";
        adminPanel.style.display = "block";
        if (logoutNav) logoutNav.style.display = "inline-block";

        renderProfile(user);
        renderAllProducts();
        renderCart();
        renderOrders();
      } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
      }
    });
  }

  // ===== LOGOUT =====
  [logoutBtn, logoutNav].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await window.auth.signOut(window.auth.getAuth());
          alert("You have logged out successfully!");
          authContainer.style.display = "block";
          adminPanel.style.display = "none";
          if (logoutNav) logoutNav.style.display = "none";
        } catch (error) {
          console.error("Logout Error:", error);
          alert("Logout failed: " + error.message);
        }
      });
    }
  });

  // ===== PROFILE =====
  async function renderProfile(user) {
    try {
      const docRef = window.firestore.doc(window.db, "users", user.uid);
      const docSnap = await window.firestore.getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        profileDetails.innerHTML = `
          <p>📧 <strong>Email:</strong> ${data.email}</p>
          <p>👤 <strong>Name:</strong> ${data.name || "N/A"}</p>
          <p>📍 <strong>Address:</strong> ${data.address || "N/A"}</p>
        `;
        profileName.value = data.name || "";
        profileAddress.value = data.address || "";
      }
    } catch (error) {
      console.error("Error rendering profile:", error);
    }
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      profileForm.style.display =
        profileForm.style.display === "none" ? "block" : "none";
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = window.auth.getAuth().currentUser;
      if (!user) return;
      try {
        const docRef = window.firestore.doc(window.db, "users", user.uid);
        await window.firestore.updateDoc(docRef, {
          name: profileName.value,
          address: profileAddress.value,
        });
        alert("Profile updated!");
        renderProfile(user);
        profileForm.style.display = "none";
      } catch (error) {
        alert("Update failed: " + error.message);
      }
    });
  }

  // ===== VIEW PRODUCT =====
  async function renderAllProducts() {
    allProductList.innerHTML = "<p>Loading products...</p>";
    try {
      const snapshot = await window.firestore.getDocs(
        window.firestore.collection(window.db, "products")
      );
      if (snapshot.empty) {
        allProductList.innerHTML = "<p>No products found.</p>";
        return;
      }
      let html = "";
      snapshot.forEach((doc) => {
        const p = doc.data();
        html += `
          <div class="product-item">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
            <p>Price: Rp${p.price.toLocaleString("id-ID")}</p>
          </div>`;
      });
      allProductList.innerHTML = html;
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  // ===== CART =====
  async function renderCart() {
    const user = window.auth.getAuth().currentUser;
    if (!user) return;
    cartList.innerHTML = "<p>Loading cart...</p>";
    try {
      const q = window.firestore.query(
        window.firestore.collection(window.db, "cart"),
        window.firestore.where("userId", "==", user.uid)
      );
      const snapshot = await window.firestore.getDocs(q);
      if (snapshot.empty) {
        cartList.innerHTML = "<p>No items in cart.</p>";
        return;
      }
      let html = "";
      snapshot.forEach((doc) => {
        const c = doc.data();
        html += `<p>🛒 Product: ${c.productId} | Qty: ${c.quantity}</p>`;
      });
      cartList.innerHTML = html;
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }

  // ===== ORDERS WITH UPDATE FEATURE =====
  async function renderOrders() {
    const user = window.auth.getAuth().currentUser;
    if (!user) return;

    orderList.innerHTML = "<p>Loading orders...</p>";

    try {
      const q = window.firestore.query(
        window.firestore.collection(window.db, "orders"),
        window.firestore.orderBy("placedAt", "desc")
      );

      const snapshot = await window.firestore.getDocs(q);

      if (snapshot.empty) {
        orderList.innerHTML = "<p>No orders found.</p>";
        return;
      }

      let html = "";
      snapshot.forEach((doc) => {
        const o = doc.data();
        const id = doc.id;

        html += `
      <div class="order-item" style="padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">
        <p>🍛 <strong>${o.productName}</strong></p>
        <p>🆔 Order ID: ${id}</p>
        <p>💰 Total: ₹${o.totalPrice}</p>
        <p>📦 Quantity: ${o.quantity}</p>
        <p>📅 ${
          o.placedAt?.toDate ? o.placedAt.toDate().toLocaleString() : "N/A"
        }</p>

        <p>🔖 Status: 
            <strong>${o.status}</strong>
        </p>

        <button class="update-order-btn" data-id="${id}">
          🔄 Update Status
        </button>

        <div id="update-panel-${id}" style="display:none; margin-top:10px;">
          <select id="status-select-${id}">
            <option value="placed" ${
              o.status === "placed" ? "selected" : ""
            }>placed</option>
            <option value="processing" ${
              o.status === "processing" ? "selected" : ""
            }>processing</option>
            <option value="completed" ${
              o.status === "completed" ? "selected" : ""
            }>completed</option>
            <option value="cancelled" ${
              o.status === "cancelled" ? "selected" : ""
            }>cancelled</option>
          </select>

          <button class="save-status-btn" data-id="${id}">
            💾 Save
          </button>
        </div>
        <hr>
      </div>
      `;
      });

      orderList.innerHTML = html;

      setupUpdateOrderEvents();
    } catch (error) {
      console.error("Error loading orders:", error);
      orderList.innerHTML = "<p>Error loading orders.</p>";
    }
  }

  // ===== UPDATE ORDER EVENTS =====
  function setupUpdateOrderEvents() {
    const updateButtons = document.querySelectorAll(".update-order-btn");
    updateButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const panel = document.getElementById(`update-panel-${id}`);
        panel.style.display = panel.style.display === "none" ? "block" : "none";
      });
    });

    const saveButtons = document.querySelectorAll(".save-status-btn");
    saveButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const newStatus = document.getElementById(`status-select-${id}`).value;

        try {
          const orderRef = window.firestore.doc(window.db, "orders", id);
          await window.firestore.updateDoc(orderRef, { status: newStatus });

          alert("✅ Order status updated!");
          renderOrders();
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to update order: " + error.message);
        }
      });
    });
  }

  // ===== PLACE ORDER =====
  if (placeOrderForm) {
    placeOrderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = window.auth.getAuth().currentUser;
      if (!user) {
        alert("Please login first.");
        return;
      }

      const productId = orderProductId.value.trim();
      const quantity = parseInt(orderQuantity.value);

      if (!productId || isNaN(quantity) || quantity <= 0) {
        alert("Invalid input.");
        return;
      }

      try {
        await window.firestore.addDoc(
          window.firestore.collection(window.db, "orders"),
          {
            userId: user.uid,
            productId,
            quantity,
            status: "placed",
            placedAt: new Date(),
          }
        );
        alert("Order placed!");
        renderOrders();
      } catch (error) {
        alert("Failed: " + error.message);
      }
    });
  }

  // ======================= ADMIN ADD TO CART ========================
  const addToCartForm2 = document.getElementById("add-to-cart-form");

  async function loadAdminCart() {
    const user = window.auth.getAuth().currentUser;
    if (!user) return;

    const cartRef = window.firestore.doc(window.db, "carts", user.uid);
    const snap = await window.firestore.getDoc(cartRef);

    cartList.innerHTML = "<h3>Cart Items:</h3>";

    if (!snap.exists()) {
      cartList.innerHTML += "<p>No items in cart.</p>";
      return;
    }

    const items = snap.data().items || [];

    if (items.length === 0) {
      cartList.innerHTML += "<p>No items in cart.</p>";
      return;
    }

    items.forEach((item) => {
      cartList.innerHTML += `
        <div class="cart-row">
            <p><strong>${item.name}</strong> — Qty: ${item.quantity}</p>
        </div>
      `;
    });
  }

  addToCartForm2.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("cart-product-id").value.trim();
    const quantity = parseInt(document.getElementById("cart-quantity").value);

    if (!productId || quantity <= 0) {
      alert("⚠ Please enter a valid product ID and quantity!");
      return;
    }

    const user = window.auth.getAuth().currentUser;
    if (!user) {
      alert("You must be logged in!");
      return;
    }

    try {
      const productRef = window.firestore.doc(window.db, "products", productId);
      const productSnap = await window.firestore.getDoc(productRef);

      if (!productSnap.exists()) {
        alert("❌ Product ID not found in database!");
        return;
      }

      const product = productSnap.data();

      const cartRef = window.firestore.doc(window.db, "carts", user.uid);
      const cartSnap = await window.firestore.getDoc(cartRef);

      let cartItems = [];

      if (cartSnap.exists()) {
        cartItems = cartSnap.data().items || [];
      }

      cartItems.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
      });

      await window.firestore.setDoc(cartRef, { items: cartItems });

      alert("🛒 Item added to cart!");
      loadAdminCart();

      addToCartForm2.reset();
    } catch (err) {
      console.error(err);
      alert("Error adding to cart: " + err.message);
    }
  });

  window.auth.onAuthStateChanged(window.auth.getAuth(), (user) => {
    if (user) loadAdminCart();
  });
}
