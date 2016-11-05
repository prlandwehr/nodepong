//Globals
var p1open = true,
	p2open = true,
	p1ws = null,
	p2ws = null;

//Socket Globals	
var WebSocketServer = require('ws').Server, 
	wss = new WebSocketServer({port: 8080});
	
//Socket callbacks
wss.on('connection', function(ws) {
	//set player slot or force disc.
	if(p1open) {
		p1open = false;
		p1ws = ws;
		ws.send('isp1');
	} else if(p2open) {
		p2open = false;
		p2ws = ws;
		ws.send('isp2');
	} else {
		ws.close();
	}
	//general message handling area
	ws.on('message', function(message) {
		if(message.search("p1") === 0) {
			var ssplit = message.split(" ");
			pGame.setp1pos( parseFloat(ssplit[1]) );
			if(p2ws) {
				p2ws.send('p1 ' + ssplit[1]);
			}
		} else if(message.search("p2") === 0) {
			var ssplit = message.split(" ");
			pGame.setp2pos( parseFloat(ssplit[1]) );
			if(p1ws) {
				p1ws.send('p2 ' + ssplit[1]);
			}
		}
		console.log('received: %s', message);
		//ws.send('something');
	});
});

//Pong module
var pGame = (function(){

	var p1pos = 0,
		p2pos = 0,
		paddlespeed = 0.02,
		ballpos = [0.5,0.5],
		ballvel = [0.0075,0.0025],
		gamesize = [1,1],
		paddlesize = [0.04,0.20],
		ballsize = [0.04,0.04],
		score = [0,0];
		
	var setp1pos = function(pos) { p1pos = pos; };
	var setp2pos = function(pos) { p2pos = pos; };

	var gameLoop = function() {
		//ball update
		ballpos[0] += ballvel[0];
		ballpos[1] += ballvel[1];
		//paddle hit check
		if(ballpos[0] < paddlesize[0]) { //p1
			//console.log('collcheck:' + p1pos);
			if(ballpos[1] >= p1pos && ballpos[1] <= p1pos + paddlesize[1]) {
				ballvel[0] = -ballvel[0];
				ballpos[0] = paddlesize[0];
			}
		} else if(ballpos[0] > (1-paddlesize[0]-ballsize[0]) ) { //p2
			//console.log('collcheck2:' + p2pos);
			if(ballpos[1] >= p2pos && ballpos[1] <= p2pos + paddlesize[1]) {
				ballvel[0] = -ballvel[0];
				ballpos[0] = 1-paddlesize[0]-ballsize[0];
			}
		}
		//hits right wall
		if(ballpos[0] > gamesize[0] - ballsize[0]) {
			ballpos[0] = gamesize[0] - ballsize[0];
			ballvel[0] = -ballvel[0];
			score[0]++;
			if(p1ws) {
				p1ws.send('score ' + score[0] + ' ' + score[1]);
			}
			if(p2ws) {
				p2ws.send('score ' + score[0] + ' ' + score[1]);
			}
		}
		//hits left wall
		if(ballpos[0] < 0) {
			ballpos[0] = 0;
			ballvel[0] = -ballvel[0];
			score[1]++;
			if(p1ws) {
				p1ws.send('score ' + score[0] + ' ' + score[1]);
			}
			if(p2ws) {
				p2ws.send('score ' + score[0] + ' ' + score[1]);
			}
		}
		//hits top wall
		if(ballpos[1] > gamesize[1] - ballsize[1]) {
			ballpos[1] = gamesize[1] - ballsize[1];
			ballvel[1] = -ballvel[1];
		}
		//hits bottom wall
		if(ballpos[1] < 0) {
			ballpos[1] = 0;
			ballvel[1] = -ballvel[1];
		}
		
		if(p1ws) {
			p1ws.send('b ' + ballpos[0] + ' ' + ballpos[1]);
		}
		if(p2ws) {
			p2ws.send('b ' + ballpos[0] + ' ' + ballpos[1]);
		}

		//console.log('position: ' + ballpos);
		//console.log('score: ' + score);
	}

	return {'gameLoop': gameLoop,
		'setp1pos': setp1pos,
		'setp2pos': setp2pos};

})();

//Timers
var gameloopTimer = setInterval(pGame.gameLoop,16);