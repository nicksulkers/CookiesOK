if(location.href.indexOf('?url=') !== -1){
	var url = unescape(location.href.split("?url=")[1]);
	document.getElementById("url").value = url;
}

document.getElementById("anotherUrl").addEventListener('click', function(){
	document.getElementById('thankYou').style.display = 'none';
	document.getElementById('formPanel').style.display = 'block';
});

chrome.storage.sync.get('options', function(values){
	if(!values.options) return;
	values.options.email && (document.getElementById('email').value = values.options.email);
	values.options.reportedCount && (document.title = '(' + values.options.reportedCount + ') ' + document.title);
});

document.getElementById("submitReport").addEventListener('click', function(){
	document.getElementById("submitReport").setAttribute('disabled', 'disabled');

	var notes = document.getElementById('additionalNotes');
	var url = document.getElementById('url');
	var email = document.getElementById('email');

	chrome.storage.sync.get('options', function(values){
		values.options.email = email.value;
		if(!values.options.reportedCount)
			values.options.reportedCount = 0;
		++values.options.reportedCount;
		chrome.storage.sync.set(values, function(){
		});
	});

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4){
			document.getElementById("submitReport").removeAttribute('disabled');
			document.getElementById('thankYou').style.display = 'block';
			document.getElementById('formPanel').style.display = 'none';
		}
	}
	xmlhttp.open("POST", "http://cookiesok.com/5/report", true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send("url=" + escape(url.value) + "&email=" + escape(email.value) + "&notes=" + escape(notes.value));
	notes.value = '';
	url.value = '';
});