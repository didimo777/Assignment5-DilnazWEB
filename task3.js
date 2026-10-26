
const ticketTypes = [
  { id: 1, name: "Standard", price: 5000, seatsLeft: 20 },
  { id: 2, name: "Premium", price: 10000, seatsLeft: 8 },
  { id: 3, name: "VIP", price: 20000, seatsLeft: 3 }
];

const promoCodes = [
  { code: "SAVE10", discount: 10 },
  { code: "STUDENT20", discount: 20 }
];

function dateAfter(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const soldOutDates = [
  dateAfter(2),
  dateAfter(5)
];

const form = document.querySelector("#ticketForm");
const summary = document.querySelector("#errorSummary");
const result = document.querySelector("#result");

const fields = [
  "event",
  "date",
  "ticketType",
  "quantity",
  "fullName",
  "email",
  "promo"
];

const touched = new Set();

form.noValidate = true;

document.querySelector("#date").min = dateAfter(1);

function getValues() {
  return {
    event: document.querySelector("#event").value,
    date: document.querySelector("#date").value,
    ticketType: document.querySelector("#ticketType").value,
    quantity: document.querySelector("#quantity").value,
    fullName: document.querySelector("#fullName").value.trim(),
    email: document.querySelector("#email").value.trim(),
    promo: document.querySelector("#promo").value.trim().toUpperCase()
  };
}

function getTicketType(name) {
  return ticketTypes.find(item => item.name === name);
}

function getPromo(code) {
  return promoCodes.find(item => item.code === code);
}

function validateField(name, values) {
  const element = document.getElementById(name);

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      return "This field is required.";
    }

    if (element.validity.typeMismatch) {
      return "Please enter a valid email address.";
    }

    if (element.validity.rangeUnderflow) {
      return "Value is below the minimum.";
    }

    if (element.validity.rangeOverflow) {
      return "Maximum 6 tickets per booking.";
    }

    if (element.validity.stepMismatch) {
      return "Please enter a whole number.";
    }

    if (element.validity.tooShort) {
      return "Value is too short.";
    }

    return "Please check this value.";
  }

  if (name === "event") {
    const allowedEvents = [
      "Music Festival",
      "Art Exhibition",
      "Tech Conference"
    ];

    if (!allowedEvents.includes(values.event)) {
      return "Please choose an available event.";
    }
  }

  if (name === "date") {
    if (values.date < dateAfter(1)) {
      return "Please choose a future date.";
    }

    if (soldOutDates.includes(values.date)) {
      return "This date is sold out. Choose another date.";
    }
  }

  if (name === "ticketType") {
    if (!getTicketType(values.ticketType)) {
      return "Please choose a valid ticket type.";
    }
  }

  if (name === "quantity") {
    const quantity = Number(values.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return "Quantity must be a positive whole number.";
    }

    const ticket = getTicketType(values.ticketType);

    if (ticket && quantity > ticket.seatsLeft) {
      return `Only ${ticket.seatsLeft} ${ticket.name} seats left.`;
    }
  }

  if (name === "fullName") {
    const words = values.fullName.split(/\s+/).filter(Boolean);

    if (words.length < 2) {
      return "Enter both your first and last name.";
    }

    if (!/^[\p{L}\s'-]+$/u.test(values.fullName)) {
      return "Name must contain letters only.";
    }
  }

  if (name === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return "Enter a valid email address.";
    }
  }

  if (name === "promo") {
    if (values.promo !== "" && !getPromo(values.promo)) {
      return "Invalid promo code. Try SAVE10 or STUDENT20.";
    }
  }

  return "";
}

function displayError(name, message) {
  const input = document.getElementById(name);
  const error = document.getElementById(name + "Error");

  error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  input.setAttribute("aria-describedby", name + "Error");
}

function checkField(name) {
  const values = getValues();
  const message = validateField(name, values);

  displayError(name, message);
  return message === "";
}

function calculateTotal(values) {
  const ticket = getTicketType(values.ticketType);
  const quantity = Number(values.quantity);

  if (!ticket || !Number.isInteger(quantity) || quantity < 1) {
    return 0;
  }

  const promo = getPromo(values.promo);
  const discount = promo ? promo.discount : 0;

  const subtotal = ticket.price * quantity;
  return subtotal * (1 - discount / 100);
}

function updatePreview() {
  const values = getValues();

  const ticket = getTicketType(values.ticketType);
  const promo = getPromo(values.promo);

  document.querySelector("#previewEvent").textContent =
    values.event || "Select an event";

  document.querySelector("#previewDate").textContent =
    values.date || "Not selected";

  document.querySelector("#previewType").textContent =
    ticket ? ticket.name : "Not selected";

  document.querySelector("#previewQuantity").textContent =
    values.quantity || "0";

  document.querySelector("#previewName").textContent =
    values.fullName || "Your name";

  document.querySelector("#previewDiscount").textContent =
    promo ? promo.discount + "%" : "0%";

  document.querySelector("#previewTotal").textContent =
    calculateTotal(values).toLocaleString("en-US") + " ₸";
}

function validateAll() {
  const values = getValues();
  const errors = [];

  for (const name of fields) {
    const message = validateField(name, values);
    displayError(name, message);

    if (message !== "") {
      errors.push({ name, message });
    }
  }

  return errors;
}

function generateBookingCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "JS-";

  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * characters.length);
    code += characters[index];
  }

  return code;
}

function showConfirmation(values, code, total) {
  result.replaceChildren();

  const card = document.createElement("div");
  card.classList.add("confirmation");

  const heading = document.createElement("h3");
  heading.textContent = "✓ Booking Confirmed!";

  const bookingCode = document.createElement("p");
  bookingCode.textContent = "Booking code: " + code;

  const eventText = document.createElement("p");
  eventText.textContent = "Event: " + values.event;

  const guestText = document.createElement("p");
  guestText.textContent = "Guest: " + values.fullName;

  const dateText = document.createElement("p");
  dateText.textContent = "Date: " + values.date;

  const totalText = document.createElement("p");
  totalText.textContent =
    "Total paid: " + total.toLocaleString("en-US") + " ₸";

  card.append(
    heading,
    bookingCode,
    eventText,
    guestText,
    dateText,
    totalText
  );

  result.append(card);
}

for (const name of fields) {
  const input = document.getElementById(name);

  input.addEventListener("blur", function () {
    touched.add(name);
    checkField(name);
  });

  input.addEventListener("input", function () {
    updatePreview();

    if (touched.has(name)) {
      checkField(name);
    }

    if (name === "ticketType" && touched.has("quantity")) {
      checkField("quantity");
    }
  });

  input.addEventListener("change", function () {
    updatePreview();

    if (touched.has(name)) {
      checkField(name);
    }

    if (name === "ticketType" && touched.has("quantity")) {
      checkField("quantity");
    }
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const errors = validateAll();

  if (errors.length > 0) {
    summary.hidden = false;
    summary.textContent =
      `Please fix ${errors.length} error(s) before booking.`;

    document.getElementById(errors[0].name).focus();
    return;
  }

  summary.hidden = true;

  const values = getValues();
  const ticket = getTicketType(values.ticketType);
  const total = calculateTotal(values);
  const code = generateBookingCode();

  showConfirmation(values, code, total);

  ticket.seatsLeft -= Number(values.quantity);

  form.reset();
  touched.clear();

  for (const name of fields) {
    const input = document.getElementById(name);
    input.removeAttribute("aria-invalid");
    document.getElementById(name + "Error").textContent = "";
  }

  updatePreview();
});

updatePreview();
