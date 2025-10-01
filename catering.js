document.addEventListener("DOMContentLoaded", () => {
  const cateringForm = document.getElementById("catering-form");

  if (cateringForm) {
    cateringForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if user is logged in (using Firebase Auth)
      if (firebase.auth().currentUser) {
        // User is logged in, proceed with form submission
        submitCateringRequest();
      } else {
        // User is not logged in, redirect to user.html
        alert("Please log in to submit a catering request.");
        window.location.href = "user.html";
      }
    });
  }

  function submitCateringRequest() {
    // Get form values
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

    // Save to Firestore
    db.collection("reservations")
      .add({
        name: name + " " + lastName,
        email: email,
        phone: phone,
        date: date,
        time: time,
        guests: guests,
        menu: menu,
        occasion: occasion,
        pickupOrDelivery: pickupDelivery,
        requests: requests,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        alert(
          "Reservation submitted successfully! You can view your request on the Admin page."
        );
        document.getElementById("catering-form").reset();
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        alert("Error submitting reservation. Please try again.");
      });
  }
});
