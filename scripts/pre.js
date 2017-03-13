var orders = null;
var getDomainOrdersComplete = false;
var hideStyles = [];

(function(){
	var script = document.createElement('script');
	script.innerHTML = 'navigator.CookiesOK = "I explicitly accept all cookies";';
	document.documentElement.appendChild(script);
	document.documentElement.removeChild(script);

	chrome.runtime.sendMessage({"action": "getDomainOrders", "hostname": location.hostname}, function(result){
		getDomainOrdersComplete = true;
		if(!result || !result.success)
			return;

		orders = result.orders;
		if(orders){
			if(orders.action)
				orders = [orders];

			for(var i in orders)
				if(orders[i].action == 'hide' || orders[i].action == 'remove'){
					var ss = document.createElement('style');
					ss.innerHTML = orders[i].target + '{display:none !important;}';
					document.documentElement.appendChild(ss);
					hideStyles.push(ss);
				}
		}
	});
})();
