// ========================= CART.JS =========================
// Combines Firestore sync with localStorage for instant cart UI response.
// Prevents scroll-to-top, updates .cart-count instantly, and keeps persistence.
// ================================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENTS =====
  const cartIcon = document.querySelector(".cart-icon");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalPrice = document.getElementById("cart-total-price");
  const cartCount = document.querySelector(".cart-count");
  const checkoutButton = document.querySelector(".checkout-btn");

  // ===== LOCALSTORAGE HELPERS =====
  function getLocalCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  function saveLocalCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ===== FIRESTORE HELPERS =====
  function getCartRef(userId) {
    return window.firestore.doc(window.db, "carts", userId);
  }

  async function saveCartToFirestore(userId, cart) {
    try {
      await window.firestore.setDoc(getCartRef(userId), { items: cart });
    } catch (err) {
      console.warn("⚠️ Firestore sync failed (offline mode)", err);
    }
  }

  async function getCartFromFirestore(userId) {
    try {
      const snap = await window.firestore.getDoc(getCartRef(userId));
      return snap.exists() ? snap.data().items || [] : [];
    } catch {
      return [];
    }
  }

  // ===== TOGGLE CART SIDEBAR =====
  const openCart = () => cartSidebar.classList.add("active");
  const closeCartSidebar = () => cartSidebar.classList.remove("active");

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault(); // ✅ Prevent scroll-to-top (#)
      cartSidebar.classList.toggle("active");
    });
  }
  if (closeCart) closeCart.addEventListener("click", closeCartSidebar);

  // ===== UPDATE CART DISPLAY =====
  function updateCartDisplay() {
    const cart = getLocalCart();
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
      total += item.price;
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
  <img src="${item.image}" class="cart-item-img" alt="${item.name}">
  <div class="cart-item-info">
    <h4>${item.name}</h4>
    <span>₹${item.price}</span>
  </div>
  <i class='bx bx-x cart-item-remove remove-icon' data-idx="${idx}"></i>
`;
      cartItemsContainer.appendChild(el);
    });

    cartTotalPrice.textContent = `₹${total.toLocaleString("en-IN")}`;
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? "flex" : "none";
  }

  // ===== ADD TO CART =====
  function attachAddToCartButtons() {
    const buttons = document.querySelectorAll(
      ".add-to-cart-btn, .menu__button"
    );
    buttons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const menuItem = e.target.closest(".menu__content, .menu__card");
        const name =
          menuItem.querySelector(".menu__name")?.textContent || "Unknown";
        const priceText =
          menuItem.querySelector(".menu__price, .menu__preci")?.textContent ||
          "₹0";
        const price = parseInt(priceText.replace(/[^\d]/g, ""));
        const image =
          menuItem.querySelector(".menu__img")?.src || "images/default.jpg";

        // === Add to localStorage instantly ===
        let cart = getLocalCart();
        cart.push({ name, price, image });
        saveLocalCart(cart);
        updateCartDisplay();

        // === If login, also sync Firestore ===
        const user = window.auth?.currentUser;
        if (user) saveCartToFirestore(user.uid, cart);

        alert(`🛒 "${name}" added to cart!`);
      });
    });
  }

  // ===== CLICK PRODUCT IMAGE → ADD TO CART + OPEN CART =====
  function attachImageClickToCart() {
    const images = document.querySelectorAll(".menu__img");

    images.forEach((img) => {
      img.style.cursor = "pointer";

      img.addEventListener("click", async (e) => {
        e.preventDefault();

        const menuItem = e.target.closest(".menu__content, .menu__card");
        const name =
          menuItem.querySelector(".menu__name")?.textContent || "Unknown";
        const priceText =
          menuItem.querySelector(".menu__price, .menu__preci")?.textContent ||
          "₹0";
        const price = parseInt(priceText.replace(/[^\d]/g, ""));
        const image = menuItem.querySelector(".menu__img")?.src;

        // Add to local cart instantly
        let cart = getLocalCart();
        cart.push({ name, price, image });
        saveLocalCart(cart);
        updateCartDisplay();

        // Sync to Firestore if logged in
        const user = window.auth?.currentUser;
        if (user) saveCartToFirestore(user.uid, cart);

        alert(`🛒 "${name}" added to cart!`);

        // Auto-open cart sidebar
        cartSidebar.classList.add("active");
      });
    });
  }

  // ===== REMOVE ITEM FROM CART =====
  cartItemsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = parseInt(e.target.dataset.idx, 10);
      let cart = getLocalCart();
      cart.splice(idx, 1);
      saveLocalCart(cart);
      updateCartDisplay();

      const user = window.auth?.currentUser;
      if (user) saveCartToFirestore(user.uid, cart);
    }
  });

  // ===== INITIAL LOAD =====
  updateCartDisplay();
  attachAddToCartButtons();
  attachImageClickToCart();

  // Keep Firestore in sync with local cart after login
  window.auth?.onAuthStateChanged(window.auth.getAuth(), async (user) => {
    if (user) {
      const serverCart = await getCartFromFirestore(user.uid);
      if (serverCart.length > 0) {
        saveLocalCart(serverCart);
      }
      updateCartDisplay();
    }
  });
});

// ========================= UNIVERSAL CHECKOUT CLICK LISTENER =========================
document.body.addEventListener("click", async (e) => {
  const checkoutBtn = e.target.closest(".checkout-btn");
  if (!checkoutBtn) return;

  e.preventDefault();
  console.log("🧾 Checkout button detected through delegation");

  const user = window.auth?.currentUser;

  if (!user) {
    const goLogin = confirm(
      "⚠️ You need to login first before checkout.\n\nClick OK to go to the login page."
    );
    if (goLogin) window.location.href = "user.html";
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("Your cart is empty. Add some items first!");
    return;
  }

  try {
    const batch = window.firestore.writeBatch(window.db);
    const ordersCol = window.firestore.collection(window.db, "orders");

    cart.forEach((item) => {
      const newOrderRef = window.firestore.doc(ordersCol);
      batch.set(newOrderRef, {
        userId: user.uid,
        userEmail: user.email,
        productName: item.name,
        totalPrice: item.price,
        status: "placed",
        placedAt: window.firestore.serverTimestamp(),
      });
    });

    await batch.commit();

    localStorage.removeItem("cart");
    updateCartDisplay();

    alert("✅ Checkout successful! Your order has been placed.");
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed.\n" + err.message);
  }
});
