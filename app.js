const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const carGrid = document.querySelector("#carGrid");
const carCount = document.querySelector("#carCount");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const carDialog = document.querySelector("#carDialog");
const checkoutDialog = document.querySelector("#checkoutDialog");
const ordersDialog = document.querySelector("#ordersDialog");
const checkoutForm = document.querySelector("#checkoutForm");
const toast = document.querySelector("#toast");

let selectedCar = null;

function carFallbackSvg(car) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f7f9fc"/>
          <stop offset="1" stop-color="#cfd6df"/>
        </linearGradient>
      </defs>
      <rect width="900" height="600" fill="url(#g)"/>
      <path d="M210 380h480c42 0 76-26 76-58v-35c0-27-25-51-60-57l-86-14-74-82c-16-18-43-29-72-29H354c-31 0-59 12-75 32l-62 78-73 16c-31 7-53 29-53 54v37c0 32 35 58 77 58h42Z" fill="#c3002f"/>
      <path d="M318 210h111v-66h-55c-16 0-31 7-39 19l-17 47Zm145 0h134l-49-54c-9-10-24-16-40-16h-45v70Z" fill="#f9fbff" opacity=".86"/>
      <circle cx="250" cy="381" r="55" fill="#18191f"/>
      <circle cx="250" cy="381" r="24" fill="#e6ebf1"/>
      <circle cx="647" cy="381" r="55" fill="#18191f"/>
      <circle cx="647" cy="381" r="24" fill="#e6ebf1"/>
      <text x="450" y="492" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#18191f">${car.model}</text>
      <text x="450" y="532" text-anchor="middle" font-family="Arial" font-size="24" fill="#626a73">${car.type}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function renderCars(cars) {
  carCount.textContent = cars.length;
  if (!cars.length) {
    carGrid.innerHTML = `<p class="empty">No se encontraron autos con ese filtro.</p>`;
    return;
  }

  carGrid.innerHTML = cars
    .map(
      (car) => `
        <button class="car-card" type="button" data-id="${car.id}" aria-label="Ver informacion de ${car.model}">
          <img src="${car.image}" alt="${car.model}" loading="lazy" onerror="this.src='${carFallbackSvg(car)}'" />
          <div class="card-body">
            <div class="card-meta">
              <span class="tag">${car.type}</span>
              <span>${car.year}</span>
            </div>
            <h2>${car.model}</h2>
            <p class="price">${currency.format(car.price)}</p>
            <p>${car.engine}</p>
          </div>
        </button>
      `
    )
    .join("");
}

function filterCars() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const filtered = nissanCars.filter((car) => {
    const matchesType = type === "todos" || car.type === type;
    const searchable = `${car.model} ${car.type} ${car.price} ${car.engine}`.toLowerCase();
    return matchesType && searchable.includes(query);
  });
  renderCars(filtered);
}

function fillDetails(car) {
  selectedCar = car;
  document.querySelector("#detailImage").src = car.image;
  document.querySelector("#detailImage").alt = car.model;
  document.querySelector("#detailImage").onerror = () => {
    document.querySelector("#detailImage").src = carFallbackSvg(car);
  };
  document.querySelector("#detailType").textContent = `${car.type} ${car.year}`;
  document.querySelector("#detailTitle").textContent = car.model;
  document.querySelector("#detailDescription").textContent = car.description;
  document.querySelector("#detailPrice").textContent = currency.format(car.price);
  document.querySelector("#detailEngine").textContent = car.engine;
  document.querySelector("#detailFuel").textContent = car.fuel;
  document.querySelector("#detailTransmission").textContent = car.transmission;
  document.querySelector("#detailSeats").textContent = `${car.seats} asientos`;
  document.querySelector("#detailColor").textContent = car.color;
  document.querySelector("#detailFeatures").innerHTML = car.features.map((feature) => `<li>${feature}</li>`).join("");
  carDialog.showModal();
}

function openCheckout(mode) {
  if (!selectedCar) return;
  document.querySelector("#checkoutCar").textContent =
    `${mode}: ${selectedCar.model} por ${currency.format(selectedCar.price)}. Un asesor Nissan se comunicara contigo para continuar.`;
  checkoutForm.dataset.mode = mode;
  carDialog.close();
  checkoutDialog.showModal();
}

function getOrders() {
  return JSON.parse(localStorage.getItem("nissanOrders") || "[]");
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem("nissanOrders", JSON.stringify(orders));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function renderOrders() {
  const ordersList = document.querySelector("#ordersList");
  const orders = getOrders();

  if (!orders.length) {
    ordersList.innerHTML = `<p class="empty">Todavia no hay compras guardadas.</p>`;
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-item">
          <strong>${order.carModel}</strong>
          <p>Folio: ${order.folio}</p>
          <p>Cliente: ${order.name} | ${order.phone}</p>
          <p>Operacion: ${order.mode} | Pago: ${order.payment}</p>
          <p>Total: ${currency.format(order.price)}</p>
        </article>
      `
    )
    .join("");
}

carGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".car-card");
  if (!card) return;
  const car = nissanCars.find((item) => item.id === Number(card.dataset.id));
  if (car) fillDetails(car);
});

searchInput.addEventListener("input", filterCars);
typeFilter.addEventListener("change", filterCars);

document.querySelector("#closeDialog").addEventListener("click", () => carDialog.close());
document.querySelector("#closeCheckout").addEventListener("click", () => checkoutDialog.close());
document.querySelector("#closeOrders").addEventListener("click", () => ordersDialog.close());
document.querySelector("#quoteButton").addEventListener("click", () => openCheckout("Cotizacion"));
document.querySelector("#buyButton").addEventListener("click", () => openCheckout("Compra"));
document.querySelector("#ordersButton").addEventListener("click", () => {
  ordersDialog.showModal();
  renderOrders();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!selectedCar) return;
  const data = new FormData(checkoutForm);
  const order = {
    folio: `NSN-${Date.now().toString().slice(-6)}`,
    mode: checkoutForm.dataset.mode || "Compra",
    carId: selectedCar.id,
    carModel: selectedCar.model,
    price: selectedCar.price,
    name: data.get("name"),
    email: data.get("email"),
    phone: data.get("phone"),
    payment: data.get("payment"),
    date: new Date().toISOString()
  };

  saveOrder(order);
  checkoutForm.reset();
  checkoutDialog.close();
  showToast(`${order.mode} registrada: ${order.folio}`);
});

renderCars(nissanCars);
