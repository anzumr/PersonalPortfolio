// --------- Theme (light/dark) ----------
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
const themeBtnMobile = document.getElementById("themeBtnMobile"); // ✅ NEW

function setTheme(t){
  root.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);

  const label = (t === "light") ? "🌞 Mode" : "🌙 Mode";
  if (themeBtn) themeBtn.textContent = label;
  if (themeBtnMobile) themeBtnMobile.textContent = label; // ✅ keep mobile button in sync

  // Starfield: adjust visibility by theme (stars look best in dark)
  const starCanvas = document.getElementById("starfield");
  if (starCanvas) starCanvas.style.opacity = (t === "light") ? "0" : "1";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
} else {
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

if (themeBtn){
  themeBtn.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme");
    setTheme(cur === "light" ? "dark" : "light");
  });
}
if (themeBtnMobile){
  themeBtnMobile.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme");
    setTheme(cur === "light" ? "dark" : "light");
  });
}

// --------- Mobile Nav Toggle ----------
const navToggle = document.getElementById("navToggle");
const mobilePanel = document.getElementById("mobilePanel");

function openMenu(){
  if (!mobilePanel || !navToggle) return;
  mobilePanel.classList.add("is-open");
  navToggle.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
}
function closeMenu(){
  if (!mobilePanel || !navToggle) return;
  mobilePanel.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}
function toggleMenu(){
  if (!mobilePanel) return;
  mobilePanel.classList.contains("is-open") ? closeMenu() : openMenu();
}

if (navToggle){
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });
}

// Close when tapping a mobile link
if (mobilePanel){
  mobilePanel.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });
}

// Close when tapping outside
document.addEventListener("click", (e) => {
  if (!mobilePanel || !navToggle) return;
  if (!mobilePanel.classList.contains("is-open")) return;
  if (mobilePanel.contains(e.target) || navToggle.contains(e.target)) return;
  closeMenu();
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Close if resized to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

// --------- Hello (languages) ----------
const helloText = document.getElementById("helloText");
const hellos = [
  { txt: "Hello", lang: "English" },
  { txt: "Hola", lang: "Spanish" },
  { txt: "Bonjour", lang: "French" },
  { txt: "Ciao", lang: "Italian" },
  { txt: "Olá", lang: "Portuguese" },
  { txt: "Hallo", lang: "German" },
  { txt: "السلام عليكم", lang: "Arabic" },
  { txt: "হ্যালো", lang: "Bangla" },
  { txt: "こんにちは", lang: "Japanese" },
  { txt: "안녕하세요", lang: "Korean" }
];

let hiIndex = 0;
function rotateHello(){
  const h = hellos[hiIndex % hellos.length];
  if (helloText){
    helloText.textContent = h.txt;
    helloText.title = h.lang;
  }
  hiIndex++;
}
rotateHello();
setInterval(rotateHello, 2200);

// --------- Availability (controlled in code only) ----------

// ✅ CHANGE THIS ONLY
const IS_AVAILABLE = true; 
// true  = Available for work
// false = Not currently available

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const statusPill = document.getElementById("statusPill");

function applyAvailability(){
  if (!statusDot || !statusText || !statusPill) return;

  if (IS_AVAILABLE){
    statusDot.style.background = "var(--good)";
    statusDot.style.boxShadow = "0 0 0 6px rgba(37,211,102,0.12)";
    statusText.textContent = "Available for work";
    statusPill.classList.remove("not-available");
  } else {
    statusDot.style.background = "var(--bad)";
    statusDot.style.boxShadow = "0 0 0 6px rgba(255,77,79,0.10)";
    statusText.textContent = "Not currently available";
    statusPill.classList.add("not-available");
  }
}

applyAvailability();


// --------- Contact form (mailto fallback) ----------
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

if (form){
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const msg = document.getElementById("msg").value.trim();

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`
    );

    window.location.href = `mailto:anzum2225@gmail.com?subject=${subject}&body=${body}`;
    if (note) note.textContent = "Opening your email client… if nothing happens, copy/paste the message into an email.";
  });
}

// --------- Footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   Starry Night Background
   - gentle drift movement
   - twinkle/brighten near cursor
   ========================= */
(() => {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let stars = [];
  let rafId = null;

  const mouse = { x: -9999, y: -9999, active: false };

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function resize(){
    w = window.innerWidth;
    h = window.innerHeight;

    // refresh DPR in case user drags between monitors
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildStars();
  }

  function buildStars(){
    const area = w * h;
    const count = Math.max(140, Math.min(420, Math.floor(area / 6500)));

    stars = Array.from({ length: count }, () => {
      const r = rand(0.6, 1.8);
      const baseA = rand(0.22, 0.82);
      const speed = rand(0.02, 0.10);         // gentle drift
      const tw = rand(0.002, 0.01);           // twinkle rate
      return {
        x: rand(0, w),
        y: rand(0, h),
        r,
        baseA,
        vx: speed,
        vy: speed * rand(0.18, 0.55),
        tw,
        phase: rand(0, Math.PI * 2)
      };
    });
  }

  function drawSoftHaze(){
    const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.7);
    g.addColorStop(0, "rgba(255,255,255,0.035)");
    g.addColorStop(0.45, "rgba(124,92,255,0.025)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function tick(t){
    // If light mode, don't waste cycles
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight){
      ctx.clearRect(0, 0, w, h);
      rafId = requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, w, h);
    drawSoftHaze();

    for (const s of stars){
      // move
      s.x += s.vx;
      s.y += s.vy;

      // wrap
      if (s.x > w + 5) s.x = -5;
      if (s.y > h + 5) s.y = -5;

      // base twinkle
      const baseTwinkle = Math.sin(t * s.tw + s.phase) * 0.18;
      let a = s.baseA + baseTwinkle;

      // hover effect: brighten near cursor
      if (mouse.active){
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const influence = 120;
        if (dist < influence){
          const k = 1 - dist / influence; // 0..1
          a += 0.55 * k;                  // brighten
          a += rand(-0.08, 0.12) * k;     // sparkle jitter
        }
      }

      a = Math.max(0, Math.min(1, a));

      // star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(235,245,255,${a})`;
      ctx.fill();

      // halo glow when bright
      if (a > 0.75){
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${Math.min(0.20, (a - 0.75) * 0.5)})`;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener("blur", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden){
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
  });

  resize();
  rafId = requestAnimationFrame(tick);

  // ensure initial opacity matches theme
  canvas.style.opacity = (root.getAttribute("data-theme") === "light") ? "0" : "1";
})();
