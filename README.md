# Kintama — Developer, Robotics Builder & Student Portfolio

A minimalist, high-performance personal portfolio engineered with pure vanilla Web standards. Designed with a dark monochrome aesthetic, 60/120 FPS interactive graphics, and tactile digital interfaces showcasing robotics builds, custom Linux environments, creative WebGL shaders, and community platforms.

---

## ✨ Features

- **Accretion Disk Particle System**:
  - Custom HTML5 Canvas engine utilizing a cubic Bezier parametric curve with Horner's rule evaluation.
  - AABB cursor collision detection with repulsive vector fields.
  - Subpixel rendering with hardware-accelerated composite layers.
- **3D Floating Matrix Cubes**:
  - 3x3 CSS 3D perspective cube cluster with reactive cursor parallax.
  - Smart animation sleeping when settled to ensure 0% CPU consumption at rest.
  - Viewport `IntersectionObserver` auto-pauses rendering when the hero section scrolls out of view.
- **Custom Sci-Fi System Preloader**:
  - Isometric rotating 3D wireframe cube glyph with scanline shaders matching the hero cubes.
  - Telemetry boot progress meter (`0%` -> `100%`) with live subsystem status tickers and smooth fade-out blur transition.
- **Interactive Hero Terminal with 5-Second Recurring Typing Effect**:
  - Automatically triggers on site load: types `curl -sL https://kintama.me/bio` and pastes the bio (`Developer, student, robotics builder, audiophile & Linux enthusiast`).
  - Recurring 5-second loop: removes all text (fast backspace + output wipe) and rewrites it again continuously.
  - Interactive input support: visitors can click and type any command (`curl`, `cat`, `whoami`) directly on their keyboard.
  - Smart hover-to-pause and active command copy integration.
- **Vertical Navigation Track (00–04)**:
  - Real-time active section indicator with full-width dynamic underlines.
  - 5 core sections: `Home`, `About`, `Skills`, `Works`, and `Contact`.
- **Streamlined Technical Stack**:
  - 4 clean categories: **Languages**, **Frontend & UI**, **Backend & APIs**, and **Systems & Tools** (C++, Linux dotfiles, robotics, audio acoustics).
  - Accessible, modern, and uncluttered layout with subtle hover interactions.
- **Showcase Projects**:
  - **[ESP32-Adblock](https://github.com/legendlife/esp32-adblock)**: Hardware DNS sinkhole and telemetry blocker engineered on ESP32 Devkit V1 with RFC 1035 UDP packet inspection.
  - **[Solaris Shenanigans](https://github.com/rc-ric/solaris-shenanigans)**: Autonomous robotics kinematics, motor control, and sensor integration firmware developed for Rajuk College Robotics & ICT Club (RCRIC).
  - **[Redish](https://github.com/legendlife/Redish)**: Crimson & obsidian Linux rice (XFCE on Arch) featuring custom dual-kawase Picom compositor, Graffias Conky telemetry, and Pywal theming (40+ stars).
  - **[Neofetch Themes](https://github.com/legendlife/neofetch-themes/tree/main)**: Curated open-source collection of aesthetic CLI system information themes with Nerd Fonts glyphs and terminal ASCII art.
- **Functional Contact Transmission**:
  - In-place AJAX dispatch staying directly on the website without page redirects.
  - Interactive "Thanks for sending!" button micro-feedback that automatically resets to "Send Message" after 4.5 seconds.
  - Freeform subject input and client-side input validation.
  - Animated copy-to-clipboard buttons with "Copied!" micro-feedback.
- **Connections Grid**:
  - Minimalist 2x2 network links: **Discord**, **Steam**, **X (Twitter)**, and **GitHub**.
- **Custom Minimalist Scrollbar**:
  - Sleek, floating dark monochrome scrollbar matching the theme across Chrome, Edge, Brave, and Firefox.
- **Performance & Optimization**:
  - Asynchronous, non-blocking font loading (`Geist` & `Geist Mono`).
  - CSS `content-visibility: auto` with intrinsic sizing for instantaneous paint times.
  - Zero external runtime JavaScript frameworks or bulky dependencies.

---

## 📁 Project Structure

```text
├── index.html         # Semantic HTML5 markup, accessibility skip links, section structures
├── css/
│   └── style.css      # CSS design tokens, 3D transforms, custom scrollbars, responsive layouts
├── js/
│   └── script.js      # Accretion particles, 3D parallax, form handler, clipboard actions
└── README.md          # Project documentation
```

---

## 🚀 Getting Started

No build step or package installation required. The project runs directly in any modern browser.

### Run with a Local Server

You can use any local static server:

#### Python 3
```bash
python -m http.server 3000
```

#### Node.js (`npx serve`)
```bash
npx serve .
```

#### VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

Visit `http://localhost:3000` in your browser.

---

## ⚙️ Customization Guide

### 1. Update Contact Email
In `index.html`, update the FormSubmit action and fallback email:
```html
<form id="contact-form" action="https://formsubmit.co/your-email@example.com" method="POST">
```
In `js/script.js`:
```javascript
const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/your-email@example.com';
const FALLBACK_EMAIL = 'your-email@example.com';
```

### 2. Social Links
In `index.html` under the `<!-- Social Links Matrix -->` section:
- Update URLs for Discord, Reddit, X, and GitHub to your profile handles.

### 3. Add or Modify Projects
In `index.html` under `<section id="projects">`:
- Duplicate or edit the `<article class="project-card">` containers to showcase your builds and repositories.

---

## 📜 License

MIT License. Free to use, adapt, and build upon.
