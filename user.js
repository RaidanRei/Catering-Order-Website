// DOM Elements
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
const productImage = document.getElementById("product-image");

const myProductList = document.getElementById("my-product-list");
const orderList = document.getElementById("order-list");

// ✅ Firebase objects (auth, db, storage) come from firebase.js

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
        role: "user",
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
logoutNav.addEventListener("click", () => {
  auth.signOut();
});

// --- Auth Listener ---
auth.onAuthStateChanged((user) => {
  if (user) {
    authContainer.style.display = "none";
    userPanel.style.display = "block";
    logoutNav.style.display = "block";
    displayMyProducts();
    displayMyOrders();
  } else {
    authContainer.style.display = "block";
    userPanel.style.display = "none";
    logoutNav.style.display = "none";
  }
});

// --- Upload Product ---
uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const file = productImage.files[0];
  const name = productName.value;
  const description = productDescription.value;
  const price = productPrice.value;
  const user = auth.currentUser;

  const storageRef = storage.ref(`products/${user.uid}/${file.name}`);
  storageRef.put(file).then((snapshot) => {
    snapshot.ref.getDownloadURL().then((downloadURL) => {
      db.collection("products")
        .add({
          name: name,
          description: description,
          price: price,
          imageUrl: downloadURL,
          userId: user.uid,
        })
        .then(() => {
          uploadForm.reset();
          alert("Product uploaded successfully");
        });
    });
  });
});

// --- Render Products ---
const renderProducts = (products) => {
  myProductList.innerHTML = "";
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Price: ${product.price}</p>
      <img src="${product.imageUrl}" width="100">
      <button class="edit-btn" data-id="${product.id}">Edit</button>
      <button class="delete-btn" data-id="${product.id}">Delete</button>
    `;
    myProductList.appendChild(productDiv);
  });
};

const displayMyProducts = () => {
  const user = auth.currentUser;
  if (user) {
    db.collection("products")
      .where("userId", "==", user.uid)
      .onSnapshot((snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        renderProducts(products);
      });
  }
};

myProductList.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("delete-btn")) {
    db.collection("products")
      .doc(id)
      .delete()
      .then(() => {
        alert("Product deleted successfully");
      });
  }
  if (e.target.classList.contains("edit-btn")) {
    const newPrice = prompt("Enter new price:");
    if (newPrice) {
      db.collection("products")
        .doc(id)
        .update({ price: newPrice })
        .then(() => {
          alert("Product updated successfully");
        });
    }
  }
});

// --- Render Orders ---
const renderOrders = (orders) => {
  orderList.innerHTML = "";
  orders.forEach((order) => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-item";
    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    `;
    orderList.appendChild(orderDiv);
  });
};

const displayMyOrders = () => {
  const user = auth.currentUser;
  if (user) {
    db.collection("orders")
      .where("userId", "==", user.uid)
      .onSnapshot((snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        renderOrders(orders);
      });
  }
};
