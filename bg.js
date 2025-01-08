(chrome => {
  let debugGroupId;
  let rate;
  let hasBeforeNavigate = 0;
  let attach = target => {
    chrome.action.setBadgeText({ tabId: target.tabId, text: "x" + rate }),
    chrome.debugger.attach(target, "1.3"),
    chrome.debugger.sendCommand(target, "Target.setAutoAttach", {
      autoAttach: !0,
      waitForDebuggerOnStart: !1,
    }),
    chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
      rate: +rate
    });
    hasBeforeNavigate || (
      chrome.webNavigation.onBeforeNavigate.addListener(tracker),
      hasBeforeNavigate = 1
    );
  }
  let tracker = async tab => {
    let tabId = tab.id;
    if (tab.url[0] != "c" && !(await chrome.debugger.getTargets()).find(v => v.tabId == tabId).attached)
      attach({ tabId });
  }
  chrome.action.setBadgeTextColor({ color: "#fff" });
  
  chrome.debugger.onDetach.addListener(() => {
    debugGroupId = 0;
    chrome.webNavigation.onBeforeNavigate.removeListener(tracker);
  });
  chrome.tabGroups.onRemoved.addListener(g => {
    if (debugGroupId) {
      if (g.id == debugGroupId) {
        debugGroupId = 0;
        chrome.webNavigation.onBeforeNavigate.removeListener(tracker);
      }
    }
  });
  chrome.runtime.onMessage.addListener(async m => {
    let tab = m[0];
    rate = m[1];
    let tabId = tab.id;
    let groupId = tab.groupId;
    let target = { tabId };
    if ((await chrome.debugger.getTargets()).find(v => v.tabId == tabId)?.attached)
      if (rate != "1" && groupId == debugGroupId) (
        chrome.action.setBadgeText({ tabId, text: "x" + rate }),
        chrome.debugger.sendCommand(target, "Emulation.setCPUThrottlingRate", {
          rate: +rate
        })
      )
      else (
        chrome.action.setBadgeText({ tabId, text: "" }),
        chrome.debugger.detach(target),
        chrome.tabs.ungroup(tabId)
      );
    else if (rate != "1") {
      let tabIds = [tabId];
      if (debugGroupId) {
        if (groupId != debugGroupId) {
          tabIds = (await chrome.tabs.query({ groupId: debugGroupId })).map(v => v.id).concat(tabIds);
          chrome.tabs.group({ groupId: debugGroupId, tabIds });
        }
      } else {
        debugGroupId = await chrome.tabs.group({tabIds});
        await chrome.tabGroups.update(debugGroupId, { title: "Downclocker" });
      }
      if (tab.url[0] != "c")
        attach(target);
      }
  });
})(chrome);