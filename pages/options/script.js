var defaultEnabledProperties = ['contextmenu'];
var storageContainer = chrome.storage.sync || chrome.storage.local; //sync if possible, works for chrome and opera but is not (yet) supported in firefox

storageContainer.get('options', function(values){
	values = values.options;

	if(!values){
		values = {};
		for(var i = 0; i < defaultEnabledProperties.length; ++i)
			values[defaultEnabledProperties[i]] = true;
	}

	for(var optionName in values){
		var row = document.getElementById('options-' + optionName);
		if(!row)
			continue;
		var input = row.getElementsByTagName("input")[0];
		if(input.type == 'checkbox' || input.type == 'radio')
			input.checked = values[optionName]
		else
			input.value = values[optionName];
	}
});

var options = document.getElementsByClassName('option');

function zero(v){
	return ("0" + v).slice(-2);
}

function save(){
	var values = {};
	for(var i = 0; i < options.length; ++i){
		var row = options[i];
		var optionName = row.id.split("-")[1];
		var input = row.getElementsByTagName("input")[0];
		if(input.type == 'checkbox' || input.type == 'radio')
			values[optionName] = input.checked;
		else
			values[optionName] = input.value;
	}
	storageContainer.set({options: values}, function(){
		var date = new Date();
		document.getElementById('status').innerHTML = 'Saved at ' + zero(date.getHours()) + ':' + zero(date.getMinutes()) + ':' + zero(date.getSeconds());
	});
	chrome.extension.getBackgroundPage().window.init();
}

for(var i = 0; i < options.length; ++i){
	var row = options[i];
	var input = row.getElementsByTagName("input")[0];
	var e = 'blur';
	if(input.type == 'checkbox' || input.type == 'radio')
		e = 'click';
	input.addEventListener(e, function(){
		save();
	});
}

if(location.href.indexOf("?initial") !== -1)
	document.getElementById('initialNotice').style.display = 'block';