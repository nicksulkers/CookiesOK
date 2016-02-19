(function(){
	var version = chrome.runtime.getManifest().version;

	var retryTimeout = 500;
	var attemptsLimit = 10;

	function performOrder(orders, attempt){
		if(!attempt)
			attempt = 1;

		var frames = orders.target.split("->");
		var target = document.querySelector(frames[0]);

		for(var i = 1; target && i < frames.length; ++i)
			try{
				target = target.contentWindow.document.querySelector(frames[i])
			}catch(ex){
				target = null;
			}

		if(!target){
			if(attempt < attemptsLimit)
				setTimeout(performOrder, retryTimeout, orders, attempt + 1);
			return;
		}

		switch(orders.action){
			case 'hide':
				target.style.display = 'none';
				break;
			case 'remove':
				target.parentNode.removeChild(target);
				break;
			default:
				target[orders.action]();
				break;
		}
	}

	//Always Attempt to execute the CookiesOK method, remove from source after execution
	//this allows websites to recognize CookiesOK and assume consent
	var script = document.createElement('script');
	script.innerHTML = 'if(window.CookiesOK) window.CookiesOK("' + version + '");';
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(script);
	setTimeout(function(){
		head.removeChild(script);
	}, 15);

	//retrieve database from background
	(function performOrders(){
		if(!getDomainOrdersComplete) //this should never happen.. but in theory, it could
			return setTimeout(performOrders, 15);

		if(orders){
			if(orders.action)
				orders = [orders];

			for(var i in orders)
				performOrder(orders[i]);

			for(var o in hideStyles)
				hideStyles[o].parentNode.removeChild(hideStyles[o]);
		}else{
			var a = document.getElementsByClassName('CookiesOK');
			a.length && a[0].click();
		}
	})();
})();