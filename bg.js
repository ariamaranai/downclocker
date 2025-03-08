{
  let dbgTabId = 0;
  let badgeText = "";
  let tabActivatedHandler = activeInfo =>
    chrome.action.setBadgeText({ text: activeInfo.tabId == dbgTabId ? badgeText : "" });

  chrome.debugger.onDetach.addListener(() => (
    chrome.tabs.onActivated.removeListener(tabActivatedHandler),
    chrome.action.setBadgeText({ text: "" }),
    dbgTabId = 0
  ));
  chrome.runtime.onMessage.addListener(async m => {
    let tab = m[0];
    let rate = m[1];
    let tabId = tab.id;
    let target = { tabId };
    if (tabId == dbgTabId)
      rate != "1"
        ? (
          chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
            rate: +rate
          }),
          chrome.action.setBadgeText({ text: badgeText = "x" + rate })
        )
        : chrome.debugger.onDetach.dispatch()
    else if (rate != "1") {
      let url = tab.url;
      if (url[0] == "c") {
        await chrome.tabs.update({ url: "about:blank" });
        let { promise, resolve }  = Promise.withResolvers();
        let init = id => id == tabId && resolve();
        chrome.tabs.onUpdated.addListener(init);
        await promise;
        chrome.tabs.onUpdated.removeListener(init);
        await chrome.tabs.update({ url });
      }
      chrome.debugger.attach(target, "1.3");
      chrome.debugger.sendCommand(target, "Target.setAutoAttach", {
        autoAttach: !0,
        waitForDebuggerOnStart: !1
      });
      chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
        rate: +rate
      });
      dbgTabId = tabId;
      chrome.tabs.onActivated.addListener(tabActivatedHandler);
      chrome.action.setBadgeText({ text: badgeText = "x" + rate });
    }
  });
}
chrome.action.setBadgeTextColor({ color: "#fff" });