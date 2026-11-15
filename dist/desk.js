/* Persist desktop navigation; the phone always keeps its bottom navigation. */
(() => {
  const root = document.documentElement;
  const key = 'matclub-sidebar-hidden';
  let collapsed = false;
  try { collapsed = localStorage.getItem(key) === '1'; } catch {}
  root.dataset.sidebar = collapsed ? 'hidden' : 'shown';
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('siteSidebar');
    const toggle = document.getElementById('sidebarToggle');
    const desktop = matchMedia('(min-width:768px) and (min-height:501px), (min-width:1024px)');
    if (!sidebar || !toggle) return;
    function apply() {
      const hidden = desktop.matches && collapsed;
      root.dataset.sidebar = collapsed ? 'hidden' : 'shown';
      sidebar.inert = hidden;
      toggle.setAttribute('aria-expanded', String(!hidden));
      toggle.title = hidden ? 'Показать боковое меню' : 'Скрыть боковое меню';
      toggle.setAttribute('aria-label', toggle.title);
    }
    toggle.addEventListener('click', () => {
      collapsed = !collapsed;
      try { localStorage.setItem(key, collapsed ? '1' : '0'); } catch {}
      apply();
    });
    desktop.addEventListener('change', apply);
    apply();

    const svg = document.querySelector('.math-plot');
    const curve = document.getElementById('bannerCurve');
    const dot = svg?.querySelector('.plot-traveler');
    const halo = svg?.querySelector('.plot-traveler-halo');
    const projection = svg?.querySelector('.plot-projection');
    const hero = document.querySelector('.hero');
    if (!curve || !dot || !hero) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true, frame = 0, elapsed = 0, last = 0, drawn = 0;
    const length = curve.getTotalLength();
    // Cache geometry once: no path measurement or layout reads during animation.
    const points = Array.from({ length: 241 }, (_, i) => curve.getPointAtLength(length * (.12 + .76 * i / 240)));
    function place(progress) {
      const index = progress * 240, a = Math.floor(index), b = Math.min(240, a + 1), t = index - a;
      const x = points[a].x + (points[b].x - points[a].x) * t;
      const y = points[a].y + (points[b].y - points[a].y) * t;
      for (const el of [dot, halo]) { el.setAttribute('cx', x.toFixed(2)); el.setAttribute('cy', y.toFixed(2)); }
      projection.setAttribute('d', `M${x.toFixed(2)} ${y.toFixed(2)}V220`);
    }
    function allowed() {
      return !document.hidden && inView && !hero.hidden && root.dataset.domain !== 'physics' && root.dataset.motion !== 'off' && !reduced.matches;
    }
    function tick(now) {
      frame = 0;
      if (!allowed()) { last = 0; return; }
      if (last) elapsed += Math.min(now - last, 64);
      last = now;
      if (now - drawn >= 32) {
        // Cosine easing gives a continuous, gentle reversal with zero end velocity.
        place((1 - Math.cos(elapsed * Math.PI / 7000)) / 2);
        drawn = now;
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (allowed()) { if (!frame) frame = requestAnimationFrame(tick); }
      else { cancelAnimationFrame(frame); frame = 0; last = 0; }
    }
    place(.6);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting; sync();
    }, { threshold: .05 }).observe(hero);
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-domain', 'data-motion'] });
    new MutationObserver(sync).observe(hero, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    sync();
  });
})();
