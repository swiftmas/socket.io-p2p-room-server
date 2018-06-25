var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=data
	document.getElementById('usrmsg').value = "";
});


window.onload = init;
var context;
var bufferLoader;
var playing = false;

function init() {
  // Fix up prefixing
  //Wire it up
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  analyser = context.createAnalyser();
  source1 = context.createBufferSource();
  source2 = context.createBufferSource();
  source1.connect(analyser);
  source2.connect(analyser);
  analyser.connect(context.destination);
  // source2.connect(context.destination);

  analyser.fftSize = 2048;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
  canvas=document.getElementById("canvaz");
  canvasCtx=canvas.getContext("2d");
  WIDTH = window.innerHeight;
  HEIGHT = window.innerWidth * .25;
  // canvasCtx.fillRect(0, 0, 300, 150);
  // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


  bufferLoader = new BufferLoader(
    context,
    [
      '/data/drum.mp3',
      '/data/synth.mp3',
    ],
    finishedLoading
    );

  bufferLoader.load();
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

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];
  // source1.start(0);
  // source2.start(0);
  draw();

}

function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);
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







