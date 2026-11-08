/* =========================================================
   Viktoria & Håvard · 03.07.2027 — felles skript
   ========================================================= */

/* Lim inn lenkene her når de er klare. Tomme lenker vises nedtonet med "Kommer snart". */
const LENKER = {
  skjema: "",      // svarskjema (f.eks. Google Forms)
  onskeliste: "",  // ønskeliste (f.eks. Ønskeskyen)
  facebook: ""     // Facebook-arrangementet
};

const BRYLLUP = new Date("2027-07-03T12:30:00+02:00").getTime();
const ROLIG = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* ---------- Lenker fra LENKER ---------- */
function settLenker() {
  document.querySelectorAll("[data-lenke]").forEach(el => {
    const url = LENKER[el.dataset.lenke];
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.removeAttribute("href");
      el.classList.add("snart");
      el.setAttribute("aria-disabled", "true");
      el.title = "Kommer snart";
      el.addEventListener("click", e => e.preventDefault());
    }
  });
}

/* ---------- Meny ---------- */
function meny() {
  const knapp = document.querySelector(".meny-knapp");
  if (!knapp) return;
  const lukk = () => {
    document.body.classList.remove("meny-apen");
    knapp.setAttribute("aria-expanded", "false");
    knapp.textContent = "Meny";
  };
  knapp.addEventListener("click", () => {
    const apen = document.body.classList.toggle("meny-apen");
    knapp.setAttribute("aria-expanded", String(apen));
    knapp.textContent = apen ? "Lukk" : "Meny";
  });
  document.querySelectorAll(".hovedmeny a").forEach(a => a.addEventListener("click", lukk));
  document.addEventListener("keydown", e => { if (e.key === "Escape") lukk(); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 1000) lukk(); });
}

/* ---------- Scroll: fast meny, parallakse, tidslinjefyll ---------- */
function scrolling() {
  const topp = document.querySelector(".toppmeny");
  const bannere = [...document.querySelectorAll(".banner > img")];
  const linje = document.querySelector(".tidslinje");
  const fyll = document.querySelector(".tidslinje-fyll");
  let venter = false;

  function oppdater() {
    venter = false;
    const h = window.innerHeight;
    if (topp) topp.classList.toggle("fast", window.scrollY > h / 2);
    if (!ROLIG) {
      bannere.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) return;
        const midt = r.top + r.height / 2 - h / 2;
        const maks = r.height * 0.1;
        const flytt = Math.max(-maks, Math.min(maks, -midt * 0.12));
        img.style.transform = `translate3d(0, ${flytt.toFixed(1)}px, 0)`;
      });
    }
    if (linje && fyll) {
      const r = linje.getBoundingClientRect();
      const andel = Math.min(1, Math.max(0, (h * 0.6 - r.top) / r.height));
      fyll.style.height = (andel * 100).toFixed(2) + "%";
    }
  }
  const be = () => { if (!venter) { venter = true; requestAnimationFrame(oppdater); } };
  window.addEventListener("scroll", be, { passive: true });
  window.addEventListener("resize", be);
  oppdater();
}

/* ---------- .vis-animasjoner, tellere og forlovelseskonfetti ---------- */
function synlighet() {
  const elementer = document.querySelectorAll(".vis, .minne, .minne-stor, [data-tell]");
  if (!("IntersectionObserver" in window)) {
    elementer.forEach(el => { el.classList.add("synlig"); if (el.dataset.tell) el.textContent = el.dataset.tell; });
    return;
  }
  const obs = new IntersectionObserver(oppf => {
    oppf.forEach(o => {
      if (!o.isIntersecting) return;
      const el = o.target;
      el.classList.add("synlig");
      if (el.dataset.tell) tell(el);
      if (el.hasAttribute("data-konfetti")) { konfetti(); el.removeAttribute("data-konfetti"); }
      obs.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  elementer.forEach(el => obs.observe(el));
}

function tell(el) {
  const mal = parseInt(el.dataset.tell, 10);
  if (ROLIG) { el.textContent = mal; return; }
  const varighet = 1800, start = performance.now();
  const steg = t => {
    const p = Math.min(1, (t - start) / varighet);
    el.textContent = Math.round(mal * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(steg);
  };
  requestAnimationFrame(steg);
}

/* ---------- Nedtelling ---------- */
function nedtelling() {
  const hero = document.querySelector(".hero");
  const boks = document.querySelector(".nedtelling");
  if (!hero || !boks) return;
  const felt = {
    d: boks.querySelector("[data-enhet=d]"), t: boks.querySelector("[data-enhet=t]"),
    m: boks.querySelector("[data-enhet=m]"), s: boks.querySelector("[data-enhet=s]")
  };
  const forhand = new URLSearchParams(location.search).has("gift");
  let tidtaker = null;

  function bliGift(medKonfetti) {
    hero.classList.add("er-gift");
    const tittel = hero.querySelector(".hero-tittel");
    if (tittel) tittel.textContent = "Nå er vi";
    if (tidtaker) clearInterval(tidtaker);
    if (medKonfetti) setTimeout(konfetti, 350);
  }
  function tikk() {
    let ms = BRYLLUP - Date.now();
    if (forhand || ms <= 0) { bliGift(true); return; }
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const t = Math.floor(ms / 36e5); ms -= t * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    const s = Math.floor(ms / 1e3);
    felt.d.textContent = d;
    felt.t.textContent = String(t).padStart(2, "0");
    felt.m.textContent = String(m).padStart(2, "0");
    felt.s.textContent = String(s).padStart(2, "0");
  }
  tikk();
  if (!hero.classList.contains("er-gift")) tidtaker = setInterval(tikk, 1000);
}

/* ---------- Lysboks ---------- */
function lysboks() {
  const knapper = [...document.querySelectorAll(".galleri button, button.polaroid")];
  if (!knapper.length) return;
  const dlg = document.createElement("dialog");
  dlg.className = "lysboks";
  dlg.setAttribute("aria-label", "Bildevisning");
  dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lukk" type="button" aria-label="Lukk">×</button>' +
    '<button class="forrige" type="button" aria-label="Forrige bilde">‹</button>' +
    '<button class="neste" type="button" aria-label="Neste bilde">›</button>';
  document.body.append(dlg);
  const img = dlg.querySelector("img"), tekst = dlg.querySelector("figcaption");
  let gruppe = [], nr = 0;

  function vis(i) {
    nr = (i + gruppe.length) % gruppe.length;
    const kilde = gruppe[nr].querySelector("img");
    img.src = kilde.currentSrc || kilde.src;
    img.alt = kilde.alt;
    tekst.textContent = gruppe[nr].dataset.tekst || kilde.alt;
  }
  knapper.forEach(k => k.addEventListener("click", () => {
    const beholder = k.closest(".galleri") || k.closest(".tidslinje") || document.body;
    gruppe = knapper.filter(b => beholder.contains(b));
    vis(gruppe.indexOf(k));
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }));
  const lukk = () => (dlg.close ? dlg.close() : dlg.removeAttribute("open"));
  dlg.querySelector(".lukk").addEventListener("click", lukk);
  dlg.querySelector(".forrige").addEventListener("click", () => vis(nr - 1));
  dlg.querySelector(".neste").addEventListener("click", () => vis(nr + 1));
  dlg.addEventListener("click", e => { if (e.target === dlg) lukk(); });
  dlg.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") vis(nr - 1);
    if (e.key === "ArrowRight") vis(nr + 1);
  });
}

/* ---------- Leaflet-kart ---------- */
const STEDER = {
  vielse: { pos: [60.475308, 5.3263802], tall: "1", etikett: "Vielse · 12:30", navn: "Åsane gamle kirke",
            maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Åsane gamle kirke, Bergen") },
  fest:   { pos: [60.3389874, 5.3202366], tall: "2", etikett: "Fest · 16:00", navn: "Credo kirken, Øvre Kråkenes 49",
            maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Credo kirken, Øvre Kråkenes 49, 5152 Bønes") },
  grill:  { pos: [60.3112951, 5.3876538], tall: "G", etikett: "Grillfest · 18:00", navn: "Totlandsveien 100, Nesttun",
            maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Totlandsvegen 100, 5226 Nesttun") }
};

function kart() {
  const bokser = document.querySelectorAll("[data-kart]");
  if (!bokser.length || typeof L === "undefined") return;
  const mobil = window.matchMedia("(pointer: coarse)").matches || L.Browser.mobile;

  bokser.forEach(boks => {
    const steder = boks.dataset.kart.split(/\s+/).map(n => STEDER[n]).filter(Boolean);
    const k = L.map(boks, { scrollWheelZoom: false, dragging: !mobil, tap: false, zoomControl: true });
    L.tileLayer("https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.kartverket.no/" target="_blank" rel="noopener">Kartverket</a>'
    }).addTo(k);

    steder.forEach(s => {
      const ikon = L.divIcon({
        className: "nal-ikon",
        html: `<div class="nal"><span>${s.tall}</span></div>`,
        iconSize: [34, 34], iconAnchor: [17, 41], popupAnchor: [0, -40], tooltipAnchor: [16, -24]
      });
      L.marker(s.pos, { icon: ikon, title: s.navn, alt: s.navn })
        .addTo(k)
        .bindTooltip(s.etikett, { permanent: true, direction: "right", className: "kart-etikett" })
        .bindPopup(`<strong>${s.navn}</strong><a href="${s.maps}" target="_blank" rel="noopener">Åpne i Google Maps</a>`);
    });

    if (steder.length > 1) {
      k.fitBounds(L.latLngBounds(steder.map(s => s.pos)), { padding: [70, 70] });
    } else if (steder.length) {
      k.setView(steder[0].pos, parseInt(boks.dataset.zoom || "14", 10));
    }
    k.on("click", () => k.scrollWheelZoom.enable());
    boks.addEventListener("mouseleave", () => k.scrollWheelZoom.disable());
  });
}

/* ---------- Svar-siden ---------- */
function svar() {
  const ja = document.getElementById("svar-ja");
  const nei = document.getElementById("svar-nei");
  if (!ja || !nei) return;
  const jaTekst = document.getElementById("melding-ja");
  const neiTekst = document.getElementById("melding-nei");
  ja.addEventListener("click", () => {
    neiTekst.classList.remove("vises");
    jaTekst.classList.add("vises");
    konfetti();
    if (LENKER.skjema) window.open(LENKER.skjema, "_blank", "noopener");
  });
  nei.addEventListener("click", () => {
    jaTekst.classList.remove("vises");
    neiTekst.classList.add("vises");
  });
  const skjemaHint = document.getElementById("skjema-hint");
  if (skjemaHint) skjemaHint.hidden = !LENKER.skjema;
  const ingenSkjema = document.getElementById("ingen-skjema");
  if (ingenSkjema) ingenSkjema.hidden = !!LENKER.skjema;
}

/* ---------- Konfetti (uten bibliotek) ---------- */
function konfetti() {
  if (ROLIG) return;
  const lerret = document.createElement("canvas");
  lerret.className = "konfetti";
  lerret.setAttribute("aria-hidden", "true");
  document.body.append(lerret);
  const ctx = lerret.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let B = 0, H = 0;
  function storrelse() {
    B = window.innerWidth; H = window.innerHeight;
    lerret.width = B * dpr; lerret.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  storrelse();
  window.addEventListener("resize", storrelse);

  const farger = ["#b48c52", "#d4a63a", "#f6f2eb", "#66745a", "#e8b4b0", "#ffffff", "#f3dfb4"];
  const g = 0.32;                      // tyngdekraft (px per bilde²)
  const fart = Math.sqrt(2 * g * H);   // ∝ √skjermhøyde, når omtrent toppen
  const biter = [];
  const antall = Math.round(Math.min(220, 90 + B / 6));
  for (let i = 0; i < antall; i++) {
    const venstre = i % 2 === 0;
    const v = fart * (0.62 + Math.random() * 0.42);
    const vinkel = (venstre ? -1 : 1) * (0.18 + Math.random() * 0.5); // radianer fra loddrett
    biter.push({
      x: venstre ? -10 : B + 10, y: H + 10,
      vx: Math.sin(-vinkel) * v * -1, vy: -Math.cos(vinkel) * v,
      str: 6 + Math.random() * 7,
      farge: farger[(Math.random() * farger.length) | 0],
      sirkel: Math.random() < 0.3,
      rot: Math.random() * Math.PI, rotFart: (Math.random() - 0.5) * 0.3,
      vugge: Math.random() * Math.PI * 2, vuggeFart: 0.05 + Math.random() * 0.06,
      maksFall: 1.6 + Math.random() * 1.6
    });
  }
  // Retning: venstre hjørne skyter mot høyre, høyre hjørne mot venstre
  biter.forEach(b => { b.vx = Math.abs(b.vx) * (b.x < 0 ? 1 : -1); });

  const start = performance.now();
  let forrige = start;
  function tegn(na) {
    const dt = Math.min(2.5, (na - forrige) / 16.67);
    forrige = na;
    ctx.clearRect(0, 0, B, H);
    let igjen = 0;
    for (const b of biter) {
      b.vy = Math.min(b.vy + g * dt, b.maksFall);
      b.vx *= Math.pow(0.985, dt);
      b.vugge += b.vuggeFart * dt;
      b.x += (b.vx + Math.sin(b.vugge) * 0.9) * dt;
      b.y += b.vy * dt;
      b.rot += b.rotFart * dt;
      if (b.y < H + 30 || b.vy < 0) igjen++;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.farge;
      if (b.sirkel) {
        ctx.beginPath(); ctx.arc(0, 0, b.str * 0.4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.scale(1, Math.cos(b.vugge * 1.6));
        ctx.fillRect(-b.str / 2, -b.str * 0.3, b.str, b.str * 0.6);
      }
      ctx.restore();
    }
    if (igjen > 0 && na - start < 12000) requestAnimationFrame(tegn);
    else { window.removeEventListener("resize", storrelse); lerret.remove(); }
  }
  requestAnimationFrame(tegn);
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  settLenker();
  meny();
  scrolling();
  synlighet();
  nedtelling();
  lysboks();
  kart();
  svar();
});
