var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=data
	document.getElementById('usrmsg').value = "";
});

var songData = {"tracks":[{"trackName":"Track1","currentRevision":"rev1","settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[{"file":"/data/1.wav","offset":[0,0,0,0,0]},{"file":"/data/2.wav","offset":[1,0,0,0,0]}]}],"songName":"Song1","bpm":120}
var bufferData = {"analysers": [], "sources": [] }

window.onload = init;
var context;
var bufferLoader;
var playing = false;

function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
	var audioToBuffer = [];
	var curIndex = 0;
	for (var i=0; i<songData.tracks.length; ++i) {
		for (var af=0; af<songData.tracks[i].audio.length; ++af){
			audioToBuffer.push(songData.tracks[i].audio[af].file);
			songData.tracks[i].audio[af].index = curIndex;
			++curIndex;
		}
	}

  bufferLoader = new BufferLoader(
    context,
		audioToBuffer,
    finishedLoading
  );

  bufferLoader.load();
}


function finishedLoading(bufferList) {
	var curIndex = 0;
	for (var i=0; i<songData.tracks.length; ++i) {
		bufferData.analysers[i] = context.createAnalyser();
		for (var s=0; s<songData.tracks[i].audio.length; ++s){
			bufferData.sources[s] = context.createBufferSource();
			bufferData.sources[s].buffer = bufferList[curIndex]
			bufferData.sources[s].connect(bufferData.analysers[i])
			++curIndex;
		}
	}
	bufferData.analysers[0].connect(context.destination);
	bufferData.analysers[0].fftSize = 2048;
	bufferLength = bufferData.analysers[0].frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
	bufferData.analysers[0].getByteTimeDomainData(dataArray);
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
      source1.stop()
      break;
    case 2:
      source2.stop()
      break;
    case 12:
      source1.stop();
      source2.stop();
      break;
    default:
      break;
      console.error("FATAL ERROR: UR A SKRUB... oneAndOrTwo MEANS ONE AND/OR TWO")
  }
}
function start(oneAndOrTwo){
  switch(oneAndOrTwo) {
    case 1:
        source1.start(0)
        break;
    case 2:
        source2.start(0)
        break;
    case 12:
      source1.start(0);
      source2.start(0);
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
