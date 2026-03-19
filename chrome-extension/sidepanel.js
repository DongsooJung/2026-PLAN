const BASE_URL = 'https://2026-plan-8zwh.vercel.app';
const frame = document.getElementById('app-frame');
const navDashboard = document.getElementById('nav-dashboard');
const navConverter = document.getElementById('nav-converter');
const navExternal = document.getElementById('nav-external');

function setActive(btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

navDashboard.addEventListener('click', () => {
  frame.src = `${BASE_URL}/dashboard`;
  setActive(navDashboard);
});

navConverter.addEventListener('click', () => {
  frame.src = `${BASE_URL}/converter`;
  setActive(navConverter);
});

navExternal.addEventListener('click', () => {
  chrome.tabs.create({ url: frame.src });
});
