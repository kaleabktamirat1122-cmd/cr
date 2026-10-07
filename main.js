// Single place to configure the app. Replace YOUR_SCRIPT_ID after deploying the Apps Script.
const API_URL = "https://script.google.com/macros/s/AKfycbz0GzDvHGTPL5hQefkpouMyj7Qdu1QooSKoIufHCeYheOIhWWg2rmdBxCIP3UTb1SyE/exec";

// Per-level content and badge. Edit copy/badges here to rebrand.
const LEVELS = {
  platinum: { title: "YOU ARE A PLATINUM CLIENT", badge: "assets/platinum-badge.svg",
    message: "Thank you for being one of Champion Properties' valued clients." },
  gold: { title: "YOU ARE A GOLD CLIENT", badge: "assets/gold-badge.svg",
    message: "Thank you for being a valued member of the Champion Properties family." },
  bronze: { title: "YOU ARE A BRONZE CLIENT", badge: "assets/bronze-badge.svg",
    message: "Thank you for choosing Champion Properties. We are proud to have you with us." }
};

// Sends ONLY the client ID. The level is decided by the backend.
async function fetchClient(clientId) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(API_URL + "?client=" + encodeURIComponent(clientId), { signal: ctl.signal });
    return await res.json();
  } catch (e) {
    return { success: false, error: "NETWORK_ERROR" };
  } finally { clearTimeout(timer); }
}

(function () {
  const $ = (id) => document.getElementById(id);
  const ID_RE = /^[A-Za-z0-9_-]{2,20}$/;

  function done() { $("loading").hidden = true; $("result").hidden = false; }

  function show(level, name) {
    const L = LEVELS[level];
    document.body.className = "theme-" + level;
    $("badge").src = L.badge;
    $("badge").alt = level + " badge";
    $("title").textContent = L.title;   // textContent: names are never parsed as HTML
    $("name").textContent = name;
    $("message").textContent = L.message;
    done();
  }

  function invalid() {
    document.body.className = "theme-invalid";
    ["badge", "name"].forEach((i) => $(i).remove());
    document.querySelector(".kicker").remove();
    $("title").textContent = "CLIENT NOT FOUND";
    $("message").textContent = "We're sorry, but this QR code is not associated with a valid Champion Properties client.";
    done();
  }

  async function init() {
    const id = (new URLSearchParams(location.search).get("client") || "").trim();
    if (!ID_RE.test(id)) return invalid();
    const data = await fetchClient(id);
    const name = data && typeof data.clientName === "string" ? data.clientName.slice(0, 80) : "";
    if (data && data.success && LEVELS[data.level] && name) show(data.level, name);
    else invalid();
  }
  init();
})();
