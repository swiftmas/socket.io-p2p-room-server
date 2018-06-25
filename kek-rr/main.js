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
  // source2.connect(analyser);
  source1.connect(context.destination);
  source2.connect(context.destination);

  analyser.fftSize = 2048;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  canvas=document.getElementById("visi");
  canvasCtx=canvas.getContext("2d");
  WIDTH = 500;
  HEIGHT = 300;
  canvasCtx.fillRect(0, 0, 300, 150);
  // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


  bufferLoader = new BufferLoader(
    context,
    [
      '/data/1.wav',
      '/data/2.wav',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function flip(){
  if(playing){
    context.resume()
  }else{
    context.suspend()
  }
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];
  source1.start(0);
  source2.start(0);
  draw();

}

function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

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







