var options = {};
var database = {};

function downloadDatabase() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			database.websites = JSON.parse(xhttp.responseText);
			database.updated = new Date();
		}
	};
	xhttp.open("GET", "https://cookiesok.com/database", true);
	xhttp.send();
}

function isTooOld(date) {
	date = new Date(date);
	var now = new Date();
	var timePassed = now - date;
	var msInDay = 24 * 3600 * 1000;
	return timePassed > msInDay;
}

chrome.storage.sync.get('database', function (data) {
	if (!data.database || isTooOld(data.database.updated))
		downloadDatabase();
	else
		database = data.database;
});


chrome.storage.sync.get('options', function (values) {
	if (values.options) options = values.options;

	if (options['contextmenu'] !== false) { //undefined OR true
		try {
			chrome.contextMenus.create({
				id: "CookiesOK_report", title: "Report to CookiesOK", contexts: ["page"], onclick: function (info) {
					chrome.tabs.create({'url': chrome.extension.getURL('pages/report/index.html?url=' + escape(info.pageUrl))});
				}
			});
		} catch (ex) {
		}
	} else {
		try {
			chrome.contextMenus.remove("CookiesOK_report", function () {
			});
		} catch (ex) {
		}
	}
});

chrome.webRequest.onBeforeSendHeaders.addListener(
	function (details) {
		details.requestHeaders.push({name: "X-CookiesOK", value: "I explicitly accept all cookies"})
		return {requestHeaders: details.requestHeaders};
	},
	{urls: ["http://*/*", "https://*/*"]},
	["blocking", "requestHeaders"]
);

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html?initial')});
	} else if (details.reason == "update") {
		chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html?upgradeFrom=' + escape(details.previousVersion))});
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch(request.action){
		case "kindly-requesting-the-database-oh-pretty-please":
			sendResponse({database: database.websites});
			break;
	}
});