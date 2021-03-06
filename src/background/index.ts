import { updateUserLastActiveTime } from '../base/status';
import config from '../base/config';
import * as searchSelection from '../base/functions/searchSelection';

const ALARM_SYNC_CONFIG = 'config:sync';

chrome.alarms.create(ALARM_SYNC_CONFIG, {
  periodInMinutes: 1,
  delayInMinutes: 0,
});

chrome.alarms.onAlarm.addListener(({ name }) => {
  if (name === ALARM_SYNC_CONFIG) {
    config.sync();
  }
});

chrome.tabs.onCreated.addListener(() => {
  updateUserLastActiveTime(new Date());
});

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
  if (!['update', 'install'].includes(reason)) {
    return;
  }
  const prev = previousVersion;
  const curr = chrome.runtime.getManifest().version;
  if (!prev || +curr.split('.')[0] > +prev.split('.')[0]) {
    const url = chrome.runtime.getURL(`/main/index.html#/options?reason=${reason}`);
    chrome.tabs.create({ url });
  }
});

searchSelection.updateContextMenu();
chrome.contextMenus.onClicked.addListener(searchSelection.onSearchMenuItemClicked);
chrome.tabs.onUpdated.addListener(searchSelection.onTabUpdated);

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (msg?.key === 'getTabId') {
    send({ tabId: sender.tab.id });
    return true;
  }
});
