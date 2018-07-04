//SETUP SOCKSET
var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=data
	document.getElementById('usrmsg').value = "";
});
//SETUP JSONDATATS
var songData = {"tracks":[{"trackName":"Synth","currentRevision":"rev1","settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[{"file":"/data/synth.mp3","init_formal":[1,0,0,0,0]},{"file":"/data/synth.mp3","init_formal":[49,0,0,0,0]}]},{"trackName":"Drums","currentRevision":"rev1","settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[{"file":"/data/drum.mp3","init_formal":[0,0,0,0,0]}]}],"songName":"Song1","bpm":140,"end":177}
var bufferData = {"analysers": [], "tracks": [] }

window.onload = init;
var context;
var bufferLoader;
var playing = false;
var playTime = 0;
var canvas = document.getElementById('canvaz');
var ctx = canvas.getContext('2d');
//GIVE BUFFER TIME
var slop = .02

//SETUP LOAD ALL THE AUDIO
function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
	bufferTracks();
}



function mainLoop(){
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
}

document.getElementById('canvaz').onclick(function(e){
   var parentOffset = $(this).parent().offset();
   //or $(this).offset(); if you really just want the current element's offset
   var relX = e.pageX - parentOffset.left;
   var relY = e.pageY - parentOffset.top;
});

function draw(){
	var zoom = 16

	canvas.width = songData.end * zoom
	canvas.height = songData.tracks.length * 62
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var timeTotal = songData.tracks[i].audio[af].init_formal
			var tlen = globalTime("time", bufferData.tracks[i].buffer.bufferList[af].duration, "formal")
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
