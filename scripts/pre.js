var script = document.createElement('script');
script.innerHTML = 'navigator.CookiesOK="I explicitly accept all cookies";';
document.documentElement.appendChild(script);
setTimeout(function(){
	document.documentElement.removeChild(script);
}, 15);