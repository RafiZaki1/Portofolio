/* =========================================================
   TECH WHEEL — logo tech stack yang berputar melingkar.
   Berhenti sementara saat kursor atau fokus ada di atas roda.
   Logo: devicon (jsDelivr). Daftar teknologi bisa diubah di TECH.
   ========================================================= */
(() => {
  const ring = document.getElementById("techWheel");
  if (!ring) return;

  const CDN = "https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/";
  const TECH = [
    { n: "PHP", s: "php/php-plain.svg" },
    { n: "Laravel", s: "laravel/laravel-original.svg" },
    { n: "Java", s: "java/java-original.svg" },
    { n: "Spring Boot", s: "spring/spring-original.svg" },
    { n: "MySQL", s: "mysql/mysql-original.svg" },
    { n: "TypeScript", s: "typescript/typescript-original.svg" },
    { n: "React", s: "react/react-original.svg" },
    { n: "JavaScript", s: "javascript/javascript-original.svg" },
    { n: "HTML", s: "html5/html5-original.svg" },
    { n: "CSS", s: "css3/css3-original.svg" },
    { n: "Git", s: "git/git-original.svg" },
    { n: "GitHub", s: "github/github-original.svg" },
    { n: "GitLab", s: "gitlab/gitlab-original.svg" }
  ];
  const SPEED = 12; // derajat per detik
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = ring.parentElement;
  const core = stage.querySelector(".tw-core");
  const coreCount = core && core.querySelector("[data-count]");
  if (coreCount) coreCount.textContent = TECH.length;

  const items = TECH.map((t) => {
    const li = document.createElement("li");
    li.className = "tw-card";
    li.innerHTML = `<span class="tw-logo"><img src="${CDN}${t.s}" alt="" loading="lazy" onerror="this.remove()"></span><span class="tw-name">${t.n}</span>`;
    ring.appendChild(li);
    return li;
  });
  const N = items.length;

  let angle = 0;
  let paused = false;
  let size = 0;
  let radius = 0;
  let cw = 0;
  let ch = 0;

  function layout() {
    size = ring.clientWidth;
    radius = size * 0.44;
    cw = Math.min(104, Math.max(60, radius * 0.36));
    ch = cw * 1.2;
    items.forEach((el) => {
      el.style.width = `${cw}px`;
      el.style.height = `${ch}px`;
    });
    if (core) {
      const d = (radius - ch / 2) * 2 * 0.8;
      core.style.width = core.style.height = `${d}px`;
    }
    draw();
  }

  function draw() {
    const c = size / 2;
    items.forEach((el, i) => {
      const a = ((angle + (i * 360) / N) * Math.PI) / 180;
      const x = c + radius * Math.sin(a) - cw / 2;
      const y = c - radius * Math.cos(a) - ch / 2;
      const front = Math.cos(a);
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.zIndex = Math.round(100 + front * 50);
      el.style.opacity = (0.5 + 0.5 * ((front + 1) / 2)).toFixed(3);
    });
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused && !reduce) {
      angle = (angle + SPEED * dt) % 360;
      draw();
    }
    requestAnimationFrame(tick);
  }

  stage.addEventListener("pointerenter", () => (paused = true));
  stage.addEventListener("pointerleave", () => (paused = false));
  stage.addEventListener("focusin", () => (paused = true));
  stage.addEventListener("focusout", () => (paused = false));
  new ResizeObserver(layout).observe(ring);

  layout();
  requestAnimationFrame(tick);
})();
