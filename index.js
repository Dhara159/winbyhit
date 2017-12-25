	var gryfUser = 0;
	var huffleUser = 0;
	var slythUser = 0;
	var ravenUser = 0;
	var gryfCount = 10;
	var huffCount = 10;
	var slythCount = 10;
	var ravenCount = 10;
	var gryfScoreArray = [];
	var huffleScoreArray = [];
	var slythScoreArray = [];
	var ravenScoreArray = [];
	var checkGryfUser = 0;
	var checkHuffleUser = 0;
	var checkRavenUser = 0;
	var checkSlythUser = 0;
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http,{});
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var compass = require('compass');
	var mysql = require('mysql');
	var md5 = require('md5');
	var session = require("express-session")({
		secret: "my-secret",
		resave: true,
		saveUninitialized: true
	});
	var sharedsession = require("express-socket.io-session");

	app.use(compass({ cwd: __dirname + 'css' }));
	app.use("/public", express.static(__dirname + '/public'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true}));
	app.use(cookieParser());
	app.io = io;
	app.use(session);
	io.use(sharedsession(session), 
	{
	    autoSave:true
	});

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'winbyhit'
	});

	var adminConnection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'adminWinbyhit'
	});

	connection.connect(function(err)
	{
		if (!err) 
		{
			console.log("database is connected");
		}
		else
		{
			console.log("Error connecting database");
		}
	});

	adminConnection.connect(function(err)
	{
		if (!err) 
		{
		}
		else
		{
			console.log("Error connecting database");
		}
	});

	io.sockets.on('connection', function(socket)
	{
		socket.on('login', function(username){ login(username) });
		socket.on('bann', function(id){ bann(id) });
		socket.on('reset', function(resetHouse){ reset(resetHouse) });
		socket.on('week', function(username){ week(username) });
		socket.on('month', function(username){ month(username) });
		socket.on('gryfCreate', function(dataRoom1){ gryfCreate(dataRoom1) });
		socket.on('huffCreate', function(dataRoom2){ huffCreate(dataRoom2) });
		socket.on('slythCreate', function(dataRoom3){ slythCreate(dataRoom3) });
		socket.on('ravenCreate', function(dataRoom4){ ravenCreate(dataRoom4) });
		socket.on('submitScore', function(submitData){ submitScore(submitData) });
		socket.on('disconnect', function(leaveData){ leaveGame(leaveData) });

		function login(username)
		{
			socket.handshake.session.username = username;
			socket.handshake.session.save();
			var afterLogin = '/groups';
			socket.emit('afterLogin', afterLogin);
		}

		function leaveGame(leaveData)
		{
			socket.leave(leaveData);
			socket.emit('leave', '/');
		}

		function bann(id)
		{
			connection.query("Update users SET banned = ? WHERE id = ?", [1, id], function(err, rows, fields)
    		{	
		    	if(rows.affectedRows > 0)
		    	{
		    		socket.emit('refresh', '');
		    	}
		    	else
		    	{
		    		console.log(err);
		    	}
		    });
		}
	
		function reset(resetHouse)
		{
			if (resetHouse == "gryffindor") 
    		{
	    		gryfUser = 0;
	    		gryfCount = 10;
	    		gryfScoreArray = [];
	    		checkGryfUser = 0;
	    		socket.emit('group', '/groups');
	    	}
	    	if (resetHouse == "hufflepuff") 
	    	{
    			huffleUser = 0;
				huffCount = 10;
				huffleScoreArray = [];
				checkHuffleUser = 0;
    			socket.emit('group', '/groups');	
    		}
    		if (resetHouse == "slytherin") 
    		{	
	    		slythUser = 0;
				slythCount = 10;
				slythScoreArray = [];
				checkSlythUser = 0;
    			socket.emit('group', '/groups');
    		}
    		if (resetHouse == "ravenclaw") 
    		{
	    		ravenUser = 0;
				ravenCount = 10;
				ravenScoreArray = [];
				checkRavenUser = 0;
	    		socket.emit('group', '/groups');
	    	}
		}

		function week(username)
    	{
    		var today = new Date();
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			var weekday = today.setDate(today.getDate() - 7);
			var oldday = new Date(weekday);
			var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
			var sessionUser = username;
			connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, weekdate, weekday], function(err, rows, fields)
			{
				socket.emit('setWeekScore', rows[0].total);
			});
    	}

    	function month(username)
		{
			var today = new Date();
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			var weekday = today.setMonth(today.getDate() - 30);
			var oldday = new Date(weekday);
			var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
			var sessionUser = username;
			connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, weekdate, weekday], function(err, rows, fields)
			{
				socket.emit('setMonthScore', rows[0].total);
			});	
		}

		function gryfCreate(dataRoom1)
    	{
    		if (gryfUser < 5) 
    		{
		    	var room1 = dataRoom1.house;
	    		var roomUser = dataRoom1.username;
		    	socket.join(room1);
		    	var playingData = {roomUser: roomUser, room: room1};
		    	updatePlaying(playingData);
		    	gryfUser = gryfUser + 1;
				checkGryfUser = gryfUser;
    			if (gryfUser == 1) 
    			{
			    	setInterval(function()
					{
						gryfCounter(room1);
					},1000);
    			}
    		}    	
	    	else
    		{
		    	gameFailed(room1);
	    	}
    	}

    	function huffCreate(dataRoom2)
	    {
		    if (huffleUser < 5) 
		    {
		    	var room2 = dataRoom2.house;
		    	var roomUser = dataRoom2.username;
		    	socket.join(room2);
		    	var playingData = {roomUser: roomUser, room: room2};
		    	updatePlaying(playingData);
		    	huffleUser = huffleUser + 1;
		    	checkHuffleUser = huffleUser;
		    	if (huffleUser == 1) 
		    	{
			    	setInterval(function()
					{
						huffCounter(room2);
					},1000);
		    	}
		    }
		    else
		    {
		    	gameFailed(room2);
		    }
		}

		function slythCreate(dataRoom3)
	    {
		    if (slythUser < 5) 
		    {
		    	var room3 = dataRoom3.house;
		    	var roomUser = dataRoom3.username;
		    	socket.join(room3);
		    	var playingDate = {roomUser: roomUser, room: room3};
		    	updatePlaying(playingDate);
				slythUser = slythUser + 1;
				checkSlythUser = slythUser;
				if (slythUser == 1) 
				{
					setInterval(function()
					{
						slythCounter(room3);
					},1000);    		
				}
			}
			else
			{
				gameFailed(room3);
			}
		}

		function ravenCreate(dataRoom4)
	    {
		    if (ravenUser < 5) 
		    {
		    	var room4 = dataRoom4.house;
		    	var roomUser = dataRoom4.username;
		    	socket.join(room4);
		    	var playingData = {roomUser: roomUser, room: room4};
		    	updatePlaying(playingData);
		    	ravenUser = ravenUser + 1;
		    	checkRavenUser = ravenUser;
		    	if (ravenUser == 1) 
		    	{
	    			setInterval(function()
					{
		    			ravenCounter(room4);
					},1000);
				}
			}
			else
			{
				gameFailed(room4);
			}
		}

		function updatePlaying(playingData)
		{	
			var username = {username: playingData.roomUser};
			connection.query("SELECT id FROM users WHERE ?", username, function(err, rows, fields)
			{
				var fid = rows[0].id;	
				connection.query("INSERT INTO playing(username, fid, house) VALUES (?, ?, ?)", [playingData.roomUser, fid, playingData.room], function(err, rows, fields)
				{
				});
			});
		}

		function submitScore(submitData)
		{
			var room = submitData.room;
			var score = submitData.score;
			var user = submitData.username;
			var max = 0;
			var winnerName;
			if (room == "gryffindor") 
			{
				gryfScoreArray[user] = score;
				checkGryfUser --;
				socket.join(room);
				if (checkGryfUser == 0)
				{					
					for(var index in gryfScoreArray) 
					{
	  					if (gryfScoreArray[index] > max) 
	  					{
	  						max = gryfScoreArray[index];
	  						winnerName = index;
	  					}
					}
					var updateScore = {winUser: winnerName, maxScore: max, room: room, goto: "gryfWinner"};
					afterSubmitScore(updateScore);
				}
			}
			if (room == "hufflepuff") 
			{
				huffleScoreArray[user] = score;
				checkHuffleUser --;
				socket.join(room);
				if (checkHuffleUser == 0) 
				{
					for(var index in huffleScoreArray) 
					{
	  					if (huffleScoreArray[index] > max) 
	  					{
	  						max = huffleScoreArray[index];
	  						winnerName = index;
	  					}
					}
					var updateScore = {winUser: winnerName, maxScore: max, room: room, goto: "huffleWinner"};
					afterSubmitScore(updateScore);
				}
			}
			if (room == "slytherin") 
			{
				slythScoreArray[user] = score;
				checkSlythUser --;
				socket.join(room);
				if (checkSlythUser == 0) 
				{
					for(var index in slythScoreArray) 
					{
	  					if (slythScoreArray[index] > max) 
	  					{
	  						max = slythScoreArray[index];
	  						winnerName = index;
	  					}
					}
					var updateScore = {winUser: winnerName, maxScore: max, room: room, goto: "slythWinner"};
					afterSubmitScore(updateScore);
				}
			}
			if (room == "ravenclaw") 
			{
				ravenScoreArray[user] = score;
				checkRavenUser --;
				socket.join(room);
				if (checkRavenUser == 0) 
				{
					for(var index in ravenScoreArray) 
					{
	  					if (ravenScoreArray[index] > max) 
	  					{
	  						max = ravenScoreArray[index];
	  						winnerName = index;
	  					}
					}	
					var updateScore = {winUser: winnerName, maxScore: max, room: room, goto: "ravenWinner"};
					afterSubmitScore(updateScore);
				}
			}
		}

		function gryfCounter(room1)
		{	
			if(gryfCount > 0)
			{
				gryfCount--;
				io.in(room1).emit('seconds', gryfCount);
			}
			else
			{
				if (gryfUser <= 1) 
				{
					connection.query("DELETE from playing WHERE house = ?",["gryffindor"], function(err, rows, fields)
					{
					});
					gameFailed(room1);
				}
				else
				{
					var destination = '/gryffindor';
					io.in(room1).emit('redirect', destination);	
				}
				
			}
		}

		function huffCounter(room2)
		{	
			if(huffCount > 0)
			{
					huffCount--;
				io.in(room2).emit('seconds', huffCount);
			}
			else
			{
				if (huffleUser <= 1) 
				{
					connection.query("DELETE from playing WHERE house = ?",["hufflepuff"], function(err, rows, fields)
					{
					});
					gameFailed(room2);
				}
				else
				{
					var destination = '/hufflepuff';
					io.in(room2).emit('redirect', destination);
				}
			}
		}

		function slythCounter(room3)
		{	
			if(slythCount > 0)
			{
				slythCount--;
				io.in(room3).emit('seconds', slythCount);
			}
			else
			{
				if (slythUser <= 1) 
				{
					connection.query("DELETE from playing WHERE house = ?",["slytherin"], function(err, rows, fields)
					{
					})
					gameFailed(room3);
				}
				else
				{
					var destination = '/slytherin';
					io.in(room3).emit('redirect', destination);
				}
			}
			
		}

		function ravenCounter(room4)
		{	
			if(ravenCount > 0)
			{
				ravenCount--;
				io.in(room4).emit('seconds', ravenCount);
			}
			else
			{
				if (ravenUser <= 1) 
				{
					connection.query("DELETE from playing WHERE house = ?",["ravenclaw"], function(err, rows, fields)
					{
					})
					gameFailed(room4);
				}
				else
				{
					var destination = '/ravenclaw';
					io.in(room4).emit('redirect', destination);
				}
			}
			
		}

		function afterSubmitScore(updateScore)
		{
			var winner = {winUser: updateScore.winUser, maxScore: updateScore.maxScore};
			var room = updateScore.room;
			var username = {username: updateScore.winUser};
			var today = new Date();
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			var weekday = today.setDate(today.getDate() - 7);
			var oldday = new Date(weekday);
			var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
			var monthday = today.setDate(today.getDate() - 30);
			var oldmonth = new Date(monthday);
			var monthdate = oldmonth.getFullYear()+'-'+(oldmonth.getMonth()+1)+'-'+oldmonth.getDate();
			connection.query("SELECT * FROM users WHERE ?", username, function(err, rows, fields)
			{
				var fid = rows[0].id;
				var lastScore = rows[0].score;
				lastScore++;
				connection.query("Update users SET score = ? WHERE username = ?", [lastScore, username.username], function(err, rows, fields)
				{
					connection.query("INSERT INTO score_log(fid, username, dateRecord, score) VALUES (?, ?, ?, ?)", [fid, username.username, date, 1], function(err, rows, fields)
					{
						connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [username.username, weekdate.toString(), date.toString()], function(err, rows, fields)
						{							
							var weekTotal = rows[0].total;
							connection.query("SELECT sum(score) as monthTotal FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [username.username, monthdate.toString(), date.toString()], function(err, rows, fields)
							{
								var monthTotal = rows[0].monthTotal;
								connection.query("Update `toppers` SET week = ?,month = ? WHERE username = ?", [parseInt(weekTotal), parseInt(monthTotal), username.username], function(err, rows, fields)
								{
									connection.query("DELETE from playing WHERE house = ?",[room], function(err, rows, fields)
									{
										io.in(room).emit(updateScore.goto, winner);
									});
								});
							});
						});
					});
				});
			});
		}

		function gameFailed(room)
		{
			var destination = '/';
			io.in(room).emit('gameFailed', destination);
		}
	});

	app.get('/', function(req, res) 
	{
		if (!req.session.username || req.session.username == "") 
		{
			res.sendFile(__dirname + '/public/views/index.html');
		}
		else
		{
			res.redirect('/groups');
		}
	});

	app.get('/adminlogin', function(req, res) 
	{
		res.sendFile(__dirname + '/public/views/adminlogin.html');
	});

	app.get('/groups', function(req, res)
	{
		if (req.session.username != "") 
		{
			res.sendFile(__dirname + '/public/views/groups.html');
		}
		else
		{
			res.send("User is not logged in!");
		}
			
	});

	app.get('/signup/:username', function(req, res){
		var username = req.params.username;
		connection.query("INSERT INTO users(username) VALUES (?)", [username], function(err, rows, fields)
		{
			var result = rows.affectedRows;
			if (!err) 
			{
				if (result != 0) 
				{
					connection.query("INSERT INTO toppers(username, week, month) VALUES (?,?,?)", [username, 0, 0], function(err, rows, fields){
						res.redirect('/');
					});
				}
				else
				{
					res.send("Data is not inserted!");
				}
			}
			else
			{
				res.send(err);
			}
		});
	});

	app.post('/validateInput', function(req, res)
	{
		var username = {username: req.body.username};
		connection.query("SELECT * FROM users WHERE ?", username, function(err, rows, fields)
		{
			var result = rows.length;
			if (result != 0) 
			{
				if (rows[0].Banned == "1") 
				{
					res.send("Banned");		
				}
				else
				{
					res.send("YES");
				}
				
			}
			else
			{
				res.send("NO")
			}
			
		});

	});

	app.post('/validateAdminInput', function(req, res)
	{
		var username = req.body.username;
		var password = md5(req.body.password);
		adminConnection.query("SELECT * FROM admin WHERE username = ? AND password = ?", [username, password], function(err, rows, fields)
		{
			var result = rows.length;
			if (result != 0) 
			{
				res.send("YES");	
				req.session.admindata = "set";
			}
			else
			{
				res.send("NO")
			}
			
		});

	});

	app.get('/main', function(req, res)
	{
		if (req.session.admindata) 
		{
			res.sendFile(__dirname + '/public/views/main.html')
		}
		else
		{
			res.send("Admin is not loggedin!");
		}
	});

	app.get('/playing', function(req, res)
	{
		if (req.session.admindata) 
		{
			res.sendFile(__dirname + '/public/views/playing.html')	
		}
		else
		{
			res.send("Admin is not loggedin!!");
		}
		
	});

	app.get('/getUsers', function(req, res)
	{
		connection.query("SELECT * FROM users", function(err, rows, fields)
		{
			var result = rows.length;
			if (result != 0) 
			{
				res.json(rows);	
			}
			else
			{
				res.send("NO")
			}
			
		});
	});

	app.get('/getPlayers', function(req, res)
	{
		connection.query("SELECT * FROM playing", function(err, rows, fields)
		{
			var result = rows.length;
			if (result != 0) 
			{
				res.json(rows);	
			}
			else
			{
				res.send("NO")
			}
			
		});
	});

	app.get('/logout', function(req, res)
	{
		req.session.destroy();
		req.logout();
		req.session = null;
		res.send("success");
	});

	app.get('/gryffindor', function(req, res)
	{
		if (req.session.username) 
		{
			res.sendFile(__dirname + '/public/views/gryffindor.html');	
		}
		else
		{
			res.send("User is not logged in!");
		}
		
	});

	app.get('/hufflepuff', function(req, res)
	{
		res.sendFile(__dirname + '/public/views/hufflepuff.html');
	});

	app.get('/ravenclaw', function(req, res)
	{
		res.sendFile(__dirname + '/public/views/ravenclaw.html');
	});

	app.get('/slytherin', function(req, res)
	{
		res.sendFile(__dirname + '/public/views/slytherin.html');
	});

	app.get('/weektop', function(req, res)
	{
		connection.query("SELECT username FROM users ")	
	});

	app.get('/getUserName', function(req, res)
	{
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		var weekday = today.setDate(today.getDate() - 7);
		var oldday = new Date(weekday);
		var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
		var sessionUser = req.session.username;
		connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, weekdate, weekday], function(err, rows, fields)
		{
			var navData = {sessionUser: sessionUser, weekly: rows[0].total}
			res.json(navData);
		});
		
	});

	app.get('/weekTopper', function(req, res)
	{
		connection.query("SELECT * FROM toppers ORDER BY week DESC LIMIT 10", function(err, rows, fields)
		{
			res.json(rows);
		});
	});

	app.get('/monthTopper', function(req, res)
	{
		connection.query("SELECT * FROM toppers ORDER BY month DESC LIMIT 10", function(err, rows, fields)
		{
			res.json(rows);
		});
	})

	app.get('/time', function(req, res)
	{
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	});

	app.get('/leaveRoom', function(req, res)
	{
		req.session.destroy();
		res.json("DONE");
	});

	http.listen(3000, function()
	{
		console.log('listening on *:3000');
	});
