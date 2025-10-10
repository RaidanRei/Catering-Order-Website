// ========================= CART.JS =========================
// Handles shopping cart UI, localStorage syncing, and checkout process
// for both user and admin dashboards. Keeps data persistent.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENT REFERENCES =====
  // Select key UI elements for the cart interface
  const cartIcon = document.querySelector(".cart-icon");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const addToCartButtons = document.querySelectorAll(".menu__button");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalPrice = document.getElementById("cart-total-price");
  const cartCount = document.querySelector(".cart-count");
  const checkoutButton = document.querySelector(".checkout-btn");

  // ===== LOCALSTORAGE HELPERS =====
  // Utility functions for reading and writing cart data
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ===== SIDEBAR TOGGLE =====
  // Opens and closes the shopping cart sidebar
  const openCart = () => cartSidebar.classList.add("active");
  const closeCartSidebar = () => cartSidebar.classList.remove("active");

  // ===== UPDATE CART DISPLAY =====
  // Renders cart items, updates total price, and badge count
  function updateCartDisplay() {
    const cart = getCart();
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
      total += parseFloat(item.price.replace("₹", ""));

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
            <span>${item.name}</span>
            <span>${item.price}</span>
        </div>
        <i class='bx bx-x cart-item-remove' data-idx="${idx}"></i>
      `;
      cartItemsContainer.appendChild(cartItem);
    });

    cartTotalPrice.textContent = `₹${total}`;
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? "flex" : "none";
  }

  // ===== EVENT HANDLERS =====
  // Toggles sidebar visibility when clicking the cart icon
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      cartSidebar.classList.contains("active")
        ? closeCartSidebar()
        : openCart();
    });
  }

  // Closes the sidebar when clicking the close button
  if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
  // ===== ADD TO CART =====
  // Adds selected menu items to the cart and updates the display
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const menuItem = e.target.closest(".menu__content");
      const itemName = menuItem.querySelector(".menu__name").textContent;
      const itemPrice = menuItem.querySelector(".menu__preci").textContent;
      const itemImage = menuItem.querySelector(".menu__img").src;

      let cart = getCart();
      cart.push({ name: itemName, price: itemPrice, image: itemImage });
      saveCart(cart);
      updateCartDisplay();
    });
  });

  // ===== REMOVE ITEM FROM CART =====
  // Deletes selected item from the cart by index
  cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("cart-item-remove")) {
      const idx = e.target.dataset.idx;
      let cart = getCart();
      cart.splice(idx, 1);
      saveCart(cart);
      updateCartDisplay();
    }
  });

  // ===== PLACE ORDER / CHECKOUT =====
  // Converts cart items into orders and clears the cart
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser && currentUser.role === "user") {
        let cart = getCart();
        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        cart.forEach((item) => {
          orders.push({
            userId: currentUser.email,
            productId: item.name,
            quantity: 1,
            status: "placed",
          });
        });
        localStorage.setItem("orders", JSON.stringify(orders));
        localStorage.removeItem("cart");
        updateCartDisplay();
        alert("Checkout successful! Orders have been placed.");
      } else {
        alert("Please log in as User to proceed with checkout.");
        window.location.href = "user.html";
      }
    });
  }

  // ===== INITIAL LOAD =====
  // Renders the cart state when the page is first loaded
  updateCartDisplay();
});
