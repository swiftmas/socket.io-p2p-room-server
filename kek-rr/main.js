var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=data
	document.getElementById('usrmsg').value = "";
});

var songData = {"tracks":[{"trackName":"Track1","currentRevision":"rev1","settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[{"file":"/data/drum.mp3","offset":[0,0,0,0,0]},{"file":"/data/synth.mp3","offset":[4,1,0,0,0]}]}],"songName":"Song1","bpm":140}
var bufferData = {"analysers": [], "tracks": [] }

window.onload = init;
var context;
var bufferLoader;
var playing = false;

function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
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

function beatToTime(beat){
	var bpm = songData.bpm;
	var min = 60;
	var minbpm = min/bpm
	var timeTotal = 0;
	timeTotal += beat[0] * (4 * minbpm)
	timeTotal += beat[1] * (1 * minbpm)
	timeTotal += beat[2] * (minbpm/4)
	timeTotal += beat[3] * (minbpm/16)
	timeTotal += beat[4] * (minbpm/64)
	return timeTotal;
}

function finishedLoading(bufferList, track) {
	console.log(track)
	var curIndex = 0;
	bufferData.analysers[track] = context.createAnalyser();
	for (var s=0; s<bufferList.length; ++s){
		bufferData.tracks[track].sources[s] = context.createBufferSource();
		bufferData.tracks[track].sources[s].buffer = bufferList[curIndex]
		bufferData.tracks[track].sources[s].connect(bufferData.tracks[track].sources[s].context.destination)
		bufferData.tracks[track].sources[s].connect(bufferData.analysers[track])
		++curIndex;
	}
	bufferData.analysers[track].connect(context.destination);
	bufferData.analysers[track].fftSize = 2048;
	bufferLength = bufferData.analysers[track].frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
	bufferData.analysers[track].getByteTimeDomainData(dataArray);
	canvas=document.getElementById("canvaz");
	canvasCtx=canvas.getContext("2d");
	WIDTH = window.innerHeight;
	HEIGHT = window.innerWidth * .25;
	// canvasCtx.fillRect(0, 0, 300, 150);
	// canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  draw();

}




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
			var offset = beatToTime(songData.tracks[i].audio[af].offset)
			console.log("Start: ", offset)
			bufferData.tracks[i].sources[af].start(offset)
		}
	};
}

function seek(time){
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var offset = beatToTime(songData.tracks[i].audio[af].offset)
			console.log("SEEKTO: ", time)
			bufferData.tracks[i].sources[af].context._playbackTime = time
		}
	};
}

function reset(oneAndOrTwo){
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			var offset = beatToTime(songData.tracks[i].audio[af].offset)
			console.log("resume: ", offset)
			bufferData.tracks[i].sources[af].context.resume()
		}
	};
}



function draw() {
  drawVisual = requestAnimationFrame(draw);
  bufferData.analysers[0].getByteTimeDomainData(dataArray);
  canvasCtx.canvas.width  = window.innerWidth;
  canvasCtx.canvas.height = window.innerHeight * .25;
  canvasCtx.fillStyle = '#474647';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = '#EEB902';
  canvasCtx.beginPath();
  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT/2;

    if(i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height/2);
  canvasCtx.stroke();
};



  // reader.readAsText(evt.target.files[0]);
