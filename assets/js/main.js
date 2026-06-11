/* ==========================================================================
   BARTON CREEK — An Omni Resort & Spa
   Interaction engine
   ========================================================================== */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.remove("no-js");

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) docEl.classList.add("reduced");

  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = typeof window.ScrollTrigger !== "undefined";
  if (hasGsap && hasST) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------
     Lenis smooth scroll
  ------------------------------------------------------------------ */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !REDUCED) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    if (hasGsap && hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }

  function scrollStop() { if (lenis) lenis.stop(); docEl.style.overflow = "hidden"; }
  function scrollStart() { if (lenis) lenis.start(); docEl.style.overflow = ""; }

  /* ------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------ */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Split element text into masked lines for reveal animations. */
  function splitLines(el) {
    if (el.dataset.split === "done") return qsa(".line-inner", el);
    var nodes = Array.prototype.slice.call(el.childNodes);
    var words = [];
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) { words.push(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.style.display = "inline-block";
          w.textContent = chunk;
          words.push(w);
        });
      } else if (node.nodeType === 1) {
        var clone = node.cloneNode(true);
        clone.style.display = "inline-block";
        words.push(clone);
      }
    });
    el.textContent = "";
    words.forEach(function (w) { el.appendChild(w); });

    // Group words by rendered line
    var lineMap = [];
    var currentTop = null;
    Array.prototype.slice.call(el.children).forEach(function (w) {
      var top = w.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) > 4) {
        currentTop = top;
        lineMap.push([]);
      }
      lineMap[lineMap.length - 1].push(w);
    });

    var inners = [];
    el.textContent = "";
    el.classList.add("split-lines");
    lineMap.forEach(function (lineWords) {
      var line = document.createElement("span");
      line.className = "line";
      var inner = document.createElement("span");
      inner.className = "line-inner";
      lineWords.forEach(function (w, i) {
        w.style.display = "";
        inner.appendChild(w);
        if (i < lineWords.length - 1) inner.appendChild(document.createTextNode(" "));
      });
      line.appendChild(inner);
      el.appendChild(line);
      el.appendChild(document.createTextNode(" "));
      inners.push(inner);
    });
    el.dataset.split = "done";
    return inners;
  }

  /* ------------------------------------------------------------------
     Page veil — entrance + internal link transitions
  ------------------------------------------------------------------ */
  var veil = qs(".veil");

  function veilOut() {
    if (!veil) return;
    var wasVeiled = docEl.classList.contains("veiling");
    try { sessionStorage.removeItem("bc-veil"); } catch (e) {}
    if (!wasVeiled) return;
    if (!hasGsap || REDUCED) { docEl.classList.remove("veiling"); return; }
    gsap.set(veil, { y: "0%" });
    gsap.to(veil, {
      y: "-101%", duration: 0.9, ease: "power4.inOut", delay: 0.08,
      onStart: function () { docEl.classList.remove("veiling"); },
      onComplete: function () { gsap.set(veil, { clearProps: "all" }); }
    });
    gsap.fromTo(qs(".veil__mark"), { opacity: 1 }, { opacity: 0, duration: 0.4, delay: 0.15 });
  }

  function bindTransitions() {
    if (!veil || !hasGsap || REDUCED) return;
    qsa('a[href]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("#") === 0 || /^(http|mailto:|tel:)/.test(href)) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        try { sessionStorage.setItem("bc-veil", "1"); } catch (err) {}
        gsap.set(veil, { y: "101%" });
        gsap.set(qs(".veil__mark"), { opacity: 0 });
        gsap.to(qs(".veil__mark"), { opacity: 1, duration: 0.35, delay: 0.3 });
        gsap.to(veil, {
          y: "0%",
          duration: 0.75,
          ease: "power4.inOut",
          onComplete: function () { window.location.href = href; }
        });
      });
    });
    // Restore when navigating back from bfcache
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) gsap.set(veil, { y: "101%" });
    });
  }

  /* ------------------------------------------------------------------
     Preloader (home) — counts, reveals brand, lifts curtain
  ------------------------------------------------------------------ */
  function initPreloader(done) {
    var pre = qs(".preloader");
    if (!pre) { done(); return; }
    if (!hasGsap || REDUCED || sessionStorage.getItem("bc-visited")) {
      pre.parentNode.removeChild(pre);
      done();
      return;
    }
    sessionStorage.setItem("bc-visited", "1");
    scrollStop();

    var count = { v: 0 };
    var countEl = qs(".preloader__count", pre);
    var barEl = qs(".preloader__bar i", pre);
    var letters = qsa(".preloader__word span", pre);
    var tl = gsap.timeline({
      onComplete: function () {
        pre.parentNode.removeChild(pre);
        scrollStart();
        done();
      }
    });

    tl.to(letters, { opacity: 1, y: 0, duration: 0.9, stagger: 0.045, ease: "power3.out" }, 0.15)
      .to(qs(".preloader__sub", pre), { opacity: 1, duration: 0.7 }, 0.7)
      .to(qs(".preloader__mark", pre), { rotate: 360, duration: 2.4, ease: "power1.inOut", transformOrigin: "50% 50%" }, 0)
      .to(count, {
        v: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: function () {
          var n = Math.round(count.v);
          if (countEl) countEl.textContent = (n < 10 ? "0" : "") + n;
          if (barEl) barEl.style.width = n + "%";
        }
      }, 0.2)
      .to(pre, { yPercent: -100, duration: 1.0, ease: "power4.inOut" }, "+=0.25");
  }

  /* ------------------------------------------------------------------
     Header behavior
  ------------------------------------------------------------------ */
  function initHeader() {
    var header = qs(".site-header");
    if (!header) return;
    var lastY = 0;
    var threshold = window.innerHeight * 0.6;

    function onScroll(y) {
      header.classList.toggle("is-solid", y > threshold);
      if (y > lastY && y > window.innerHeight && Math.abs(y - lastY) > 6) {
        header.classList.add("is-hidden");
      } else if (y < lastY || y < 120) {
        header.classList.remove("is-hidden");
      }
      lastY = y;
    }

    if (lenis) {
      lenis.on("scroll", function (e) { onScroll(e.scroll); });
    } else {
      window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true });
    }
    onScroll(window.scrollY);
  }

  /* ------------------------------------------------------------------
     Full-screen menu
  ------------------------------------------------------------------ */
  function initMenu() {
    var menu = qs(".menu");
    var openBtn = qs(".menu-toggle");
    var closeBtn = qs(".menu-close");
    if (!menu || !openBtn) return;

    var links = qsa(".menu__link", menu);
    var previews = qsa(".menu__preview img", menu);
    var open = false;

    function setOpen(state) {
      open = state;
      openBtn.setAttribute("aria-expanded", String(state));
      if (state) {
        menu.classList.add("is-open");
        scrollStop();
        if (hasGsap && !REDUCED) {
          gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power4.inOut" });
          gsap.fromTo(links, { y: 64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.055, delay: 0.35, ease: "power4.out", overwrite: true });
          gsap.fromTo(qsa(".menu__meta, .menu__preview", menu), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.55, stagger: 0.08, ease: "power3.out", overwrite: true });
        } else {
          menu.style.clipPath = "inset(0 0 0% 0)";
        }
      } else {
        if (hasGsap && !REDUCED) {
          gsap.to(menu, {
            clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut",
            onComplete: function () { menu.classList.remove("is-open"); scrollStart(); }
          });
        } else {
          menu.style.clipPath = "inset(0 0 100% 0)";
          menu.classList.remove("is-open");
          scrollStart();
        }
      }
    }

    openBtn.addEventListener("click", function () { setOpen(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });

    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        var id = link.getAttribute("data-preview");
        previews.forEach(function (img) {
          img.classList.toggle("is-active", img.getAttribute("data-preview") === id);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals
  ------------------------------------------------------------------ */
  function initReveals() {
    if (!hasGsap || !hasST || REDUCED) return;

    // Masked line reveals on serif headings
    qsa("[data-split]").forEach(function (el) {
      var inners = splitLines(el);
      gsap.to(inners, {
        y: 0,
        duration: 1.25,
        stagger: 0.09,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });

    // Fade-up reveals
    qsa("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: parseFloat(el.dataset.reveal) || 0,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    // Clip-mask image reveals
    qsa("[data-mask]").forEach(function (el) {
      gsap.to(el, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.4,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 84%", once: true }
      });
    });

    // Parallax media
    qsa(".media--parallax > img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7 }, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // Hero media slow drift
    var heroImg = qs(".hero__media img, .page-hero__media img");
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.12, yPercent: 0 }, {
        scale: 1.0, yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: heroImg.closest(".hero, .page-hero"), start: "top top", end: "bottom top", scrub: true }
      });
    }

    // CTA parallax
    qsa(".cta__media img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -9 }, {
        yPercent: 9, ease: "none",
        scrollTrigger: { trigger: img.closest(".cta"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ------------------------------------------------------------------
     Hero entrance (after preloader)
  ------------------------------------------------------------------ */
  function heroEntrance() {
    var lines = qsa("[data-hero-line]");
    var fades = qsa("[data-hero-fade]");
    if (!hasGsap || REDUCED) {
      lines.concat(fades).forEach(function (el) { el.style.opacity = "1"; });
      return;
    }
    var tl = gsap.timeline();
    var hero = qs(".hero, .page-hero");
    if (hero) {
      var media = qs(".hero__media img, .page-hero__media img", hero);
      if (media) tl.fromTo(media, { scale: 1.22 }, { scale: 1.12, duration: 2.2, ease: "power3.out" }, 0);
    }
    lines.forEach(function (el, i) {
      var inners = splitLines(el);
      el.style.opacity = "1";
      tl.to(inners, { y: 0, duration: 1.4, stagger: 0.1, ease: "power4.out" }, 0.25 + i * 0.18);
    });
    if (fades.length) {
      tl.fromTo(fades, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" }, 0.85);
    }
  }

  /* ------------------------------------------------------------------
     Marquee — velocity-reactive loop
  ------------------------------------------------------------------ */
  function initMarquee() {
    qsa(".marquee").forEach(function (marquee) {
      var track = qs(".marquee__track", marquee);
      if (!track) return;
      // Duplicate content until comfortably wider than 2x viewport
      var base = track.innerHTML;
      while (track.scrollWidth < window.innerWidth * 2.5) {
        track.innerHTML += base;
      }
      if (!hasGsap || REDUCED) return;

      var x = 0;
      var speed = marquee.dataset.speed ? parseFloat(marquee.dataset.speed) : 0.55;
      var boost = 0;
      var half = track.scrollWidth / 2;

      gsap.ticker.add(function () {
        x -= speed + boost;
        boost *= 0.93;
        if (-x >= half) x += half;
        track.style.transform = "translate3d(" + x + "px,0,0)";
      });

      if (lenis) {
        lenis.on("scroll", function (e) {
          boost = Math.min(Math.abs(e.velocity) * 0.12, 6);
        });
      }
    });
  }

  /* ------------------------------------------------------------------
     Pinned horizontal scroll panel
  ------------------------------------------------------------------ */
  function initHScroll() {
    var section = qs(".hscroll");
    if (!section || !hasGsap || !hasST || REDUCED) return;
    if (window.matchMedia("(max-width: 860px)").matches) return;

    var track = qs(".hscroll__track", section);
    var progress = qs(".hscroll__progress i", section);
    var getDistance = function () { return track.scrollWidth - window.innerWidth; };

    gsap.to(track, {
      x: function () { return -getDistance(); },
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: function () { return "+=" + getDistance(); },
        pin: qs(".hscroll__pin", section),
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (progress) progress.style.transform = "scaleX(" + self.progress + ")";
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Counters
  ------------------------------------------------------------------ */
  function initCounters() {
    qsa("[data-count]").forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var decimals = el.dataset.count.indexOf(".") > -1 ? 1 : 0;
      function fmt(v) {
        var s = v.toFixed(decimals);
        return decimals ? s : Number(s).toLocaleString("en-US");
      }
      if (!hasGsap || !hasST || REDUCED) { el.textContent = fmt(target); return; }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 2,
        ease: "power2.out",
        onUpdate: function () { el.textContent = fmt(obj.v); },
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  /* ------------------------------------------------------------------
     Custom cursor
  ------------------------------------------------------------------ */
  function initCursor() {
    var cursor = qs(".cursor");
    if (!cursor || REDUCED) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    var label = qs(".cursor__label", cursor);
    var x = -100, y = -100, cx = -100, cy = -100;
    var visible = false;

    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!visible) { visible = true; cursor.style.opacity = "1"; cx = x; cy = y; }
    });
    document.addEventListener("mouseleave", function () {
      visible = false; cursor.style.opacity = "0";
    });

    function loop() {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(loop);
    }
    loop();

    function bindHoverables() {
      qsa("a, button, .chip, [data-cursor]").forEach(function (el) {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = "1";
        el.addEventListener("mouseenter", function () {
          var text = el.getAttribute("data-cursor");
          if (text) {
            label.textContent = text;
            cursor.classList.add("has-label");
          } else {
            cursor.classList.add("is-hover");
          }
        });
        el.addEventListener("mouseleave", function () {
          cursor.classList.remove("is-hover", "has-label");
        });
      });
    }
    bindHoverables();
  }

  /* ------------------------------------------------------------------
     Accordion
  ------------------------------------------------------------------ */
  function initAccordion() {
    qsa(".accordion__item").forEach(function (item) {
      var trigger = qs(".accordion__trigger", item);
      var panel = qs(".accordion__panel", item);
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        // close siblings
        qsa(".accordion__item.is-open", item.parentElement).forEach(function (sib) {
          if (sib === item) return;
          sib.classList.remove("is-open");
          qs(".accordion__panel", sib).style.height = "0px";
          qs(".accordion__trigger", sib).setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.height = isOpen ? "0px" : panel.scrollHeight + "px";
      });
    });
  }

  /* ------------------------------------------------------------------
     Forms (demo shell — simulated submit)
  ------------------------------------------------------------------ */
  function initForms() {
    qsa("form[data-demo]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        qsa("[required]", form).forEach(function (input) {
          var field = input.closest(".field") || input.closest(".check");
          var bad = !input.value.trim() || (input.type === "email" && !/^\S+@\S+\.\S+$/.test(input.value)) || (input.type === "checkbox" && !input.checked);
          if (field) field.classList.toggle("has-error", bad);
          if (bad) valid = false;
        });
        if (!valid) return;
        var wrap = form.closest(".form-wrap");
        if (wrap) {
          wrap.classList.add("is-sent");
          if (hasGsap && !REDUCED) {
            gsap.fromTo(qs(".form__success", wrap), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
          }
        }
      });
      qsa("input, select, textarea", form).forEach(function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field") || input.closest(".check");
          if (field) field.classList.remove("has-error");
        });
      });
    });

    // Newsletter micro-interaction
    qsa("form[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = qs("input", form);
        if (!input.value.trim() || !/^\S+@\S+\.\S+$/.test(input.value)) {
          input.style.borderColor = "var(--c-error)";
          return;
        }
        input.value = "";
        input.placeholder = "Welcome to the list — see you on the creek.";
      });
    });
  }

  /* ------------------------------------------------------------------
     Gallery — filters + lightbox
  ------------------------------------------------------------------ */
  function initGallery() {
    var grid = qs("[data-gallery]");
    if (!grid) return;

    var items = qsa(".gallery-item", grid);
    var chips = qsa("[data-filter]");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var f = chip.dataset.filter;
        items.forEach(function (item) {
          var show = f === "all" || item.dataset.cat === f;
          item.classList.toggle("is-hidden", !show);
        });
        if (hasGsap && !REDUCED) {
          gsap.fromTo(items.filter(function (i) { return !i.classList.contains("is-hidden"); }),
            { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.04, ease: "power3.out", overwrite: true });
        }
        if (hasST) ScrollTrigger.refresh();
      });
    });

    // Lightbox
    var lb = qs(".lightbox");
    if (!lb) return;
    var lbImg = qs(".lightbox__img", lb);
    var lbCap = qs(".lightbox__caption-text", lb);
    var lbCount = qs(".lightbox__count", lb);
    var current = 0;

    function visibleItems() {
      return items.filter(function (i) { return !i.classList.contains("is-hidden"); });
    }

    function show(idx) {
      var vis = visibleItems();
      if (!vis.length) return;
      current = (idx + vis.length) % vis.length;
      var item = vis[current];
      var img = qs("img", item);
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt || "";
      if (lbCap) lbCap.textContent = item.dataset.caption || img.alt || "";
      if (lbCount) lbCount.textContent = (current + 1) + " / " + vis.length;
    }

    function open(idx) {
      show(idx);
      lb.classList.add("is-open");
      scrollStop();
    }

    function close() {
      lb.classList.remove("is-open");
      scrollStart();
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        open(visibleItems().indexOf(item));
      });
    });

    qs(".lightbox__close", lb).addEventListener("click", close);
    qs(".lightbox__btn--prev", lb).addEventListener("click", function () { show(current - 1); });
    qs(".lightbox__btn--next", lb).addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ------------------------------------------------------------------
     Ambient soundscape (WebAudio — Hill Country air)
  ------------------------------------------------------------------ */
  var Ambient = (function () {
    var ctx = null, master = null, nodes = [], running = false;

    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // Wind — filtered noise, slowly breathing
      var bufferSize = ctx.sampleRate * 4;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      var last = 0;
      for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 420;
      var noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;
      noise.connect(noiseFilter).connect(noiseGain).connect(master);
      noise.start();
      nodes.push(noise);

      var windLfo = ctx.createOscillator();
      windLfo.frequency.value = 0.07;
      var windLfoGain = ctx.createGain();
      windLfoGain.gain.value = 180;
      windLfo.connect(windLfoGain).connect(noiseFilter.frequency);
      windLfo.start();
      nodes.push(windLfo);

      // Warm pad — soft detuned triad, very low
      [110, 164.81, 220].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = i === 1 ? 4 : -3;
        var g = ctx.createGain();
        g.gain.value = 0.045;
        var lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.013;
        var lfoG = ctx.createGain();
        lfoG.gain.value = 0.02;
        lfo.connect(lfoG).connect(g.gain);
        osc.connect(g).connect(master);
        osc.start(); lfo.start();
        nodes.push(osc, lfo);
      });

      // Distant songbird — occasional gentle chirps
      function chirp() {
        if (!running) return;
        var t = ctx.currentTime + 0.05;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = "sine";
        var base = 2600 + Math.random() * 900;
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.07);
        osc.frequency.exponentialRampToValueAtTime(base * 0.92, t + 0.16);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.012 + Math.random() * 0.008, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.3);
        setTimeout(chirp, 2600 + Math.random() * 7000);
      }
      setTimeout(chirp, 1800);
    }

    return {
      start: function () {
        if (!ctx) { try { build(); } catch (e) { return false; } }
        if (ctx.state === "suspended") ctx.resume();
        running = true;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.62, ctx.currentTime + 2.2);
        return true;
      },
      stop: function () {
        if (!ctx) return;
        running = false;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
      },
      isRunning: function () { return running; }
    };
  })();

  function initSound() {
    var toggle = qs(".sound-toggle");
    if (!toggle) return;
    var labelEl = qs(".sound-toggle__label", toggle);

    function setState(on) {
      toggle.classList.toggle("is-on", on);
      if (labelEl) labelEl.textContent = on ? "Sound on" : "Sound off";
      sessionStorage.setItem("bc-sound", on ? "1" : "0");
    }

    toggle.addEventListener("click", function () {
      if (Ambient.isRunning()) { Ambient.stop(); setState(false); }
      else { if (Ambient.start()) setState(true); }
    });

    // Optional explicit entry buttons (explore intro)
    qsa("[data-sound-start]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.dataset.soundStart === "on") { if (Ambient.start()) setState(true); }
        else setState(false);
      });
    });

    setState(false);
  }

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  function initYear() {
    qsa("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
    qsa("[data-totop]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  function boot() {
    initHeader();
    initMenu();
    initMarquee();
    initHScroll();
    initCounters();
    initCursor();
    initAccordion();
    initForms();
    initGallery();
    initSound();
    initYear();
    bindTransitions();

    initPreloader(function () {
      heroEntrance();
      initReveals();
      if (hasST) ScrollTrigger.refresh();
    });

    // If no preloader on this page, reveal via veil
    if (!qs(".preloader")) veilOut();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
