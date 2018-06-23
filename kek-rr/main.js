var socket = io.connect();
var data = ""
socket.on('data', function(newdata) {
	data = newdata;
});
