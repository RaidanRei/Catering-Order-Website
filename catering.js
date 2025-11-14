// ========================= CATERING.JS =========================
// Handles catering reservation submission, validation,
// Firestore saving, and email sending via mailto.
// ===============================================================

// Load firebase auth (provided from catering.html)
let auth;
window.setAuthForCatering = (authInstance) => {
  auth = authInstance;
};

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENTS =====
  const cateringForm = document.getElementById("catering-form");

  if (!cateringForm) return;

  // ===== FORM SUBMISSION HANDLER =====
  cateringForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Check login
    const user = auth?.currentUser;
    if (!user) {
      alert("⚠ Please login as a User to submit your catering request.");
      window.location.href = "user.html";
      return;
    }

    // Proceed to catering submission
    await submitCateringRequest(user);
  });

  // ========================= MAIN FUNCTION =========================
  async function submitCateringRequest(user) {
    // Collect form inputs
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guests = parseInt(document.getElementById("guests").value, 10);
    const menu = document.getElementById("menu").value;
    const occasion = document.getElementById("occasion").value.trim();
    const pickupDelivery = document.getElementById("pickup-delivery").value;
    const requests = document.getElementById("requests").value.trim();

    // ===== VALIDATION RULES =====
    if (menu === "Plated" && guests < 25) {
      alert("Plated Catering requires a minimum of 25 guests.");
      return;
    }
    if (menu === "Buffet" && guests < 20) {
      alert("Buffet Catering requires a minimum of 20 guests.");
      return;
    }
    if (menu === "Family Style" && guests < 15) {
      alert("Family Style Catering requires a minimum of 15 guests.");
      return;
    }

    // ===== BUILD EMAIL FORMAT =====
    const emailBody = `CATERING REQUEST

Customer Name: ${firstName} ${lastName}
Customer Email: ${email}
Phone: ${phone}

Event Date: ${date}
Event Time: ${time}
Guests: ${guests}
Catering Style: ${menu}
Occasion: ${occasion}
Service Type: ${pickupDelivery}

Special Requests:
${requests}

Submitted by logged-in user:
${user.email}
`;

    const mailtoURL =
      `mailto:indianfoodie.catering@gmail.com` +
      `?subject=Catering Request from ${encodeURIComponent(
        firstName + " " + lastName
      )}` +
      `&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoURL;

    // ===== SAVE TO FIRESTORE TOO =====
    try {
      await window.firestore.addDoc(
        window.firestore.collection(window.db, "reservations"),
        {
          userId: user.uid,
          userEmail: user.email,
          name: firstName + " " + lastName,
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
          createdAt: new Date(),
        }
      );

      alert(
        `Thank you, ${firstName}! Your catering request has been submitted and an email draft has opened for you.`
      );

      cateringForm.reset();
    } catch (error) {
      console.error("Firestore error:", error);
      alert("Request saved to email but failed to save in database.");
    }
  }
});
