(function () {
	var version = chrome.runtime.getManifest().version;

	var retryTimeout = 500;
	var attemptsLimit = 10;

	function log(obj) {
		console.log(obj);
	}

	function performOrder(orders, attempt) {
		if (!attempt)
			attempt = 1;

		log('performOrder, attempt nr.: ' + attempt + '');

		var frames = orders.target.split("->");
		log('Searching target DOM: document.querySelector("' + frames[0] + '")');
		var target = document.querySelector(frames[0]);

		for (i = 1; target && i < frames.length; ++i) {
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

	chrome.runtime.sendMessage({"action": "kindly-requesting-the-database-oh-pretty-please"}, function (response) {
		//current domain minus www.
		var hostname = location.hostname;
		if (hostname.indexOf('www.') === 0)
			hostname = hostname.substr(4);
		log('Current domain = ' + hostname);

		//match database for domain, alternatively perform wildcard check
		var orders = response.database[hostname];
		log('Searching for orders...');
		if (!orders && hostname.match('.')) {
			var tmphostname = hostname.split(".");
			tmphostname[0] = '*';
			tmphostname = tmphostname.join('.');
			orders = response.database[tmphostname];
			log('Performing wildcard check...');
		}

		//if there was a match, execute
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