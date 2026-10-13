// Update the details below before publishing. Use digits only for WhatsApp, including country code.
const MINISTRY_SETTINGS = {
  whatsappNumber: "265993250016", // Primary ministry WhatsApp number
  email: "yolamugerald2@gmail.com", // Ministry contact email
  secondaryWhatsappNumber: "265885914196", // Secondary WhatsApp number
  location: "Malawi · Online ministry"
};

document.getElementById("year").textContent = new Date().getFullYear();
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

if (MINISTRY_SETTINGS.whatsappNumber) {
  document.getElementById("whatsappDisplay").textContent = "+" + MINISTRY_SETTINGS.whatsappNumber + (MINISTRY_SETTINGS.secondaryWhatsappNumber ? " / +" + MINISTRY_SETTINGS.secondaryWhatsappNumber : "");
  const wa = document.getElementById("whatsappLink");
  wa.href = "https://wa.me/" + MINISTRY_SETTINGS.whatsappNumber;
  wa.target = "_blank"; wa.rel = "noopener noreferrer";
} else {
  document.getElementById("whatsappLink").addEventListener("click", e => {
    e.preventDefault();
    alert("Please add the ministry WhatsApp number in script.js before using this link.");
  });
}
if (MINISTRY_SETTINGS.email) {
  document.getElementById("emailDisplay").textContent = MINISTRY_SETTINGS.email;
  document.getElementById("emailLink").href = "mailto:" + MINISTRY_SETTINGS.email;
} else {
  document.getElementById("emailLink").addEventListener("click", e => {
    e.preventDefault();
    alert("Please add the ministry email address in script.js before using this link.");
  });
}
document.getElementById("locationDisplay").textContent = MINISTRY_SETTINGS.location;

document.getElementById("prayerForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("prayerName").value.trim();
  const topic = document.getElementById("prayerTopic").value;
  const message = document.getElementById("prayerMessage").value.trim();
  const status = document.getElementById("prayerStatus");
  if (!message) { status.textContent = "Please write your prayer request first."; return; }
  if (!MINISTRY_SETTINGS.whatsappNumber) {
    status.textContent = "The prayer request is ready, but the ministry WhatsApp number must be added in script.js before it can be sent.";
    return;
  }
  const body = `Prayer request for JESUS EMBASSY — FOR ALL NATIONS\nName: ${name || "Not provided"}\nCategory: ${topic}\nRequest: ${message}`;
  window.open("https://wa.me/" + MINISTRY_SETTINGS.whatsappNumber + "?text=" + encodeURIComponent(body), "_blank", "noopener,noreferrer");
  status.textContent = "WhatsApp opened with your request ready. Please review and press Send in WhatsApp.";
});
