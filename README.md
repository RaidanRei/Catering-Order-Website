🧾 README.md

# 🍽️ Catering & Ordering Website

This is a **modern catering and food ordering web app** built with **HTML, CSS, and JavaScript**, now fully powered by **Firebase Authentication + Firebase Firestore** for real-time database and secure login system.

The project supports **Admin and User** roles with separate dashboards, dynamic order management, Firestore-based Cart & Orders, Catering Reservation submission, and elegant UI styled in **Saffron (Indian orange)** tones.

---

## 🌐 Live Demo

👉 **[View the Website](https://raidanrei.github.io/Catering-Order-Website/)**  
Experience the interactive slider in action!

---

## 📸 Preview

| Screenshot |
| ---------- |

![Screenshot](./images/thumbnail_indian_foodie.webp)

---

## ✨ Features

### 👑 Admin Panel

- Login using Firebase Authentication (admin role detected via users collection)
- Add new products (name, price, description, image URL) → saved to Firestore collection products
- Import menu from index.html directly into Firestore
- View all products in a responsive grid layout
- View and manage user orders from Firestore (orders collection)
- Update order status (`placed → approved → completed`).
- Delete products or orders directly from dashboard

### 🙋‍♂️ User Panel

- Login/Register using Firebase Auth
- Browse menu and add items to cart
- Cart auto-syncs with Firestore when logged in:

Offline: stored in LocalStorage

Online/login: merged with Firestore

- Checkout → creates new documents in orders collection
- Catering reservation form sends request to Firestore (reservations collection)
- View order history (coming soon)

### 🛒 Cart System

- Fully dynamic cart sidebar with add/remove functionality
- Real-time total price calculation
- Cart saved locally first → synced to Firestore when logged in
- Works even offline (localStorage fallback)
- Checkout writes multiple order documents to Firestore using batch writes

### 🎨 UI & Design

- Responsive saffron-themed layout
- Animated hover effects for buttons and pricing
- Centered, elegant catering form with glowing animation
- Consistent navbar and footer styling across all pages

---

## 🗂️ Project Structure

```bash
📦 project/
│
├── index.html # Landing page with menu, hero, and features
├── catering.html # Catering service form (Firestore + Auth)
├── user.html # User login/register + Firestore order sync
├── admin.html # Admin login + product & order management
│
├── style.css # Main stylesheet (Saffron theme, responsive)
├── admin.js # Admin logic (Firestore CRUD)
├── user.js # User login + registration (Firebase Auth)
├── cart.js # Cart logic (LocalStorage + Firestore sync)
├── catering.js # Catering reservation (Firestore)
│
└── firebaseConfig included inline on each page
```

---

## ⚙️ Firestore Structure

| Collection     | Description                             |
| -------------- | --------------------------------------- |
| `users`        | User profiles + role (`admin` / `user`) |
| `products`     | All menu items stored by admin          |
| `carts`        | User cart (document ID = UID of user)   |
| `orders`       | List of orders created during checkout  |
| `reservations` | Catering request form submissions       |

---

## 🧩 Default Accounts

```js
// Admin
Email: admin@contoh.com
Password: admincontoh

// User (default demo)
Email: user@example.com
Password: userone
```

---

## 🧠 How It Works

1. User/Admin login via Firebase Authentication

2. Admin role is checked from Firestore (users/{uid}.role)

3. Products added in Admin Panel go to Firestore products

4. Cart:

- Stored locally first (LocalStorage)
- Synced to Firestore when user logs in

5. Checkout:

- Creates multiple order docs in orders (batch write)

6. Catering form:

- Validates guest count
- Writes to Firestore reservations

---

## 🎨 Theme & Colors

| Element    | Color                 | Description        |
| ---------- | --------------------- | ------------------ |
| Primary    | `#FF9933`             | Saffron orange     |
| Hover      | `#CC7A00` / `#E63900` | Interaction colors |
| Background | `#F5F5DC`             | Warm beige         |
| Text       | `#333333`             | Soft dark gray     |

---

## 📱 Responsiveness

- Fully responsive layout

- Grid-based menu

- Flexible catering form

- Slide-in cart sidebar

---

## 🚀 Getting Started

1️⃣ Clone or Download

```bash
   git clone https://github.com/RaidanRei/Catering-Order-Website.git
```

2️⃣ Run locally:

```bash
open index.html
```

3️⃣ Ensure your Firebase config is inserted in each HTML file.

4️⃣ (Optional) First-time product import:

Open browser console on index.html and run:

```bash
importMenuToFirestore();
```

---

## 💡 Developer Notes

- LocalStorage is now only used for temporary cart display

- Firestore is the main database for:
- Products
- Orders
- Carts
- Reservations

- Works offline-first thanks to local caching

- To reset cart: clear LocalStorage or logout/login

---

## 👨‍💻 Author

GitHub Profile 🔗 [RaidanRei](https://github.com/RaidanRei)

If you like this project, feel free to ⭐ star the repository!

---
