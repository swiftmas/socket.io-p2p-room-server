//CREATE MASETER BUFFER READER FOR SEEKING
function playSound(track, audioFile, time, offset) {
  console.log(track, audioFile, time, offset)
	bufferData.tracks[track].sources[audioFile] = context.createBufferSource();
	bufferData.tracks[track].sources[audioFile].buffer = bufferData.buffers[songData.tracks[track].audio[audioFile].file]
	bufferData.tracks[track].sources[audioFile].connect(bufferData.tracks[track].sources[audioFile].context.destination)
	bufferData.tracks[track].sources[audioFile].start(time + slop, offset)
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
