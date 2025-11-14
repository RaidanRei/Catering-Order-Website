// ========================= USER.JS =========================
// Handles user authentication, profile, product upload, and viewing orders.
// Ensures logout works consistently like admin.js
// ================================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 🔄 Wait until Firebase is ready
  const checkFirebase = setInterval(() => {
    if (window.auth && window.firestore && window.db) {
      clearInterval(checkFirebase);
      initUserDashboard();
    }
  }, 300);
});

function initUserDashboard() {
  console.log("✅ Firebase detected, starting User Dashboard...");

  // ===== DOM ELEMENTS =====
  const authContainer = document.getElementById("auth-container");
  const userPanel = document.getElementById("user-panel");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const logoutNav = document.getElementById("logout-nav");
  const uploadForm = document.getElementById("upload-form");
  const orderList = document.getElementById("order-list");

  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const registerEmail = document.getElementById("register-email");
  const registerPassword = document.getElementById("register-password");

  const productName = document.getElementById("product-name");
  const productDescription = document.getElementById("product-description");
  const productPrice = document.getElementById("product-price");

  const profileDetails = document.getElementById("profile-details");
  const profileForm = document.getElementById("profile-form");
  const profileName = document.getElementById("profile-name");
  const profileAddress = document.getElementById("profile-address");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const myProductList = document.getElementById("my-product-list");

  // ===== LOADING MESSAGE =====
  const loadingScreen = document.createElement("div");
  loadingScreen.textContent = "Checking authentication...";
  loadingScreen.style.textAlign = "center";
  loadingScreen.style.padding = "2rem";
  loadingScreen.style.fontWeight = "bold";
  document.body.prepend(loadingScreen);

  authContainer.style.display = "none";
  userPanel.style.display = "none";

  // ===== AUTH LISTENER =====
  window.auth.onAuthStateChanged(window.auth.getAuth(), async (user) => {
    loadingScreen.remove();

    if (user) {
      const docRef = window.firestore.doc(window.db, "users", user.uid);
      const docSnap = await window.firestore.getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "user") {
        console.log("👤 User authenticated:", user.email);
        authContainer.style.display = "none";
        userPanel.style.display = "block";
        if (logoutNav) logoutNav.style.display = "inline-block";
        renderProfile(user.uid);
        renderMyProducts(user.uid);
        renderMyOrders(user.uid);
      } else {
        alert("Access Denied: Not a user account.");
        await window.auth.signOut(window.auth.getAuth());
        authContainer.style.display = "block";
        userPanel.style.display = "none";
      }
    } else {
      console.log("ℹ️ No user logged in");
      authContainer.style.display = "block";
      userPanel.style.display = "none";
      if (logoutNav) logoutNav.style.display = "none";
    }
  });

  // ===== REGISTER =====
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = registerEmail.value.trim();
      const password = registerPassword.value.trim();

      try {
        const userCredential = await window.auth.createUserWithEmailAndPassword(
          window.auth.getAuth(),
          email,
          password
        );
        const user = userCredential.user;

        await window.firestore.setDoc(
          window.firestore.doc(window.db, "users", user.uid),
          {
            email,
            role: "user",
            name: "New User",
            address: "Unknown",
            createdAt: window.firestore.serverTimestamp(),
          }
        );

        alert("Registration successful! Please login.");
        registerForm.reset();
      } catch (error) {
        console.error("Register Error:", error);
        alert("Registration failed: " + error.message);
      }
    });
  }

  // ===== LOGIN =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      try {
        await window.auth.signInWithEmailAndPassword(
          window.auth.getAuth(),
          email,
          password
        );

        console.log("✅ Login success:", email);
        alert("Login successful!"); // ✅ Added confirmation message

        // Optional immediate UI switch (agar langsung terasa login berhasil)
        authContainer.style.display = "none";
        userPanel.style.display = "block";
        if (logoutNav) logoutNav.style.display = "inline-block";

        const user = window.auth.getAuth().currentUser;
        if (user) {
          renderProfile(user.uid);
          renderMyProducts(user.uid);
          renderMyOrders(user.uid);
        }
      } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
      }
    });
  }

  // ===== LOGOUT =====
  if (logoutNav) {
    logoutNav.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await window.auth.signOut(window.auth.getAuth());
        alert("You have logged out successfully!");
        authContainer.style.display = "block";
        userPanel.style.display = "none";
        logoutNav.style.display = "none";
        console.log("👋 User logged out");
      } catch (error) {
        console.error("Logout Error:", error);
        alert("Logout failed: " + error.message);
      }
    });
  }

  // ===== PROFILE =====
  async function renderProfile(userId) {
    try {
      const docRef = window.firestore.doc(window.db, "users", userId);
      const docSnap = await window.firestore.getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        profileDetails.innerHTML = `
          <p>📧 <strong>Email:</strong> ${data.email}</p>
          <p>👤 <strong>Name:</strong> ${data.name}</p>
          <p>📍 <strong>Address:</strong> ${data.address}</p>
        `;
        profileName.value = data.name;
        profileAddress.value = data.address;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
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
        alert("Profile updated successfully!");
        renderProfile(user.uid);
        profileForm.style.display = "none";
      } catch (error) {
        alert("Failed to update profile: " + error.message);
      }
    });
  }

  // ===== UPLOAD PRODUCT =====
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = window.auth.getAuth().currentUser;
      if (!user) return alert("You must be logged in.");

      try {
        await window.firestore.addDoc(
          window.firestore.collection(window.db, "products"),
          {
            userId: user.uid,
            userEmail: user.email,
            name: productName.value,
            description: productDescription.value,
            price: parseFloat(productPrice.value),
            createdAt: window.firestore.serverTimestamp(),
          }
        );
        alert("Product uploaded successfully!");
        uploadForm.reset();
        renderMyProducts(user.uid);
      } catch (error) {
        console.error("Upload Error:", error);
      }
    });
  }

  // ===== VIEW PRODUCTS =====
  async function renderMyProducts(userId) {
    myProductList.innerHTML = "Loading...";
    try {
      const q = window.firestore.query(
        window.firestore.collection(window.db, "products"),
        window.firestore.where("userId", "==", userId)
      );
      const snapshot = await window.firestore.getDocs(q);
      if (snapshot.empty) {
        myProductList.innerHTML = "<p>No products found.</p>";
        return;
      }

      let html = "";
      snapshot.forEach((doc) => {
        const p = doc.data();
        html += `
          <div class="product-item">
            <p>🍛 <strong>${p.name}</strong></p>
            <p>📝 ${p.description}</p>
            <p>🏷️ ₹${p.price.toLocaleString("en-IN")}</p>
            <button onclick="placeOrder('${doc.id}', '${p.name}', ${
          p.price
        })">🛒 Order</button>
          </div>`;
      });
      myProductList.innerHTML = html;
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  // ===== PLACE ORDER =====
  window.placeOrder = async function (productId, productName, price) {
    const user = window.auth.getAuth().currentUser;
    if (!user) return alert("Please login to place order.");

    try {
      await window.firestore.addDoc(
        window.firestore.collection(window.db, "orders"),
        {
          userId: user.uid,
          userEmail: user.email,
          productId,
          productName,
          totalPrice: price,
          quantity: 1,
          status: "placed",
          placedAt: window.firestore.serverTimestamp(),
        }
      );

      alert("Order placed successfully!");
      renderMyOrders(user.uid);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order: " + error.message);
    }
  };

  // ===== VIEW ORDERS =====
  async function renderMyOrders(userId) {
    orderList.innerHTML = "Loading your orders...";
    try {
      const q = window.firestore.query(
        window.firestore.collection(window.db, "orders"),
        window.firestore.where("userId", "==", userId),
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
        const date = o.placedAt
          ? new Date(o.placedAt.toDate()).toLocaleString("en-IN")
          : "N/A";
        html += `
          <div class="order-item">
            <p>🍛 <strong>${o.productName}</strong></p>
            <p>💰 Total: ₹${o.totalPrice.toLocaleString("en-IN")}</p>
            <p>📅⏰ ${date}</p>
            <p>ℹ️ Status: ${o.status.toUpperCase()}</p>
          </div>`;
      });
      orderList.innerHTML = html;
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      orderList.innerHTML = `<p style="color:red;">Failed to load orders.</p>`;
    }
  }
}
