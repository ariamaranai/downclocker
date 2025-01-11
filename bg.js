{
  let dbgTabId = 0;
  let badgeText = 0;
  let dbgAttach = (tabId, rate) => {
    let target = { tabId };
    chrome.debugger.attach(target, "1.3"),
    chrome.debugger.sendCommand(target, "Target.setAutoAttach", {
      autoAttach: !0,
      waitForDebuggerOnStart: !1
    }),
    chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
      rate: +rate
    }),
    chrome.tabs.onActivated.addListener(tabActivatedHandler);
    chrome.action.setBadgeText({ text: badgeText = "x" + rate })
  }
  let tabActivatedHandler = activeInfo =>
    chrome.action.setBadgeText({ text: activeInfo.tabId == dbgTabId ? badgeText : "" })
  let beforeNavigateHandler = details =>
    details.url[0] != "c" && details.tabId == dbgTabId && (
      chrome.webNavigation.onBeforeNavigate.removeListener(beforeNavigateHandler),
      dbgAttach(dbgTabId = details.tabId, badgeText.slice(1))
    );

  chrome.debugger.onDetach.addListener(() => (
    chrome.tabs.onUpdated.removeListener(beforeNaivateHandler),
    chrome.action.setBadgeText({ text: "" })
  ));
  chrome.runtime.onMessage.addListener(async m => {
    let tab = m[0];
    let rate = m[1];
    let tabId = tab.id;
    let target = { tabId };
    if ((await chrome.debugger.getTargets()).find(v => v.tabId == tabId)?.attached)
      rate != "1"
        ? (
          chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
            rate: +rate
          }),
          chrome.action.setBadgeText({ text: badgeText = "x" + rate })
        )
        : (
          chrome.tabs.onUpdated.removeListener(beforeNavigateHandler),
          chrome.action.setBadgeText({ text: "" })
        )
    else if (rate != "1") {
      if (tab.url[0] == "c")
        chrome.webNavigation.onBeforeNavigate.addListener(beforeNavigateHandler);
    dbgAttach(dbgTabId = tabId, rate);
    }
  });
}
chrome.action.setBadgeTextColor({ color: "#fff" });