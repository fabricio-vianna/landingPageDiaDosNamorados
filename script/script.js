/* ============================================================
   script.js — Para Giovanna, Feliz Dia dos Namorados 💕
   Fabricio — Junho 2026
   ============================================================ */

"use strict";

/* ============================================================
   1. UTILITÁRIOS GERAIS
   ============================================================ */

function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
}

function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/* ============================================================
   2. SCROLL SUAVE — BOTÃO INICIAL
   ============================================================ */

function initSmoothScroll() {
    const btnStart = document.getElementById("btnStart");
    if (!btnStart) return;

    btnStart.addEventListener("click", () => {
        const storySection = document.getElementById("story");
        if (storySection) {
            storySection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

/* ============================================================
   3. ANIMAÇÕES DE ENTRADA AO ROLAR (Scroll Reveal)
   ============================================================ */

function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal, .reveal-finale");
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    if (!entry.target.classList.contains("reveal-finale")) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
}

/* ============================================================
   4. CONTADOR EM TEMPO REAL
   ============================================================ */

function initCounter() {
    const startDate = new Date("2024-07-07T00:00:00");
    const elDays = document.getElementById("cDays");
    const elHours = document.getElementById("cHours");
    const elMinutes = document.getElementById("cMinutes");

    if (!elDays || !elHours || !elMinutes) return;

    function update() {
        const now = new Date();
        const diff = now - startDate;
        const totalMinutes = Math.floor(diff / 60000);
        const totalHours = Math.floor(diff / 3600000);
        const totalDays = Math.floor(diff / 86400000);
        const minutes = totalMinutes % 60;
        const hours = totalHours % 24;

        elDays.textContent = totalDays.toLocaleString("pt-BR");
        elHours.textContent = String(hours).padStart(2, "0");
        elMinutes.textContent = String(minutes).padStart(2, "0");
    }

    update();
    setInterval(update, 60000);
}

/* ============================================================
   5. GALERIA COM LIGHTBOX
   ============================================================ */

function initGallery() {
    const tabs = document.querySelectorAll(".gallery__tab");
    const allItems = document.querySelectorAll(".gallery__item");

    /* ----- ABAS DE CATEGORIA ----- */
    tabs.forEach((tab) => {
        function handleTabSelect(e) {
            e.preventDefault();
            e.stopPropagation();

            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            const cat = tab.dataset.cat;
            allItems.forEach((item) => {
                if (item.dataset.cat === cat) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        }

        tab.addEventListener("click", handleTabSelect);
        tab.addEventListener("touchend", handleTabSelect, { passive: false });
    });

    /* ----- LIGHTBOX ----- */
    const lightbox = document.getElementById("lightbox");
    const lbImgWrap = document.getElementById("lbImgWrap");
    const lbClose = document.getElementById("lbClose");
    const lbPrev = document.getElementById("lbPrev");
    const lbNext = document.getElementById("lbNext");

    if (!lightbox) return;

    let currentImages = [];
    let currentIndex = 0;

    function openLightbox(imgs, idx) {
        currentImages = imgs;
        currentIndex = idx;
        showLightboxImage();
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        lbImgWrap.innerHTML = "";
    }

    function showLightboxImage() {
        if (!currentImages.length) return;
        const img = currentImages[currentIndex];
        lbImgWrap.innerHTML = "";

        if (img && img.tagName === "IMG") {
            const clone = img.cloneNode();
            clone.style.maxWidth = "90vw";
            clone.style.maxHeight = "85vh";
            clone.style.objectFit = "contain";
            lbImgWrap.appendChild(clone);
        } else {
            const ph = document.createElement("div");
            ph.style.cssText = "color:#fff;font-size:1rem;padding:40px;text-align:center;opacity:0.7;";
            ph.textContent = img ? img.textContent : "📸";
            lbImgWrap.appendChild(ph);
        }
    }

    function navigate(dir) {
        if (!currentImages.length) return;
        currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
        showLightboxImage();
    }

    const galleryGrid = document.getElementById("galleryGrid");
    if (galleryGrid) {
        function handleGalleryClick(e) {
            const item = e.target.closest(".gallery__item");
            if (!item || item.style.display === "none") return;

            const visibleItems = [...allItems].filter((i) => i.style.display !== "none");
            const visibleImgs = visibleItems.map(
                (i) => i.querySelector("img") || i.querySelector(".gallery__img")
            );
            const idx = visibleItems.indexOf(item);
            openLightbox(visibleImgs, idx >= 0 ? idx : 0);
        }

        galleryGrid.addEventListener("click", handleGalleryClick);
        galleryGrid.addEventListener("touchend", (e) => {
            e.preventDefault();
            handleGalleryClick(e);
        }, { passive: false });
    }

    function handleClose() { closeLightbox(); }
    lbClose?.addEventListener("click", handleClose);
    lbClose?.addEventListener("touchend", (e) => { e.preventDefault(); handleClose(); }, { passive: false });

    lbPrev?.addEventListener("click", () => navigate(-1));
    lbPrev?.addEventListener("touchend", (e) => { e.preventDefault(); navigate(-1); }, { passive: false });

    lbNext?.addEventListener("click", () => navigate(1));
    lbNext?.addEventListener("touchend", (e) => { e.preventDefault(); navigate(1); }, { passive: false });

    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(1);
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
}

/* ============================================================
   6. ENVELOPES / CARTAS SECRETAS
   ============================================================ */

function initEnvelopes() {
    const envelopes = document.querySelectorAll(".envelope");

    envelopes.forEach((env) => {
        if (!env.querySelector(".envelope__close")) {
            const closeBtn = document.createElement("button");
            closeBtn.className = "envelope__close";
            closeBtn.textContent = "✕";
            closeBtn.title = "Fechar carta";
            closeBtn.setAttribute("aria-label", "Fechar carta");
            env.querySelector(".envelope__letter")?.appendChild(closeBtn);
        }

        const front = env.querySelector(".envelope__front");

        function handleEnvelopeOpen(e) {
            e.preventDefault();
            e.stopPropagation();
            envelopes.forEach((other) => {
                if (other !== env) other.classList.remove("open");
            });
            env.classList.toggle("open");
        }

        front?.addEventListener("click", handleEnvelopeOpen);
        front?.addEventListener("touchend", handleEnvelopeOpen, { passive: false });

        function handleEnvelopeClose(e) {
            if (e.target.classList.contains("envelope__close")) {
                e.preventDefault();
                e.stopPropagation();
                env.classList.remove("open");
            }
        }

        env.addEventListener("click", handleEnvelopeClose);
        env.addEventListener("touchend", handleEnvelopeClose, { passive: false });
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".envelope")) {
            envelopes.forEach((env) => env.classList.remove("open"));
        }
    });

    document.addEventListener("touchend", (e) => {
        if (!e.target.closest(".envelope")) {
            envelopes.forEach((env) => env.classList.remove("open"));
        }
    }, { passive: true });
}

/* ============================================================
   7. BOTÃO DE MÚSICA
   ============================================================ */

function initMusic() {
    const musicBtn = document.getElementById("musicBtn");
    const bgMusic = document.getElementById("bgMusic");

    if (!musicBtn || !bgMusic) return;

    let isPlaying = false;

    async function handleMusicToggle(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            musicBtn.classList.remove("playing");
            musicBtn.querySelector("span").textContent = "Nossa música";
        } else {
            try {
                await bgMusic.play();
                isPlaying = true;
                musicBtn.classList.add("playing");
                musicBtn.querySelector("span").textContent = "Pausar música";
            } catch (err) {
                console.info("Reprodução de áudio bloqueada pelo navegador.", err);
            }
        }
    }

    musicBtn.addEventListener("click", handleMusicToggle);
    musicBtn.addEventListener("touchend", handleMusicToggle, { passive: false });

    bgMusic.addEventListener("ended", () => {
        isPlaying = false;
        musicBtn.classList.remove("playing");
        musicBtn.querySelector("span").textContent = "Nossa música";
    });
}

/* ============================================================
   8. PARTÍCULAS / CORAÇÕES FLUTUANTES (Canvas)
   ============================================================ */

function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let W, H;
    let particles = [];
    const symbols = ["♥", "✦", "✧", "·", "❤", "♡"];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    function particleCount() {
        return Math.floor((W * H) / 18000);
    }

    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 12 + 6,
            alpha: Math.random() * 0.35 + 0.05,
            speed: Math.random() * 0.4 + 0.1,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            drift: (Math.random() - 0.5) * 0.4,
            hue: Math.random() > 0.5 ? "#e91e63" : "#c9a96e",
        };
    }

    function initParticleList() {
        particles = [];
        const count = particleCount();
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    initParticleList();

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.hue;
            ctx.font = `${p.size}px serif`;
            ctx.fillText(p.symbol, p.x, p.y);
            p.y -= p.speed;
            p.x += p.drift;
            p.alpha += (Math.random() - 0.5) * 0.004;
            p.alpha = Math.max(0.02, Math.min(0.4, p.alpha));
            if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
            if (p.x < -20 || p.x > W + 20) { p.x = Math.random() * W; }
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener("resize", initParticleList, { passive: true });
}

/* ============================================================
   9. ANIMAÇÕES DA TIMELINE
   ============================================================ */

function initTimeline() {
    const items = document.querySelectorAll(".timeline__item");
    if (!items.length) return;
    items.forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.12}s`;
    });
}

/* ============================================================
   10. FOGOS DE ARTIFÍCIO — SEÇÃO FINAL
   ============================================================ */

function initFireworks() {
    const canvas = document.getElementById("fireworks-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let W, H;
    let particles = [];
    let active = false;

    function resize() {
        W = canvas.width = canvas.offsetWidth || window.innerWidth;
        H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    function Particle(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.size = Math.random() * 3 + 1;
    }

    Particle.prototype.update = function () {
        this.x += this.vx; this.y += this.vy;
        this.vy += 0.06; this.alpha -= this.decay;
    };

    Particle.prototype.draw = function () {
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };

    const colors = ["#e91e63","#f48fb1","#c9a96e","#f0d89a","#ffffff","#ce93d8","#f8bbd0","#ffe082"];

    function burst() {
        const x = Math.random() * W;
        const y = Math.random() * (H * 0.6);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = isTouchDevice() ? 30 : 50;
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
    }

    let burstInterval;

    function startFireworks() {
        if (active) return;
        active = true;
        burstInterval = setInterval(burst, 900);
        loop();
    }

    function stopFireworks() {
        active = false;
        clearInterval(burstInterval);
    }

    function loop() {
        if (!active && particles.length === 0) return;
        ctx.clearRect(0, 0, W, H);
        particles = particles.filter((p) => p.alpha > 0);
        particles.forEach((p) => { p.update(); p.draw(); });
        ctx.globalAlpha = 1;
        requestAnimationFrame(loop);
    }

    const finaleSection = document.getElementById("finale");
    if (finaleSection) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) startFireworks();
                    else stopFireworks();
                });
            },
            { threshold: 0.2 }
        );
        obs.observe(finaleSection);
    }
}

/* ============================================================
   11. SPARKLES NO HERO
   ============================================================ */

function initHeroSparkles() {
    const container = document.querySelector(".hero__sparkles");
    if (!container) return;

    const COUNT = isTouchDevice() ? 8 : 14;

    for (let i = 0; i < COUNT; i++) {
        const sp = document.createElement("span");
        sp.textContent = Math.random() > 0.5 ? "✦" : "✧";
        sp.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 14 + 8}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            color: ${Math.random() > 0.5 ? "#e91e63" : "#c9a96e"};
            opacity: 0;
            animation: sparkle ${Math.random() * 3 + 2}s ${Math.random() * 4}s ease-in-out infinite;
            pointer-events: none;
            user-select: none;
        `;
        container.appendChild(sp);
    }

    if (!document.getElementById("sparkle-kf")) {
        const style = document.createElement("style");
        style.id = "sparkle-kf";
        style.textContent = `
            @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                50%       { opacity: 0.9; transform: scale(1.2) rotate(30deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================================
   12. CORAÇÕES FLUTUANTES NA SEÇÃO FINAL
   ============================================================ */

function initFinaleHearts() {
    const container = document.getElementById("finaleHearts");
    if (!container) return;

    const hearts = ["❤", "♥", "💕", "💗", "💖"];
    const COUNT = isTouchDevice() ? 5 : 9;

    for (let i = 0; i < COUNT; i++) {
        const h = document.createElement("span");
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        h.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 22 + 10}px;
            left: ${Math.random() * 100}%;
            top: 0;
            color: ${Math.random() > 0.5 ? "#f48fb1" : "#f0d89a"};
            opacity: 0;
            animation: floatUp ${Math.random() * 4 + 3}s ${Math.random() * 5}s ease-in-out infinite;
            pointer-events: none;
            user-select: none;
        `;
        container.appendChild(h);
    }

    if (!document.getElementById("floatup-kf")) {
        const style = document.createElement("style");
        style.id = "floatup-kf";
        style.textContent = `
            @keyframes floatUp {
                0%   { opacity: 0;   transform: translateY(60px) scale(0.7); }
                30%  { opacity: 0.8; }
                70%  { opacity: 0.6; }
                100% { opacity: 0;   transform: translateY(-80px) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================================
   13. MOBILE OPTIMIZATIONS
   ============================================================ */

function initMobileOptimizations() {
    if (isTouchDevice()) {
        document.body.classList.add("is-touch");
        // IMPORTANTE: Sem preventDefault global aqui.
        // O preventDefault global bloqueava TODOS os toques da página.
    }
}

/* ============================================================
   14. INICIALIZAÇÃO GLOBAL
   ============================================================ */

ready(() => {
    initMobileOptimizations();
    initSmoothScroll();
    initScrollReveal();
    initTimeline();
    initCounter();
    initGallery();
    initEnvelopes();
    initMusic();
    initHeroSparkles();
    initParticles();
    initFinaleHearts();
    initFireworks();
});