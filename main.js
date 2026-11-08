// Movement is toned down for prefers-reduced-motion in CSS; the effects here
// (typing, counters, colour state changes) don't move content, so they always run.
(() => {
  const $ =(s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Lightbox ----------
  const box = $("#lightbox");
  const big = $("img", box);
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-full]");
    if (!el) return;
    big.src = el.dataset.full;
    big.alt = $("img", el)?.alt || "";
    box.showModal();
  });
  box.addEventListener("click", () => box.close());

  // ---------- Merge Tactics viewport thumbnails ----------
  const vpMain = $(".vp-main");
  $$(".vp-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const img = $("img", vpMain);
      const next = img.cloneNode();
      next.src = thumb.dataset.src;
      next.alt = $("img", thumb).alt;
      img.replaceWith(next);
      vpMain.dataset.full = thumb.dataset.src;
      $$(".vp-thumb").forEach((t) => t.classList.toggle("is-active", t === thumb));
    });
  });

  // ---------- Hero name typing ----------
  const typed = $$(".hero__name [data-type]");
  if (typed.length) {
    const texts = typed.map((el) => el.textContent);
    typed.forEach((el) => (el.textContent = ""));
    let part = 0, ch = 0;
    const tick = () => {
      typed[part].textContent = texts[part].slice(0, ++ch);
      if (ch >= texts[part].length) { part++; ch = 0; }
      if (part < typed.length) setTimeout(tick, 55);
    };
    setTimeout(tick, 300);
  }

  // ---------- Count-up numbers ----------
  const setNum = (el, v) => {
    el.textContent = (el.dataset.pre || "") + v.toFixed(+(el.dataset.dec || 0)) + (el.dataset.suf || "");
  };
  const countUp = (el) => {
    const to = parseFloat(el.dataset.to);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1400);
      setNum(el, to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$("[data-to]").forEach((el) => setNum(el, 0));

  // ---------- Output log typing ----------
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = (d) => `[${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}-${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
  const log = $("[data-log]");
  const logLines = log ? $$(".log__line", log) : [];
  const logTexts = logLines.map((l) => $(".msg", l).textContent);
  const now = Date.now();
  logLines.forEach((l, i) => ($(".ts", l).textContent = stamp(new Date(now + i * 1000))));
  logLines.forEach((l) => { l.classList.add("is-pending"); $(".msg", l).textContent = ""; });
  const typeLog = () => {
    let i = 0;
    const nextLine = () => {
      if (i >= logLines.length) return;
      const line = logLines[i], msg = $(".msg", line), full = logTexts[i];
      let c = 0;
      line.classList.replace("is-pending", "is-typing");
      const tick = () => {
        msg.textContent = full.slice(0, ++c);
        if (c < full.length) return setTimeout(tick, 16);
        line.classList.remove("is-typing");
        i++;
        setTimeout(nextLine, 260);
      };
      tick();
    };
    nextLine();
  };

  // ---------- Scroll reveal ----------
  const reveals = $$(".reveal");
  const onReveal = (el) => {
    el.classList.add("is-in");
    $$("[data-to]", el).forEach(countUp);
    if (log && el.contains(log)) typeLog();
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      onReveal(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => io.observe(el));

  // ---------- Behavior tree "debugger" ----------
  const bt = $(".bt");
  const btStatus = $(".bt-status");
  if (bt) {
    const steps = [
      ["sel", "run"], ["seqL", "run"], ["eqsL", "ok"], ["mvL", "fail"], ["seqL", "fail"],
      ["seqR", "run"], ["eqsR", "ok"], ["mvR", "ok"], ["seqR", "ok"], ["sel", "ok"],
    ];
    const names = {
      sel: "Selector", seqL: "Sequence (Attack)", seqR: "Sequence (Cover)",
      eqsL: "EQS Query (Find Target)", mvL: "Move To (Target)",
      eqsR: "EQS Query (Find Cover)", mvR: "Move To (Cover)",
    };
    const verb = { run: "Running", ok: "Succeeded", fail: "Failed" };
    let i = 0, timer = null;
    const tick = () => {
      if (i === 0) $$("[data-n]", bt).forEach((n) => n.classList.remove("run", "ok", "fail"));
      const [id, state] = steps[i];
      $$(`[data-n="${id}"]`, bt).forEach((n) => { n.classList.remove("run", "ok", "fail"); n.classList.add(state); });
      btStatus.textContent = `${verb[state]}: ${names[id]}`;
      i = (i + 1) % steps.length;
      timer = setTimeout(tick, i === 0 ? 2000 : 700);
    };
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !timer) tick();
      if (!en.isIntersecting) { clearTimeout(timer); timer = null; }
    }).observe(bt);
  }

  // ---------- Plugin filter ----------
  const filters = $$("[data-filter]");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    $$(".plug").forEach((p) => {
      const show = f === "all" || p.dataset.tags.split(" ").includes(f);
      p.hidden = !show;
      p.classList.remove("is-filtered-in");
      if (show) { void p.offsetWidth; p.classList.add("is-filtered-in"); }
    });
  }));

  // ---------- Sequencer clip selection ----------
  const clips = $$(".clip[data-pane]");
  const panes = $$(".seq-detail");
  const select = (id) => {
    clips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.pane === id)));
    panes.forEach((p) => (p.hidden = p.dataset.pane !== id));
  };
  if (clips.length) {
    clips.forEach((c) => c.addEventListener("click", () => select(c.dataset.pane)));
    select("ff");
  }
  // On narrow screens the timeline scrolls sideways; start at the recent end.
  const seqScroll = $(".seq-scroll");
  if (seqScroll) seqScroll.scrollLeft = seqScroll.scrollWidth;

  // ---------- Nav scrollspy ----------
  const links = $$(".nav__links a");
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-active"));
      byId.get(en.target.id)?.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
})();
