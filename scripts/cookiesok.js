(function(){
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
			case 'click':
			case 'submit':
			case 'focus':
			case 'blur':
			case 'select':
				target[orders.action]();
				break;
			case 'removeClasses':
				var classes = target.className.trim().split(/\s+/);
				var index;
				for(var a in orders.args)
					if(-1 !== (index = classes.indexOf(orders.args[a])))
						classes.splice(index, 1);
				target.className = classes.join(" ");
				break;
			case 'addClasses':
				for(var b in orders.args)
					target.className += " " + orders.args[b];
				break;
		}
	}

	var script = document.createElement('script');
	script.innerHTML = 'if(window.CookiesOK) window.CookiesOK("' + chrome.runtime.getManifest().version + '");';
	document.documentElement.appendChild(script);
	document.documentElement.removeChild(script);

	(function performOrders(){
		if(!getDomainOrdersComplete)
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