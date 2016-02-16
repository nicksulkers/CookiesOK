var paused = false;

var options = {};
var database = {};

function setPaused(value){
	paused = value;
	var g = paused ? 'grey' : '';
	chrome.browserAction.setIcon({
		path: {
			19: "images/icon19" + g + ".png",
			38: "images/icon38" + g + ".png"
		}
	});
}

function downloadDatabase(callback){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(xhttp.readyState == 4){
			if(xhttp.status == 200){
				var result = JSON.parse(xhttp.responseText);
				callback(result.success, result.data);
			}else{
				callback(false);
			}
		}
	};
	xhttp.open("GET", "https://cookiesok.com/5/database", true);
	xhttp.send();
}

function isTooOld(date){
	date = new Date(date);
	var now = new Date();
	var timePassed = now - date;
	var msInDay = 24 * 3600 * 1000; //24 hours
	return timePassed > msInDay;
}

chrome.storage.sync.get('database', function(data){
	if(!data.database || isTooOld(data.database.updated))
		downloadDatabase(function(success, data){
			if(success){
				database.websites = data;
				database.updated = new Date();
			}else database = data.database; //should the server ever face some downtime
		});
	else
		database = data.database;
});


chrome.storage.sync.get('options', function(values){
	if(values.options) options = values.options;

	if(options['contextmenu'] !== false){ //undefined OR true
		try{
			chrome.contextMenus.create({
				id: "CookiesOK_report",
				title: chrome.i18n.getMessage("context_menu_report_text"),
				contexts: ["page"],
				onclick: function(info){
					chrome.tabs.create({'url': chrome.extension.getURL('pages/report/index.html?url=' + escape(info.pageUrl))});
				}
			});
		}catch(ex){
		}
	}else{
		try{
			chrome.contextMenus.remove("CookiesOK_report", function(){
			});
		}catch(ex){
		}
	}
});

//Send along a X-CookiesOK HTTP header
//this allows websites to recognize CookiesOK and assume consent
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details){
		details.requestHeaders.push({name: "X-CookiesOK", value: "I explicitly accept all cookies"})
		return {requestHeaders: details.requestHeaders};
	},
	{urls: ["http://*/*", "https://*/*"]},
	["blocking", "requestHeaders"]
);

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html?initial')});
	}else if(details.reason == "update"){
		//chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html?upgradeFrom=' + escape(details.previousVersion))});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(paused){
		sendResponse({success: false});
		return;
	}
	switch(request.action){
		case "getDomainOrders":
			var hostname = request.hostname;
			if(hostname.indexOf('www.') === 0)
				hostname = hostname.substr(4);

			var orders = database.websites[hostname];
			if(!orders && hostname.match('.')){
				var tmpHostname = hostname.split(".");
				tmpHostname[0] = '*';
				tmpHostname = tmpHostname.join('.');
				orders = database.websites[tmpHostname];
			}

			if(orders)
				sendResponse({success: true, orders: orders});
			else
				sendResponse({success: false});
			break;
	}
});