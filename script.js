
const menuButton = document.querySelector(".menu");
const navigation = document.querySelector(".nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "✕" : "☰";
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "☰";
    });
  });
}

const prayerForm = document.querySelector("#prayerForm");

if (prayerForm) {
  prayerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const category = document.querySelector("#category").value;
    const message = document.querySelector("#message").value.trim();
    const status = document.querySelector("#status");

    if (!message) {
      status.textContent = "Please enter your prayer request.";
      return;
    }

    const ministryNumber = "265885914196";

    const text = [
      "JESUS EMBASSY — FOR ALL NATIONS",
      "Prayer Request",
      "",
      "Name: " + (name || "Not provided"),
      "Category: " + category,
      "Request: " + message
    ].join("\n");

    const whatsappURL =
      "https://wa.me/" + ministryNumber +
      "?text=" + encodeURIComponent(text);

    status.textContent =
      "WhatsApp will open so you can review and send your message.";

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  });
}

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
