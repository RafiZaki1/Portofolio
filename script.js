/* ===========================================================
   Portofolio · Muhamad Rafi Zaki
   Render data, animasi scroll, tema gelap/terang.
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

/* ---------- Tema gelap / terang ---------- */
safe("tema", () => {
  const btn = $("themeBtn");
  const meta = qs('meta[name="theme-color"]');
  const paint = (t) => {
    root.setAttribute("data-theme", t);
    if (meta) meta.content = t === "light" ? "#e6e5df" : "#0a1317";
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

safe("perkenalan", () => {
  // Isi slide "Introduction": kontak singkat dan sekolah saat ini
  const lines = [D.email, D.telepon, D.lokasi].filter(Boolean).map(esc);
  $("introContact").innerHTML = lines.join("<br>");
  const sekolah = arr(D.pendidikan)[0];
  if (sekolah) $("introEdu").innerHTML = `${esc(sekolah.nama)}${sekolah.detail ? `<br>${esc(sekolah.detail.split(",")[0])}` : ""}`;
});

safe("pills", () => {
  const EMOJI = { badminton: "🏸", berenang: "🏊", lari: "🏃" };
  const loc = D.lokasi ? `<span class="pill">${ic("map-pin")}${esc(D.lokasi)}</span>` : "";
  const hobi = arr(D.hobi).map((h) => `<span class="pill">${EMOJI[String(h).toLowerCase()] || "✦"} ${esc(h)}</span>`).join("");
  $("aboutPills").innerHTML = loc + hobi;
});

const two = (n) => String(n).padStart(2, "0");

/* Singkatan ala tabel periodik untuk ubin teknologi */
const ABBR = [[/laravel/i, "Lv"], [/spring/i, "Sb"], [/rest/i, "Ra"], [/mysql/i, "My"], [/typescript/i, "Ts"], [/react/i, "Re"],
  [/javascript/i, "Js"], [/html/i, "Ht"], [/css/i, "Cs"], [/gitlab/i, "Gl"], [/github/i, "Gh"], [/laragon/i, "Lg"]];
const abbr = (name = "") => {
  const hit = ABBR.find(([re]) => re.test(name));
  if (hit) return hit[1];
  const base = (name.match(/\(([^)]+)\)/) || [null, name])[1].replace(/[^A-Za-z ]/g, "");
  const caps = base.match(/[A-Z]/g) || [];
  return caps.length > 1 ? caps[0] + caps[1].toLowerCase() : base.slice(0, 2).replace(/^./, (c) => c.toUpperCase());
};

safe("skill", () => {
  const grup = arr(D.skill);
  const tech = grup.filter((g) => !/soft/i.test(g.grup));
  const soft = grup.filter((g) => /soft/i.test(g.grup)).flatMap((g) => arr(g.item));
  // Tiap grup punya warna ubin sendiri (t0, t1, t2), seperti kolase warna di slide referensi
  $("skillLegend").innerHTML = tech.map((g, i) => `<li><i class="sw t${i % 3}"></i>${esc(g.grup)}</li>`).join("");
  let n = 0;
  $("skillTiles").innerHTML = tech.flatMap((g, gi) => arr(g.item).map((t) => {
    n += 1;
    const label = String(t).replace(/\s*\(([^)]+)\)/, " · $1");
    return `<li class="tile t${gi % 3}" data-reveal style="--i:${n % 6}"><span class="tile-no">${two(n)}</span><b aria-hidden="true">${esc(abbr(t))}</b><span class="tile-name">${esc(label)}</span></li>`;
  })).join("");
  $("softList").innerHTML = soft.map((t, i) => `<li data-reveal style="--i:${i}"><svg class="ic" aria-hidden="true"><use href="#o-spark"/></svg>${esc(t)}</li>`).join("");
});

safe("karya", () => {
  // Karya pertama di sebelah slide pembatas (8 kolom), sisanya berpasangan (6 kolom).
  const host = (u = "") => { try { return new URL(u).host.replace(/^www\./, ""); } catch (e) { return "localhost"; } };
  $("workList").innerHTML = arr(D.karya).map((k, i) => {
    const main = k.demo || k.kode;
    const img = `<img src="${esc(k.gambar)}" alt="Tampilan ${esc(k.judul)}" width="1200" height="750" loading="lazy" decoding="async">`;
    const shot = main
      ? `<a class="shot" href="${esc(safeUrl(main))}" ${ext(main)} aria-label="Buka ${esc(k.judul)}${k.demo ? "" : " di GitHub"}">${img}</a>`
      : `<div class="shot">${img}</div>`;
    const actions = [
      k.demo ? `<a class="btn primary sm" href="${esc(safeUrl(k.demo))}" ${ext(k.demo)}><span>Coba ${esc(k.judul)}</span>${ic("arrow-up-right")}</a>` : "",
      k.kode ? `<a class="btn ghost sm" href="${esc(safeUrl(k.kode))}" ${ext(k.kode)}>${ic("github")}<span>Kode</span></a>` : "",
    ].join("");
    const lead = i === 0;
    return `<article class="slide page work ${lead ? "span-8 lead-work" : "span-6"}">
      <div class="mock" data-reveal>
        <div class="browser"><div class="win-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(main))}</span></div>${shot}</div>
        ${lead ? '<i class="plinth" aria-hidden="true"></i>' : ""}
      </div>
      <div class="work-text" data-reveal style="--i:1">
        <span class="work-kind">${two(i + 1)} — ${esc(k.jenis)}</span>
        <h3>${esc(k.judul)}</h3>
        <p>${esc(k.deskripsi)}</p>
        <ul class="tags">${arr(k.teknologi).map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>
        ${actions ? `<div class="work-actions">${actions}</div>` : ""}
      </div>
    </article>`;
  }).join("");
});

safe("pengalaman", () => {
  $("expList").innerHTML = arr(D.pengalaman).map((e, i) => {
    const ringId = `expRing${i}`;
    const ring = `${e.instansi} ✦ ${e.periode} ✦`.toUpperCase();
    return `<article class="exp">
      <div class="exp-side" data-reveal>
        <span class="ring-badge static" aria-hidden="true">
          <svg viewBox="0 0 120 120"><defs><path id="${ringId}" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>
            <text><textPath href="#${ringId}" textLength="287" lengthAdjust="spacingAndGlyphs">${esc(ring)}</textPath></text></svg>
          ${ic("briefcase")}
        </span>
        <h3>${esc(e.posisi)}</h3>
        <p class="org">${esc(e.instansi)}</p>
        <span class="period">${esc(e.periode)}</span>
      </div>
      <ol class="exp-points">${arr(e.poin).map((p, j) => `<li data-reveal style="--i:${Math.min(j, 5)}">${esc(p)}</li>`).join("")}</ol>
    </article>`;
  }).join("");
});

safe("pendidikan", () => {
  $("eduList").innerHTML = arr(D.pendidikan).map((e, i) => `
    <li class="tl-item${i === 0 ? " now" : ""}" data-reveal style="--i:${Math.min(i, 5)}">
      <span class="when">${esc(e.periode)}</span>
      <h3>${esc(e.nama)}</h3>
      ${e.detail ? `<p>${esc(e.detail)}</p>` : ""}
    </li>`).join("");
});

// Entri contoh yang judulnya masih diawali "Nama ..." tidak ditampilkan
safe("sertifikat", () => {
  const real = (x) => x && !/^\s*nama\s/i.test(x.judul || "");
  const certs = arr(D.sertifikat).filter(real);
  const awards = arr(D.prestasi).filter(real);
  if (!certs.length && !awards.length) return;
  $("sertifikat").hidden = false;
  $("navCert").hidden = false;
  // Tiap sertifikat tampil sebagai tiket berlubang
  const item = (icon, title, sub, year, link, i) => {
    const body = `<span class="tk-main"><b>${esc(title)}</b><small>${sub}</small></span><span class="tk-stub">${ic(icon)}<em>${esc(year || "—")}</em></span>`;
    return `<li data-reveal style="--i:${Math.min(i, 5)}">${link
      ? `<a class="ticket" href="${esc(safeUrl(link))}" ${ext(link)}>${body}</a>`
      : `<div class="ticket">${body}</div>`}</li>`;
  };
  $("certList").innerHTML = certs.map((c, i) => item("award", c.judul, esc(c.penerbit || ""), c.tahun, c.link, i)).join("");
  $("awardList").innerHTML = awards.map((a, i) => item("star", a.judul, esc(a.detail || ""), a.tahun, "", i)).join("");
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
  // Ikon kontak memakai ornamen bulat yang sama dengan tombol sosmed
  $("contactList").innerHTML = items.map(([icon, label, href, val], i) => `
    <li data-reveal style="--i:${i}"><a class="contact" href="${esc(safeUrl(href))}" ${ext(href)}>
      <span class="soc" aria-hidden="true">${ic(icon)}</span>
      <span class="contact-txt"><small>${label}</small><b>${esc(val)}</b></span>
      ${ic("arrow-up-right", "go")}
    </a></li>`).join("");
  if (D.email) {
    $("mailLink").href = `mailto:${D.email}`;
    $("mailLink").textContent = D.email;
    $("mailRing").href = `mailto:${D.email}`;
  }
});

safe("nomor-halaman", () => {
  // Kaki slide ala deck presentasi: nama di kiri, nomor halaman di kanan.
  // Sampul dihitung sebagai halaman 01, jadi slide pertama di bawahnya halaman 02.
  const pages = qsa("main .page").filter((p) => !p.hidden);
  const year = new Date().getFullYear();
  pages.forEach((p, i) => {
    p.insertAdjacentHTML("beforeend", `<footer class="folio" aria-hidden="true"><span>${esc(D.nama || "")} — Portfolio ${year}</span><span>${two(i + 2)} / ${two(pages.length + 1)}</span></footer>`);
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
    <a class="repo" data-reveal style="--i:${i % 3}" href="${esc(safeUrl(href))}" target="_blank" rel="noopener">
      <div class="repo-top"><span class="repo-no">${two(i + 1)}</span>${ic("arrow-up-right", "go")}</div>
      <h4>${esc(x.name)}</h4>
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
    observeReveals(box);
  } catch (e) {
    box.innerHTML = `<div class="empty">Proyek belum bisa dimuat. Lihat langsung di <a href="https://github.com/${esc(D.githubUser)}" target="_blank" rel="noopener">GitHub</a>.</div>`;
  }
})();

/* ---------- Navigasi: menu mobile, scroll-spy ---------- */
safe("menu", () => {
  const menu = $("menu");
  const burger = $("burger");
  const navLinks = qsa("#links a:not([hidden])");
  $("menuLinks").innerHTML = navLinks.map((a, i) =>
    `<a href="${esc(a.getAttribute("href"))}" style="--i:${i}"><span class="n">${two(i + 1)}</span>${esc(a.textContent)}</a>`).join("");
  // Slide "Content": nomornya dari CSS counter, sama seperti nomor di judul tiap seksi
  $("tocList").innerHTML = navLinks.map((a) =>
    `<li><a href="${esc(a.getAttribute("href"))}"><b aria-hidden="true"></b><span>${esc(a.textContent)}</span></a></li>`).join("");
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
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    bar.style.transform = `scaleX(${p})`;
    top.style.setProperty("--p", p.toFixed(3));
    top.classList.toggle("show", scrollY > 700);
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

observeReveals();
