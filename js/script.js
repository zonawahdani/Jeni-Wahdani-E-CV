const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* Data dibersihkan di memori saja (file data.js tidak diubah): spasi di tepi dibuang, dan isian "-" dianggap kosong */
function cleanData(v) {
  if (typeof v === "string") {
    const t = v.trim();
    return t === "-" ? "" : t;
  }
  if (Array.isArray(v)) return v.map(cleanData);
  if (v && typeof v === "object") {
    Object.keys(v).forEach((k) => {
      v[k] = cleanData(v[k]);
    });
    return v;
  }
  return v;
}
cleanData(DATA);

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function link(href, label, cls) {
  const a = el("a", cls, label);
  a.href = href;
  if (/^https?:/.test(href)) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}
function empty(host, title, msg) {
  const box = el("div", "empty rv");
  box.append(el("h3", null, title), el("p", null, msg));
  host.append(box);
}

function renderSchool(items) {
  const host = $("#list-riwayat");
  if (!items.length)
    return empty(host, "SLOT KOSONG", "Riwayat sekolah belum diisi.");
  const ol = el("ol", "path");
  items.forEach((s, i) => {
    const li = el("li", "rv");
    li.append(el("div", "n", "R" + (i + 1)));
    const d = el("div");
    d.append(el("h3", null, s.nama || ""));
    [s.prodi || s.jurusan, s.tahun, s.catatan]
      .filter(Boolean)
      .forEach((t) => d.append(el("p", null, t)));
    li.append(d);
    ol.append(li);
  });
  host.append(ol);
}

function renderProjects(items) {
  const host = $("#list-proyek");
  if (!items.length) return empty(host, "SLOT KOSONG", "Proyek belum diisi.");
  const wrap = el("div", "versus");
  items.forEach((p) => {
    const row = el("article", "vs rv");
    const t = el("div", "vs-t");
    t.append(el("h3", null, p.judul || ""));
    const b = el("div", "vs-b");
    const media = cover(
      p.gambar,
      "Tampilan proyek " + (p.judul || ""),
      "[FOTO PROYEK] BELUM DIISI",
    );
    const meta = [p.peran, p.tahun].filter(Boolean).join(" / ");
    if (meta) b.append(el("p", "meta", meta));
    if (p.deskripsi) b.append(el("p", null, p.deskripsi));
    if (p.kontribusi) {
      const k = el("p");
      k.append(
        el("strong", null, "Kontribusi: "),
        document.createTextNode(p.kontribusi),
      );
      b.append(k);
    }
    if (p.teknologi && p.teknologi.length) {
      const ul = el("ul", "tags");
      p.teknologi.forEach((x) => ul.append(el("li", null, x)));
      b.append(ul);
    }
    if (p.link) b.append(link(p.link, "LIHAT PROYEK", "btn"));
    row.append(media, t, b);
    wrap.append(row);
  });
  host.append(wrap);
}

/* PDF: komputer memakai jendela pratinjau; HP dan layar sentuh membuka tab baru karena banyak browser HP tidak menampilkan PDF di dalam halaman */
let pdfDialog;
function openPdf(src, title) {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.open(src, "_blank", "noopener");
    return;
  }
  if (!pdfDialog) {
    pdfDialog = el("dialog", "pdf-viewer");
    pdfDialog.setAttribute("aria-labelledby", "pdfTitle");
    const bar = el("div", "pdf-bar");
    const t = el("p", null, "");
    t.id = "pdfTitle";
    const x = el("button", "pdf-btn", "Tutup");
    x.type = "button";
    x.addEventListener("click", () => pdfDialog.close());
    bar.append(t, x);
    const frame = el("iframe");
    frame.id = "pdfFrame";
    frame.title = "Pratinjau sertifikat";
    pdfDialog.append(bar, frame);
    pdfDialog.addEventListener("click", (e) => {
      if (e.target === pdfDialog) pdfDialog.close();
    });
    pdfDialog.addEventListener("close", () => {
      $("#pdfFrame").src = "about:blank";
    });
    document.body.append(pdfDialog);
  }
  $("#pdfTitle").textContent = title;
  $("#pdfFrame").src = src;
  pdfDialog.showModal();
}

function renderCerts(items) {
  const host = $("#list-sertifikat");
  if (!items.length)
    return empty(host, "SLOT KOSONG", "Sertifikat belum diisi.");
  const ul = el("ul", "tickets");
  items.forEach((c) => {
    const li = el("li", "ticket rv");
    if (c.gambar) {
      const full = link(c.gambar, "");
      full.target = "_blank";
      full.rel = "noopener noreferrer";
      full.append(thumb(c.gambar, "Sertifikat " + (c.judul || "")));
      li.append(full);
    } else {
      li.append(cover("", "", "[FOTO SERTIFIKAT] BELUM DIISI"));
    }
    const cap = el("div", "cap");
    cap.append(el("h3", null, c.judul || ""));
    [c.penerbit, c.tahun]
      .filter(Boolean)
      .forEach((t) => cap.append(el("p", null, t)));
    if (c.link) cap.append(link(c.link, "Lihat sertifikat"));
    if (c.pdf) {
      const row = el("div", "pdf-row");
      const open = el("button", "pdf-btn", "Lihat PDF");
      open.type = "button";
      open.addEventListener("click", () =>
        openPdf(c.pdf, c.judul || "Sertifikat"),
      );
      const dl = link(c.pdf, "Unduh", "pdf-dl");
      dl.setAttribute("download", "");
      row.append(open, dl);
      cap.append(row);
    }
    li.append(cap);
    ul.append(li);
  });
  host.append(ul);
}

function renderContacts(items) {
  const host = $("#list-kontak");
  if (!items.length) return empty(host, "SLOT KOSONG", "Kontak belum diisi.");
  const ul = el("ul", "cont");
  items.forEach((k) => {
    const li = el("li", "rv");
    const a = link(k.href || "#kontak", "");
    a.append(
      el("small", null, k.label || ""),
      document.createTextNode(k.nilai || ""),
    );
    li.append(a);
    ul.append(li);
  });
  host.append(ul);
}

function thumb(src, alt) {
  const img = new Image();
  img.src = src;
  img.alt = alt;
  img.width = 640;
  img.height = 400;
  img.loading = "lazy";
  img.className = "thumb";
  return img;
}

function cover(src, alt, label) {
  if (src) return thumb(src, alt);
  const ph = el("div", "ph", label);
  ph.setAttribute("role", "img");
  ph.setAttribute("aria-label", label);
  return ph;
}

function renderSkills(items) {
  const host = $("#list-bidang");
  if (!items.length)
    return empty(host, "SLOT KOSONG", "Bidang yang dikuasai belum diisi.");
  [
    ["hard", "Hard Skills"],
    ["soft", "Soft Skills"],
  ].forEach(([jenis, label]) => {
    const group = items.filter(
      (b) => (b.tipe === "soft" ? "soft" : "hard") === jenis,
    );
    if (!group.length) return;
    host.append(el("p", "about-label", label));
    const ul = el("ul", jenis === "hard" ? "chart" : "skills");
    group.forEach((b) => {
      if (jenis === "soft") {
        const w = el("li", "skill rv", b.nama || "");
        if (b.keterangan) w.append(el("small", null, b.keterangan));
        ul.append(w);
        return;
      }
      const li = el("li", "rv");
      const has = typeof b.nilai === "number";
      const nilai = has ? Math.max(0, Math.min(100, b.nilai)) : 0;
      const row = el("div", "row");
      const pct = el(
        "span",
        "pct",
        has ? (reduce ? nilai + "%" : "0%") : "belum dinilai",
      );
      if (has) pct.dataset.n = nilai;
      row.append(el("span", "nm", b.nama || ""), pct);
      const bar = el("div", "bar");
      bar.setAttribute("role", "meter");
      bar.setAttribute("aria-label", b.nama || "");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      if (has) bar.setAttribute("aria-valuenow", nilai);
      const fill = el("i");
      fill.style.setProperty("--v", nilai / 100);
      bar.append(fill);
      li.append(row, bar);
      if (b.keterangan) li.append(el("small", null, b.keterangan));
      ul.append(li);
    });
    host.append(ul);
  });
}

function renderExperience(items) {
  const host = $("#list-pengalaman");
  if (!items.length)
    return empty(host, "SLOT KOSONG", "Pengalaman belum diisi.");
  const ul = el("ul", "xp");
  items.forEach((x) => {
    const li = el("li", "rv");
    const left = el("div");
    [x.periode, x.jenis]
      .filter(Boolean)
      .forEach((t) => left.append(el("p", "meta", t)));
    const d = el("div");
    d.append(el("h3", null, x.posisi || ""));
    if (x.organisasi) d.append(el("p", "org", x.organisasi));
    if (x.deskripsi) d.append(el("p", "xp-d", x.deskripsi));
    li.append(left, d);
    ul.append(li);
  });
  host.append(ul);
}

function renderAbout(data) {
  const host = $("#list-tentang");
  const paras = (data.tentang || "")
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);
  const minat = data.minat || [],
    keahlian = data.keahlianUtama || [];
  if (
    !paras.length &&
    !minat.length &&
    !keahlian.length &&
    !data.tujuanKarier
  ) {
    return empty(host, "SLOT KOSONG", "Bagian tentang saya belum diisi.");
  }
  const box = el("div", "about");
  box.append(el("p", "tag", "Perkenalan"));
  const d = el("div");
  paras.forEach((t) => d.append(el("p", "about-text rv", t)));
  [
    ["Minat", minat],
    ["Keahlian utama", keahlian],
  ].forEach(([label, list]) => {
    if (!list.length) return;
    d.append(el("p", "about-label", label));
    const short = list.filter((x) => x.length <= 40),
      long = list.filter((x) => x.length > 40);
    if (short.length) {
      const ul = el("ul", "tags");
      short.forEach((x) => ul.append(el("li", null, x)));
      d.append(ul);
    }
    long.forEach((x) => d.append(el("p", "about-body", x)));
  });
  if (data.tujuanKarier) {
    d.append(el("p", "about-label", "Tujuan karier"));
    d.append(el("p", "about-body rv", data.tujuanKarier));
  }
  box.append(d);
  host.append(box);
}

if (DATA.foto) {
  const slot = $("#slot");
  slot.replaceChildren();
  const img = new Image();
  img.src = DATA.foto;
  img.width = 250;
  img.height = 333;
  img.alt = "Foto Jeni Wahdani";
  img.fetchPriority = "high";
  slot.removeAttribute("role");
  slot.removeAttribute("aria-label");
  slot.append(img);
}
if (DATA.headline) {
  const h = $("#headline");
  h.textContent = DATA.headline;
  h.hidden = false;
}
renderAbout(DATA);
renderExperience(DATA.pengalaman || []);
renderSchool(DATA.sekolah);
renderSkills(DATA.bidang);
renderProjects(DATA.proyek);
renderCerts(DATA.sertifikat);
renderContacts(DATA.kontak);

/* Pecah teks jadi huruf. Teks asli tetap terbaca pembaca layar lewat .sr */
function splitText(node) {
  const t = node.textContent;
  node.textContent = "";
  node.append(el("span", "sr", t));
  let word = null;
  [...t].forEach((c, i) => {
    if (c === " ") {
      node.append(" ");
      word = null;
      return;
    }
    if (!word) {
      word = el("span", "w");
      word.setAttribute("aria-hidden", "true");
      node.append(word);
    }
    const s = el("span", "ch", c);
    s.style.setProperty("--i", i);
    word.append(s);
  });
}
document.querySelectorAll(".kin").forEach(splitText);
let heroStarted = false;
const startHero = () => {
  if (heroStarted) return;
  heroStarted = true;
  $("#mulai").classList.add("in");
};

/* Muncul saat masuk layar */
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".rv").forEach((n) => io.observe(n));

/* Menu: label bagian aktif, progres scroll, pita huruf, dan penanda kaca yang meluncur */
const labels = {
  mulai: "MULAI",
  tentang: "TENTANG SAYA",
  riwayat: "SEKOLAH",
  bidang: "BIDANG",
  pengalaman: "PENGALAMAN",
  proyek: "PROYEK",
  sertifikat: "SERTIFIKAT",
  kontak: "KONTAK",
};
const links = [...document.querySelectorAll(".nav a")];
const hp = $("#hp"),
  ind = $("#ind"),
  nav = $("#nav"),
  menu = $("#menu");
const bands = [...document.querySelectorAll(".band p")];
let active = links[0];

function moveInd(a) {
  if (!a) {
    ind.style.opacity = 0;
    return;
  }
  ind.style.opacity = 1;
  ind.style.width = a.offsetWidth + "px";
  ind.style.height = a.offsetHeight + "px";
  ind.style.transform =
    "translate(" + a.offsetLeft + "px," + a.offsetTop + "px)";
}
function tick() {
  const max = document.documentElement.scrollHeight - innerHeight;
  hp.style.transform =
    "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0) + ")";
  let cur = "mulai";
  Object.keys(labels).forEach((id) => {
    if ($("#" + id).getBoundingClientRect().top <= innerHeight * 0.4) cur = id;
  });
  links.forEach((a) => {
    if (a.dataset.s !== cur) a.removeAttribute("aria-current");
    else a.setAttribute("aria-current", "true");
  });
  const next = links.find((a) => a.dataset.s === cur);
  if (next !== active) {
    active = next;
    moveInd(active);
    if (active)
      nav.scrollTo({
        left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
  }
  if (!reduce)
    bands.forEach((p) => {
      const r = p.parentElement.getBoundingClientRect();
      p.style.transform =
        "translateX(" +
        ((r.top - innerHeight / 2) * parseFloat(p.dataset.f) - 120) +
        "px)";
    });
}
addEventListener("scroll", tick, { passive: true });
addEventListener("resize", () => {
  moveInd(active);
  tick();
});
tick();
moveInd(active);

links.forEach((a) => {
  a.addEventListener("mouseenter", () => moveInd(a));
  a.addEventListener("focus", () => moveInd(a));
});
nav.addEventListener("mouseleave", () => moveInd(active));
nav.addEventListener("focusout", () => moveInd(active));
menu.addEventListener("pointermove", (e) => {
  const r = menu.getBoundingClientRect();
  menu.style.setProperty("--mx", e.clientX - r.left + "px");
  menu.style.setProperty("--my", e.clientY - r.top + "px");
});

/* Cahaya hero mengikuti kursor */
const hero = $("#mulai");
hero.addEventListener("pointermove", (e) => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty("--gx", e.clientX - r.left + "px");
  hero.style.setProperty("--gy", e.clientY - r.top + "px");
});

/* Tombol Mulai: sapaan besar lalu pindah ke Tentang Saya */
$("#start").addEventListener("click", () => {
  if (reduce) {
    location.hash = "tentang";
    return;
  }
  const b = $("#banner"),
    t = $("#bannerText");
  const show = (txt) => {
    t.textContent = txt;
    t.style.animation = "none";
    void t.offsetWidth;
    t.style.animation = "";
  };
  b.hidden = false;
  show("HALO");
  setTimeout(() => show("SAYA JENI"), 800);
  setTimeout(() => {
    b.hidden = true;
    location.hash = "tentang";
  }, 1700);
});

/* Sentuh: tandai baris yang sedang berada di tengah layar */
if (matchMedia("(hover: none)").matches && !reduce) {
  const mid = new IntersectionObserver(
    (es) =>
      es.forEach((e) => e.target.classList.toggle("on", e.isIntersecting)),
    { rootMargin: "-42% 0px -42% 0px" },
  );
  document
    .querySelectorAll(
      ".path li, .skill, .chart li, .xp li, .vs, .ticket, .cont a",
    )
    .forEach((n) => mid.observe(n));
}

/* Jeda bertingkat: item dalam satu daftar muncul bergantian saat scroll */
document
  .querySelectorAll(".path, .xp, .skills, .chart, .versus, .tickets, .cont")
  .forEach((group) => {
    [...group.children].forEach((c, i) =>
      c.style.setProperty("--d", Math.min(i, 6) * 80 + "ms"),
    );
  });

/* Kartu proyek: miring mengikuti kursor, kilau mengikuti posisi mouse */
if (matchMedia("(hover: hover)").matches && !reduce) {
  document.querySelectorAll(".vs").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width,
        y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", (x - 0.5) * 6 + "deg");
      card.style.setProperty("--rx", (0.5 - y) * 5 + "deg");
      card.style.setProperty("--gx", x * 100 + "%");
      card.style.setProperty("--gy", y * 100 + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* Kursor cincin yang mengikuti mouse dengan sedikit jeda, membesar di atas tautan dan kartu */
if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
  const ring = el("div", "cursor");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(ring);
  let tx = 0,
    ty = 0,
    x = 0,
    y = 0,
    running = false;
  const follow = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    ring.style.transform = "translate(" + x + "px," + y + "px)";
    if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3)
      requestAnimationFrame(follow);
    else running = false;
  };
  addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!ring.classList.contains("on")) {
      x = tx;
      y = ty;
      ring.classList.add("on");
    }
    if (!running) {
      running = true;
      requestAnimationFrame(follow);
    }
  });
  document.addEventListener("pointerover", (e) =>
    ring.classList.toggle(
      "big",
      !!e.target.closest("a, button, .vs, .ticket, .slot"),
    ),
  );
  document.documentElement.addEventListener("mouseleave", () =>
    ring.classList.remove("on"),
  );
}

/* Foto profil: miring 3D, kilau, dan foto bergeser berlawanan arah kursor */
if (matchMedia("(hover: hover)").matches && !reduce) {
  const photo = $("#slot");
  photo.addEventListener("pointermove", (e) => {
    const r = photo.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    photo.style.setProperty("--ry", (x - 0.5) * 14 + "deg");
    photo.style.setProperty("--rx", (0.5 - y) * 12 + "deg");
    photo.style.setProperty("--gx", x * 100 + "%");
    photo.style.setProperty("--gy", y * 100 + "%");
    photo.style.setProperty("--tx", (0.5 - x) * 14 + "px");
    photo.style.setProperty("--ty", (0.5 - y) * 14 + "px");
  });
  photo.addEventListener("pointerleave", () => {
    ["--rx", "--ry", "--tx", "--ty"].forEach((v) =>
      photo.style.setProperty(v, v.startsWith("--r") ? "0deg" : "0px"),
    );
  });
}

/* Diagram bidang: angka persen naik dari nol saat barisnya masuk layar */
if (!reduce) {
  const counter = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        counter.unobserve(e.target);
        const out = e.target.querySelector(".pct[data-n]");
        if (!out) return;
        const to = +out.dataset.n,
          t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / 1300);
          out.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + "%";
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { threshold: 0.3 },
  );
  document.querySelectorAll(".chart li").forEach((li) => counter.observe(li));
}

/* Layar loading: progres mengikuti pemuatan sungguhan (font dan semua file), lalu READY? FIGHT! dan layar terangkat */
(function () {
  const root = document.documentElement,
    loader = $("#loader");
  if (!loader || root.classList.contains("no-loader")) {
    root.classList.remove("loading");
    startHero();
    return;
  }
  const fill = $("#ldFill"),
    pct = $("#ldPct"),
    label = $("#ldText"),
    call = $("#ldCall");
  const MIN = 1500,
    MAX = 5000,
    t0 = performance.now();
  let shown = 0,
    fontsReady = false,
    pageLoaded = false,
    finished = false,
    left = false;

  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => {
      fontsReady = true;
    });
  else fontsReady = true;
  if (document.readyState === "complete") pageLoaded = true;
  else
    addEventListener("load", () => {
      pageLoaded = true;
    });

  function leave() {
    if (left) return;
    left = true;
    loader.classList.add("out");
    root.classList.remove("loading");
    setTimeout(startHero, 250);
    setTimeout(() => loader.remove(), 1100);
  }

  function shout(text, flash) {
    call.textContent = text;
    call.classList.remove("hit");
    void call.offsetWidth;
    call.classList.add("hit");
    if (flash) loader.classList.add("flash");
  }

  function finish() {
    if (finished) return;
    finished = true;
    fill.style.transform = "scaleX(1)";
    pct.textContent = "100%";
    label.textContent = "SIAP";
    setTimeout(() => {
      loader.classList.add("calling");
      shout("READY?");
    }, 350);
    setTimeout(() => shout("FIGHT!", true), 1000);
    setTimeout(leave, 1550);
  }

  function frame(now) {
    if (finished || left) return;
    const elapsed = now - t0;
    if (elapsed > MAX) pageLoaded = fontsReady = true;
    const goal = pageLoaded && fontsReady ? 100 : fontsReady ? 82 : 45;
    const paced = Math.min(goal, (elapsed / MIN) * 100);
    shown += (paced - shown) * 0.1;
    fill.style.transform = "scaleX(" + shown / 100 + ")";
    pct.textContent = Math.round(shown) + "%";
    if (goal === 100 && shown >= 99.4) return finish();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  $("#ldSkip").addEventListener("click", () => {
    finished = true;
    leave();
  });
})();

/* Unduh CV: tombol hanya muncul jika alamat file PDF diisi di data.js */
if (DATA.cv) {
  document.querySelectorAll("[data-cv]").forEach((a) => {
    a.href = DATA.cv;
    a.hidden = false;
  });
}

/* Form WhatsApp: pesan disusun dari isian pengunjung lalu chat WhatsApp dibuka dengan teks terisi */
(function () {
  const form = $("#waForm"),
    box = $("#collab");
  if (!form) return;
  let number = String(DATA.whatsapp || "").replace(/\D/g, "");
  if (number.startsWith("0")) number = "62" + number.slice(1);
  if (number.length < 9) {
    const note = el("div", "empty");
    note.append(
      el("h3", null, "SLOT KOSONG"),
      el("p", null, "Nomor WhatsApp belum diisi."),
    );
    box.replaceChildren(note);
    return;
  }
  const err = $("#waErr");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nama = String(f.get("nama") || "").trim(),
      pesan = String(f.get("pesan") || "").trim();
    if (!nama || !pesan) {
      err.textContent = !nama
        ? "Isi nama Anda terlebih dahulu."
        : "Tulis pesan Anda terlebih dahulu.";
      (!nama ? form.elements.nama : form.elements.pesan).focus();
      return;
    }
    err.textContent = "";
    const teks =
      "Halo Jeni, saya " +
      nama +
      ".\nKeperluan: " +
      f.get("keperluan") +
      "\n\n" +
      pesan;
    window.open(
      "https://wa.me/" + number + "?text=" + encodeURIComponent(teks),
      "_blank",
      "noopener",
    );
  });
})();
