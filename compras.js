const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const tableBody = document.querySelector("#ordersTableBody");
const ordersCount = document.querySelector("#ordersCount");
const ordersMessage = document.querySelector("#ordersMessage");
const refreshButton = document.querySelector("#refreshButton");
const downloadCsvButton = document.querySelector("#downloadCsv");

let currentOrders = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOrders() {
  return JSON.parse(localStorage.getItem("nissanOrders") || "[]");
}

function loadOrders() {
  ordersMessage.classList.add("hidden");
  currentOrders = getOrders();
  renderOrders(currentOrders);
}

function renderOrders(orders) {
  ordersCount.textContent = orders.length;
  if (!orders.length) {
    tableBody.innerHTML = "";
    ordersMessage.textContent = "Todavia no hay compras guardadas en este navegador.";
    ordersMessage.classList.remove("hidden");
    return;
  }

  tableBody.innerHTML = orders
    .map(
      (order) => `
        <tr>
          <td>${escapeHtml(order.folio)}</td>
          <td>${escapeHtml(order.name)}<br><span>${escapeHtml(order.phone)}</span></td>
          <td>${escapeHtml(order.carModel)}</td>
          <td>${escapeHtml(order.mode)}</td>
          <td>${escapeHtml(order.payment)}</td>
          <td>${currencyFormatter.format(order.price)}</td>
          <td>${escapeHtml(order.date)}</td>
        </tr>
      `
    )
    .join("");
}

function downloadCsv() {
  if (!currentOrders.length) return;

  const headers = ["Folio", "Cliente", "Correo", "Telefono", "Auto", "Operacion", "Pago", "Total", "Fecha"];
  const rows = currentOrders.map((order) => [
    order.folio,
    order.name,
    order.email,
    order.phone,
    order.carModel,
    order.mode,
    order.payment,
    order.price,
    order.date
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "compras-nissan.csv";
  link.click();
  URL.revokeObjectURL(url);
}

refreshButton.addEventListener("click", loadOrders);
downloadCsvButton.addEventListener("click", downloadCsv);

loadOrders();
