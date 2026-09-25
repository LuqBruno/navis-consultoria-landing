const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileNav.hidden = !open;
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileNav.hidden = true;
}));

const method = document.querySelector('.method');
const methodArt = document.querySelector('.method-art');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (method && methodArt) {
  const beam = methodArt.querySelector('.beam');
  methodArt.classList.add('is-enhanced');
  let currentAngle = -36;
  let pointerX = 0;
  let pointerY = 0;
  let tracking = false;
  let visible = false;
  let frame = 0;
  let lastTime = 0;

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  };

  const tick = time => {
    if (!visible || reducedMotion.matches) return stop();
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;

    if (tracking) {
      const bounds = methodArt.getBoundingClientRect();
      const target = Math.atan2(pointerY - bounds.top - bounds.height / 2, pointerX - bounds.left - bounds.width / 2) * 180 / Math.PI;
      const shortestTurn = ((target - currentAngle + 540) % 360) - 180;
      currentAngle += shortestTurn * Math.min(1, elapsed / 105);
    } else {
      currentAngle = (currentAngle + elapsed * .02) % 360;
    }

    beam.style.transform = `rotate(${currentAngle}deg)`;
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (frame || !visible || reducedMotion.matches) return;
    frame = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else stop();
  }, { rootMargin: '100px' });
  observer.observe(method);

  method.addEventListener('pointermove', event => {
    if (!precisePointer.matches || reducedMotion.matches) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    tracking = true;
    start();
  }, { passive: true });

  method.addEventListener('pointerleave', () => {
    tracking = false;
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stop();
      tracking = false;
      beam.style.removeProperty('transform');
    } else {
      start();
    }
  });
}
