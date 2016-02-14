var script = document.createElement('script');
script.innerHTML = 'navigator.CookiesOK="I explicitly accept all cookies";';
document.documentElement.appendChild(script);
setTimeout(function(){
	document.documentElement.removeChild(script);
}, 15);

var orders = null;
var getDomainOrdersComplete = false;
var hideStyles = [];

chrome.runtime.sendMessage({"action": "getDomainOrders", "hostname": location.hostname}, function(result){
	getDomainOrdersComplete = true;
	if(!result.success)
		return;

	orders = result.orders;
	if(orders){
		if(orders.action)
			orders = [orders];

		for(var i in orders)
			if(orders[i].action == 'hide'){
				//var ss = document.createElement('style');
				//ss.innerHTML = orders[i].target + '{display:none !important;}';
				//document.documentElement.appendChild(ss);
				//hideStyles.push(ss);
			}
	}
});