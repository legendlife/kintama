/**
 * KINTAMA PORTFOLIO — CORE SCRIPT
 * Features:
 *  - Canvas-based particle galaxy & ambient star field (matches screenshot curve)
 *  - 3D CSS Cube cluster interactive mouse parallax / tilt
 *  - Terminal command & email clipboard copy
 *  - Working contact form with validation & extensible submission
 *  - Mobile navigation drawer
 */

(function () {
  'use strict';

  // =========================================================================
  // 0. CUSTOM SYSTEM PRELOADER
  // =========================================================================
  const preloader = document.getElementById('site-preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  const preloaderPct = document.getElementById('preloader-pct');
  const preloaderTask = document.getElementById('preloader-task');

  function initPreloader(onCompleteCallback) {
    if (!preloader) {
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    const TASKS = [
      { at: 0, text: 'BOOT: ACCRETION FIELD...' },
      { at: 25, text: 'EVALUATING BEZIER HORNER MATRIX...' },
      { at: 55, text: 'CALIBRATING 3D PERSPECTIVE...' },
      { at: 82, text: 'INITIALIZING TERMINAL ENGINE...' },
      { at: 100, text: 'SYSTEM OPERATIONAL // READY' }
    ];

    const isMobile = window.innerWidth < 768;
    const duration = isMobile ? 1000 : 1350; // fast 1.0s boot on mobile, 1.35s on desktop
    const startTime = performance.now();

    function updateTaskText(pct) {
      if (!preloaderTask) return;
      for (let i = TASKS.length - 1; i >= 0; i--) {
        if (pct >= TASKS[i].at) {
          preloaderTask.textContent = TASKS[i].text;
          break;
        }
      }
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease out for responsive acceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentPct = Math.floor(eased * 100);

      if (preloaderFill) preloaderFill.style.width = currentPct + '%';
      if (preloaderPct) preloaderPct.textContent = currentPct + '%';
      updateTaskText(currentPct);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        if (preloaderFill) preloaderFill.style.width = '100%';
        if (preloaderPct) preloaderPct.textContent = '100%';
        updateTaskText(100);

        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.add('loaded');

          // Trigger typing effect right as loading screen fades
          if (onCompleteCallback) onCompleteCallback();

          setTimeout(() => {
            preloader.classList.add('hidden');
          }, 600);
        }, 180);
      }
    }

    requestAnimationFrame(tick);
  }

  // =========================================================================
  // 1. DYNAMIC PARTICLE SYSTEM (NINEBRAINS ACCRETION DISK & PIXEL STIPPLE FIELD)
  // =========================================================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates & repulsion parameters
    const MOUSE_RADIUS = 140;
    const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
    const mouse = {
      x: -2000,
      y: -2000,
      active: false
    };

    // Pre-allocated static tiers (fixed opacities — zero runtime GC string allocations)
    // Matches the pixelated monochrome dithered aesthetic in the reference screenshot
    const TIERS = [
      { color: 'rgba(255, 255, 255, 0.12)' }, // Deep ambient grain & outer falloff
      { color: 'rgba(255, 255, 255, 0.32)' }, // Mid-density stippled accretion plane
      { color: 'rgba(255, 255, 255, 0.65)' }, // Spray highlights & inner rim halo
      { color: 'rgba(255, 255, 255, 0.96)' }  // Razor-sharp brilliant white rim crest
    ];

    // Pre-allocated buckets for batch rendering
    const tierBuckets = [[], [], [], []];

    // Resize canvas with devicePixelRatio scaling (capped at 1.25 on mobile for 120 FPS without battery drain)
    function resizeCanvas() {
      const isMobile = window.innerWidth < 768;
      dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.scale(dpr, dpr);
    }

    // Initialize all components of the accretion disk structure matching the reference image:
    // 1. Brilliant razor-sharp curved rim edge
    // 2. Diffused spray fading into upper-left towards cubes
    // 3. Dense dithered stipple plane filling lower-right corner
    // 4. Ambient stars across deep black void
    function initParticles() {
      tierBuckets[0].length = 0;
      tierBuckets[1].length = 0;
      tierBuckets[2].length = 0;
      tierBuckets[3].length = 0;

      const isMobile = width < 768;
      const isSmallMobile = width < 480;
      const RIM_COUNT = isSmallMobile ? 140 : (isMobile ? 220 : 750);
      const SPRAY_COUNT = isSmallMobile ? 180 : (isMobile ? 320 : 1150);
      const PLANE_COUNT = isSmallMobile ? 220 : (isMobile ? 380 : 1350);
      const AMBIENT_COUNT = isSmallMobile ? 25 : (isMobile ? 50 : 180);

      // --- Group 1: The Luminous Razor Rim Crest ---
      // Hugs the curve tightly with brilliant white pixel density
      for (let i = 0; i < RIM_COUNT; i++) {
        const randTier = Math.random();
        const tier = randTier > 0.35 ? 3 : 2; // Mostly Tier 3 (pure white)
        const t = Math.random() * 1.30 - 0.15; // Extends well past edges (-0.15 to 1.15)
        const offset = (Math.random() - 0.5) * (isMobile ? 8 : 14); // Tight band (±7px)

        tierBuckets[tier].push({
          isDisk: true,
          t: t,
          speed: Math.random() * 0.00007 + 0.00003, // Majestic slow cosmic drift
          offset: offset,
          size: Math.random() < 0.3 ? 1.6 : 1.2,
          pushX: 0,
          pushY: 0
        });
      }

      // --- Group 2: The Outer Spray / Coronal Dust (Upper-Left toward Cubes) ---
      // Exponential falloff away from the rim, fading in opacity
      for (let j = 0; j < SPRAY_COUNT; j++) {
        const t = Math.random() * 1.30 - 0.15;
        // Non-linear power distribution clusters particles near the rim, spraying outward
        const sprayDist = Math.pow(Math.random(), 2.2) * (isMobile ? 140 : 280);
        const offset = -sprayDist; // Negative offset points toward upper-left

        // Tier chosen by proximity to rim
        const normDist = sprayDist / (isMobile ? 140 : 280);
        let tier = 0;
        if (normDist < 0.15) tier = 2;
        else if (normDist < 0.50) tier = 1;
        else tier = 0;

        tierBuckets[tier].push({
          isDisk: true,
          t: t,
          speed: Math.random() * 0.00008 + 0.00003,
          offset: offset,
          size: Math.random() < 0.25 ? 1.4 : 1.0,
          pushX: 0,
          pushY: 0
        });
      }

      // --- Group 3: Dense Lower-Right Accretion Plane ---
      // Stippled dither field filling the wedge beneath the rim
      for (let k = 0; k < PLANE_COUNT; k++) {
        const t = Math.random() * 1.30 - 0.15;
        // Fills the lower-right expanse
        const planeDist = Math.pow(Math.random(), 0.92) * (isMobile ? 180 : 380);
        const offset = +planeDist; // Positive offset points toward lower-right

        const normDist = planeDist / (isMobile ? 180 : 380);
        let tier = 0;
        if (normDist < 0.20) tier = 2;
        else if (normDist < 0.65) tier = 1;
        else tier = 0;

        tierBuckets[tier].push({
          isDisk: true,
          t: t,
          speed: Math.random() * 0.00006 + 0.00002,
          offset: offset,
          size: Math.random() < 0.2 ? 1.3 : 1.0,
          pushX: 0,
          pushY: 0
        });
      }

      // --- Group 4: Ambient Cosmic Starfield ---
      // Floating throughout the dark void
      for (let m = 0; m < AMBIENT_COUNT; m++) {
        const randTier = Math.random();
        let tier = 0;
        if (randTier > 0.85) tier = 2;
        else if (randTier > 0.45) tier = 1;

        tierBuckets[tier].push({
          isDisk: false,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.48) * 0.18,
          vy: (Math.random() - 0.50) * 0.10,
          size: Math.random() < 0.25 ? 1.5 : 1.0,
          pushX: 0,
          pushY: 0
        });
      }
    }

    // Animation frame render loop (Batched & Hardware-Accelerated Blits)
    let animId = null;
    const BOUND_PAD = 20;

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Deeply curved planetary accretion horizon (Cubic Bezier):
      // Horner's Rule precalculated polynomial coefficients:
      // P(t) = D + t * (C + t * (B + t * A))
      // T(t) = C + t * (B2 + t * A3)
      const x0 = -width * 0.10;
      const y0 = height * 1.02;
      const x1 = width * 0.28;
      const y1 = height * 0.98;
      const x2 = width * 0.68;
      const y2 = height * 0.82;
      const x3 = width * 1.14;
      const y3 = height * 0.22;

      const Ax = x3 - 3 * x2 + 3 * x1 - x0;
      const Ay = y3 - 3 * y2 + 3 * y1 - y0;
      const Bx = 3 * (x2 - 2 * x1 + x0);
      const By = 3 * (y2 - 2 * y1 + y0);
      const Cx = 3 * (x1 - x0);
      const Cy = 3 * (y1 - y0);
      const Dx = x0;
      const Dy = y0;

      const B2x = 2 * Bx;
      const B2y = 2 * By;
      const A3x = 3 * Ax;
      const A3y = 3 * Ay;

      const mouseActive = mouse.active;
      const mouseX = mouse.x;
      const mouseY = mouse.y;

      // 4 Batch Passes (Hardware-accelerated pixel quad blits per tier)
      for (let tTier = 0; tTier < 4; tTier++) {
        const bucket = tierBuckets[tTier];
        const bLen = bucket.length;
        if (bLen === 0) continue;

        ctx.fillStyle = TIERS[tTier].color;

        for (let i = 0; i < bLen; i++) {
          const p = bucket[i];
          let px, py;

          if (p.isDisk) {
            // Majestic slow cosmic drift
            p.t += p.speed;
            if (p.t > 1.15) {
              p.t = -0.15;
            }

            const pt = p.t;

            // Horner's Rule evaluation: 3 multiplications & additions only (4x faster)
            const bx = Dx + pt * (Cx + pt * (Bx + pt * Ax));
            const by = Dy + pt * (Cy + pt * (By + pt * Ay));

            // Instant tangent & normal evaluation with inverted length multiplication
            const tx = Cx + pt * (B2x + pt * A3x);
            const ty = Cy + pt * (B2y + pt * A3y);
            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            const invTLen = 1 / tLen;
            const nx = ty * invTLen;
            const ny = -tx * invTLen;

            // Smooth laminar drift along the accretion horizon (zero jitter or shakiness)
            px = bx + nx * p.offset + p.pushX;
            py = by + ny * p.offset + p.pushY;

            // Fast AABB bounding box check before distance calculation
            if (mouseActive) {
              const dx = px - mouseX;
              const dy = py - mouseY;
              if (dx < 140 && dx > -140 && dy < 140 && dy > -140) {
                const distSq = dx * dx + dy * dy;
                if (distSq < MOUSE_RADIUS_SQ && distSq > 0.01) {
                  const dist = Math.sqrt(distSq);
                  const force = (1 - dist / MOUSE_RADIUS) * 2.2;
                  p.pushX += (dx / dist) * force;
                  p.pushY += (dy / dist) * force;
                }
              }
            }

            if (p.pushX !== 0 || p.pushY !== 0) {
              p.pushX *= 0.91;
              p.pushY *= 0.91;
              if (p.pushX > -0.005 && p.pushX < 0.005) p.pushX = 0;
              if (p.pushY > -0.005 && p.pushY < 0.005) p.pushY = 0;
            }

          } else {
            // Ambient stars
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -BOUND_PAD) p.x = width + BOUND_PAD;
            else if (p.x > width + BOUND_PAD) p.x = -BOUND_PAD;
            if (p.y < -BOUND_PAD) p.y = height + BOUND_PAD;
            else if (p.y > height + BOUND_PAD) p.y = -BOUND_PAD;

            px = p.x + p.pushX;
            py = p.y + p.pushY;

            if (mouseActive) {
              const dx = px - mouseX;
              const dy = py - mouseY;
              if (dx < 140 && dx > -140 && dy < 140 && dy > -140) {
                const distSq = dx * dx + dy * dy;
                if (distSq < MOUSE_RADIUS_SQ && distSq > 0.01) {
                  const dist = Math.sqrt(distSq);
                  const force = (1 - dist / MOUSE_RADIUS) * 1.6;
                  p.pushX += (dx / dist) * force;
                  p.pushY += (dy / dist) * force;
                }
              }
            }

            if (p.pushX !== 0 || p.pushY !== 0) {
              p.pushX *= 0.91;
              p.pushY *= 0.91;
              if (p.pushX > -0.005 && p.pushX < 0.005) p.pushX = 0;
              if (p.pushY > -0.005 && p.pushY < 0.005) p.pushY = 0;
            }
          }

          // Silky-smooth subpixel rendering (eliminates pixel snapping jitter)
          ctx.fillRect(px, py, p.size, p.size);
        }
      }

      animId = requestAnimationFrame(renderParticles);
    }

    // Window event listeners (optimized for mobile address-bar collapse)
    let resizeTimer = null;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (Math.abs(window.innerWidth - lastWidth) < 14) return;
      lastWidth = window.innerWidth;
      resizeCanvas();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 150);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Pause canvas if tab is hidden to conserve GPU & battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(renderParticles);
      }
    });

    // Start particle system
    resizeCanvas();
    initParticles();
    animId = requestAnimationFrame(renderParticles);
  }

  // =========================================================================
  // 2. 3D CUBES CLUSTER MOUSE PARALLAX / TILT (IDLE-SLEEPING LOOP)
  // =========================================================================
  const cubesScene = document.getElementById('cubes-scene');
  const cubesViewport = document.getElementById('cubes-viewport');

  if (cubesScene && cubesViewport) {
    // Base angles matching ninebrains screenshot isometric view
    const BASE_ROT_X = 56;
    const BASE_ROT_Z = -34;

    let targetDeltaX = 0;
    let targetDeltaY = 0;
    let currentDeltaX = 0;
    let currentDeltaY = 0;
    let isTicking = false;
    let isHeroVisible = true;

    // Cache viewport metrics (prevents getBoundingClientRect layout thrashing)
    let centerX = 0;
    let centerY = 0;

    function updateViewportMetrics() {
      const rect = cubesViewport.getBoundingClientRect();
      centerX = rect.left + rect.width * 0.5;
      centerY = rect.top + rect.height * 0.5;
    }

    updateViewportMetrics();
    window.addEventListener('resize', updateViewportMetrics, { passive: true });

    // Track mouse over hero section
    const heroSection = document.getElementById('hero');
    const heroVisual = document.getElementById('hero-visual-wrapper');
    const trackArea = heroVisual || heroSection || window;

    // IntersectionObserver pauses calculations when hero is scrolled out of view
    if (heroSection) {
      const heroObserver = new IntersectionObserver((entries) => {
        isHeroVisible = entries[0].isIntersecting;
        if (!isHeroVisible && isTicking) {
          isTicking = false;
        }
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }

    function scheduleTiltUpdate() {
      if (!isTicking && isHeroVisible) {
        isTicking = true;
        requestAnimationFrame(updateCubesTilt);
      }
    }

    trackArea.addEventListener('mousemove', (e) => {
      const normX = (e.clientX - centerX) / (window.innerWidth * 0.5);
      const normY = (e.clientY - centerY) / (window.innerHeight * 0.5);

      // Max tilt degrees
      targetDeltaX = Math.max(-12, Math.min(12, normY * -10));
      targetDeltaY = Math.max(-15, Math.min(15, normX * 12));
      scheduleTiltUpdate();
    }, { passive: true });

    trackArea.addEventListener('mouseleave', () => {
      targetDeltaX = 0;
      targetDeltaY = 0;
      scheduleTiltUpdate();
    });

    // Smooth lerp update loop that SLEEPS when idle (zero CPU when settled)
    function updateCubesTilt() {
      if (!isHeroVisible) {
        isTicking = false;
        return;
      }

      const diffX = targetDeltaX - currentDeltaX;
      const diffY = targetDeltaY - currentDeltaY;

      // When settled, snap and STOP the animation loop until next mousemove
      if (Math.abs(diffX) < 0.015 && Math.abs(diffY) < 0.015) {
        currentDeltaX = targetDeltaX;
        currentDeltaY = targetDeltaY;
        cubesScene.style.transform = `rotateX(${(BASE_ROT_X + currentDeltaX).toFixed(2)}deg) rotateZ(${(BASE_ROT_Z + currentDeltaY).toFixed(2)}deg)`;
        isTicking = false;
        return;
      }

      currentDeltaX += diffX * 0.08;
      currentDeltaY += diffY * 0.08;

      const finalRotX = BASE_ROT_X + currentDeltaX;
      const finalRotZ = BASE_ROT_Z + currentDeltaY;

      cubesScene.style.transform = `rotateX(${finalRotX.toFixed(2)}deg) rotateZ(${finalRotZ.toFixed(2)}deg)`;
      requestAnimationFrame(updateCubesTilt);
    }
  }

  // =========================================================================
  // 3. VERTICAL SECTION NAVIGATOR TRACKING (Ninebrains UI)
  // =========================================================================
  const vnavItems = document.querySelectorAll('.vnav-item');
  const observedSections = document.querySelectorAll('section[data-nav]');

  if (vnavItems.length > 0 && observedSections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -45% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetSectionId = entry.target.id;
          vnavItems.forEach((item) => {
            const shouldBeActive = item.getAttribute('data-section') === targetSectionId;
            if (item.classList.contains('active') !== shouldBeActive) {
              item.classList.toggle('active', shouldBeActive);
            }
          });
        }
      });
    }, observerOptions);

    observedSections.forEach((sec) => navObserver.observe(sec));
  }

  // Smooth scroll click handler for vertical nav items
  vnavItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // =========================================================================
  // 4. TOP NAVIGATION SCROLL BEHAVIOR & MOBILE DRAWER (THROTTLED)
  // =========================================================================
  const topNav = document.getElementById('top-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navActions = document.querySelector('.nav-actions');

  let isScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      isScrollTicking = true;
      requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 40;
        if (topNav.classList.contains('scrolled') !== shouldBeScrolled) {
          topNav.classList.toggle('scrolled', shouldBeScrolled);
        }
        isScrollTicking = false;
      });
    }
  }, { passive: true });

  if (mobileToggle && navActions) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navActions.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu on nav link click
    navActions.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navActions.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================================================
  // 5. TERMINAL COMMAND TYPING EFFECT & CLIPBOARD ACTIONS
  // =========================================================================
  // 5. TERMINAL COMMAND TYPING & INTERACTIVE INPUT
  // =========================================================================
  const terminalBar = document.getElementById('terminal-bar');
  const terminalTab = document.querySelector('.terminal-bar-tabs .tab-item');
  const cmdContainer = document.getElementById('cmd-container');
  const cmdInput = document.getElementById('cmd-input');
  const cmdString = document.getElementById('cmd-string');
  const cmdHint = document.getElementById('cmd-hint');
  const terminalCursor = document.getElementById('terminal-cursor');
  const copyBtn = document.getElementById('copy-btn');

  const DEFAULT_COMMAND = 'curl -sL https://kintama.runs-on.dev/bio';
  const BIO_OUTPUT = 'Developer, student, robotics builder, audiophile & Linux enthusiast';

  let isAutoTyping = false;
  let typingTimer = null;
  let cycleTimer = null;
  let isHovered = false;
  let isUserManualTyping = false;

  function setCursorBlink(blink) {
    if (!terminalCursor) return;
    if (blink) {
      terminalCursor.classList.add('blink');
    } else {
      terminalCursor.classList.remove('blink');
    }
  }

  // Schedule the 5-second recurring loop
  function scheduleNextCycle() {
    clearTimeout(cycleTimer);
    if (isHovered || isUserManualTyping) return;

    cycleTimer = setTimeout(() => {
      if (!isHovered && !isUserManualTyping) {
        removeAndRewind();
      }
    }, 5000); // exactly every 5 seconds
  }

  // Removes every text there, then writes it again
  function removeAndRewind() {
    clearTimeout(typingTimer);
    clearTimeout(cycleTimer);
    isAutoTyping = true;
    setCursorBlink(false);

    // Fade out and clear output text
    if (cmdHint) {
      cmdHint.style.opacity = '0';
      cmdHint.textContent = '';
    }

    // Fast backspace deletion of the command line
    let currentCmd = cmdString ? cmdString.textContent : '';

    function eraseStep() {
      if (currentCmd.length > 0) {
        currentCmd = currentCmd.slice(0, -1);
        if (cmdString) cmdString.textContent = currentCmd;
        if (cmdInput) cmdInput.value = currentCmd;
        typingTimer = setTimeout(eraseStep, 16);
      } else {
        if (cmdString) cmdString.textContent = '';
        if (cmdInput) cmdInput.value = '';
        setCursorBlink(true);
        // Brief pause (220ms) then write it again
        typingTimer = setTimeout(() => {
          runDefaultSequence();
        }, 220);
      }
    }

    eraseStep();
  }

  // Type string character by character with natural cadence
  function autoTypeCommand(text, speedMin, speedMax, onDone) {
    let charIdx = 0;
    if (cmdString) cmdString.textContent = '';
    if (cmdInput) cmdInput.value = '';
    setCursorBlink(false);

    function typeChar() {
      if (charIdx < text.length) {
        const nextChar = text.charAt(charIdx);
        if (cmdString) cmdString.textContent += nextChar;
        if (cmdInput) cmdInput.value = cmdString.textContent;
        charIdx++;
        const delay = speedMin + Math.random() * (speedMax - speedMin);
        typingTimer = setTimeout(typeChar, delay);
      } else {
        setCursorBlink(true);
        if (onDone) onDone();
      }
    }

    typeChar();
  }

  // Paste / output the bio text with a fast terminal stream, then schedule 5s loop
  function pasteOutput(text) {
    if (!cmdHint) return;
    cmdHint.textContent = '';
    cmdHint.style.opacity = '1';

    let idx = 0;
    function flushChunk() {
      if (idx < text.length) {
        const step = Math.min(4, text.length - idx);
        cmdHint.textContent += text.substr(idx, step);
        idx += step;
        typingTimer = setTimeout(flushChunk, 14);
      } else {
        cmdHint.textContent = text;
        isAutoTyping = false;
        // Schedule next cycle: every 5 seconds, removes every text and writes it again
        scheduleNextCycle();
      }
    }

    flushChunk();
  }

  function runDefaultSequence() {
    if (!cmdString || !cmdHint) return;
    clearTimeout(typingTimer);
    clearTimeout(cycleTimer);
    isAutoTyping = true;

    cmdString.textContent = '';
    if (cmdInput) cmdInput.value = '';
    cmdHint.textContent = '';
    cmdHint.style.opacity = '0';

    // 1. Type "curl -sL https://kintama.me/bio"
    autoTypeCommand(DEFAULT_COMMAND, 35, 65, () => {
      // 2. Pause for Enter
      typingTimer = setTimeout(() => {
        // 3. Paste bio output
        pasteOutput(BIO_OUTPUT);
      }, 220);
    });
  }

  // Interactive input: allows the user to click & type commands directly
  if (cmdInput) {
    if (terminalBar) {
      terminalBar.addEventListener('click', (e) => {
        if (e.target.closest('#copy-btn')) return;
        cmdInput.focus();
      });
    }

    cmdInput.addEventListener('input', () => {
      clearTimeout(typingTimer);
      clearTimeout(cycleTimer);
      isAutoTyping = false;
      isUserManualTyping = true;
      if (cmdString) cmdString.textContent = cmdInput.value;
      setCursorBlink(true);
    });

    cmdInput.addEventListener('blur', () => {
      if (!cmdInput.value.trim()) {
        isUserManualTyping = false;
        scheduleNextCycle();
      }
    });

    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const entered = cmdInput.value.trim().toLowerCase();

        clearTimeout(typingTimer);
        clearTimeout(cycleTimer);
        isAutoTyping = false;

        if (entered === 'clear') {
          if (cmdHint) cmdHint.textContent = '';
          cmdInput.value = '';
          if (cmdString) cmdString.textContent = '';
          isUserManualTyping = false;
          scheduleNextCycle();
          return;
        }

        if (entered === 'help') {
          pasteOutput('Commands: curl -sL https://kintama.me/bio, whoami, clear');
          return;
        }

        // Paste bio output for curl, cat, or any command
        pasteOutput(BIO_OUTPUT);
        setTimeout(() => {
          isUserManualTyping = false;
          scheduleNextCycle();
        }, 5000);
      }
    });
  }

  // Pause on hover so reading / copying is never interrupted
  if (terminalBar) {
    terminalBar.addEventListener('mouseenter', () => {
      isHovered = true;
      clearTimeout(cycleTimer);
    });

    terminalBar.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!isAutoTyping && !isUserManualTyping) {
        scheduleNextCycle();
      }
    });
  }

  // Allow clicking on Terminal tab to replay the sequence immediately
  if (terminalTab) {
    terminalTab.addEventListener('click', () => {
      isUserManualTyping = false;
      runDefaultSequence();
    });
  }

  // Initialize preloader, and launch typing sequence as the site loads
  initPreloader(() => {
    runDefaultSequence();
  });

  // Helper for animated copy feedback
  const setupCopyButton = (buttonEl, getSourceFn, labelSelector, defaultLabel = 'Copy', successLabel = 'Copied!') => {
    if (!buttonEl || !getSourceFn) return;
    let timeoutId = null;

    buttonEl.addEventListener('click', async () => {
      const textToCopy = (typeof getSourceFn === 'function' ? getSourceFn() : getSourceFn.textContent).trim();
      const labelEl = buttonEl.querySelector(labelSelector);

      const triggerSuccess = () => {
        buttonEl.classList.add('copied');
        buttonEl.setAttribute('title', 'Copied to clipboard!');
        if (labelEl) labelEl.textContent = successLabel;

        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          buttonEl.classList.remove('copied');
          buttonEl.setAttribute('title', defaultLabel === 'Copy' ? 'Copy to clipboard' : 'Copy email address');
          if (labelEl) labelEl.textContent = defaultLabel;
        }, 2200);
      };

      try {
        await navigator.clipboard.writeText(textToCopy);
        triggerSuccess();
      } catch (err) {
        // Fallback for older browsers or restricted iframe environments
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          triggerSuccess();
        } catch (copyErr) {
          console.warn('Clipboard copy failed:', copyErr);
        }
        document.body.removeChild(textarea);
      }
    });
  };

  // Terminal command copy: copies current command or default curl
  setupCopyButton(
    copyBtn,
    () => (cmdInput && cmdInput.value.trim() ? cmdInput.value.trim() : DEFAULT_COMMAND),
    '.copy-text',
    'Copy',
    'Copied!'
  );

  // Direct email copy button in Connections
  const emailCopyBtn = document.getElementById('email-copy-btn');
  const emailAddress = document.getElementById('email-address');
  setupCopyButton(emailCopyBtn, emailAddress, '.email-copy-text', 'Copy', 'Copied!');

  // =========================================================================
  // 6. WORKING CONTACT FORM (Validation & Extensible Dispatch)
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const formAlert = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm && submitBtn) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const btnText = submitBtn.querySelector('.btn-text');

    const DEFAULT_BTN_TEXT = 'Send Message';
    const SUCCESS_BTN_TEXT = 'Thanks for sending!';
    let resetTimer = null;

    // Email regex validation
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Clear individual field errors on input
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          input.closest('.form-group').classList.remove('has-error');
        });
      }
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasError = false;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Email
      if (!isValidEmail(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('has-error');
        hasError = true;
      } else {
        messageInput.closest('.form-group').classList.remove('has-error');
      }

      if (hasError) {
        showFormAlert('Please resolve the flagged input fields above.', 'error');
        return;
      }

      // Clear any pending button reset timer
      if (resetTimer) clearTimeout(resetTimer);

      // UI Loading State (stays on page, no redirect)
      submitBtn.disabled = true;
      submitBtn.classList.remove('success');
      submitBtn.classList.add('loading');
      if (btnText) btnText.textContent = 'Transmitting...';
      hideFormAlert();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = (subjectInput && subjectInput.value.trim()) ? subjectInput.value.trim() : 'General Transmission';
      const message = messageInput.value.trim();

      // Resolve AJAX endpoint from form action attribute
      const formAction = contactForm.getAttribute('action') || 'https://formsubmit.co/ajax/mdraiyanislam944@proton.me';
      const endpoint = formAction.includes('/ajax/') ? formAction : formAction.replace('formsubmit.co/', 'formsubmit.co/ajax/');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            subject: subject,
            message: message,
            _subject: `[Kintama Portfolio] ${subject} - ${name}`,
            _template: 'table',
            _captcha: 'false'
          })
        });

        const data = await response.json().catch(() => null);

        if (response.ok && (!data || data.success !== 'false')) {
          // Stay on page: Clear form fields
          contactForm.reset();

          // Replace button text with "Thanks for sending!" and animate success state
          submitBtn.classList.remove('loading');
          submitBtn.classList.add('success');
          if (btnText) btnText.textContent = SUCCESS_BTN_TEXT;
          showFormAlert('✓ Transmission acknowledged! Thanks for reaching out.', 'success');

          // Reset button back to "Send Message" after 4.5 seconds
          resetTimer = setTimeout(() => {
            submitBtn.classList.remove('success');
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = DEFAULT_BTN_TEXT;
            hideFormAlert();
          }, 4500);

        } else {
          const errMsg = data && data.message ? data.message : `Delivery error (${response.status})`;
          throw new Error(errMsg);
        }

      } catch (err) {
        console.warn('Form transmission issue:', err);

        // Stay on page: inform the user without leaving
        submitBtn.classList.remove('loading');
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = DEFAULT_BTN_TEXT;

        showFormAlert('Transmission error. You can also contact directly at kintamarbd@gmail.com.', 'error');
      }
    });

    function showFormAlert(message, type) {
      if (formAlert) {
        formAlert.textContent = message;
        formAlert.className = `form-alert ${type}`;
        formAlert.hidden = false;
      }
    }

    function hideFormAlert() {
      if (formAlert) {
        formAlert.hidden = true;
      }
    }
  }

  // =========================================================================
  // 7. BACK TO TOP SMOOTH SCROLL
  // =========================================================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
