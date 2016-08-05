//Table management

var express 		 = require('express');
var app 				 = express();
var http 				 = require('http').Server(app);
var io 					 = require('socket.io')(http);
var helmet 			 = require('helmet');
var session 		 = require('express-session');
var bodyParser	 = require('body-parser');
var fs 					 = require('fs');
var jwt 				 = require('jsonwebtoken');
var socketioJwt  = require('socketio-jwt');
var mongojs 		 = require('mongojs');
var db 					 = mongojs('restaurant_info',['user','map']);
var randomstring = require("randomstring");
var moment       = require("moment");
moment.defaultFormat='YYYY-MM-DD HH:mm:ss';
var secret=randomstring.generate(10);
console.log(secret);
var condA={status:{
  unavailable:[],
  available:[],
  selected:[]
  }
};
var numOnline=0;
var expireInMinute=72*60;
function getStamp(){
  if (app.get('env') === 'development'){
    return moment().format();
  }
  else{
    return moment().add(8,"h").format();
  }
}
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
app.get('/api/map',function(req,res){
  db.map.find({},function(err,docs){
    if(err){
      console.log(err);
    }
    else if(docs[0]!=undefined){
      res.type("json");
  		res.json(docs[0]);
    }
  });
});
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
          req.session.admin=docs[0].admin;
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
// user editing functions
var fail=[{username:"請登入"}];
var root_id="";
db.user.find({username:"edison"},function (err, docs) {
  root_id=docs[0]._id;
});
app.get('/userlist', function (req, res) {
  console.log(req.session);
  if(req.session.admin=="true"){
    db.user.find(function (err, docs) {
      res.json(docs);
    });
  }
  else{
    res.send(fail);
  }
});

app.post('/userlist', function (req, res) {
  if(req.session.admin==="true"){
    db.user.insert(req.body, function(err, doc) {
      res.json(doc);
    });
  }
  else{
    res.send(fail);
  }
});

app.delete('/userlist/:id', function (req, res) {
  if(req.session.admin==="true"){
    var id = req.params.id;
    if(id!=root_id){
      db.user.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
      });
    }
    res.json({stat:"fail"});
  }
  else{
    res.send(fail);
  }
});

app.get('/userlist/:id', function (req, res) {
  if(req.session.admin==="true"){
    var id = req.params.id;
    console.log(id);
    db.user.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
      res.json(doc);
    });
  }
  else{
    res.send(fail);
  }
});

app.put('/userlist/:id', function (req, res) {
  if(req.session.admin==="true"){
    var id = req.params.id;
    if(id!=root_id){
      db.user.findAndModify({
        query: {_id: mongojs.ObjectId(id)},
        update: {$set: {username: req.body.username, pass: req.body.pass}},
        new: true}, function (err, doc) {
          res.json(doc);
        }
      );
      res.json({stat:"fail"});
    }
  }
  else{
    res.send(fail);
  }
});
//user edit block ends
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
	 console.log(socket.decoded_token.account,"\tlogs in at ",getStamp());
	//console.log(socket.handshake.decoded_token.account, 'connected');
	// console.log("sign in");
	socket.on('disconnect',function(socket){
		io.emit('updateOnline',io.engine.clientsCount);
    console.log(socket,"\tlogs out at ",getStamp());
	});
	socket.on("recv_updateA", function(msg){
    console.log(socket.decoded_token.account,"\tupdates at ",getStamp());
    condA.status.available=msg.status.available;
    condA.status.selected=msg.status.selected;
    io.emit('updateA',condA);
  });
	socket.on('new_connt',function(msg){
		numOnline++;
		socket.emit('updateA',condA);
		// socket.emit('updateB',condB);
		// socket.emit('updateC',condC);
		io.emit('updateOnline',io.engine.clientsCount);
	});
  socket.on('unavailable',function(msg){
    if(socket.decoded_token.admin=="true"){
      io.emit('updateA',msg);
  		condA=msg;
    }
  });
  socket.on('mapUpdate',function(map){
    if(socket.decoded_token.admin=="true"){
      // console.log(map);
      db.map.findAndModify({
        query: {},
        update: { $set: {tid:map.tid,for:map.for,map:map.map,modified:getStamp()} },
        new: true
        }, function (err, doc, lastErrorObject) {
          console.log(err);
        });
      io.emit('updateMap');
    }
  });
	socket.on('reset',function(msg){
    if(socket.decoded_token.admin=="true"){
      condA={};
    }
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
