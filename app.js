// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var condA,condB,condC;
var numOnline=0;
// var mongojs = require('mongojs');
// var db = mongojs('contactlist', ['contactlist']);
//var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser.json());
app.get('/hello',function(req, res){
	var dateObj=new Date;
	res.json(dateObj);
});

io.on('connection', function(socket){
	socket.on('disconnect',function(socket){
		io.emit('updateOnline',io.engine.clientsCount);
	});
	socket.on("recv_updateA", function(msg){
    io.emit('updateA',msg);
		condA=msg;
  });
	socket.on("recv_updateB", function(msg){
    io.emit('updateB', { status: msg });
		condB=msg;
  });
	socket.on("recv_updateC", function(msg){
    io.emit('updateC', { status: msg });
		condC=msg;
  });
	socket.on('new_connt',function(msg){
		numOnline++;
		socket.emit('updateA',condA);
		socket.emit('updateB',condB);
		socket.emit('updateC',condC);
		io.emit('updateOnline',io.engine.clientsCount);
	});
	socket.on('reset',function(msg){
		condA={};
		condB={};
		condC={};
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
