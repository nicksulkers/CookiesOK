(function () {
	var a = document.querySelectorAll('[data-translation]');
	for (var i = 0; i < a.length; ++i) {
		a[i].innerText = chrome.i18n.getMessage(a[i].getAttribute('data-translation'));
	}
})();