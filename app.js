// MEAN Stack RESTful API Tutorial - Contact List App

var express 		 = require('express');
var app 				 = express();
var http 				 = require('http').Server(app);
var io 					 = require('socket.io')(http);
var helmet 			 = require('helmet');
var session 		 = require('express-session');
var bodyParser	 = require('body-parser');
var fs 					 = require('fs');
// var secret			= require('./secret.js')
var jwt 				 = require('jsonwebtoken');
var socketioJwt  = require('socketio-jwt');
var mongojs 		 = require('mongojs');
var db 					 = mongojs('restaurant_info',['user','map']);
var randomstring = require("randomstring");
var moment       = require("moment");
moment.defaultFormat='YYYY-MM-DD HH:mm:ss';
var secret=randomstring.generate(10);
console.log(secret);
var condA,condB,condC;
var numOnline=0;
var expireInMinute=72*60;

app.set('env', 'production');
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: secret,
  cookie: {
		maxAge: expireInMinute*60*1000,
    httpOnly: true
		//domain: 'table.mgr.ddns.net'
	},
 resave: true,
 saveUninitialized: true
}));
app.get('/api/logout',function(req,res,next){
  req.session=null;
  res.cookie("connect.sid",'', { maxAge: -1, httpOnly: true });
  res.send();
});
app.post('/api/login', function (req, res,next) {
	// console.log(req.body.passwd);

	if(req.session.token){	//has logined, send token back
			res.json({success:"true",token: req.session.token});
	}
	else if(req.body.account==undefined||req.body.passwd==undefined){
		res.type("json");
		res.json({success:"false"});
	}
	else {
		db.user.find({username:req.body.account},function(err,docs){
			if(docs[0]){
				if(docs[0].pass===req.body.passwd) {
					var profile = {
				    account: req.body.account,
            admin:docs[0].admin
			  	};
			  	var token = jwt.sign(profile, secret, { expiresIn: expireInMinute*60 });
					req.session.token=token;
					res.type("json");
					res.json({success:"true",token:token});
				}
				else{
					res.type("json");
					res.json({success:"false"});
				}
			}
			else{
				res.type("json");
				res.json({success:"false"});
			}
		});
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

io.use(socketioJwt.authorize({
  secret: secret,
  handshake: true
}));
io.on('connection', function(socket){
	 console.log(socket.decoded_token.account,"\tlogs in at ",moment().format());
	//console.log(socket.handshake.decoded_token.account, 'connected');
	// console.log("sign in");
	socket.on('disconnect',function(socket){
		io.emit('updateOnline',io.engine.clientsCount);
    console.log(socket,"\tlogs out at ",moment().format());
	});
	socket.on("recv_updateA", function(msg){
    console.log(socket.decoded_token.account,"\tupdates at ",moment().format());
    io.emit('updateA',msg);
		condA=msg;
  });
	socket.on('new_connt',function(msg){
		numOnline++;
		socket.emit('updateA',condA);
		// socket.emit('updateB',condB);
		// socket.emit('updateC',condC);
		io.emit('updateOnline',io.engine.clientsCount);
	});
  socket.on('unavailable',function(){
    if(socket.decoded_token.admin=="true"){

    }
  });
  socket.on('mapUpdate',function(){
    if(socket.decoded_token.admin=="true"){

    }
  });
	socket.on('reset',function(msg){
    if(socket.decoded_token.admin=="true"){
      condA={};
      condB={};
      condC={};
    }
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
