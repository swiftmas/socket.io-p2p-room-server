
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
  pageDraw();
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
}

function newTrack(track, file){
    kekFileData[file.name] = {}
    kekFileData[file.name].value = file;
    createBuffer(file.name);
  	var rev = songData.tracks[track].currentRevision
  	var newtrack = {"file":file.name, "init_formal": [0,0,0,0,0]}
  	songData.tracks[track].revisions[rev].audio.push(newtrack)
    finishedLoading()
}


function pageDraw(){
  console.log("DrawTracks")
  let htmlData = ""
  for (var track=0; track<songData.tracks.length; ++track) {
    let trackName = songData.tracks[track].trackName
    let mark1 = `
        <div class="track-header">
          ${trackName} <br>
          <select onchange="changeRev(this, ${track})">
        `
    let mark2 = ""
    for (var revision in songData.tracks[track].revisions){
      mark2 +=`<option value="${revision}">${revision}</option>`
    }
    let mark3 =`
          </select>
        </div>
        `
    htmlData = htmlData + mark1 + mark2 + mark3
  }
  document.getElementById('trackHeaders').innerHTML = htmlData

}


function changeRev(revValue, track){
    stop()
    var value = revValue.value;
    songData.tracks[track].currentRevision = value
}

function draw(){
	var zoom = 16
	canvas.width = songData.end * zoom
	canvas.height = songData.tracks.length * 82
	for (var i=0; i<songData.tracks.length; ++i) {
		var rev = songData.tracks[i].currentRevision
		for (var af=0; af<songData.tracks[i].revisions[rev].audio.length; ++af){
			var timeTotal = songData.tracks[i].revisions[rev].audio[af].init_formal
			var tlen = globalTime("time", bufferData.buffers[songData.tracks[i].revisions[rev].audio[af].file].duration, "formal")
			var my_gradient = ctx.createLinearGradient(0, 0, 0, 170+(100*i));
			my_gradient.addColorStop(0, "#2ff3f3");
			my_gradient.addColorStop(1, "#b400e1");
      //my_gradient.addColorStop(0, "#eee");
			//my_gradient.addColorStop(1, "#fff");
			ctx.fillStyle = my_gradient;
			ctx.fillRect(timeTotal[0]*zoom,i*82,tlen[0]*zoom,80);
			ctx.fillStyle = "Black"
			var newtime = globalTime("time",(context.currentTime - playTime),"formal")
			ctx.fillRect((newtime[0]*zoom)+parseInt(newtime[1]*(zoom/4))+parseInt(newtime[2]*(zoom/16)),0,1,82*songData.tracks.length)
			document.getElementById('currentTime').innerHTML = "Measure: " + newtime[0] + " , Quarter: " + newtime[1] + " , 16th: " + newtime[2]
		}
	}
}


socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=chatData
	document.getElementById('usrmsg').value = "";
});
