/* ============================================================
   0xPrashanthSec Portfolio — White/Black Editorial Theme
   Features: Subtle dot canvas · Typing effect · RSS news feed
             Blog integration · Scroll reveal · Nav behaviour
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ── Clock ─────────────────────────────────────────── */
    function clock() {
        const el = document.getElementById('tb-time');
        if (!el) return;
        const n = new Date();
        const p = v => String(v).padStart(2,'0');
        el.textContent = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())} IST`;
    }
    clock();
    setInterval(clock, 1000);

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
            window.scrollTo({ top: t.offsetTop - 92, behavior: 'smooth' });
        });
    });

    function markActiveNav() {
        const secs = document.querySelectorAll('section[id]');
        const sy   = window.scrollY + 110;
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

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                ctx.fill();

                // Connect nearby dots
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

                // Connect to mouse
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

    /* ── Counter Animation ──────────────────────────────── */
    function runCounters() {
        document.querySelectorAll('[data-target]').forEach(el => {
            const target = +el.dataset.target;
            let cur = 0;
            const step = target / (1600 / 16);
            const t = setInterval(() => {
                cur = Math.min(cur + step, target);
                el.textContent = Math.floor(cur);
                if (cur >= target) clearInterval(t);
            }, 16);
        });
    }
    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) {
        new IntersectionObserver((ens, obs) => {
            if (ens[0].isIntersecting) { runCounters(); obs.disconnect(); }
        }, { threshold: .4 }).observe(statsEl);
    }

    /* ── Scroll Reveal ──────────────────────────────────── */
    const revealSel = '.pcard,.skcard,.rcard,.bcard,.icard,.profile-box,.timeline-box,.about-text,.terminal,.hero-stats';
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

    /* ── Security News Feed ─────────────────────────────── */
    const SOURCES = [
        { url: 'https://feeds.feedburner.com/TheHackersNews',  label: 'The Hacker News' },
        { url: 'https://www.bleepingcomputer.com/feed/',       label: 'BleepingComputer' },
        { url: 'https://krebsonsecurity.com/feed/',            label: 'Krebs on Security' },
        { url: 'https://www.securityweek.com/feed',            label: 'SecurityWeek'     },
    ];
    const R2J       = 'https://api.rss2json.com/v1/api.json?rss_url=';
    const CACHE_KEY = 'intel_feed_v4';
    const CACHE_TTL = 3 * 60 * 60 * 1000;

    function categorize(text) {
        const t = text.toLowerCase();
        if (/ransomware|lockbit|cl0p|blackcat|extortion/.test(t)) return 'ransomware';
        if (/breach|leak|exposed|stolen|credential|data dump/.test(t)) return 'breach';
        if (/cve-|zero.?day|exploit|vulnerability|rce|patch|auth bypass|buffer overflow/.test(t)) return 'vulnerability';
        if (/apt|threat actor|campaign|espionage|nation.?state|unc\d|ta\d|fin\d/.test(t)) return 'threat-intel';
        if (/malware|trojan|backdoor|rat |botnet|infostealer|loader|dropper/.test(t)) return 'malware';
        return 'general';
    }
    function severity(text, cat) {
        const t = text.toLowerCase();
        if (/zero.?day|critical|ransomware|actively exploit|rce|wormable|mass exploit/.test(t)) return 'critical';
        if (/high.?sever|data breach|apt |nation.?state|supply.?chain/.test(t)) return 'high';
        if (/medium|patch|advisory|vulnerability/.test(t)) return 'medium';
        return 'low';
    }
    function timeAgo(ds) {
        const d = Math.floor((Date.now() - new Date(ds)) / 60000);
        if (d < 60)   return `${d}m ago`;
        if (d < 1440) return `${Math.floor(d/60)}h ago`;
        return `${Math.floor(d/1440)}d ago`;
    }

    function buildCard(item) {
        const combo = (item.title || '') + ' ' + (item.description || '');
        const cat   = categorize(combo);
        const sev   = severity(combo, cat);
        const labels = { critical:'CRITICAL', high:'HIGH', medium:'MEDIUM', low:'LOW' };
        const cats   = { ransomware:'🔴 Ransomware', breach:'💾 Breach', vulnerability:'⚠️ Vulnerability', 'threat-intel':'🎯 Threat Intel', malware:'🦠 Malware', general:'📡 Security' };
        const title  = (item.title || '').replace(/<[^>]*>/g,'').slice(0, 110);

        const d = document.createElement('div');
        d.className = 'icard reveal';
        d.dataset.cat = cat;
        d.innerHTML = `
            <div class="icard-row1">
                <span class="isev sev-${sev}">${labels[sev]}</span>
                <span class="icat">${cats[cat]}</span>
            </div>
            <div class="ititle"><a href="${item.link}" target="_blank" rel="noopener">${title}</a></div>
            <div class="imeta">
                <span class="isource">${item._src}</span>
                <span class="idate">${timeAgo(item.pubDate)}</span>
            </div>
            <a href="${item.link}" target="_blank" rel="noopener" class="iread">Read →</a>`;
        return d;
    }

    async function fetchFeed(src) {
        try {
            const res  = await fetch(R2J + encodeURIComponent(src.url), { signal: AbortSignal.timeout(8000) });
            const data = await res.json();
            if (data.status !== 'ok') return [];
            return (data.items || []).slice(0, 5).map(i => ({ ...i, _src: src.label }));
        } catch { return []; }
    }

    let cachedItems = [];

    async function loadIntel(force = false) {
        const grid = document.getElementById('intel-grid');
        if (!grid) return;

        // Cache
        if (!force) {
            try {
                const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
                if (c && Date.now() - c.ts < CACHE_TTL && c.items?.length) {
                    renderCards(c.items, grid);
                    setTimestamp(new Date(c.ts));
                    cachedItems = c.items;
                    return;
                }
            } catch {}
        }

        grid.innerHTML = '<div class="load-state"><div class="lspin"></div><p>Fetching threat intelligence…</p></div>';

        const results = await Promise.allSettled(SOURCES.map(fetchFeed));
        let items = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value).filter(i => i.title && i.link);
        items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const seen = new Set();
        items = items.filter(i => {
            const k = i.title.slice(0, 45).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k); return true;
        }).slice(0, 18);

        if (items.length) {
            try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items })); } catch {}
            cachedItems = items;
            renderCards(items, grid);
            setTimestamp(new Date());
        } else {
            grid.innerHTML = `<div class="load-state"><p style="color:#b91c1c">⚠ Feed temporarily unavailable. <a href="https://thehackernews.com" target="_blank" style="color:var(--accent)">Visit THN →</a></p></div>`;
        }
    }

    function renderCards(items, grid) {
        grid.innerHTML = '';
        items.forEach(item => {
            const card = buildCard(item);
            grid.appendChild(card);
            setTimeout(() => revObs.observe(card), 10);
        });
    }

    function setTimestamp(d) {
        const el = document.getElementById('intel-ts');
        if (el) el.textContent = `Updated ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }

    // Filters
    document.querySelectorAll('.flt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.flt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            document.querySelectorAll('.icard').forEach(c => {
                c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none';
            });
        });
    });

    document.getElementById('intel-refresh')?.addEventListener('click', () => loadIntel(true));
    loadIntel();

    /* ── Medium Blog Feed ───────────────────────────────── */
    async function loadBlogs() {
        const grid     = document.getElementById('blogs-grid');
        const fallback = document.getElementById('blogs-fallback');
        if (!grid) return;
        try {
            const url  = R2J + encodeURIComponent('https://medium.com/feed/@prashanth-pulisetti');
            const res  = await fetch(url, { signal: AbortSignal.timeout(9000) });
            const data = await res.json();
            if (data.status !== 'ok' || !data.items?.length) throw 0;
            grid.innerHTML = '';
            data.items.slice(0, 6).forEach(a => {
                const tags    = (a.categories || []).slice(0, 3);
                const dt      = new Date(a.pubDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const excerpt = (a.description || '').replace(/<[^>]*>/g,'').slice(0,145) + '…';
                const d = document.createElement('div');
                d.className = 'bcard reveal';
                d.innerHTML = `
                    <div class="bcard-meta">
                        <span class="bcat">${tags[0] || 'Security'}</span>
                        <span class="bdt">${dt}</span>
                    </div>
                    <h3>${a.title}</h3>
                    <p>${excerpt}</p>
                    <div class="btags">${tags.map(t=>`<span>${t}</span>`).join('')}</div>
                    <a href="${a.link}" target="_blank" rel="noopener" class="bread">Read on Medium →</a>`;
                grid.appendChild(d);
                setTimeout(() => revObs.observe(d), 10);
            });
        } catch {
            if (grid)     grid.style.display     = 'none';
            if (fallback) fallback.style.display  = 'grid';
        }
    }
    loadBlogs();
    setTimeout(() => {
        const g = document.getElementById('blogs-grid');
        const f = document.getElementById('blogs-fallback');
        if (g && g.querySelector('.load-state')) { g.style.display='none'; if(f) f.style.display='grid'; }
    }, 9000);

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
