
//SETUP GLOBALS
var songData = {};
var bufferData = {"analysers": [], "tracks": [], "buffers":{}};
var originArrayBuffer = {};
var kekFileData = {"promiseCount":0, "totalFiles": 1000};
var chatData = "";

var socket = io.connect();
var canvas = document.getElementById('canvaz');
var ctx = canvas.getContext('2d');
var context;
var playing = false;
var playTime = 0;
var slop = .01;

//SETUP LOAD ALL THE AUDIO
window.onload = init;
function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
	loadKek("/data/song1.kek", "url")
}


// Loop for Draw and scheduling
function mainLoop(){
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
}


function draw(){
	var zoom = 16
	canvas.width = songData.end * zoom
	canvas.height = songData.tracks.length * 62
	for (var i=0; i<songData.tracks.length; ++i) {
		var rev = songData.tracks[i].currentRevision
		for (var af=0; af<songData.tracks[i].revisions[rev].audio.length; ++af){
			var timeTotal = songData.tracks[i].revisions[rev].audio[af].init_formal
			var tlen = globalTime("time", bufferData.buffers[songData.tracks[i].revisions[rev].audio[af].file].duration, "formal")
			var my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
			my_gradient.addColorStop(0, "#2ff3f3");
			my_gradient.addColorStop(1, "#b400e1");
			ctx.fillStyle = my_gradient;
			ctx.fillRect(timeTotal[0]*zoom,i*62,tlen[0]*zoom,60);
			ctx.fillStyle = "Black"
			var newtime = globalTime("time",(context.currentTime - playTime),"formal")
			ctx.fillRect((newtime[0]*zoom)+parseInt(newtime[1]*(zoom/4))+parseInt(newtime[2]*(zoom/16)),0,1,62*songData.tracks.length)
			document.getElementById('currentTime').innerHTML = "Measure: " + newtime[0] + " , Quarter: " + newtime[1] + " , 16th: " + newtime[2]
		}
	}
}


socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=chatData
	document.getElementById('usrmsg').value = "";
});
