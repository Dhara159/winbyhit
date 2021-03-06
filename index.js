	const port = process.env.PORT || 3000;
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
	var addedGryfUser = 0;
	var addedHuffleUser = 0;
	var addedSlythUser = 0;
	var addedRavenUser = 0;
	var joinedGryf = 0;
	var joinedHuffle = 0;
	var joinedSlyth = 0;
	var joinedRaven = 0;
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
		host: 'db4free.net',
		user: 'winbyhit',
		password: 'Winbyhit@1598753',
		database: 'winbyhit'
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

	io.sockets.on('connection', function(socket)
	{
		socket.on("signup", function(username){ signup(username) });
		socket.on('login', function(username){ login(username) });
		socket.on('bann', function(id){ bann(id) });
		socket.on('reset', function(resetHouse){ reset(resetHouse) });
		socket.on('week', function(username){ week(username) });
		socket.on('month', function(username){ month(username) });
		socket.on('gryfCreate', function(dataRoom1){ gryfCreate(dataRoom1) });
		socket.on('huffCreate', function(dataRoom2){ huffCreate(dataRoom2) });
		socket.on('slythCreate', function(dataRoom3){ slythCreate(dataRoom3) });
		socket.on('ravenCreate', function(dataRoom4){ ravenCreate(dataRoom4) });
		socket.on('reached', function(reachedRoom){ reached(reachedRoom) });
		socket.on('submitScore', function(submitData){ submitScore(submitData) });
		socket.on('disconnect', function(leaveData){ leaveGame(leaveData) });

		function signup(username)
		{	
			connection.query("INSERT INTO users(username) VALUES (?)", [username], function(err, rows, fields)
			{
				var result = rows.affectedRows;
				if (!err) 
				{
					if (result != 0) 
					{
						connection.query("INSERT INTO toppers(username, week, month) VALUES (?,?,?)", [username, 0, 0], function(err, rows, fields)
						{
							socket.emit('afterSignUp', 'Successfully SignedUp');
						});
					}
					else
					{
						socket.emit('afterSignUp', 'Something went wrong, please try again!');
					}
				}
				else
				{
					socket.emit('afterSignUp', 'Something went wrong, please try again!');
				}
			});
		}

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
		    		addedGryfUser = 0;
					joinedGryf = 0;
		    		socket.leave("gryffindor");
	    		}
	    		if (resetHouse == "hufflepuff") 
	    		{
	    			huffleUser = 0;
				huffCount = 10;
				huffleScoreArray = [];
				checkHuffleUser = 0;
					addedHuffleUser = 0;
					joinedHuffle = 0;
		    		socket.leave("hufflepuff");
    			}
    			if (resetHouse == "slytherin") 
    			{	
	    			slythUser = 0;
				slythCount = 10;
				slythScoreArray = [];
				checkSlythUser = 0;
					addedSlythUser = 0;
					joinedSlyth = 0;
		    		socket.leave("slytherin");				
    			}
    			if (resetHouse == "ravenclaw") 
    			{
	    			ravenUser = 0;
				ravenCount = 10;
				ravenScoreArray = [];
				checkRavenUser = 0;
					addedRavenUser = 0;
					joinedRaven = 0;
				socket.leave("ravenclaw");
	    		}
	    		socket.emit('group', '/groups');
		}

		function week(username)
    		{
    			var today = new Date();
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			var weekday = today.setDate(today.getDate() - 6);
			var oldday = new Date(weekday);
			var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
			var sessionUser = username;
			connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, weekdate.toString(), date.toString()], function(err, rows, fields)
			{
				socket.emit('setWeekScore', rows[0].total);
			});
    		}

    		function month(username)
		{
			var today = new Date();
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			var monthday = today.setDate(today.getDate() - 30);
			var oldmonth = new Date(monthday);
			var monthdate = oldmonth.getFullYear()+'-'+(oldmonth.getMonth()+1)+'-'+oldmonth.getDate();
			var sessionUser = username;
			connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, monthdate.toString(), date.toString()], function(err, rows, fields)
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
				addedGryfUser = checkGryfUser = gryfUser;
    				if (gryfUser == 1) 
    				{
				    	var gryfInterval = setInterval(function()
					{
						var createData = {room: room1, interval: gryfInterval};
						gryfCounter(createData);
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
			    	addedHuffleUser = checkHuffleUser = huffleUser;
			    	if (huffleUser == 1) 
			    	{
				    	var huffleInterval = setInterval(function()
					{
						var createData = {room: room2, interval: huffleInterval};
						huffCounter(createData);
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
				addedSlythUser = checkSlythUser = slythUser;
				if (slythUser == 1) 
				{
					var slythInterval = setInterval(function()
					{
						var createData = {room: room3, interval: slythInterval};
						slythCounter(createData);
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
			    	addedRavenUser = checkRavenUser = ravenUser;
			    	if (ravenUser == 1) 
			    	{
		    			var ravenInterval = setInterval(function()
					{
							var createData = {room: room4, interval: ravenInterval};
		    				ravenCounter(createData);
					},1000);
				}
			}
			else
			{
				gameFailed(room4);
			}
		}

		function reached(reachedRoom)
		{
			switch(reachedRoom)
			{
				case "gryffindor":
					joinedGryf = joinedGryf + 1;
					socket.join(reachedRoom);
					if (joinedGryf == addedGryfUser) 
					{
						setTimeout(function() 
  						{
	  						var seconds_left = 15;
	  						var interval = setInterval(function() 
	  						{
	  							io.in(reachedRoom).emit('timer', --seconds_left);
  								if (seconds_left <= 0)
  								{
  									clearInterval(interval);
  									io.in(reachedRoom).emit('timeOut', "data");
        						}
    						}, 1000);
  						}, 2000);
					}
					break;

				case "hufflepuff":
					joinedHuffle = joinedHuffle + 1;
					socket.join(reachedRoom);
					if (joinedHuffle == addedHuffleUser) 
					{
						setTimeout(function() 
  						{
	  						var seconds_left = 15;
	  						var interval = setInterval(function() 
	  						{
	  							io.in(reachedRoom).emit('timer', --seconds_left);
  								if (seconds_left <= 0)
  								{
  									clearInterval(interval);
  									io.in(reachedRoom).emit('timeOut', "data");
        						}
    						}, 1000);
  						}, 2000);
					}
					break;

				case "slytherin":
					joinedSlyth = joinedSlyth + 1;
					socket.join(reachedRoom);
					if (joinedSlyth == addedSlythUser) 
					{
						setTimeout(function() 
  						{
	  						var seconds_left = 15;
	  						var interval = setInterval(function() 
	  						{
	  							io.in(reachedRoom).emit('timer', --seconds_left);
  								if (seconds_left <= 0)
  								{
  									clearInterval(interval);
  									io.in(reachedRoom).emit('timeOut', "data");
        						}
    						}, 1000);
  						}, 2000);
					}
					break;

				case "ravenclaw":
					joinedRaven = joinedRaven + 1;
					socket.join(reachedRoom);
					if (joinedRaven == addedRavenUser) 
					{
						setTimeout(function() 
  						{
	  						var seconds_left = 15;
	  						var interval = setInterval(function() 
	  						{
	  							io.in(reachedRoom).emit('timer', --seconds_left);
  								if (seconds_left <= 0)
  								{
  									clearInterval(interval);
  									io.in(reachedRoom).emit('timeOut', "data");
        						}
    						}, 1000);
  						}, 2000);
					}
					break;

				default:
					io.in(reachedRoom).emit('timeOut', "data");
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

		function gryfCounter(createData)
		{	
			if(gryfCount > 0)
			{
				gryfCount--;
				io.in(createData.room).emit('seconds', gryfCount);
			}
			else
			{
				if (gryfUser <= 1) 
				{
					gryfCount = 10;
					gryfUser = 0;
					addedGryfUser = 0;
					joinedGryf = 0;
					connection.query("DELETE from playing WHERE house = ?",["gryffindor"], function(err, rows, fields)
					{
					});
					clearInterval(createData.interval);
					gameFailed(createData.room);
				}
				else
				{
					clearInterval(createData.interval);
					var destination = '/gryffindor';
					io.in(createData.room).emit('redirect', destination);	
				}
				
			}
		}

		function huffCounter(createData)
		{	
			if(huffCount > 0)
			{
					huffCount--;
				io.in(createData.room).emit('seconds', huffCount);
			}
			else
			{
				if (huffleUser <= 1) 
				{
					addedHuffleUser = 0;
					joinedHuffle = 0;
					huffCount = 10;
					huffleUser = 0;
					connection.query("DELETE from playing WHERE house = ?",["hufflepuff"], function(err, rows, fields)
					{
					});
					clearInterval(createData.interval);
					gameFailed(createData.room);
				}
				else
				{
					clearInterval(createData.interval);
					var destination = '/hufflepuff';
					io.in(createData.room).emit('redirect', destination);
				}
			}
		}

		function slythCounter(createData)
		{	
			if(slythCount > 0)
			{
				slythCount--;
				io.in(createData.room).emit('seconds', slythCount);
			}
			else
			{
				if (slythUser <= 1) 
				{
					addedSlythUser = 0;
					joinedSlyth = 0;
					slythCount = 10;
					slythUser = 0;
					connection.query("DELETE from playing WHERE house = ?",["slytherin"], function(err, rows, fields)
					{
					})
					clearInterval(createData.interval);
					gameFailed(createData.room);
				}
				else
				{
					clearInterval(createData.interval);
					var destination = '/slytherin';
					io.in(createData.room).emit('redirect', destination);
				}
			}
			
		}

		function ravenCounter(createData)
		{	
			if(ravenCount > 0)
			{
				ravenCount--;
				io.in(createData.room).emit('seconds', ravenCount);
			}
			else
			{
				if (ravenUser <= 1) 
				{
					addedRavenUser = 0;
					joinedRaven = 0;
					ravenCount = 10;
					ravenUser = 0;
					connection.query("DELETE from playing WHERE house = ?",["ravenclaw"], function(err, rows, fields)
					{
					})
					clearInterval(createData.interval);
					gameFailed(createData.room);
				}
				else
				{
					clearInterval(createData.interval);
					var destination = '/ravenclaw';
					io.in(createData.room).emit('redirect', destination);
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
			var weekday = today.setDate(today.getDate() - 6);
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
		if (!req.session.username || req.session.username == "" || req.session.username == undefined) 
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
		if (req.session.username != "" || req.session.username == undefined) 
		{
			res.sendFile(__dirname + '/public/views/groups.html');
		}
		else
		{
			res.send("User is not logged in!");
		}
			
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
		connection.query("SELECT * FROM admin WHERE username = ? AND password = ?", [username, password], function(err, rows, fields)
		{
			var result = rows.length;
			if (result != 0) 
			{
				req.session.admindata = "set";
				res.send("YES");	
			}
			else
			{
				res.send("NO")
			}
			
		});

	});

	app.get('/main', function(req, res)
	{
		if (req.session.admindata != "") 
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
		if (req.session.admindata != "") 
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
		req.session.admindata = "";
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
		var weekday = today.setDate(today.getDate() - 6);
		var oldday = new Date(weekday);
		var weekdate = oldday.getFullYear()+'-'+(oldday.getMonth()+1)+'-'+oldday.getDate();
		var sessionUser = req.session.username;
		connection.query("SELECT sum(score) as total FROM score_log WHERE username = ? AND dateRecord >= ? AND dateRecord <= ?", [sessionUser, weekdate.toString(), date.toString()], function(err, rows, fields)
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

	app.post('/leaveRoom', function(req, res)
	{
		req.session.destroy();
		res.json("DONE");
	});
	
	http.listen(port, function()
	{
		console.log('listening on ' + port);
	});
