/* ============================================
   BIRTHDAY WEBSITE — INTERACTIVE ENGINE
   ============================================ */

(function () {
    'use strict';

    // ---- State ----
    let currentPage = 1;
    const totalPages = 8;
    let isTransitioning = false;
    let isMuted = false;
    let letterTyped = false;
    let meterPlayed = false;
    let touchStartX = 0;
    let touchEndX = 0;

    // ---- DOM References ----
    const slides = document.querySelectorAll('.slide');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageCurrent = document.getElementById('page-current');
    const beginBtn = document.getElementById('begin-btn');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const particlesCanvas = document.getElementById('particles-canvas');
    const petalsContainer = document.getElementById('petals-container');
    const bgGradient = document.getElementById('bg-gradient');

    // ---- Initialize ----
    function init() {
        updateNav();
        initParticles();
        spawnPetals();
        initMusic();
        bindEvents();
        triggerPageAnimations(1);
    }

    // ---- Navigation ----
    function goToPage(page, direction) {
        if (isTransitioning || page < 1 || page > totalPages || page === currentPage) return;
        isTransitioning = true;

        const currentSlide = document.querySelector(`.slide[data-page="${currentPage}"]`);
        const nextSlide = document.querySelector(`.slide[data-page="${page}"]`);

        // Exit current
        currentSlide.classList.remove('active');
        currentSlide.classList.add(direction === 'next' ? 'exit-left' : 'exit-right');

        // Enter next
        nextSlide.style.transform = direction === 'next'
            ? 'scale(0.95) translateX(60px)'
            : 'scale(0.95) translateX(-60px)';
        nextSlide.classList.add('active');

        // Handle final page bright background
        if (page === 8) {
            document.body.classList.add('page-final-active');
        } else {
            document.body.classList.remove('page-final-active');
        }

        currentPage = page;
        pageCurrent.textContent = currentPage;
        updateNav();

        setTimeout(() => {
            currentSlide.classList.remove('exit-left', 'exit-right');
            nextSlide.style.transform = '';
            isTransitioning = false;
            triggerPageAnimations(currentPage);
        }, 800);
    }

    function nextPage() {
        goToPage(currentPage + 1, 'next');
    }

    function prevPage() {
        goToPage(currentPage - 1, 'prev');
    }

    function updateNav() {
        btnPrev.classList.toggle('hidden', currentPage === 1);
        btnNext.classList.toggle('hidden', currentPage === totalPages);
    }

    // ---- Event Bindings ----
    function bindEvents() {
        btnNext.addEventListener('click', nextPage);
        btnPrev.addEventListener('click', prevPage);
        beginBtn.addEventListener('click', function () {
            ensureMusicPlaying();
            nextPage();
        });

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextPage();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevPage();
            }
        });

        // Touch swipe
        document.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        // Music toggle
        musicToggle.addEventListener('click', toggleMusic);

        // Flip cards on mobile (tap)
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', function () {
                this.classList.toggle('flipped');
            });
        });
    }

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 60;
        if (Math.abs(diff) > threshold) {
            if (diff > 0) nextPage();
            else prevPage();
        }
    }

    // ---- Music ----
    function initMusic() {
        // Try to start at "Did I cross the line..." — roughly ~30s in for many songs
        // Set a starting point (adjustable)
        bgMusic.currentTime = 0;
        bgMusic.volume = 0;

        // Attempt autoplay
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                fadeInMusic();
            }).catch(() => {
                // Autoplay blocked — will play on first interaction
                isMuted = true;
                musicToggle.classList.add('muted');
            });
        }
    }

    function ensureMusicPlaying() {
        if (bgMusic.paused) {
            bgMusic.currentTime = 0;
            bgMusic.volume = 0;
            bgMusic.play().then(() => {
                fadeInMusic();
                isMuted = false;
                musicToggle.classList.remove('muted');
            }).catch(() => { });
        }
    }

    function fadeInMusic() {
        let vol = 0;
        const fadeInterval = setInterval(() => {
            vol += 0.02;
            if (vol >= 0.7) {
                vol = 0.7;
                clearInterval(fadeInterval);
            }
            bgMusic.volume = vol;
        }, 80);
        isMuted = false;
        musicToggle.classList.remove('muted');
    }

    function toggleMusic() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                fadeInMusic();
            }).catch(() => { });
        } else if (isMuted) {
            bgMusic.volume = 0.7;
            isMuted = false;
            musicToggle.classList.remove('muted');
        } else {
            bgMusic.volume = 0;
            isMuted = true;
            musicToggle.classList.add('muted');
        }
    }

    // ---- Page Animations ----
    function triggerPageAnimations(page) {
        switch (page) {
            case 2: animateFavLines(); break;
            case 3: animateReasonCards(); break;
            case 4: animateFlipCards(); break;
            case 5: if (!meterPlayed) { animateLoveMeter(); meterPlayed = true; } break;
            case 6: if (!letterTyped) { animateLetter(); letterTyped = true; } break;
            case 7: animateCarousel(); break;
            case 8: animateFinalPage(); break;
        }
    }

    // Page 2 — Animate message lines
    function animateFavLines() {
        const lines = document.querySelectorAll('#fav-lines .msg-line');
        lines.forEach(line => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
            }, delay + 300);
        });
    }

    // Page 3 — Animate reason cards
    function animateReasonCards() {
        const cards = document.querySelectorAll('#reasons-grid .reason-card');
        cards.forEach(card => {
            const delay = parseInt(card.dataset.delay) || 0;
            setTimeout(() => {
                card.classList.add('visible');
            }, delay + 200);
        });
    }

    // Page 4 — Animate flip cards
    function animateFlipCards() {
        const cards = document.querySelectorAll('#funny-grid .flip-card');
        cards.forEach(card => {
            const delay = parseInt(card.dataset.delay) || 0;
            setTimeout(() => {
                card.classList.add('visible');
            }, delay + 200);
        });
    }

    // Page 5 — Love Meter Animation
    function animateLoveMeter() {
        const fill = document.getElementById('meter-fill');
        const value = document.getElementById('meter-value');
        const message = document.getElementById('meter-message');
        const explosion = document.getElementById('heart-explosion');

        const stages = [
            { pct: 20, label: '100%', delay: 600 },
            { pct: 35, label: '150%', delay: 1200 },
            { pct: 55, label: '500%', delay: 1800 },
            { pct: 80, label: '9999%', delay: 2500 },
            { pct: 100, label: '∞', delay: 3200 },
        ];

        stages.forEach(stage => {
            setTimeout(() => {
                fill.style.width = stage.pct + '%';
                value.textContent = stage.label;

                if (stage.label === '∞') {
                    value.style.fontSize = 'clamp(64px, 14vw, 120px)';
                    value.style.color = '#FF69B4';
                    value.style.textShadow = '0 0 60px rgba(255, 105, 180, 0.6)';

                    // Explosion
                    setTimeout(() => {
                        createHeartExplosion(explosion);
                        message.textContent = '"My love for you cannot be measured."';
                        message.classList.add('visible');
                    }, 600);
                }
            }, stage.delay);
        });
    }

    function createHeartExplosion(container) {
        const hearts = ['❤️', '💜', '💖', '💕', '✨', '🌹', '💗'];
        for (let i = 0; i < 30; i++) {
            const heart = document.createElement('span');
            heart.className = 'explosion-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            const angle = (Math.PI * 2 * i) / 30;
            const dist = 120 + Math.random() * 200;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            heart.style.setProperty('--tx', tx + 'px');
            heart.style.setProperty('--ty', ty + 'px');
            heart.style.setProperty('--rot', (Math.random() * 360) + 'deg');
            heart.style.animationDelay = (Math.random() * 0.4) + 's';
            heart.style.fontSize = (16 + Math.random() * 20) + 'px';
            container.appendChild(heart);
        }
    }

    // Page 6 — Typewriter Letter
    function animateLetter() {
        const letterText = document.getElementById('letter-text');
        const cursor = document.getElementById('letter-cursor');

        const text = `My dearest Khadija,

Meeting you changed my life in the most beautiful way.

Every laugh, every conversation, every memory with you became part of my happiness.

The rope of the matter is in our hands, either we hold on to it together or it will break.

I hope this birthday brings you all the joy you deserve.

Thank you for being my safe place and my favorite person.

Happy Birthday, my love.

❤️`;

        let i = 0;
        const speed = 35;

        function type() {
            if (i < text.length) {
                letterText.textContent += text.charAt(i);
                i++;
                setTimeout(type, text.charAt(i - 1) === '\n' ? speed * 6 : speed);
            } else {
                cursor.classList.add('hidden');
            }
        }

        setTimeout(type, 500);
    }

    // Page 7 — Heart Carousel
    function animateCarousel() {
        const scene = document.getElementById('carousel-scene');
        const ring = document.getElementById('carousel-ring');
        if (!scene || !ring) return;

        // Spawn sparkles around carousel
        const sparkleContainer = scene;
        const sparkles = ['✦', '✧', '⋆', '✨'];
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const sp = document.createElement('span');
                sp.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sp.style.cssText = `
                    position: absolute;
                    font-size: ${8 + Math.random() * 10}px;
                    color: rgba(255, 215, 0, ${0.3 + Math.random() * 0.4});
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    pointer-events: none;
                    animation: sparkleTwinkle ${1.5 + Math.random() * 2}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
                    z-index: 1;
                `;
                sparkleContainer.appendChild(sp);
            }, i * 100);
        }

        // Mouse parallax tilt on desktop
        scene.addEventListener('mousemove', function (e) {
            const rect = scene.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            ring.style.transform = `rotateX(${y * -10}deg)`;
        });

        scene.addEventListener('mouseleave', function () {
            ring.style.transform = '';
        });
    }

    // Page 8 — Final Surprise
    function animateFinalPage() {
        // Animate lines
        const lines = document.querySelectorAll('#final-lines .final-line');
        lines.forEach(line => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
            }, delay + 500);
        });

        // Animate love text
        setTimeout(() => {
            document.getElementById('final-love').classList.add('visible');
        }, 2500);

        // Start floating hearts
        startFinalHearts();
    }

    function startFinalHearts() {
        const container = document.getElementById('final-hearts');
        const hearts = ['❤️', '💜', '💖', '💕', '🌹', '✨'];

        function spawnHeart() {
            if (currentPage !== 8) return;
            const heart = document.createElement('span');
            heart.className = 'floating-final-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = (14 + Math.random() * 20) + 'px';
            heart.style.animationDuration = (3 + Math.random() * 3) + 's';
            heart.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 7000);

            setTimeout(spawnHeart, 200 + Math.random() * 400);
        }

        spawnHeart();
    }

    // ---- Particle System ----
    function initParticles() {
        const canvas = particlesCanvas;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeDir = Math.random() > 0.5 ? 1 : -1;
                // Colors: gold, lavender, pink, white
                const colors = [
                    '255, 215, 0',
                    '200, 162, 200',
                    '255, 182, 193',
                    '255, 255, 255',
                    '255, 105, 180'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.fadeDir * 0.003;
                if (this.opacity > 0.6) this.fadeDir = -1;
                if (this.opacity < 0.05) this.fadeDir = 1;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.15})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ---- Rose Petals ----
    function spawnPetals() {
        const types = ['', 'rose', 'heart'];

        function createPetal() {
            const petal = document.createElement('div');
            const type = types[Math.floor(Math.random() * types.length)];
            petal.className = 'petal' + (type ? ' ' + type : '');
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDuration = (8 + Math.random() * 10) + 's';
            petal.style.animationDelay = Math.random() * 2 + 's';
            petal.style.fontSize = (12 + Math.random() * 8) + 'px';
            petalsContainer.appendChild(petal);

            setTimeout(() => {
                petal.remove();
            }, 20000);
        }

        // Initial burst
        for (let i = 0; i < 8; i++) {
            setTimeout(createPetal, i * 500);
        }

        // Continuous spawning
        setInterval(() => {
            if (document.hidden) return;
            createPetal();
        }, 2500);
    }

    // ---- Start ----
    document.addEventListener('DOMContentLoaded', init);
})();
