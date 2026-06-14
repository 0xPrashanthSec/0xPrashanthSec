/* ============================================================
   0xPrashanthSec Portfolio — White/Black Editorial Theme
   Features: Subtle dot canvas · Typing effect · Blog integration
             Scroll reveal · Nav behaviour
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ── Navbar ─────────────────────────────────────────── */
    const navbar  = document.getElementById('navbar');
    const navList = document.getElementById('nav-list');
    const burger  = document.getElementById('burger');

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        markActiveNav();
    }, { passive: true });

    if (burger && navList) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            navList.classList.toggle('open');
            document.body.style.overflow = navList.classList.contains('open') ? 'hidden' : '';
        });
    }

    document.querySelectorAll('.nlink').forEach(a => {
        a.addEventListener('click', () => {
            if (burger) burger.classList.remove('open');
            if (navList) navList.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (!t) return;
            e.preventDefault();
            window.scrollTo({ top: t.offsetTop - 68, behavior: 'smooth' });
        });
    });

    function markActiveNav() {
        const secs = document.querySelectorAll('section[id]');
        const sy   = window.scrollY + 90;
        secs.forEach(s => {
            const lnk = document.querySelector(`.nlink[href="#${s.id}"]`);
            if (!lnk) return;
            lnk.classList.toggle('active', sy >= s.offsetTop && sy < s.offsetTop + s.offsetHeight);
        });
    }

    /* ── Subtle Dot Canvas (light, not matrix) ─────────── */
    (function initDots() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W, H, pts = [];

        function resize() {
            W = canvas.width  = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
            pts = Array.from({ length: Math.floor((W * H) / 14000) }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
                r: Math.random() * 1.5 + .5,
            }));
        }

        let mx = null, my = null;
        canvas.closest('section')?.addEventListener('mousemove', e => {
            const r = canvas.getBoundingClientRect();
            mx = e.clientX - r.left;
            my = e.clientY - r.top;
        });
        canvas.closest('section')?.addEventListener('mouseleave', () => { mx = null; my = null; });

        function draw() {
            ctx.clearRect(0, 0, W, H);

            pts.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                ctx.fill();

                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0,0,0,${0.05 * (1 - d/120)})`;
                        ctx.lineWidth = .5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }

                if (mx !== null) {
                    const dx = p.x - mx, dy = p.y - my;
                    const d  = Math.sqrt(dx*dx + dy*dy);
                    if (d < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0,0,0,${0.1 * (1 - d/140)})`;
                        ctx.lineWidth = .8;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mx, my);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize, { passive: true });
        draw();
    })();

    /* ── Typing Effect ──────────────────────────────────── */
    (function typing() {
        const roles = [
            'Threat Hunting & DFIR Specialist',
            'SOC Lead & Detection Engineer',
            'Purple Team Operator (CRTE/CRTO)',
            'SIEM Architect & Automation Builder',
            'Malware Analyst & IOC Hunter',
        ];
        const el = document.getElementById('typed-text');
        if (!el) return;
        let ri = 0, ci = 0, del = false, wait = 0;
        setInterval(() => {
            if (wait > 0) { wait--; return; }
            const w = roles[ri];
            if (del) {
                el.textContent = w.slice(0, --ci);
                if (ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 10; }
            } else {
                el.textContent = w.slice(0, ++ci);
                if (ci === w.length) { del = true; wait = 50; }
            }
        }, 60);
    })();

    /* ── Scroll Reveal ──────────────────────────────────── */
    const revealSel = '.pcard,.skcard,.rcard,.bcard,.profile-box,.timeline-box,.about-text,.terminal';
    const revEls = document.querySelectorAll(revealSel);
    revEls.forEach(el => el.classList.add('reveal'));

    const revObs = new IntersectionObserver(entries => {
        entries.forEach((e, idx) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), (idx % 5) * 70);
                revObs.unobserve(e.target);
            }
        });
    }, { threshold: .07, rootMargin: '0px 0px -30px 0px' });
    revEls.forEach(el => revObs.observe(el));

    /* ── Prism ──────────────────────────────────────────── */
    const hljs = () => { if (window.Prism) Prism.highlightAll(); };
    hljs(); window.addEventListener('load', hljs);

    /* ── Keyboard ───────────────────────────────────────── */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (burger)  burger.classList.remove('open');
            if (navList) navList.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    /* ── Page fade-in ───────────────────────────────────── */
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.style.opacity = '1'));

    console.log('%c0xPrashanthSec · SOC Lead · Detection Engineer', 'font-family:monospace;font-size:13px;color:#1d3557;font-weight:bold');
    console.log('%cGitHub: @0xPrashanthSec · Blog: prashanth.blog', 'font-family:monospace;font-size:11px;color:#7a766e');
});
