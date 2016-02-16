//Define navigator.CookiesOK, this allows websites to recognize CookiesOK and assume consent
//if we can, we should probably do this differently..
(function(){
	var script = document.createElement('script');
	script.innerHTML = 'navigator.CookiesOK = "I explicitly accept all cookies";';
	document.documentElement.appendChild(script);
	setTimeout(function(){
		document.documentElement.removeChild(script);
	}, 15);
})();

var orders = null;
// By the end orders will contain 1 or more instructions for the extension to get rid of cookie warnings
// we actually don't need this until cookiesok.js is injected, however.. hiding using inline css isn't instant and
// means a flickering effect on every page load. By injecting a style tag we may prevent this for most websites
var getDomainOrdersComplete = false;
var hideStyles = []; //all temporary style tags, will be removed from page when cookiesok.js is done

chrome.runtime.sendMessage({"action": "getDomainOrders", "hostname": location.hostname}, function(result){
	getDomainOrdersComplete = true;
	if(!result.success)
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