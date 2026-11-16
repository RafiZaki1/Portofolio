/* ===========================================================
   Portofolio · Muhamad Rafi Zaki
   Render data, animasi scroll, efek kursor, tema gelap/terang.
   Isi konten diedit di data.js.
   =========================================================== */
"use strict";

/* ---------- Util ---------- */
const $ = (id) => document.getElementById(id);
const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const arr = (v) => (Array.isArray(v) ? v : []);
const safeUrl = (u = "") => (/^(https?:|mailto:|tel:)/i.test(u) ? u : "#");
const ext = (u = "") => (/^https?:/i.test(u) ? 'target="_blank" rel="noopener"' : "");
const ic = (name, cls = "") => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const safe = (label, fn) => { try { fn(); } catch (err) { console.error(`[portofolio] ${label}:`, err); } };

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const D = typeof DATA !== "undefined" ? DATA : {};

/* ---------- Pembuka → mulai animasi hero ---------- */
const markReady = () => {
  if (root.classList.contains("ready")) return;
  root.classList.add("ready");
  const pre = $("pre");
  if (pre) { pre.classList.add("done"); setTimeout(() => pre.remove(), 1300); }
};
{
  const t0 = performance.now();
  const loaded = new Promise((res) => (document.readyState === "complete" ? res() : addEventListener("load", res, { once: true })));
  const cap = new Promise((res) => setTimeout(res, 2500));
  Promise.race([loaded, cap]).then(() => setTimeout(markReady, reduce ? 0 : Math.max(0, 1000 - (performance.now() - t0))));
  setTimeout(markReady, 3800); // jaring pengaman
}

/* ---------- Pustaka kecil: reveal, tilt, hitung angka ---------- */
const revealIO = "IntersectionObserver" in window && !reduce
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        revealIO.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
  : null;

function observeReveals(scope = document) {
  qsa("[data-reveal]:not(.in)", scope).forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add("in")));
}

// Sorot kursor (--mx/--my) dan kemiringan 3D (--rx/--ry) pada kartu
function bindCards(scope = document) {
  qsa("[data-tilt], [data-spot]", scope).forEach((el) => {
    if (el._bound) return;
    el._bound = true;
    const tilt = el.hasAttribute("data-tilt") && finePointer && !reduce;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      if (tilt) {
        el.style.setProperty("--ry", `${((x / r.width - 0.5) * 9).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - y / r.height) * 9).toFixed(2)}deg`);
      }
    });
    el.addEventListener("pointerleave", () => { el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); });
  });
}

function countUp(el, to, dur = 1500) {
  if (reduce) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = (t) => {
    const p = clamp((t - t0) / dur, 0, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counterIO = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el._seen = true;
        counterIO.unobserve(el);
        if (el.dataset.count) countUp(el, +el.dataset.count);
      });
    }, { threshold: 0.6 })
  : null;
function setCount(el, n) { el.dataset.count = n; if (el._seen || !counterIO) countUp(el, n); }

let toastTimer;
function toast(msg, ok = true) {
  const t = $("toast");
  if (!t) return;
  t.innerHTML = `${ic(ok ? "check" : "x")}<span>${esc(msg)}</span>`;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* lanjut ke cara lama */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

/* ---------- Tema gelap / terang ---------- */
safe("tema", () => {
  const btn = $("themeBtn");
  const meta = qs('meta[name="theme-color"]');
  const paint = (t) => {
    root.setAttribute("data-theme", t);
    if (meta) meta.content = t === "light" ? "#f3f6fd" : "#050b1a";
    btn.setAttribute("aria-label", t === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap");
  };
  paint(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("rz-theme", next); } catch (e) { /* abaikan */ }
    if (!document.startViewTransition || reduce) { paint(next); return; }
    const b = btn.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => paint(next));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
  });
});

/* ---------- Render konten dari data.js ---------- */
safe("footer", () => {
  $("year").textContent = new Date().getFullYear();
  if (D.lokasi) $("footLoc").textContent = D.lokasi;
  $("githubAll").href = `https://github.com/${D.githubUser}`;
  const org = arr(D.pengalaman)[0];
  if (org && org.instansi) $("heroOrg").textContent = org.instansi;
});

safe("sosial", () => {
  const items = [
    ["github", `https://github.com/${D.githubUser}`, "GitHub"],
    ["linkedin", D.linkedin, "LinkedIn"],
    ["instagram", D.instagram, "Instagram"],
    ["mail", D.email ? `mailto:${D.email}` : "", "Email"],
  ].filter(([, href]) => href);
  $("heroSocials").innerHTML = items.map(([i, href, label]) =>
    `<a class="soc" href="${esc(safeUrl(href))}" aria-label="${label}" title="${label}" ${ext(href)}>${ic(i)}</a>`).join("");
});

safe("marquee", () => {
  const techs = arr(D.skill).filter((g) => !/soft/i.test(g.grup)).flatMap((g) => arr(g.item));
  if (!techs.length) { qs(".marquee").hidden = true; return; }
  const half = [...techs, ...techs].map((t) => `<span>${esc(t)}</span>`).join("");
  $("track").innerHTML = half + half;
});

safe("pills", () => {
  const EMOJI = { badminton: "🏸", berenang: "🏊", lari: "🏃" };
  const loc = D.lokasi ? `<span class="pill">${ic("map-pin")}${esc(D.lokasi)}</span>` : "";
  const hobi = arr(D.hobi).map((h) => `<span class="pill">${EMOJI[String(h).toLowerCase()] || "✦"} ${esc(h)}</span>`).join("");
  $("aboutPills").innerHTML = loc + hobi;
});

safe("skill", () => {
  const ICONS = [[/back/i, "server"], [/front/i, "layout"], [/tool/i, "tool"], [/soft|tim|sikap/i, "users"]];
  const iconFor = (name = "") => (ICONS.find(([re]) => re.test(name)) || [null, "code"])[1];
  $("skillList").innerHTML = arr(D.skill).map((g, i) => `
    <article class="card fx" data-tilt data-reveal style="--i:${Math.min(i, 5)}">
      <div class="card-top"><span class="icon-box">${ic(iconFor(g.grup))}</span><span class="count">${String(arr(g.item).length).padStart(2, "0")}</span></div>
      <h3>${esc(g.grup)}</h3>
      <div class="tags">${arr(g.item).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </article>`).join("");
});

safe("karya", () => {
  // Karya pilihan: gambar besar + deskripsi. Karya pertama tampil paling lebar.
  $("workList").innerHTML = arr(D.karya).map((k, i) => {
    const main = k.demo || k.kode;
    const img = `<img src="${esc(k.gambar)}" alt="Tampilan ${esc(k.judul)}" width="1200" height="750" loading="lazy" decoding="async">`;
    const shot = main
      ? `<a class="shot" href="${esc(safeUrl(main))}" ${ext(main)} aria-label="Buka ${esc(k.judul)}${k.demo ? "" : " di GitHub"}">${img}</a>`
      : `<div class="shot">${img}</div>`;
    const actions = [
      k.demo ? `<a class="btn primary sm" href="${esc(safeUrl(k.demo))}" ${ext(k.demo)}><span>Coba ${esc(k.judul)}</span>${ic("arrow-up-right")}</a>` : "",
      k.kode ? `<a class="btn ghost sm" href="${esc(safeUrl(k.kode))}" ${ext(k.kode)}>${ic("github")}<span>Kode di GitHub</span></a>` : "",
    ].join("");
    return `<article class="work fx${i === 0 ? " lead-work" : ""}" data-spot data-reveal style="--i:${Math.min(i, 3)}">
      ${shot}
      <div class="work-body">
        <span class="work-kind">${esc(k.jenis)}</span>
        <h3>${esc(k.judul)}</h3>
        <p>${esc(k.deskripsi)}</p>
        <div class="tags">${arr(k.teknologi).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${actions ? `<div class="work-actions">${actions}</div>` : ""}
      </div>
    </article>`;
  }).join("");
});

safe("pengalaman", () => {
  $("expList").innerHTML = arr(D.pengalaman).map((e) => `
    <article class="exp fx" data-spot data-reveal>
      <div class="exp-head">
        <div class="exp-title"><span class="icon-box">${ic("briefcase")}</span>
          <div><h3>${esc(e.posisi)}</h3><p class="org">${esc(e.instansi)}</p></div></div>
        <span class="period">${esc(e.periode)}</span>
      </div>
      <ul>${arr(e.poin).map((p, j) => `<li data-reveal style="--i:${Math.min(j, 5)}">${ic("check-circle")}<span>${esc(p)}</span></li>`).join("")}</ul>
    </article>`).join("");
});

safe("pendidikan", () => {
  $("eduList").innerHTML = arr(D.pendidikan).map((e, i) => `
    <div class="tl-item" data-reveal style="--i:${Math.min(i, 5)}">
      <span class="period">${esc(e.periode)}</span>
      <h3>${esc(e.nama)}</h3>
      ${e.detail ? `<p>${esc(e.detail)}</p>` : ""}
    </div>`).join("");
});

// Entri contoh yang judulnya masih diawali "Nama ..." tidak ditampilkan
safe("sertifikat", () => {
  const real = (x) => x && !/^\s*nama\s/i.test(x.judul || "");
  const certs = arr(D.sertifikat).filter(real);
  const awards = arr(D.prestasi).filter(real);
  if (!certs.length && !awards.length) return;
  $("sertifikat").hidden = false;
  $("navCert").hidden = false;
  $("certList").innerHTML = certs.map((c, i) => {
    const body = `<div class="card-top"><span class="icon-box">${ic("award")}</span>${c.link ? `<span class="go">${ic("arrow-up-right")}</span>` : ""}</div>
      <h3>${esc(c.judul)}</h3><p>${[c.penerbit, c.tahun].filter(Boolean).map(esc).join(" · ")}</p>`;
    return c.link
      ? `<a class="card fx repo" data-tilt data-reveal style="--i:${Math.min(i, 5)}" href="${esc(safeUrl(c.link))}" ${ext(c.link)}>${body}</a>`
      : `<div class="card fx" data-tilt data-reveal style="--i:${Math.min(i, 5)}">${body}</div>`;
  }).join("");
  $("awardList").innerHTML = awards.map((a, i) => `
    <div class="card fx" data-tilt data-reveal style="--i:${Math.min(i, 5)}">
      <div class="card-top"><span class="icon-box">${ic("star")}</span></div>
      <h3>${esc(a.judul)}</h3><p>${esc(a.detail)} · ${esc(a.tahun)}</p>
    </div>`).join("");
});

safe("kontak", () => {
  const handle = (u) => { try { return "@" + new URL(u).pathname.split("/").filter(Boolean).pop(); } catch (e) { return "Instagram"; } };
  const items = [
    ["mail", "Email", D.email ? `mailto:${D.email}` : "", D.email],
    ["github", "GitHub", `https://github.com/${D.githubUser}`, `@${D.githubUser}`],
    ["linkedin", "LinkedIn", D.linkedin, "Rafi Zaki"],
    ["instagram", "Instagram", D.instagram, handle(D.instagram)],
    ["phone", "Telepon", D.telepon ? `tel:${String(D.telepon).replace(/[\s-]/g, "")}` : "", D.telepon],
  ].filter(([, , href, val]) => href && val);
  $("contactList").innerHTML = items.map(([icon, label, href, val], i) => `
    <a class="card fx contact" data-tilt data-reveal style="--i:${i}" href="${esc(safeUrl(href))}" ${ext(href)}>
      <span class="icon-box">${ic(icon)}</span>
      <span><small>${label}</small><b>${esc(val)}</b></span>
      <span class="go">${ic("arrow-up-right")}</span>
    </a>`).join("");

  if (D.email) $("mailLink").href = `mailto:${D.email}`;
  $("copyMail")?.addEventListener("click", async () => {
    const ok = await copyText(D.email || "");
    toast(ok ? "Alamat email disalin" : "Gagal menyalin, salin manual ya", ok);
  });
});

/* ---------- Efek mengetik pada peran ---------- */
safe("mengetik", () => {
  const el = $("typed");
  const words = arr(D.peran).length ? D.peran : ["Fullstack Developer", "Laravel & Spring Boot", "RESTful API", "Siswa RPL · SMKN 2 Mojokerto"];
  el.textContent = words[0];
  if (reduce) return;
  let w = 0, c = words[0].length, del = true;
  const tick = () => {
    const word = words[w];
    el.textContent = word.slice(0, c);
    let wait = del ? 32 : 70;
    if (!del && c === word.length) { del = true; wait = 1800; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 380; }
    else c += del ? -1 : 1;
    setTimeout(tick, wait);
  };
  setTimeout(tick, 2600);
});

/* ---------- Proyek dari GitHub (dengan cache 10 menit) ---------- */
const LANG = { PHP: "#8892bf", Java: "#e08a3c", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#7a5ccf", Blade: "#f7523f", Vue: "#41b883", Python: "#3572a5", Kotlin: "#a97bff", Dart: "#00b4ab", "C#": "#178600", "C++": "#f34b7d", C: "#9aa0a6", Shell: "#89e051", SCSS: "#c6538c", Go: "#00add8" };
const langColor = (l) => (Object.prototype.hasOwnProperty.call(LANG, l) ? LANG[l] : "var(--accent)");
const CACHE_KEY = "rz-repos-v1";
const CACHE_TTL = 10 * 60 * 1000;

function readCache() {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && Array.isArray(c.data) ? c : null; } catch (e) { return null; }
}
async function loadRepos() {
  const cached = readCache();
  if (cached && Date.now() - cached.t < CACHE_TTL) return cached.data;
  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(D.githubUser)}/repos?per_page=100&sort=updated`);
    if (!r.ok) throw new Error(r.status);
    const data = (await r.json()).map((x) => ({
      name: x.name, description: x.description, html_url: x.html_url, homepage: x.homepage, language: x.language,
      topics: x.topics, stargazers_count: x.stargazers_count, pushed_at: x.pushed_at, fork: x.fork,
    }));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) { /* abaikan */ }
    return data;
  } catch (err) {
    if (cached) return cached.data; // pakai cache lama jika GitHub membatasi / offline
    throw err;
  }
}

const repoCard = (x, i) => {
  const href = /^https?:\/\//i.test(x.homepage || "") ? x.homepage : x.html_url;
  const lang = x.language ? `<span class="tag"><i style="--c:${langColor(x.language)}"></i>${esc(x.language)}</span>` : "";
  const topics = arr(x.topics).slice(0, x.language ? 3 : 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const when = new Date(x.pushed_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  return `
    <a class="card fx repo" data-tilt data-reveal style="--i:${Math.min(i, 5)}" href="${esc(safeUrl(href))}" target="_blank" rel="noopener">
      <div class="card-top"><span class="icon-box">${ic("folder")}</span><span class="go">${ic("arrow-up-right")}</span></div>
      <h3>${esc(x.name)}</h3>
      <p class="desc">${esc(x.description || "Tanpa deskripsi")}</p>
      <div class="tags">${lang}${topics}</div>
      <div class="meta"><span>${ic("star")}${Number(x.stargazers_count) || 0}</span><span>Update ${esc(when)}</span></div>
    </a>`;
};

(async () => {
  const box = $("repoList");
  box.innerHTML = Array.from({ length: 3 }, () => '<div class="sk" aria-hidden="true"></div>').join("");
  try {
    const all = await loadRepos();
    let repos = all.filter((x) => !x.fork && !arr(D.repoSembunyi).includes(x.name));
    setCount($("statRepo"), repos.length);
    const rank = (x) => { const i = arr(D.repoUnggulan).indexOf(x.name); return i === -1 ? 999 : i; };
    repos.sort((a, b) => rank(a) - rank(b) || new Date(b.pushed_at) - new Date(a.pushed_at));
    repos = repos.slice(0, 9);
    if (!repos.length) { box.innerHTML = '<div class="empty">Belum ada repo publik.</div>'; return; }
    box.innerHTML = repos.map(repoCard).join("");
    bindCards(box);
    observeReveals(box);
  } catch (e) {
    box.innerHTML = `<div class="empty">Proyek belum bisa dimuat. Lihat langsung di <a href="https://github.com/${esc(D.githubUser)}" target="_blank" rel="noopener">GitHub</a>.</div>`;
  }
})();

/* ---------- Navigasi: menu mobile, scroll-spy ---------- */
safe("menu", () => {
  const menu = $("menu");
  const burger = $("burger");
  $("menuLinks").innerHTML = qsa("#links a:not([hidden])").map((a, i) =>
    `<a href="${esc(a.getAttribute("href"))}" style="--i:${i}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${esc(a.textContent)}</a>`).join("");
  const set = (open) => {
    menu.classList.toggle("open", open);
    menu.inert = !open;
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => set(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) set(false); });
  addEventListener("resize", () => { if (innerWidth > 980) set(false); });
});

safe("scroll-spy", () => {
  if (!("IntersectionObserver" in window)) return;
  const links = qsa("#links a, #menuLinks a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  qsa("main section[id]").forEach((s) => spy.observe(s));
});

/* ---------- Scroll: progres, tombol atas, garis waktu ---------- */
safe("scroll", () => {
  const bar = $("progress");
  const top = $("totop");
  const timelines = qsa(".timeline");
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    bar.style.transform = `scaleX(${p})`;
    top.style.setProperty("--p", p.toFixed(3));
    top.classList.toggle("show", scrollY > 700);
    timelines.forEach((tl) => {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty("--p", clamp((innerHeight * 0.62 - r.top) / r.height, 0, 1).toFixed(3));
      qsa(".tl-item", tl).forEach((it) => it.classList.toggle("lit", it.getBoundingClientRect().top + 38 < innerHeight * 0.62));
    });
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
  update();
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
});

/* ---------- Pratinjau CV ---------- */
safe("cv", () => {
  const dlg = $("cvDialog");
  qsa("[data-open-cv]").forEach((b) => b.addEventListener("click", () => {
    if (typeof dlg.showModal === "function") { dlg.showModal(); document.body.classList.add("lock"); }
    else window.open("assets/CV-Rafi-Zaki.pdf", "_blank", "noopener");
  }));
  qsa("[data-close-cv]").forEach((b) => b.addEventListener("click", () => dlg.close()));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => document.body.classList.remove("lock"));
});

/* ---------- Efek khusus perangkat dengan mouse ---------- */
safe("kursor", () => {
  const spot = $("spot");
  if (!finePointer || reduce) return;
  let x = 0, y = 0, raf = 0;
  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    spot.classList.add("on");
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; spot.style.setProperty("--mx", `${x}px`); spot.style.setProperty("--my", `${y}px`); });
  }, { passive: true });
  root.addEventListener("mouseleave", () => spot.classList.remove("on"));
});

safe("parallax-hero", () => {
  if (!finePointer || reduce) return;
  const hero = qs(".hero");
  const vis = $("heroVisual");
  let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    vis.style.setProperty("--px", cx.toFixed(3));
    vis.style.setProperty("--py", cy.toFixed(3));
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop); else running = false;
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    kick();
  });
  hero.addEventListener("pointerleave", () => { tx = ty = 0; kick(); });
});

safe("magnetik", () => {
  if (!finePointer || reduce) return;
  qsa(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
});

/* ---------- Aktifkan animasi untuk semua elemen yang sudah dirender ---------- */
safe("angka", () => {
  const els = qsa("[data-count]");
  if (counterIO && !reduce) els.forEach((el) => { el.textContent = "0"; });
  if (counterIO) [...els, $("statRepo")].forEach((el) => counterIO.observe(el));
});
safe("api", () => {
  // Endpoint dibentuk dari data.js, jadi selalu sama dengan isi halaman.
  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined && o[k] !== "").map((k) => [k, o[k]]));
  const EP = {
    "/api/profil": () => ({ nama: D.nama, peran: "Backend Developer", fokus: ["Laravel", "Spring Boot", "REST API", "MySQL"], sedang_belajar: ["TypeScript", "React"], lokasi: D.lokasi, status: "Terbuka untuk kesempatan kerja" }),
    "/api/karya": () => arr(D.karya).map((k) => pick(k, ["judul", "jenis", "teknologi", "demo", "kode"])),
    "/api/skill": () => Object.fromEntries(arr(D.skill).map((g) => [g.grup.toLowerCase().replace(/\s+/g, "_"), g.item])),
    "/api/pengalaman": () => arr(D.pengalaman).map((p) => pick(p, ["posisi", "instansi", "periode", "poin"])),
    "/api/pendidikan": () => arr(D.pendidikan).map((e) => pick(e, ["nama", "detail", "periode"])),
    "/api/sertifikat": () => arr(D.sertifikat).map((c) => pick(c, ["judul", "penerbit", "tahun"])),
    "/api/kontak": () => pick({ email: D.email, linkedin: D.linkedin, github: D.githubUser && `https://github.com/${D.githubUser}` }, ["email", "linkedin", "github"]),
  };
  const form = $("apiForm"), input = $("apiPath"), status = $("apiStatus"), body = $("apiBody"), eps = $("apiEps");
  eps.innerHTML = Object.keys(EP).map((p) => `<button class="api-ep" type="button" data-ep="${p}" aria-pressed="false">${p.replace("/api", "")}</button>`).join("");
  const color = (json) => esc(json).replace(/(&quot;(?:[^&]|&(?!quot;))*&quot;)(\s*:)?|\b(-?\d+(?:\.\d+)?|true|false|null)\b/g, (m, str, colon, num) =>
    str ? `<span class="${colon ? "k" : "s"}">${str}</span>${colon || ""}` : `<span class="n">${num}</span>`);
  function send(raw) {
    const t0 = performance.now();
    const path = ("/" + String(raw || "").trim().replace(/^\/+/, "")).replace(/\/+$/, "").toLowerCase() || "/";
    input.value = path;
    qsa(".api-ep", eps).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ep === path)));
    const found = EP[path];
    const res = found
      ? { status: 200, data: found() }
      : { status: 404, error: `Endpoint ${path} tidak ditemukan`, tersedia: Object.keys(EP) };
    const json = JSON.stringify(res, null, 2);
    const ms = Math.max(1, Math.round(performance.now() - t0));
    status.innerHTML = `<b class="${found ? "ok" : "err"}">${found ? "200 OK" : "404 Not Found"}</b><span>${ms} ms</span><span>${new Blob([json]).size} B</span><span>application/json</span>`;
    body.innerHTML = color(json);
    body.scrollTop = 0;
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  eps.addEventListener("click", (e) => { const b = e.target.closest("[data-ep]"); if (b) send(b.dataset.ep); });
  send("/api/profil");
});

bindCards();
observeReveals();
