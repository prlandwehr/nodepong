//Global variables
var isPlayerOne = false,
	isPlayerTwo = false,
	p1pos = 0,
	p2pos = 0,
	ballpos = [0,0],
	isDown = false,
	isUp = false,
	score = [0,0];
	
//Socket Globals
var connection = new WebSocket('ws://localhost:8080');

//Socket Callbacks
connection.onopen = function () {
	//connection.send('Ping');
};
connection.onerror = function (error) {
	console.log('WebSocket Error ' + error);
};
connection.onmessage = function (e) {
	//handle information from the server
	//ball position
	if(e.data[0] === 'b') {
		var bsplit = e.data.split(" ");
		ballpos[0] = bsplit[1];
		ballpos[1] = bsplit[2];
	}
	else if(e.data.search("score") === 0) {
		var ssplit = e.data.split(" ");
		score[0] = ssplit[1];
		score[1] = ssplit[2];
		$('#score').html(score[0] + ", " + score[1]);
	}
	else if(e.data.search("p1") === 0) {
		var ssplit = e.data.split(" ");
		p1pos = parseFloat(ssplit[1]);
		$('#p1').css('bottom', (p1pos*500) + 'px');
	}
	else if(e.data.search("p2") === 0) {
		var ssplit = e.data.split(" ");
		p2pos = parseFloat(ssplit[1]);
		$('#p2').css('bottom', (p2pos*500) + 'px');
	}
	switch(e.data) {
		case 'isp1':
			isPlayerOne = true;
			console.log('Server: ' + e.data);
			break;
		case 'isp2':
			isPlayerTwo = true;
			console.log('Server: ' + e.data);
			break;
		default:
			console.log('Server: ' + e.data);
	}
};

window.addEventListener('keydown', function(event) {
    //console.log(event.keyCode);
	switch(event.keyCode) {
		case 38: //up
			isUp = true;
			isDown = false;
			//p1pos += 0.01;
			//$('#p1').css('bottom', (p1pos*500) + 'px');
			break;
		case 40: //down
			isDown = true;
			isUp = false;
			//p1pos -= 0.01;
			//$('#p1').css('bottom', (p1pos*500) + 'px');
			break;
	}
	
});

window.addEventListener('keyup', function(event) {
    //console.log(event.keyCode);
	switch(event.keyCode) {
		case 38: //up
			isUp = false;
			break;
		case 40: //down
			isDown = false;
			break;
	}
});

function gameLoop() {
	if(isUp) {
		if(isPlayerOne && p1pos < 0.8) {
			p1pos += 0.01;
			$('#p1').css('bottom', (p1pos*500) + 'px');
		} else if(isPlayerTwo && p2pos < 0.8) {
			p2pos += 0.01;
			$('#p2').css('bottom', (p2pos*500) + 'px');
		}
	}
	if(isDown) {
		if(isPlayerOne && p1pos > 0) {
			p1pos -= 0.01;
			$('#p1').css('bottom', (p1pos*500) + 'px');
		} else if(isPlayerTwo && p2pos > 0) {
			p2pos -= 0.01;
			$('#p2').css('bottom', (p2pos*500) + 'px');
		}
	}
	$('#ball').css('left', (ballpos[0]*500) + 'px');
	$('#ball').css('bottom', (ballpos[1]*500) + 'px');
	
	//outgoing
	if(isPlayerOne) {
		connection.send('p1 ' + p1pos);
	} else if(isPlayerTwo) {
		connection.send('p2 ' + p2pos);
	}
}

var gameloopTimer = setInterval(gameLoop,16);