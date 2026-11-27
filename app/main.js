// Brisk Bargain — Black Friday deal finder. Hash routes:
//   #/            the deal grid, with live search, category chips, store and
//                 minimum-discount filters, and sorting
//   #/deal/<id>   one deal, with its verdict, evidence and store comparison
// window.__shotReady is false while a page renders and true once it is on screen,
// so a screenshot script knows when to capture.

import { deals } from "./data.js";
import { card, dealPage, grid, hero, missing, percentOff, save, usd, verdictBadge } from "./views.js";

const app = document.getElementById("app");
const statsEl = document.getElementById("stats");
const filtersEl = document.getElementById("filters");
const qEl = document.getElementById("q");
const storeEl = document.getElementById("store");
const mindiscEl = document.getElementById("mindisc");
const sortEl = document.getElementById("sort");
const chipsEl = document.getElementById("chips");

const categories = [...new Set(deals.map((d) => d.category))].sort();
const stores = [...new Set(deals.map((d) => d.store))].sort();

const state = { q: "", category: "All", store: "All", mindisc: 0, sort: "discount" };

// --- savings stats header (computed from the data, never hard-coded) ---
const totalSave = deals.reduce((s, d) => s + save(d), 0);
const bestPct = Math.max(...deals.map(percentOff));
const newLows = deals.filter((d) => d.verdict === "NEW LOW").length;
statsEl.innerHTML = `
  <div class="stat"><strong>${deals.length}</strong><span>deals checked</span></div>
  <div class="stat"><strong>${usd(totalSave)}</strong><span>total savings</span></div>
  <div class="stat"><strong>-${bestPct}%</strong><span>best discount</span></div>
  <div class="stat"><strong>${newLows}</strong><span>new lows</span></div>`;
document.getElementById("newlow-chip").textContent = `${newLows} NEW LOWS`;

// --- filter controls ---
storeEl.innerHTML =
  `<option value="All">All stores</option>` + stores.map((s) => `<option value="${s}">${s}</option>`).join("");
chipsEl.innerHTML =
  `<button type="button" class="chip active" data-cat="All">All</button>` +
  categories.map((c) => `<button type="button" class="chip" data-cat="${c}">${c}</button>`).join("");

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let list = deals.filter(
    (d) =>
      (state.category === "All" || d.category === state.category) &&
      (state.store === "All" || d.store === state.store) &&
      percentOff(d) >= state.mindisc &&
      (q === "" || `${d.title} ${d.store} ${d.category} ${d.verdict}`.toLowerCase().includes(q)),
  );
  if (state.sort === "discount") list = [...list].sort((a, b) => percentOff(b) - percentOff(a) || save(b) - save(a));
  else if (state.sort === "saving") list = [...list].sort((a, b) => save(b) - save(a));
  else if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

function renderList() {
  const list = applyFilters();
  const isDefault = state.q === "" && state.category === "All" && state.store === "All" && state.mindisc === 0 && state.sort === "discount";
  const top = isDefault
    ? `<p class="dateline">Friday, November 27, 2026 &middot; Prices checked 6:40 AM UTC</p>
  ${hero(deals.find((d) => d.id === "airpods-pro-3"))}`
    : "";
  app.innerHTML = `${top}<h1 class="list-title">${list.length} Black Friday deals <span class="list-sub">— sorted by ${sortEl.options[sortEl.selectedIndex].textContent.replace("Sort: ", "")}</span></h1>
  ${grid(list)}`;
  window.__shotReady = true;
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    filtersEl.style.display = "none";
    document.title = `${found ? found.title : "Not found"} | Brisk Bargain`;
    app.innerHTML = found
      ? dealPage(found, deals.filter((d) => d.category === found.category))
      : missing();
  } else {
    filtersEl.style.display = "";
    document.title = "Brisk Bargain — Black Friday Deal Finder 2026";
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

qEl.addEventListener("input", () => {
  state.q = qEl.value;
  renderList();
});
storeEl.addEventListener("change", () => {
  state.store = storeEl.value;
  renderList();
});
mindiscEl.addEventListener("change", () => {
  state.mindisc = Number(mindiscEl.value);
  renderList();
});
sortEl.addEventListener("change", () => {
  state.sort = sortEl.value;
  renderList();
});
chipsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  state.category = btn.dataset.cat;
  chipsEl.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
  renderList();
});

window.addEventListener("hashchange", render);
render();
