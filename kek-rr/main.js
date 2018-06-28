var socket = io.connect()
var data = ""
socket.on('data', function (newdata) {
  data = newdata
  document.getElementById('chatText').innerHTML = data
  document.getElementById('usrmsg').value = ""
})


window.onload = init
var context
var bufferLoader
var playing = false

function init() {
  initCanvas()
  initMixer()
  initListeners()
}

/**
 * - newTrack - 
 * This is for creating new tracks after initializing. 
 * Just needs a track number and can figure the rest out. 
 * @param {1,2} trackNo 
 */
function newTrack(trackNo, track) {
  console.log('new track inc' + trackNo)
  var fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    var arrayBuffer = e.target.result
    context.decodeAudioData(arrayBuffer).then(function (audioBuffer) {
      if (trackNo === 1) {
        source1 = new BuffAudio(context, audioBuffer)
      } else if (trackNo === 2) {
        source2 = new BuffAudio(context, audioBuffer)
      } else {
        console.error("this, shouldn't happen ever.. use 1 or two for your track number...")
      }
    })
  }
  fileReader.readAsArrayBuffer(track)
}

function pause(int) {
  console.log("you thought you could pause me?!, think again: " + int)
}

/**
 * - stop - 
 * Starts a track
 * @param {1,2 or 12} oneAndOrTwo 
 * 
 */
function stop(oneAndOrTwo) {
  switch (oneAndOrTwo) {
    case 1:
      source1.stop()
      break
    case 2:
      source2.stop()
      break
    case 12:
      source1.stop()
      source2.stop()
      break
    default:
      console.error("FATAL ERROR: UR A SKRUB... oneAndOrTwo MEANS ONE AND/OR TWO")
  }
}

/**
 * - start - 
 * Starts a track
 * @param {1,2 or 12} oneAndOrTwo 
 * 
 */
function start(oneAndOrTwo) {
  switch (oneAndOrTwo) {
    case 1:
      //wtf well that's one way to check the type...
      if (source1.constructor.toString().includes("AudioBufferSourceNode")) {
        source1.play()
      }else{
        source1.start()
      }
      break
    case 2:
      if (source2.constructor.toString().includes("AudioBufferSourceNode")) {
        source2.play()
      }else{
        source2.start()
      }
      break
    case 12:
      source1.start(0)
      source2.start(0)
      break
    default:
      console.error("FATAL ERROR: UR A SKRUB... oneAndOrTwo MEANS ONE AND/OR TWO")
  }
}

/**
 * - reset - 
 * stops the audio and reinitialized everything
 */
function reset() {
  stop(12)
  init()
}


/**
 * - draw - 
 * This handles drawing on the html5 canvas.
 */
function draw() {
  drawVisual = requestAnimationFrame(draw)
  analyser.getByteTimeDomainData(dataArray)
  canvasCtx.canvas.width = window.innerWidth
  canvasCtx.canvas.height = window.innerHeight * .25
  canvasCtx.fillStyle = '#474647'
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)
  canvasCtx.lineWidth = 2
  canvasCtx.strokeStyle = '#EEB902'
  canvasCtx.beginPath()
  var sliceWidth = WIDTH * 1.0 / bufferLength
  var x = 0
  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0
    var y = v * HEIGHT / 2
    if (i === 0) {
      canvasCtx.moveTo(x, y)
    } else {
      canvasCtx.lineTo(x, y)
    }
    x += sliceWidth
  }
  canvasCtx.lineTo(canvas.width, canvas.height / 2)
  canvasCtx.stroke()
}

/**
 *  - finishedLoading -
 * Callback for initMixer -> bufferLoader
 * Also kicks off the draw function
 * @param {
 * } bufferList 
 */
//TODO: get the draw function out. 
function finishedLoading(bufferList) {
  source1 = new BuffAudio(context, bufferList[0])
  source2 = new BuffAudio(context, bufferList[0])
  draw()
}

/**
 *  - initMixer - aka Initialize the mixer. 
 * I guess you have to load the audio as a buffer this way
 * It would be a security risk for the File Reader API to 
 * be able to access local files. It makes sense but now we
 * need this seperate code for the inital startup. 
 */
function initMixer() {
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('use chrome pls.')
  }
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  context = new AudioContext()
  analyser = context.createAnalyser()
  source1 = context.createBufferSource()
  source2 = context.createBufferSource()
  source1.connect(analyser)
  source2.connect(analyser)
  analyser.connect(context.destination)
  analyser.fftSize = 2048
  bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  bufferLoader = new BufferLoader(
    context, [
      '/data/drum.mp3',
      '/data/synth.mp3'
    ],
    finishedLoading
  )

  bufferLoader.load()

}
/**
 * - initListeners -
 * Just like loop through all the classes and 
 * add a listener function to each one
 * 
 * This could be better....
 * 
 */
function initListeners() {
  //todo: find a way to fix these. 
  //They're erroring out on load because the files don't exist.
  // document.getElementById("track-drop-1").addEventListener('change', newTrack(1, document.getElementById("track-drop-1").files[0]), false) 
  // document.getElementById("track-drop-2").addEventListener('change', newTrack(2, document.getElementById("track-drop-2").files[0]), false) 
  document.getElementById("play-button-1").addEventListener('click', start(1), false)
  document.getElementById("play-button-2").addEventListener('click', start(2), false)
  document.getElementById("pause-button-1").addEventListener('click', pause(1), false)
  document.getElementById("pause-button-2").addEventListener('click', pause(2), false)
  document.getElementById("stop-button-1").addEventListener('click', stop(1), false)
  document.getElementById("stop-button-2").addEventListener('click', stop(2), false)
}

function initCanvas() {
  canvas = document.getElementById("canvaz")
  canvasCtx = canvas.getContext("2d")
  WIDTH = window.innerHeight
  HEIGHT = window.innerWidth * .25
}