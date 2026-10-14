(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));
  const form = document.getElementById('prayer-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('prayer-name').value.trim();
    const topic = document.getElementById('prayer-topic').value;
    const message = document.getElementById('prayer-message').value.trim();
    const error = document.getElementById('form-error');
    if (!message) { error.textContent = 'Please write a short prayer request before continuing.'; return; }
    error.textContent = '';
    const body = `Hello Jesus Embassy — For All Nations, I would like to share a prayer request.\n\nName: ${name || 'Not provided'}\nCategory: ${topic}\nPrayer request: ${message}`;
    const url = 'https://wa.me/265885914196?text=' + encodeURIComponent(body);
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
