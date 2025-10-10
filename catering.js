// ========================= CATERING.JS =========================
// Handles catering reservation form submission, validation, and storage.
// Ensures user authentication and saves all reservations in localStorage.
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENT REFERENCE =====
  // Get catering form element from the DOM
  const cateringForm = document.getElementById("catering-form");

  // ===== LOCALSTORAGE HELPERS =====
  // Functions for getting and saving catering reservations
  function getReservations() {
    return JSON.parse(localStorage.getItem("reservations")) || [];
  }
  function saveReservations(res) {
    localStorage.setItem("reservations", JSON.stringify(res));
  }

  // ===== FORM SUBMISSION EVENT =====
  // Handles catering form submission and validates user login
  if (cateringForm) {
    cateringForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || currentUser.role !== "user") {
        alert("Please log in as User to submit a catering request.");
        window.location.href = "user.html";
        return;
      }

      submitCateringRequest();
    });
  }

  // ===== SUBMIT CATERING REQUEST =====
  // Collects form input, validates data, and saves a new reservation
  function submitCateringRequest() {
    const name = document.getElementById("name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guests = parseInt(document.getElementById("guests").value, 10);
    const menu = document.getElementById("menu").value;
    const occasion = document.getElementById("occasion").value;
    const pickupDelivery = document.getElementById("pickup-delivery").value;
    const requests = document.getElementById("requests").value;

    // ===== VALIDATION RULES =====
    // Enforce minimum guest requirements for different catering types
    if (menu === "plated" && guests < 25) {
      alert("Plated Catering requires a minimum of 25 guests.");
      return;
    }
    if (menu === "buffet" && guests < 20) {
      alert("Buffet Catering requires a minimum of 20 guests.");
      return;
    }
    if (menu === "family-style" && guests < 15) {
      alert("Family Style Catering requires a minimum of 15 guests.");
      return;
    }

    // ===== SAVE RESERVATION =====
    // Pushes new reservation data into localStorage
    let reservations = getReservations();
    reservations.push({
      name: name + " " + lastName,
      email,
      phone,
      date,
      time,
      guests,
      menu,
      occasion,
      pickupOrDelivery: pickupDelivery,
      requests,
      status: "submitted",
    });
    saveReservations(reservations);
    // Confirmation alert and form reset
    alert(
      "Reservation submitted successfully! You can view it on the Admin page."
    );
    document.getElementById("catering-form").reset();
  }
});
