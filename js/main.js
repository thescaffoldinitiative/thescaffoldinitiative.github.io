// ---------- Mobile nav ----------
(function () {
  var btn = document.getElementById("menu-btn");
  var nav = document.getElementById("mobile-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "✕" : "☰";
  });
})();

// ---------- Dyslexic font toggle (persisted, applies across pages) ----------
(function () {
  var saved = localStorage.getItem("font-mode");
  var on = saved === "dyslexic";
  document.documentElement.classList.toggle("font-standard", !on);

  document.querySelectorAll(".dys-toggle").forEach(function (toggle) {
    toggle.setAttribute("aria-checked", on ? "true" : "false");
    toggle.addEventListener("click", function () {
      var next = document.documentElement.classList.contains("font-standard");
      document.documentElement.classList.toggle("font-standard", !next);
      localStorage.setItem("font-mode", next ? "dyslexic" : "standard");
      document.querySelectorAll(".dys-toggle").forEach(function (t) {
        t.setAttribute("aria-checked", next ? "true" : "false");
      });
    });
  });
})();

// ---------- Mark current page in nav ----------
(function () {
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-desktop a, .nav-mobile a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
})();

// ---------- Tiny tabs (educational-accommodations page) ----------
(function () {
  document.querySelectorAll(".mini-tabs").forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn");
    var panels = group.querySelectorAll(".tab-panel");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        group.querySelector('.tab-panel[data-tab="' + btn.dataset.tab + '"]').classList.add("active");
      });
    });
  });
})();

// ---------- Where We Are: Leaflet map ----------
var SCAFFOLD_MARKERS = [
  { country: "India", label: "Rajasthan", lat: 27.0, lng: 74.2 },
  { country: "India", label: "Haryana", lat: 29.0, lng: 76.0 },
  { country: "India", label: "Maharashtra", lat: 19.7, lng: 75.7 },
  { country: "India", label: "Chhattisgarh", lat: 21.3, lng: 81.8 },
  { country: "India", label: "Delhi", lat: 28.6, lng: 77.2 },
  { country: "India", label: "Assam", lat: 26.2, lng: 92.9 },
  { country: "India", label: "Madhya Pradesh", lat: 22.9, lng: 78.6 },
  { country: "India", label: "Odisha", lat: 20.9, lng: 85.1 },
  { country: "India", label: "Gujarat", lat: 22.3, lng: 71.2 },
  { country: "India", label: "Punjab", lat: 31.1, lng: 75.3 },
  { country: "India", label: "Uttar Pradesh", lat: 27.0, lng: 80.9 },
  { country: "India", label: "Telangana", lat: 17.9, lng: 79.5 },
  { country: "India", label: "West Bengal", lat: 22.9, lng: 87.8 },
  { country: "India", label: "Chandigarh", lat: 30.7, lng: 76.8 },
  { country: "Pakistan", label: "Sindh", lat: 25.9, lng: 68.5 },
  { country: "Pakistan", label: "Khyber Pakhtunkhwa", lat: 34.0, lng: 71.5 },
  { country: "Pakistan", label: "Islamabad Capital Territory", lat: 33.7, lng: 73.0 },
  { country: "Pakistan", label: "Punjab", lat: 31.1, lng: 72.5 },
  { country: "Nigeria", label: "Oyo", lat: 7.85, lng: 3.93 },
  { country: "Nigeria", label: "Anambra", lat: 6.2, lng: 7.0 },
  { country: "Malaysia", label: "Johor", lat: 1.9, lng: 103.3 },
  { country: "Malaysia", label: "Negeri Sembilan", lat: 2.7, lng: 102.3 },
  { country: "Morocco", label: "Fès-Meknès", lat: 34.0, lng: -5.0 },
  { country: "Morocco", label: "Rabat-Salé-Kénitra", lat: 34.2, lng: -6.5 },
  { country: "Zambia", label: "Central Province", lat: -14.4, lng: 28.5 },
  { country: "Zambia", label: "Lusaka Province", lat: -15.4, lng: 28.3 },
  { country: "UAE", label: "Sharjah", lat: 25.35, lng: 55.42 },
  { country: "UAE", label: "Dubai", lat: 25.2, lng: 55.27 },
  { country: "Jamaica", label: "Jamaica", lat: 18.1, lng: -77.3 },
  { country: "Philippines", label: "Philippines", lat: 12.9, lng: 121.8 },
  { country: "Saudi Arabia", label: "Saudi Arabia", lat: 23.9, lng: 45.1 },
  { country: "Egypt", label: "Egypt", lat: 26.8, lng: 30.8 },
  { country: "Turkey", label: "Turkey", lat: 39.0, lng: 35.2 },
  { country: "Bangladesh", label: "Bangladesh", lat: 23.7, lng: 90.4 },
  { country: "Iraq", label: "Iraq", lat: 33.2, lng: 43.7 },
  { country: "Uzbekistan", label: "Uzbekistan", lat: 41.4, lng: 64.6 },
  { country: "Peru", label: "Peru", lat: -9.2, lng: -75.0 },
  { country: "USA", label: "USA", lat: 39.8, lng: -98.6 },
  { country: "France", label: "France", lat: 46.6, lng: 2.2 },
  { country: "UK", label: "UK", lat: 54.0, lng: -2.0 },
  { country: "Thailand", label: "Thailand", lat: 15.9, lng: 100.9 },
  { country: "Hong Kong", label: "Hong Kong", lat: 22.3, lng: 114.2 },
  { country: "Spain", label: "Spain", lat: 40.5, lng: -3.7 }
];

(function () {
  var el = document.getElementById("map");
  if (!el || typeof L === "undefined") return;
  var map = L.map(el, { center: [20, 40], zoom: 2, scrollWheelZoom: false, worldCopyJump: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);
  var pinkIcon = L.divIcon({
    className: "scaffold-pin",
    html: '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#F58EA3;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
  SCAFFOLD_MARKERS.forEach(function (m) {
    L.marker([m.lat, m.lng], { icon: pinkIcon })
      .addTo(map)
      .bindPopup("<strong>" + m.label + "</strong><br/><span style=\"opacity:.7\">" + m.country + "</span>");
  });
})();
