// 확장프로그램 아이콘 우클릭 시 사이드 패널 열기 옵션 활성화
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// 컨텍스트 메뉴에서 사이드 패널 열기
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'open-side-panel',
    title: '2026 PLAN 사이드 패널 열기',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-side-panel') {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
