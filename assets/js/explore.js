/* ==========================================================================
   BARTON CREEK — Explore the Grounds
   Interactive estate map: pan / zoom / hotspots / drawer
   ========================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector(".explore-stage");
  var canvas = document.querySelector(".explore-canvas");
  if (!stage || !canvas) return;

  /* ------------------------------------------------------------------
     Hotspot data — positions are % of the 1600×1100 canvas
  ------------------------------------------------------------------ */
  var SPOTS = [
    {
      id: "resort", cat: "stay", x: 47.5, y: 44.5, name: "The Resort",
      title: "Omni Barton Creek Resort & Spa",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      desc: "The heart of the estate — 493 reimagined rooms and suites rising gently above the fairways, every window framing a long view of unbroken Hill Country.",
      facts: [["Rooms & Suites", "493"], ["Renovated", "2019"], ["Architecture", "Hill Country Modern"]]
    },
    {
      id: "spa", cat: "well", x: 41.5, y: 38.5, name: "Mokara Spa",
      title: "Mokara Spa",
      img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop",
      desc: "Thirteen thousand square feet of stillness — treatment rooms, a private spa pool deck, sauna and cold plunge, all scented with cedar and limestone.",
      facts: [["Treatment Rooms", "16"], ["Spa Pool Deck", "Adults only"], ["Signature", "Hill Country Stone Ritual"]]
    },
    {
      id: "foothills", cat: "golf", x: 30, y: 60, name: "Fazio Foothills",
      title: "Fazio Foothills",
      img: "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=1200&auto=format&fit=crop",
      desc: "Tom Fazio's masterwork of waterfalls, limestone caves and box canyons — the round that put Barton Creek on every golfer's map.",
      facts: [["Designer", "Tom Fazio"], ["Par", "72"], ["Yardage", "7,125"], ["Opened", "1986"]]
    },
    {
      id: "canyons", cat: "golf", x: 21, y: 30, name: "Fazio Canyons",
      title: "Fazio Canyons",
      img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1200&auto=format&fit=crop",
      desc: "Carved through rolling canyon land and the spring-fed bends of Short Springs Branch — wide, wild and endlessly green.",
      facts: [["Designer", "Tom Fazio"], ["Par", "72"], ["Yardage", "7,153"], ["Opened", "2000"]]
    },
    {
      id: "crenshaw", cat: "golf", x: 63, y: 66, name: "Coore Crenshaw",
      title: "Coore Crenshaw",
      img: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=1200&auto=format&fit=crop",
      desc: "A walkable, classical routing from Austin's own Ben Crenshaw and Bill Coore — golf the way the old masters intended it.",
      facts: [["Designers", "Coore & Crenshaw"], ["Par", "71"], ["Walkable", "Yes"], ["Opened", "1991"]]
    },
    {
      id: "academy", cat: "golf", x: 40, y: 56, name: "Golf Academy",
      title: "Barton Creek Golf Academy",
      img: "https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=1200&auto=format&fit=crop",
      desc: "Tour-level instruction, club fitting and a short-game village under the live oaks. Bring your handicap; leave it here.",
      facts: [["Practice Tee", "360 yards"], ["Coaching", "PGA professionals"], ["Fitting Studio", "TrackMan 4"]]
    },
    {
      id: "bobs", cat: "dine", x: 52.5, y: 39, name: "Bob's Steak & Chop House",
      title: "Bob's Steak & Chop House",
      img: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop",
      desc: "Prime cuts, glazed carrots the size of Texas, and a wine list as deep as the canyon. The classic steakhouse, done the Austin way.",
      facts: [["Dress", "Resort elegant"], ["Known for", "Prime tomahawk"], ["Hours", "5 – 10 pm"]]
    },
    {
      id: "salamander", cat: "dine", x: 44, y: 49, name: "Blind Salamander",
      title: "Blind Salamander Kitchen & Bar",
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
      desc: "Named for the rarest resident of the Edwards Aquifer — contemporary Hill Country plates, wood-fired and paired with long canyon views.",
      facts: [["Style", "New Texan"], ["Chef's Table", "8 seats"], ["Hours", "7 am – 9 pm"]]
    },
    {
      id: "overlook", cat: "dine", x: 56, y: 49.5, name: "The Overlook Terrace",
      title: "The Overlook Terrace",
      img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop",
      desc: "Sunset cocktails on the canyon rim. Mesquite-smoked snacks, frozen ranch waters, and the best golden hour in Travis County.",
      facts: [["Best at", "Golden hour"], ["Signature", "Ranch Water 78735"], ["Live music", "Fri & Sat"]]
    },
    {
      id: "infinity", cat: "well", x: 51, y: 33.5, name: "Infinity Edge Pool",
      title: "The Infinity Edge",
      img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop",
      desc: "An adults-only ribbon of water pouring into the horizon, with private cabanas, chilled towels and a quiet bar that finds you.",
      facts: [["Access", "Adults only"], ["Cabanas", "12 private"], ["Open", "Seasonal"]]
    },
    {
      id: "familypool", cat: "play", x: 54.5, y: 28, name: "Family Pool & Splash Pad",
      title: "Family Pool & Splash Pad",
      img: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1200&auto=format&fit=crop",
      desc: "Cannonballs encouraged. A resort pool, splash pad and snow-cone cart keep the young (and young at heart) busy until the stars come out.",
      facts: [["Splash Pad", "Zero entry"], ["Kid Zone", "Adjacent"], ["S'mores", "Nightly at the fire pits"]]
    },
    {
      id: "kidzone", cat: "play", x: 59, y: 31.5, name: "Barton's Kid Zone",
      title: "Barton's Kid Zone",
      img: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop",
      desc: "Crafts, games and junior naturalist programming under the oaks — supervised sessions so grown-ups can slip away to the spa.",
      facts: [["Ages", "4 – 12"], ["Sessions", "Daily"], ["Evening camp", "Fri & Sat"]]
    },
    {
      id: "tennis", cat: "play", x: 36.5, y: 31, name: "Tennis & Pickleball",
      title: "Racquet Club",
      img: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1200&auto=format&fit=crop",
      desc: "Eight lighted courts, a pickleball pavilion, and pros who will sort your serve before your morning coffee cools.",
      facts: [["Tennis Courts", "8 lighted"], ["Pickleball", "6 courts"], ["Clinics", "Daily"]]
    },
    {
      id: "trails", cat: "play", x: 70, y: 41, name: "Greenbelt Trailhead",
      title: "Hill Country Trails",
      img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop",
      desc: "Miles of private trail winding toward the Barton Creek greenbelt — limestone ledges, cypress shade, and spring-fed swimming holes.",
      facts: [["Trail Network", "9+ miles"], ["Guided hikes", "Sat mornings"], ["Wildlife", "White-tailed deer, painted bunting"]]
    },
    {
      id: "creek", cat: "play", x: 77.5, y: 56.5, name: "Barton Creek",
      title: "The Creek Itself",
      img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200&auto=format&fit=crop",
      desc: "Clear, cold and spring-fed — the waterway that named the land. Wade pools, skipping stones and cypress roots a century deep.",
      facts: [["Water", "Spring-fed"], ["Swimming holes", "3 on property"], ["Fly fishing", "Catch & release"]]
    },
    {
      id: "pavilion", cat: "stay", x: 60.5, y: 56, name: "Event Lawn & Pavilion",
      title: "Event Lawn & Pavilion",
      img: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=1200&auto=format&fit=crop",
      desc: "Hill Country weddings and starlit dinners on a lawn that rolls to the canyon edge, with the pavilion's cedar beams overhead.",
      facts: [["Capacity", "350 seated"], ["Ceremony view", "Due west"], ["Fire pits", "4"]]
    },
    {
      id: "residences", cat: "stay", x: 66, y: 23, name: "The Residences",
      title: "The Residences at Barton Creek",
      img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
      desc: "A rare collection of club residences and hillside estates — ownership on the most storied land in Austin.",
      facts: [["Club Residences", "28"], ["Estate Homesites", "40"], ["Status", "Now inviting inquiry"]],
      link: "residences.html"
    },
    {
      id: "lakeside", cat: "golf", x: 12.5, y: 13.5, name: "Palmer Lakeside · Lake Travis",
      title: "Palmer Lakeside",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      desc: "Arnold Palmer's lakeside escape above Lake Travis — a 40-minute drive into bluer air and wider water. Shuttle service daily.",
      facts: [["Designer", "Arnold Palmer"], ["Par", "71"], ["Yardage", "6,956"], ["Setting", "Lake Travis"]]
    }
  ];

  var CATS = { golf: "Golf", dine: "Dining", well: "Wellness", play: "Recreation", stay: "Resort & Stay" };

  /* ------------------------------------------------------------------
     Build pins
  ------------------------------------------------------------------ */
  var pinLayer = document.querySelector(".explore-pins");
  SPOTS.forEach(function (spot) {
    var pin = document.createElement("button");
    pin.className = "pin pin--" + spot.cat;
    pin.style.left = spot.x + "%";
    pin.style.top = spot.y + "%";
    pin.setAttribute("aria-label", spot.name);
    pin.dataset.id = spot.id;
    pin.dataset.cat = spot.cat;
    pin.innerHTML = '<span class="pin__dot"></span><span class="pin__label">' + spot.name + "</span>";
    pinLayer.appendChild(pin);
  });

  /* ------------------------------------------------------------------
     Pan & zoom
  ------------------------------------------------------------------ */
  var view = { x: 0, y: 0, scale: 1 };
  var target = { x: 0, y: 0, scale: 1 };
  var MIN_SCALE = 0.7, MAX_SCALE = 2.6;
  var dragging = false, lastPt = null, moved = 0;

  function clampView() {
    var w = 1600 * target.scale, h = 1100 * target.scale;
    var maxX = Math.max(0, (w - window.innerWidth) / 2) + 140 * target.scale;
    var maxY = Math.max(0, (h - window.innerHeight) / 2) + 140 * target.scale;
    target.x = Math.max(-maxX, Math.min(maxX, target.x));
    target.y = Math.max(-maxY, Math.min(maxY, target.y));
    target.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, target.scale));
  }

  function render() {
    view.x += (target.x - view.x) * 0.12;
    view.y += (target.y - view.y) * 0.12;
    view.scale += (target.scale - view.scale) * 0.12;
    canvas.style.transform =
      "translate3d(" + view.x + "px," + view.y + "px,0) scale(" + view.scale + ")";
    requestAnimationFrame(render);
  }
  render();

  function pointerDown(e) {
    dragging = true;
    moved = 0;
    lastPt = { x: e.clientX, y: e.clientY };
    stage.classList.add("is-dragging");
  }

  function pointerMove(e) {
    if (!dragging || !lastPt) return;
    var dx = e.clientX - lastPt.x, dy = e.clientY - lastPt.y;
    moved += Math.abs(dx) + Math.abs(dy);
    target.x += dx;
    target.y += dy;
    lastPt = { x: e.clientX, y: e.clientY };
    clampView();
    hideHint();
  }

  function pointerUp() {
    dragging = false;
    lastPt = null;
    stage.classList.remove("is-dragging");
  }

  stage.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);

  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? -0.16 : 0.16;
    target.scale *= 1 + delta;
    clampView();
    hideHint();
  }, { passive: false });

  // Pinch zoom
  var pinchDist = null;
  stage.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      var d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchDist) {
        target.scale *= d / pinchDist;
        clampView();
      }
      pinchDist = d;
    }
  }, { passive: false });
  stage.addEventListener("touchend", function () { pinchDist = null; });

  document.querySelectorAll("[data-zoom]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      target.scale *= btn.dataset.zoom === "in" ? 1.3 : 0.77;
      clampView();
      hideHint();
    });
  });

  /* ------------------------------------------------------------------
     Drawer
  ------------------------------------------------------------------ */
  var drawer = document.querySelector(".explore-drawer");
  var dImg = drawer.querySelector(".explore-drawer__media img");
  var dCat = drawer.querySelector(".explore-drawer__cat");
  var dTitle = drawer.querySelector(".explore-drawer__title");
  var dDesc = drawer.querySelector(".explore-drawer__desc");
  var dFacts = drawer.querySelector(".explore-drawer__facts");
  var dLink = drawer.querySelector(".explore-drawer__link");
  var activePin = null;

  function openSpot(spot, pin) {
    if (activePin) activePin.classList.remove("is-active");
    activePin = pin;
    pin.classList.add("is-active");

    dImg.src = spot.img;
    dImg.alt = spot.title;
    dCat.textContent = CATS[spot.cat] || "";
    dTitle.textContent = spot.title;
    dDesc.textContent = spot.desc;
    dFacts.innerHTML = spot.facts.map(function (f) {
      return "<li><span>" + f[0] + "</span><span>" + f[1] + "</span></li>";
    }).join("");
    if (spot.link) {
      dLink.href = spot.link;
      dLink.style.display = "";
    } else {
      dLink.href = "contact.html";
      dLink.style.display = "";
    }
    drawer.classList.add("is-open");

    // Ease the map so the pin sits in the visible area left of the drawer
    var px = (spot.x / 100 - 0.5) * 1600 * target.scale;
    var py = (spot.y / 100 - 0.5) * 1100 * target.scale;
    var drawerW = Math.min(440, window.innerWidth * 0.92);
    target.x = -px - (window.innerWidth > 760 ? drawerW / 2 - 40 : 0);
    target.y = -py;
    clampView();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    if (activePin) activePin.classList.remove("is-active");
    activePin = null;
  }

  pinLayer.addEventListener("click", function (e) {
    var pin = e.target.closest(".pin");
    if (!pin || moved > 8) return;
    var spot = SPOTS.filter(function (s) { return s.id === pin.dataset.id; })[0];
    if (spot) openSpot(spot, pin);
  });

  drawer.querySelector(".explore-drawer__close").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ------------------------------------------------------------------
     Filters
  ------------------------------------------------------------------ */
  document.querySelectorAll(".explore-filters .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".explore-filters .chip").forEach(function (c) {
        c.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      var f = chip.dataset.cat;
      document.querySelectorAll(".pin").forEach(function (pin) {
        pin.classList.toggle("is-dim", f !== "all" && pin.dataset.cat !== f);
      });
      closeDrawer();
    });
  });

  /* ------------------------------------------------------------------
     Intro overlay & hint
  ------------------------------------------------------------------ */
  var intro = document.querySelector(".explore-intro");
  var hint = document.querySelector(".explore-hint");
  var hintShown = false;

  function hideHint() {
    if (hint && hintShown) {
      hint.classList.remove("is-visible");
      hintShown = false;
    }
  }

  document.querySelectorAll("[data-enter-map]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      intro.classList.add("is-hidden");
      target.scale = 1.12;
      setTimeout(function () {
        if (hint) {
          hint.classList.add("is-visible");
          hintShown = true;
          setTimeout(hideHint, 3800);
        }
      }, 900);
    });
  });

  // Gentle idle drift before first interaction
  var idleT = 0;
  var idleDrift = setInterval(function () {
    if (dragging || drawer.classList.contains("is-open")) return;
    idleT += 0.016;
    if (!intro.classList.contains("is-hidden")) {
      target.x = Math.sin(idleT * 0.4) * 30;
      target.y = Math.cos(idleT * 0.3) * 20;
    }
  }, 16);
  stage.addEventListener("pointerdown", function () { clearInterval(idleDrift); }, { once: true });
})();
