// 1. HTML ELEMENTS

const overlay = document.querySelector("#demo-overlay");
const openButton = document.querySelector("#demo-open");
const closeButton = document.querySelector("#demo-close");
const refreshButton = document.querySelector("#demo-refresh");
const tableBody = document.querySelector("#shipment-rows");
const runButton = document.querySelector("#demo-run");
const loader = document.querySelector("#demo-loader");
const tableWrap = document.querySelector(".demo-table-wrap");
const results = document.querySelector("#demo-results");
const savingsOutput = document.querySelector("#demo-savings");

// 2. EU TRANSPORT ROUTES

const routes = [
  ["Rotterdam, Netherlands", "Antwerp, Belgium", 105],
  ["Amsterdam, Netherlands", "Frankfurt, Germany", 440],
  ["Brussels, Belgium", "Paris, France", 315],
  ["Hamburg, Germany", "Copenhagen, Denmark", 340],
  ["Berlin, Germany", "Poznan, Poland", 275],
  ["Munich, Germany", "Vienna, Austria", 435],
  ["Lyon, France", "Turin, Italy", 315],
  ["Paris, France", "Barcelona, Spain", 1035],
  ["Milan, Italy", "Stuttgart, Germany", 390],
  ["Madrid, Spain", "Lisbon, Portugal", 625],
  ["Barcelona, Spain", "Toulouse, France", 395],
  ["Warsaw, Poland", "Prague, Czech Republic", 680],
  ["Prague, Czech Republic", "Vienna, Austria", 295],
  ["Budapest, Hungary", "Bucharest, Romania", 835],
  ["Stockholm, Sweden", "Gothenburg, Sweden", 470],
  ["Porto, Portugal", "Vigo, Spain", 155],
  ["Sofia, Bulgaria", "Thessaloniki, Greece", 230],
  ["Bratislava, Slovakia", "Budapest, Hungary", 200],
  ["Lille, France", "Antwerp, Belgium", 115],
  ["Cologne, Germany", "Luxembourg, Luxembourg", 190]
];


// 3. TRANSPORT SERVICES

const services = [
  { name: "Full truckload (FTL)", base: 85, rate: 1.45 },
  { name: "Groupage (LTL)", base: 45, rate: 0.82 },
  { name: "Temperature-controlled", base: 130, rate: 1.80 },
  { name: "Express road freight", base: 110, rate: 1.95 },
  { name: "Intermodal road / rail", base: 95, rate: 1.12 }
];


// 4. FORMATTING

const dateFormat = new Intl.DateTimeFormat("en-GB");

const euroFormat = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR"
});


// 5. GENERATE 1,000 DUMMY SHIPMENTS

const shipments = Array.from({ length: 1000 }, (_, index) => {

  const route = routes[Math.floor(Math.random() * routes.length)];
  const service = services[Math.floor(Math.random() * services.length)];

  const loadingDate = new Date();
  loadingDate.setDate(
    loadingDate.getDate() - Math.floor(Math.random() * 75)
  );

  const deliveryDate = new Date(loadingDate);
  deliveryDate.setDate(
    deliveryDate.getDate() +
    Math.max(1, Math.ceil(route[2] / 700)) +
    Math.floor(Math.random() * 2)
  );

  const costs =
    (service.base + route[2] * service.rate) *
    (0.90 + Math.random() * 0.20);

  return {
    id: String(index + 1).padStart(4, "0"),
    shipment: `EU-${loadingDate.getFullYear()}-${String(index + 1).padStart(5, "0")}`,
    loading: dateFormat.format(loadingDate),
    delivery: dateFormat.format(deliveryDate),
    from: route[0],
    to: route[1],
    distance: route[2],
    service: service.name,
    costs: Number(costs.toFixed(2))
  };

});


// 6. SELECT 10 RANDOM SHIPMENTS

function getRandomShipments() {

  const pool = [...shipments];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 10);
}

// 7. DISPLAY SHIPMENTS IN THE HTML TABLE

let currentSample = [];
let analysisTimer = null;


// DISPLAY SHIPMENTS

function displayShipments() {

  currentSample = getRandomShipments();

  renderShipments(currentSample);

  results.hidden = true;
  runButton.disabled = false;

}


// BUILD HTML TABLE

function renderShipments(orders, flaggedIds = null) {

  const fragment = document.createDocumentFragment();

  orders.forEach(order => {

    const row = document.createElement("tr");

    Object.entries(order).forEach(([key, value]) => {

      const cell = document.createElement("td");

      if (key === "costs") {

        cell.textContent = euroFormat.format(value);

        if (flaggedIds !== null) {

          cell.classList.add(
            flaggedIds.has(order.id)
              ? "cost-flagged"
              : "cost-normal"
          );

        }

      } else {

        cell.textContent = value;

      }

      row.appendChild(cell);

    });

    fragment.appendChild(row);

  });

  tableBody.replaceChildren(fragment);

}


// 8. OPEN AND CLOSE DEMO

function openDemo() {

  displayShipments();

  overlay.hidden = false;
  document.body.classList.add("demo-open");

  closeButton.focus();

}


function closeDemo() {

  clearTimeout(analysisTimer);
  analysisTimer = null;

  loader.hidden = true;
  tableWrap.hidden = false;

  runButton.disabled = false;
  refreshButton.disabled = false;

  overlay.hidden = true;
  document.body.classList.remove("demo-open");

  openButton.focus();

}


// 9. RUN SIMULATED ANALYSIS

function runAnalysis() {

  runButton.disabled = true;
  refreshButton.disabled = true;

  tableWrap.hidden = true;
  results.hidden = true;
  loader.hidden = false;

  const waiting = 1500 + Math.random() * 800;

  analysisTimer = setTimeout(() => {

    // SELECT 2 TO 4 FLAGGED SHIPMENTS

    const shuffled = [...currentSample];

    for (let i = shuffled.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] =
      [shuffled[j], shuffled[i]];

    }

    const flaggedCount = 2 + Math.floor(Math.random() * 3);

    const flaggedIds = new Set(
      shuffled.slice(0, flaggedCount).map(order => order.id)
    );


    // CALCULATE FLAGGED COSTS

    const potentialSavings = currentSample
      .filter(order => flaggedIds.has(order.id))
      .reduce((total, order) => total + order.costs, 0);


    // UPDATE TABLE

    renderShipments(currentSample, flaggedIds);


    // DISPLAY RESULTS

    savingsOutput.textContent =
      euroFormat.format(potentialSavings);

    loader.hidden = true;
    tableWrap.hidden = false;
    results.hidden = false;

    runButton.disabled = false;
    refreshButton.disabled = false;

    analysisTimer = null;

  }, waiting);

}


// 10. EVENT LISTENERS

openButton.addEventListener("click", openDemo);
closeButton.addEventListener("click", closeDemo);

refreshButton.addEventListener("click", displayShipments);
runButton.addEventListener("click", runAnalysis);

overlay.addEventListener("click", event => {

  if (event.target === overlay) {
    closeDemo();
  }

});

document.addEventListener("keydown", event => {

  if (event.key === "Escape" && !overlay.hidden) {
    closeDemo();
  }

});