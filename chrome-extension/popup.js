const BASE_URL = 'https://2026-plan-8zwh.vercel.app';

document.getElementById('btn-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: `${BASE_URL}/dashboard` });
  window.close();
});

document.getElementById('btn-converter').addEventListener('click', () => {
  chrome.tabs.create({ url: `${BASE_URL}/converter` });
  window.close();
});

document.getElementById('btn-sidepanel').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: BASE_URL });
  window.close();
});
