// HTML for each page, built from the deal data in data.js. Every value is escaped
// before it goes into the page. Views: the deal grid (#/) and one deal (#/deal/<id>).

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const save = (d) => d.was - d.price;
const day = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

const VERDICT_CLASS = { "NEW LOW": "v-new", "STRONG DEAL": "v-strong", "ROUTINE SALE": "v-routine", INFLATED: "v-bad" };

export function verdictBadge(d) {
  return `<span class="verdict ${VERDICT_CLASS[d.verdict] || ""}">${escape(d.verdict)}</span>`;
}

export function card(d) {
  const pct = percentOff(d);
  const also = (d.alsoAt || [])[0];
  return `<article class="card">
  <a class="card-link" href="#/deal/${encodeURIComponent(d.id)}" aria-label="${escape(d.title)}">
    <span class="badge">-${pct}%</span>
    <span class="card-store">${escape(d.store)}</span>
    <span class="card-cat">${escape(d.category)}</span>
    <h3>${escape(d.title)}</h3>
    <span class="card-price">${usd(d.price)} <s>${usd(d.was)}</s></span>
    <span class="card-save">Save ${usd(save(d))}</span>
    ${also ? `<span class="card-also">Also ${usd(also.price)} at ${escape(also.store)}</span>` : ""}
    ${verdictBadge(d)}
    <span class="card-checked">Checked ${day(d.checked)}</span>
  </a>
  <a class="card-buy" href="${escape(d.url)}" target="_blank" rel="noopener">Shop at ${escape(d.store)} &rarr;</a>
</article>`;
}

export function hero(d) {
  const pct = percentOff(d);
  return `<section class="hero" aria-label="Deal of the day">
  <div class="hero-tag">DEAL OF THE DAY</div>
  <div class="hero-body">
    <div>
      <h2><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h2>
      <p class="hero-line"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="hero-save">−${pct}% &middot; save ${usd(save(d))}</span> &middot; ${escape(d.store)}</p>
      <p class="hero-why">${escape(d.why)}</p>
    </div>
    <div class="hero-side">
      ${verdictBadge(d)}
      <span class="hero-checked">Checked ${day(d.checked)}</span>
      <a class="hero-buy" href="${escape(d.url)}" target="_blank" rel="noopener">Shop at ${escape(d.store)} &rarr;</a>
    </div>
  </div>
</section>`;
}

export function grid(list) {
  if (list.length === 0)
    return '<p class="empty">No deals match those filters. Try clearing the search or lowering the minimum discount.</p>';
  return `<div class="grid">${list.map(card).join("")}</div>`;
}

export function dealPage(d, sameCategory) {
  const pct = percentOff(d);
  const also = (d.alsoAt || [])
    .map(
      (a) =>
        `<tr><td>${escape(a.store)}</td><td>${usd(a.price)}</td><td><a href="${escape(a.url)}" target="_blank" rel="noopener">View &rarr;</a></td></tr>`,
    )
    .join("");
  const others = sameCategory
    .filter((x) => x.id !== d.id)
    .slice(0, 4)
    .map(
      (x) =>
        `<li><a href="#/deal/${encodeURIComponent(x.id)}">${escape(x.title)}</a> <span>${usd(x.price)} <s>${usd(x.was)}</s> &middot; -${percentOff(x)}%</span></li>`,
    )
    .join("");
  return `<p class="crumbs"><a href="#/">&larr; All deals</a> &middot; ${escape(d.category)} &middot; ${escape(d.store)}</p>
<article class="detail">
  <div class="detail-head">
    <span class="badge big">-${pct}%</span>
    <div>
      <h1>${escape(d.title)}</h1>
      <p class="detail-store">${escape(d.store)} &middot; ${escape(d.category)}</p>
    </div>
  </div>
  <p class="detail-price">${usd(d.price)} <s>${usd(d.was)}</s> <span class="detail-save">You save ${usd(save(d))} (${pct}% off)</span></p>
  <p>${verdictBadge(d)}</p>
  ${d.history ? `<p class="history"><strong>Price history:</strong> ${escape(d.history)}</p>` : ""}
  <p><a class="buy-big" href="${escape(d.url)}" target="_blank" rel="noopener">Shop this deal at ${escape(d.store)} &rarr;</a></p>
  <h2>Is it really a deal?</h2>
  <p>${escape(d.why)}</p>
  <dl class="facts">
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${pct}% off &middot; save ${usd(save(d))}</dd>
    <dt>Price checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p class="note">Prices move fast on Black Friday — the store page is the final word. No code needed unless the store says so.</p>
  ${also ? `<h2>Same product, other stores</h2><table class="compare"><thead><tr><th>Store</th><th>Price</th><th></th></tr></thead><tbody><tr><td>${escape(d.store)}</td><td><strong>${usd(d.price)}</strong></td><td>Best price found</td></tr>${also}</tbody></table>` : ""}
  ${others ? `<h2>More ${escape(d.category)} deals</h2><ul class="more">${others}</ul>` : ""}
</article>`;
}

export function missing() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
