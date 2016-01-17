(function () {
	var version = chrome.runtime.getManifest().version;

	var retryTimeout = 500;
	var attemptsLimit = 10;

	function log(obj) {
		//console.log(obj);
	}

	function performOrder(orders, attempt) {
		if (!attempt)
			attempt = 1;

		log('performOrder, attempt nr.: ' + attempt + '');

		var frames = orders.target.split("->");
		log('Searching target DOM: document.querySelector("' + frames[0] + '")');
		var target = document.querySelector(frames[0]);

		for (var i = 1; target && i < frames.length; ++i) {
			try {
				log('.querySelector("' + frames[i] + '")');
				target = target.contentWindow.document.querySelector(frames[i])
			} catch (ex) {
				target = null;
			}
		}

		if (!target) {
			if (attempt < attemptsLimit)
				setTimeout(performOrder, retryTimeout, orders, attempt + 1);
			return;
		}

		log('target found! Performing ' + orders.action);
		switch (orders.action) {
			case 'hide':
				target.style.display = 'none';
				target.style.visibility = 'hidden';
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
	log('Attempting execution of JS function CookiesOK("' + version + '")');
	var script = document.createElement('script');
	script.innerHTML = 'if(window.CookiesOK) window.CookiesOK("' + version + '");';
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(script);
	setTimeout(function () {
		head.removeChild(script);
	}, 15);

	//retrieve database from background
	log('Looking up ' + location.hostname + ' in database');
	chrome.runtime.sendMessage({"action": "getDomainOrders", "hostname": location.hostname}, function (result) {
		log(result);
		if (!result.success)
			return;

		var orders = result.orders;
		if (orders) {
			log("Orders found...")
			if (orders.action)
				orders = [orders];

			for (var i in orders)
				performOrder(orders[i]);
		} else {
			log("No orders found...")
		}
	});
})();