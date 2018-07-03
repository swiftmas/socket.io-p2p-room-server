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
var slop = .01

//SETUP LOAD ALL THE AUDIO
function init(a) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  //----- This part lets us define an optional param to only reload one of the tracks. ------
  // So a doesnt have to be passed, we can call just init() unless we want a specific track /
  a = a || "all";
  if ( a == "all"){
  var i = 0;
    upperBound=songData.tracks.length
  } else {
    var i = a;
    upperBound = a + 1;
  }
  //---- --- --  ----------------------------------------------------------------------------
	for (var i=0; i<songData.tracks.length; ++i) {
		bufferData.tracks[i]={"sources": [], "buffer": [] };
		var audioToBuffer = [];
		var curIndex = 0;
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			audioToBuffer.push(songData.tracks[i].audio[af].file);
			songData.tracks[i].audio[af].index = curIndex;
			++curIndex;
		}
		bufferData.tracks[i].buffer = new BufferLoader(
			context,
			audioToBuffer,
			i, //track number
			finishedLoading
		);
		bufferData.tracks[i].buffer.load();
	}
}
// RELEASES THE PROMISE FOR THE BUFFERS AND SIGNALS THAT PLAYBACK CAN STSART. Plays through once to alleviate need of if/thens to make sure the buffers exist.
function finishedLoading(bufferList, track) {
	console.log(track, "has loaded")
	for (var s=0; s<bufferList.length; ++s){
		bufferData.tracks[track].sources[s] = context.createBufferSource();
		bufferData.tracks[track].sources[s].buffer = bufferList[s]
		bufferData.tracks[track].sources[s].connect(bufferData.tracks[track].sources[s].context.destination)
		// This will setup our timers so that we use real time instead of calling the function every time
		songData.tracks[track].audio[s].init_time = globalTime("formal", songData.tracks[track].audio[s].init_formal, "time")
    songData.tracks[track].audio[s].init_128 = globalTime("formal", songData.tracks[track].audio[s].init_formal, "128")
		if (songData.tracks.length == bufferData.tracks.length){
					startIT();
		};
	}
}

//CREATE MASETER BUFFER READER FOR SEEKING
function playSound(track, buffer, time, offset) {
	bufferData.tracks[track].sources[buffer] = context.createBufferSource();
	bufferData.tracks[track].sources[buffer].buffer = bufferData.tracks[track].buffer.bufferList[buffer]
	bufferData.tracks[track].sources[buffer].connect(bufferData.tracks[track].sources[buffer].context.destination)
	bufferData.tracks[track].sources[buffer].start(time, offset)
	console.log("PlayFunction:", time + slop, offset)
}

//GLOBAL CONVERTER OF TIME
function globalTime(input, value, output){
	if (input == "formal" && output =="time"){
			var bpm = songData.bpm;
			var minbpm = 4 * (60/bpm)
			var timeTotal = 0;
			timeTotal += value[0] * minbpm
			timeTotal += value[1] * (minbpm/4)
			timeTotal += value[2] * (minbpm/16)
			timeTotal += value[3] * (minbpm/64)
			timeTotal += value[4] * (minbpm/256)
			return timeTotal;
	} else if (input == "formal" && output =="128"){
	    var timeTotal = 0;
	    timeTotal += value[0] * 256
	    timeTotal += value[1] * 64
	    timeTotal += value[2] * 16
	    timeTotal += value[3] * 4
	    timeTotal += value[4]
	    return timeTotal;
	} else if (input == "time" && output == "formal"){
			var bpm = songData.bpm;
	    var minbpm = 4 * (60/bpm)
			var timeFormal = [];
	    timeFormal[0] =  parseInt(value/minbpm);
			value = value - (timeFormal[0] * minbpm);
	    timeFormal[1] =  parseInt(value/(minbpm/4));
	    value = value - (timeFormal[1] * (minbpm/4))
	    timeFormal[2] =  parseInt(value/(minbpm/16));
			value = value - (timeFormal[2] * (minbpm/16))
	    timeFormal[3] =  parseInt(value/(minbpm/64));
			value = value - (timeFormal[3] * (minbpm/64))
	    timeFormal[4] =  parseInt(value/(minbpm/256));
	    return timeFormal;
	}

}



/// FUNCTIONS FOR PLAYBACK
function stop(oneAndOrTwo){
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			bufferData.tracks[i].sources[af].context.suspend()
		}
	};
}

function start(oneAndOrTwo){
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var offset = songData.tracks[i].audio[af].init_time
			try {
			bufferData.tracks[i].sources[af].stop(0)
		} catch(err) {}
			var now = context.currentTime;
			playSound(i,af,now + offset, 0)
			bufferData.tracks[i].sources[af].context.resume()
			playTime = context.currentTime
		}
	};
}

function seek(time){
	time = globalTime("formal", time, "time");
	console.log(time)
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var offset = songData.tracks[i].audio[af].init_time
			try {
			bufferData.tracks[i].sources[af].stop(0)
		  } catch(err) {}
			var now = context.currentTime;
		  offset = offset - time
			if (offset < 0){
				playSound(i,af,now,-offset)
			} else {
				playSound(i,af,now+offset, 0)
			}
			playTime =  context.currentTime - time
		}
	};
}

function resume(oneAndOrTwo){
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var offset = songData.tracks[i].audio[af].init_time
			bufferData.tracks[i].sources[af].context.resume()
		}
	};
}

function startIT(){
	setInterval(function(){
		draw()
	}, 32);
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
