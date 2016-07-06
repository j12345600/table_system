// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var helmet = require('helmet');
var session = require('express-session');
var bodyParser=require('body-parser');
var fs = require('fs');
var secret=require('./secret.js')
var condA,condB,condC;
var numOnline=0;
var loginData={
	aaa:"AAA",
	bbb:"BBB",
	ccc:"CCC"
}
// var mongojs = require('mongojs');
// var db = mongojs('contactlist', ['contactlist']);
//var bodyParser = require('body-parser');
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: secret.sessionSecret,
  cookie: {
		maxAge: 24*60*60*1000,
    httpOnly: true,
		//domain: 'table.mgr.ddns.net'
	},
 resave: true,
 saveUninitialized: true
}));
app.post('/api/login', function (req, res,next) {
  if(loginData[req.body.account]===req.body.passwd){
		req.session.account=req.body.account;
		req.session.hasLogin=1;
		res.type("json");
		res.json({success:"true"});
	}
	else{
		res.type("json");
		res.json({success:"false"});
	}
});
app.get('/jquery.js',function(req,res){
	fs.readFile(__dirname + '/public/src/jquery.js', function(error, data) {
		if (error){
			res.send("opps this doesn't exist - 404");
		} else {
			res.set('Content-Type', 'text/javascript');
			res.send(data);
		}
	});
});
app.use(function LoginAuth(req, res, next) {
		if(!req.session.hasLogin) {
			fs.readFile(__dirname + '/public/loginForm.html', function(error, data) {
			if (error){
				res.send("opps this doesn't exist - 404");
			} else {
				res.set('Content-Type', 'text/html');
				res.send(data);
			}
		});
	 } else {
		 next();
	 }
});
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser.json());

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
