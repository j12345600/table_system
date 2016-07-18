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
var jwt = require('jsonwebtoken');
var socketioJwt = require('socketio-jwt');
var condA,condB,condC;
var numOnline=0;
var expireInMinute=24*60;
var loginData={
	aaa:"AAA",
	bbb:"BBB",
	ccc:"CCC"
}
// var mongojs = require('mongojs');
// var db = mongojs('contactlist', ['contactlist']);
//var bodyParser = require('body-parser');
//app.set('env', 'production');
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: secret.sessionSecret,
  cookie: {
		maxAge: expireInMinute*60*1000,
    httpOnly: true
		//domain: 'table.mgr.ddns.net'
	},
 resave: true,
 saveUninitialized: true
}));
app.post('/api/login', function (req, res,next) {
	//console.log("receive request");
	if(req.session.token){	//has logined, send token back
			res.json({success:"true",token: req.session.token});
	}
	else if(req.body.account==undefined||req.body.passwd==undefined){
		res.type("json");
		res.json({success:"false"});
	}
  else if(loginData[req.body.account]===req.body.passwd){	//login successfully
		var profile = {
	    account: req.body.account
  	};
  	var token = jwt.sign(profile, secret.sessionSecret, { expiresInMinutes: expireInMinute });
		req.session.token=token;
		res.type("json");
		res.json({success:"true",token:token});
	}
	else{
		res.type("json");
		res.json({success:"false"});
	}
});
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
//
// // production error handler
// // no stacktraces leaked to user
else{
		app.use(function(err, req, res, next) {
	    res.status(err.status || 500);
	    res.send('<H1 style=margin-left:50%>404 Not Found</H1>');
	});
}
//app.use(bodyParser.json());

io.set('authorization', socketioJwt.authorize({
  secret: secret.sessionSecret,
  handshake: true
}));
io.on('connection', function(socket){
	console.log(socket.handshake);
	//console.log(socket.handshake.decoded_token.account, 'connected');
	console.log("sign in");
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
