var http = require('http');

var server = http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('Hello World<br/>line two');
})

server.listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');