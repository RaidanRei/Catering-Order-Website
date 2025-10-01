document.addEventListener("DOMContentLoaded", () => {
  const cartIcon = document.querySelector(".cart-icon");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const addToCartButtons = document.querySelectorAll(".menu__button");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalPrice = document.getElementById("cart-total-price");
  const cartCount = document.querySelector(".cart-count");
  const checkoutButton = document.querySelector(".checkout-btn");

  // Function to open the cart sidebar
  const openCart = () => {
    if (cartSidebar) {
      cartSidebar.classList.add("active");
    }
  };

  // Function to close the cart sidebar
  const closeCartSidebar = () => {
    if (cartSidebar) {
      cartSidebar.classList.remove("active");
    }
  };

  // Function to update the cart total
  const updateCartTotal = () => {
    const cartItems = cartItemsContainer.querySelectorAll(".cart-item");
    let total = 0;
    cartItems.forEach((item) => {
      const priceElement = item.querySelector(
        ".cart-item-info span:last-child"
      );
      const price = parseFloat(priceElement.textContent.replace("₹", ""));
      total += price;
    });
    cartTotalPrice.textContent = `₹${total}`;
  };

  // Function to update the cart count
  const updateCartCount = () => {
    const cartItems = cartItemsContainer.querySelectorAll(".cart-item");
    const count = cartItems.length;
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? "flex" : "none";
  };

  // Event listener for toggling the cart
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      if (cartSidebar.classList.contains("active")) {
        closeCartSidebar();
      } else {
        openCart();
      }
    });
  }

  // Event listener for closing the cart
  if (closeCart) {
    closeCart.addEventListener("click", closeCartSidebar);
  }

  // Event listeners for adding items to the cart
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const menuItem = e.target.closest(".menu__content");
      const itemName = menuItem.querySelector(".menu__name").textContent;
      const itemPrice = menuItem.querySelector(".menu__preci").textContent;
      const itemImage = menuItem.querySelector(".menu__img").src;

      addItemToCart(itemName, itemPrice, itemImage);
    });
  });

  // Function to add an item to the cart
  function addItemToCart(name, price, imageSrc) {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
            <img src="${imageSrc}" alt="${name}" class="cart-item-img">
            <div class="cart-item-info">
                <span>${name}</span>
                <span>${price}</span>
            </div>
            <i class='bx bx-x cart-item-remove'></i>
        `;
    cartItemsContainer.appendChild(cartItem);

    // Add event listener to the remove button
    cartItem
      .querySelector(".cart-item-remove")
      .addEventListener("click", () => {
        cartItem.remove();
        updateCartTotal();
        updateCartCount();
      });

    updateCartTotal();
    updateCartCount();
  }

  // Event listener for the checkout button
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      // Check if user is logged in (using Firebase Auth)
      if (firebase.auth().currentUser) {
        // User is logged in, proceed with checkout
        console.log("User is logged in, proceeding to checkout...");
        // You can add your checkout logic here
      } else {
        // User is not logged in, redirect to user.html
        alert("Please log in to proceed with checkout.");
        window.location.href = "user.html";
      }
    });
  }
});
