const NEWSLETTER_FORM_ACTION = "";
// Connect a provider by setting NEWSLETTER_FORM_ACTION to the form endpoint
// from Beehiiv, Kit, Substack, Mailchimp, or another newsletter service.

const DEMO_MARKETS = [
  { id: "politics-2026-turnout", question: "Will national voter turnout exceed 62% in the next U.S. general election?", probability: 54, move: 7, platform: "Kalshi", category: "Politics", updated: "2026-07-13T14:20:00-05:00" },
  { id: "economics-rate-cut", question: "Will the Federal Reserve announce at least one rate cut before December?", probability: 61, move: -5, platform: "Polymarket", category: "Economics", updated: "2026-07-13T13:10:00-05:00" },
  { id: "technology-frontier-model", question: "Will a major AI lab release a new frontier model before October?", probability: 68, move: 11, platform: "Metaculus", category: "Technology", updated: "2026-07-13T12:45:00-05:00" },
  { id: "sports-finals-repeat", question: "Will last season's champion return to the league finals?", probability: 32, move: -9, platform: "Manifold", category: "Sports", updated: "2026-07-13T11:55:00-05:00" },
  { id: "world-summit-agreement", question: "Will the next global climate summit produce a binding finance agreement?", probability: 29, move: 4, platform: "Other regulated platforms", category: "World events", updated: "2026-07-13T10:30:00-05:00" },
  { id: "entertainment-awards", question: "Will an independent film win the top award at the next major ceremony?", probability: 47, move: 6, platform: "Polymarket", category: "Entertainment", updated: "2026-07-13T09:40:00-05:00" },
  { id: "economics-cpi", question: "Will the next CPI release come in below consensus expectations?", probability: 44, move: -3, platform: "Kalshi", category: "Economics", updated: "2026-07-12T16:25:00-05:00" },
  { id: "technology-chip-export", question: "Will new semiconductor export rules be announced this quarter?", probability: 57, move: 8, platform: "Metaculus", category: "Technology", updated: "2026-07-12T15:05:00-05:00" },
  { id: "politics-debate", question: "Will another nationally televised debate be scheduled before Labor Day?", probability: 38, move: -6, platform: "Manifold", category: "Politics", updated: "2026-07-12T12:15:00-05:00" }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupFooterYear();
  setupSignupForms();
  hydrateMarketSections();
  setupShareLinks();
});

function setupNavigation() {
  const toggle = $(".nav-toggle");
  const nav = $(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupFooterYear() {
  $$(".current-year").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function setupSignupForms() {
  $$(".signup-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = $("input[type='email']", form);
      const message = $(".form-message", form);
      if (!email || !message) return;

      message.className = "form-message";
      const value = email.value.trim();
      if (!isValidEmail(value)) {
        message.textContent = "Enter a valid email address to continue.";
        message.classList.add("error");
        email.focus();
        return;
      }

      if (!NEWSLETTER_FORM_ACTION) {
        message.textContent = "Demo mode: no newsletter provider is connected yet, so this address was not saved.";
        message.classList.add("success");
        form.reset();
        return;
      }

      try {
        const response = await fetch(NEWSLETTER_FORM_ACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value })
        });
        if (!response.ok) throw new Error("Provider rejected the signup.");
        message.textContent = "Thanks. Please check your inbox to confirm your subscription.";
        message.classList.add("success");
        form.reset();
      } catch (error) {
        message.textContent = "Signup could not be completed. Please try again in a moment.";
        message.classList.add("error");
      }
    });
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hydrateMarketSections() {
  const homepageGrid = $("#market-movers");
  const dashboardGrid = $("#markets-dashboard");
  if (!homepageGrid && !dashboardGrid) return;

  const markets = await loadMarkets();
  if (homepageGrid) {
    renderMarketCards(homepageGrid, markets.slice(0, 6));
  }
  if (dashboardGrid) {
    setupMarketDashboard(markets);
  }
}

async function loadMarkets() {
  try {
    const response = await fetch("data/markets.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Market data unavailable.");
    return await response.json();
  } catch (error) {
    return DEMO_MARKETS;
  }
}

function renderMarketCards(container, markets) {
  container.innerHTML = markets.map((market) => {
    const direction = market.move >= 0 ? "positive" : "negative";
    const sign = market.move >= 0 ? "+" : "";
    return `
      <article class="market-card">
        <div class="demo-label">Demonstration data</div>
        <p class="question">${escapeHtml(market.question)}</p>
        <div class="market-topline">
          <span class="probability">${market.probability}%</span>
          <span class="move ${direction}" aria-label="${direction} move">${sign}${market.move} pts</span>
        </div>
        <div class="market-meta">
          <span class="pill">${escapeHtml(market.platform)}</span>
          <span class="pill">${escapeHtml(market.category)}</span>
          <span>${formatDate(market.updated)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function setupMarketDashboard(markets) {
  const dashboardGrid = $("#markets-dashboard");
  const search = $("#market-search");
  const category = $("#category-filter");
  const platform = $("#platform-filter");
  const sort = $("#sort-filter");
  const reset = $("#reset-filters");
  const empty = $("#empty-state");

  populateSelect(category, uniqueValues(markets, "category"), "All categories");
  populateSelect(platform, uniqueValues(markets, "platform"), "All platforms");

  const render = () => {
    const query = search.value.trim().toLowerCase();
    let visible = markets.filter((market) => {
      const matchesSearch = !query || market.question.toLowerCase().includes(query);
      const matchesCategory = !category.value || market.category === category.value;
      const matchesPlatform = !platform.value || market.platform === platform.value;
      return matchesSearch && matchesCategory && matchesPlatform;
    });

    visible = sortMarkets(visible, sort.value);
    renderMarketCards(dashboardGrid, visible);
    empty.classList.toggle("visible", visible.length === 0);
  };

  [search, category, platform, sort].forEach((control) => {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });

  reset.addEventListener("click", () => {
    search.value = "";
    category.value = "";
    platform.value = "";
    sort.value = "largest-move";
    render();
    search.focus();
  });

  render();
}

function populateSelect(select, values, label) {
  select.innerHTML = `<option value="">${label}</option>` + values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))].sort();
}

function sortMarkets(markets, mode) {
  return [...markets].sort((a, b) => {
    if (mode === "highest-probability") return b.probability - a.probability;
    if (mode === "lowest-probability") return a.probability - b.probability;
    if (mode === "recently-updated") return new Date(b.updated) - new Date(a.updated);
    return Math.abs(b.move) - Math.abs(a.move);
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function setupShareLinks() {
  $$(".share-link").forEach((link) => {
    const pageUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    if (link.dataset.share === "x") {
      link.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${title}`;
    }
    if (link.dataset.share === "linkedin") {
      link.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }
    if (link.dataset.share === "email") {
      link.href = `mailto:?subject=${title}&body=${pageUrl}`;
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
