/* =====================================================
   KAYLEE SWEET 17TH  –  script.js
   ===================================================== */

/* =====================================================
   WELCOME OVERLAY — dismiss on button click, then start audio
   ===================================================== */
(function initWelcomeOverlay() {
  var overlay = document.getElementById('welcome-overlay');
  var btn     = document.getElementById('welcome-btn');
  if (!overlay || !btn) return;

  btn.addEventListener('click', function () {
    overlay.classList.add('hidden');
    // Remove from DOM after fade-out
    overlay.addEventListener('transitionend', function () {
      overlay.remove();
    }, { once: true });
    // Start audio — guaranteed user gesture at this point
    if (typeof window.startAudioAfterOverlay === 'function') {
      window.startAudioAfterOverlay();
    }
  });
})();

/* =====================================================
   GALLERY CONFIG
   ─────────────────────────────────────────────────────
   Tambahkan nama file foto party / makan-makan di sini.
   Contoh:
     "DSC01234.JPG",
     "DSC01235.JPG",

   Semua file harus ada di folder  Assets/
   ===================================================== */
const GALLERY_PHOTOS = [
  "DSC01523.JPG",
  "DSC01529.JPG",
  "DSC01543.JPG",
  "DSC01552.JPG",
  "DSC01557.JPG",
  "DSC01567.JPG",
];

/* =====================================================
   DYNAMIC GALLERY INJECTION
   ===================================================== */
(function injectGalleryPhotos() {
  const grid   = document.getElementById('gallery-grid');
  const emojis = ['🎉', '🌸', '✨', '💖', '⭐', '🎀', '💫', '🌟', '🥳', '💕'];

  GALLERY_PHOTOS.forEach(function (filename, i) {
    const card = document.createElement('div');
    card.className = 'photo-card reveal';

    const img = document.createElement('img');
    img.src     = 'Assets/' + filename;
    img.alt     = 'Sweet 17 Moment';
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      card.classList.add('photo-missing');
    });

    const caption = document.createElement('div');
    caption.className   = 'photo-caption';
    caption.textContent = emojis[i % emojis.length] + ' Sweet 17';

    card.appendChild(img);
    grid.appendChild(card);
  });
})();

/* =====================================================
   SCROLL REVEAL  —  IntersectionObserver + directional stagger
   ===================================================== */
(function initReveal() {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  // Section headers: alternate slide-from-left / slide-from-right
  document.querySelectorAll('.section-header').forEach(function (el, i) {
    el.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
    io.observe(el);
  });

  // Trait cards: staggered rise from bottom
  document.querySelectorAll('.trait-card').forEach(function (el, i) {
    el.classList.add('from-up');
    el.style.setProperty('--delay', (i * 0.09) + 's');
    io.observe(el);
  });

  // Photo cards: alternate left / right with stagger
  document.querySelectorAll('.photo-card').forEach(function (el, i) {
    el.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
    el.style.setProperty('--delay', (i * 0.07) + 's');
    io.observe(el);
  });

  // Message cards: staggered pop-in
  document.querySelectorAll('.message-card').forEach(function (el, i) {
    el.classList.add('pop');
    el.style.setProperty('--delay', (i % 5 * 0.07) + 's');
    io.observe(el);
  });

  // About letter card
  document.querySelectorAll('.about-letter').forEach(function (el) {
    el.classList.add('from-up');
    io.observe(el);
  });

  // Drive section + footer
  document.querySelectorAll('.drive-section, .footer-content').forEach(function (el) {
    el.classList.add('from-up');
    io.observe(el);
  });
})();

/* =====================================================
   AUDIO PLAYER
   ===================================================== */
(function initAudioPlayer() {
  var audio        = document.getElementById('audio');
  var playBtn      = document.getElementById('play-btn');
  var muteBtn      = document.getElementById('mute-btn');
  var volSlider    = document.getElementById('volume-slider');

  var isPlaying = false;
  var isMuted   = false;
  var lastVol   = 0.7;

  var TARGET_VOL = 0.7;
  audio.volume    = 0;
  volSlider.value = TARGET_VOL;

  // Set src via JS (avoids IDM popup)
  audio.src = 'Assets/Be Like a Woman.mp3';
  audio.currentTime = 20;     // start at 0:20

  // Fade volume 0 → TARGET_VOL over 3 seconds using rAF
  function fadeInVolume() {
    var start = null;
    var FADE_MS = 3000;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / FADE_MS, 1);
      audio.volume = parseFloat((progress * TARGET_VOL).toFixed(4));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Audio starts only after welcome overlay is dismissed (user gesture required by browsers)
  window.startAudioAfterOverlay = function () {
    audio.play().then(function () {
      isPlaying = true;
      fadeInVolume();
      syncPlayBtn();
    }).catch(function () {
      audio.volume = TARGET_VOL;
      isPlaying = false;
      syncPlayBtn();
    });
  };

  /* ── Update button labels ── */
  function syncPlayBtn() {
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  function syncMuteBtn() {
    var v = audio.volume;
    if (isMuted || v === 0) {
      muteBtn.textContent = '🔇';
      muteBtn.setAttribute('aria-label', 'Unmute');
    } else if (v < 0.5) {
      muteBtn.textContent = '🔉';
      muteBtn.setAttribute('aria-label', 'Mute');
    } else {
      muteBtn.textContent = '🔊';
      muteBtn.setAttribute('aria-label', 'Mute');
    }
  }

  /* ── Play / Pause ── */
  playBtn.addEventListener('click', function () {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      var promise = audio.play();
      if (promise !== undefined) {
        promise.catch(function () {});
      }
      isPlaying = true;
    }
    syncPlayBtn();
  });

  /* ── Mute toggle ── */
  muteBtn.addEventListener('click', function () {
    if (isMuted) {
      isMuted       = false;
      audio.volume  = lastVol > 0 ? lastVol : 0.7;
      volSlider.value = audio.volume;
    } else {
      lastVol       = audio.volume;
      isMuted       = true;
      audio.volume  = 0;
      volSlider.value = 0;
    }
    syncMuteBtn();
  });

  /* ── Volume slider ── */
  volSlider.addEventListener('input', function () {
    var val    = parseFloat(volSlider.value);
    audio.volume = val;
    if (val > 0) {
      isMuted = false;
      lastVol = val;
    } else {
      isMuted = true;
    }
    syncMuteBtn();
  });

  /* ── Sync state if audio ends unexpectedly (loop attr handles looping) ── */
  audio.addEventListener('ended', function () {
    isPlaying = false;
    syncPlayBtn();
  });
  audio.addEventListener('pause', function () {
    if (!audio.ended) {
      isPlaying = false;
      syncPlayBtn();
    }
  });
  audio.addEventListener('play', function () {
    isPlaying = true;
    syncPlayBtn();
  });
})();

/* =====================================================
   CONFETTI  (canvas-based particle system)
   ===================================================== */
(function initConfetti() {
  var canvas = document.getElementById('confetti-canvas');
  var ctx    = canvas.getContext('2d');

  var COLORS = [
    '#FF69B4', '#FFD700', '#FF4500',
    '#00BFFF', '#00E5A3', '#C084FC',
    '#FF1493', '#FFFFFF'
  ];
  var SHAPES = ['circle', 'rect', 'triangle'];

  var particles    = [];
  var frameCount   = 0;
  var MAX_FRAMES   = 320;   // ~5 s of spawning at 60 fps
  var rafId        = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function newParticle() {
    return {
      x:       rand(0, canvas.width),
      y:       rand(-20, -2),
      size:    rand(6, 14),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      shape:   SHAPES[Math.floor(Math.random() * SHAPES.length)],
      vx:      rand(-2, 2),
      vy:      rand(2.5, 5),
      angle:   rand(0, Math.PI * 2),
      spin:    rand(-0.1, 0.1),
      opacity: 1
    };
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle   = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    var s = p.size;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'rect') {
      ctx.fillRect(-s / 2, -s / 4, s, s / 2);
    } else {
      // triangle
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.lineTo(-s / 2, s / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    if (frameCount <= MAX_FRAMES) {
      for (var i = 0; i < 5; i++) {
        particles.push(newParticle());
      }
    }

    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;

      if (p.y > canvas.height - 80) {
        p.opacity -= 0.025;
      }

      if (p.opacity <= 0.04 || p.y > canvas.height + 20) {
        particles.splice(j, 1);
      } else {
        drawParticle(p);
      }
    }

    if (particles.length > 0 || frameCount <= MAX_FRAMES) {
      rafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.addEventListener('load', function () {
    rafId = requestAnimationFrame(tick);
  });
})();
