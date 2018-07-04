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
