// --------- Theme (light/dark) ----------
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");

function setTheme(t){
  root.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
  themeBtn.textContent = (t === "light") ? "🌞 Mode" : "🌙 Mode";

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

themeBtn.addEventListener("click", () => {
  const cur = root.getAttribute("data-theme");
  setTheme(cur === "light" ? "dark" : "light");
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
  helloText.textContent = h.txt;
  helloText.title = h.lang;
  hiIndex++;
}
rotateHello();
setInterval(rotateHello, 2200);

// --------- Availability (green/red light) ----------
const toggle = document.getElementById("availToggle");
const statusDot = document.getElementById("statusDot");
const statusTitle = document.getElementById("statusTitle");
const statusDesc = document.getElementById("statusDesc");

function setAvailability(isAvailable){
  if(isAvailable){
    toggle.setAttribute("aria-checked", "true");
    statusDot.style.background = "var(--good)";
    statusDot.style.boxShadow = "0 0 0 6px rgba(37,211,102,0.12)";
    statusTitle.textContent = "Available for work";
    statusDesc.textContent = "Open to opportunities";
  } else {
    toggle.setAttribute("aria-checked", "false");
    statusDot.style.background = "var(--bad)";
    statusDot.style.boxShadow = "0 0 0 6px rgba(255,77,79,0.10)";
    statusTitle.textContent = "Not currently available";
    statusDesc.textContent = "Still happy to connect";
  }
  localStorage.setItem("available", String(isAvailable));
}

const savedAvail = localStorage.getItem("available");
setAvailability(savedAvail === null ? true : savedAvail === "true");

function flipAvail(){
  const cur = toggle.getAttribute("aria-checked") === "true";
  setAvailability(!cur);
}

toggle.addEventListener("click", flipAvail);
toggle.addEventListener("keydown", (e) => {
  if(e.key === "Enter" || e.key === " "){
    e.preventDefault();
    flipAvail();
  }
});

// --------- Contact form (mailto fallback) ----------
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

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
  note.textContent = "Opening your email client… if nothing happens, copy/paste the message into an email.";
});

// --------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

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
