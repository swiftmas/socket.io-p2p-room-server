var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=data
	document.getElementById('usrmsg').value = "";
});

var songData = {"tracks":[{"trackName":"Track1","currentRevision":"rev1","settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[{"file":"/data/drum.mp3","offset":[0,0,0,0,0]},{"file":"/data/synth.mp3","offset":[1,0,0,0,0]}]}],"songName":"Song1","bpm":120}
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
	var min = 60000;
	var minbpm = 60000/bpm
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
  switch(oneAndOrTwo) {
    case 1:
      bufferData.tracks[0].sources[0].stop()
      break;
    case 2:
      bufferData.tracks[0].sources[1].stop()
      break;
    case 12:
      bufferData.tracks[0].sources[0].stop();
      bufferData.tracks[0].sources[1].stop();
      break;
    default:
      break;
      console.error("FATAL ERROR: UR A SKRUB... oneAndOrTwo MEANS ONE AND/OR TWO")
  }
}
function start(oneAndOrTwo){
  switch(oneAndOrTwo) {
    case 1:
        bufferData.tracks[0].sources[0].start(0)
        break;
    case 2:
        bufferData.tracks[0].sources[1].start(0)
        break;
    case 12:
      bufferData.tracks[0].sources[0].start(0);
      bufferData.tracks[0].sources[1].start(0);
      break;
    default:
        console.error("FATAL ERROR: UR A SKRUB... oneAndOrTwo MEANS ONE AND/OR TWO")
  }
}

function reset(){
  stop(12);
  init();
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
