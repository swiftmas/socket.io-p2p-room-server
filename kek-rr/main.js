
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
	loadKek("/data/newSong.kek", "url")
}


// Loop for Draw and scheduling
function mainLoop(){
  pageDraw();
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
}

function newAudio(track, file, measure, beat){
    kekFileData[file.name] = {}
    kekFileData[file.name].value = file;
    createBuffer(file.name);
  	var rev = songData.tracks[track].currentRevision
  	var newtrack = {"file":file.name, "init_formal": [measure,beat,0,0,0]}
  	songData.tracks[track].revisions[rev].audio.push(newtrack)
    finishedLoading()
}

function newTrack(){
  let newtrack = {"trackName":"New","currentRevision":"Master","revisions":{"Master":{"settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[]}}}
  songData.tracks.push(newtrack);
  pageDraw();
}


socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=chatData
	document.getElementById('usrmsg').value = "";
});
