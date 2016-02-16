var bg = chrome.extension.getBackgroundPage();
var btnPause = document.getElementById('btnPause');
var btnResume = document.getElementById('btnResume');
var btnSettings = document.getElementById('btnSettings');
var btnReport = document.getElementById('btnReport');

function pause(){
	btnPause.style.display = 'none';
	btnResume.style.display = 'block';
}

function resume(){
	btnResume.style.display = 'none';
	btnPause.style.display = 'block';
}

if(bg.paused) pause();
else resume();


btnPause.addEventListener('click', function(){
	pause();
	bg.setPaused(true);
});

btnResume.addEventListener('click', function(){
	resume();
	bg.setPaused(false);
});

btnReport.addEventListener('click', function(){
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		chrome.tabs.create({'url': chrome.extension.getURL('pages/report/index.html?url=' + escape(tabs[0].url))});
	});
});

btnSettings.addEventListener('click', function(){
	chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html')});
});