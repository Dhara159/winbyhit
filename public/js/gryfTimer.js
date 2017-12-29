  	var socket = io.connect('https://secret-sands-26285.herokuapp.com');
  	
  	var hit = 0;
  	var modal = document.getElementById('myModal');
  	var modal1 = document.getElementById('myModal1');
  	var btn = document.getElementsByClassName("common");
  	var span = document.getElementsByClassName("close")[0];
  	var span1 = document.getElementsByClassName("close")[1];

  	$('#hit').click(function() 
  	{
  		hit++;
  	});

  	$(document).ready(function()
  	{
  		socket.emit("reached", "gryffindor");
	  	$.ajax
	  	({
  			type: 'get',
  			url: 'getUserName',
  			success: function(navData) 
  			{
	  			$('#username').val(navData.sessionUser);
  				$('#navuser').text("USERNAME: " + navData.sessionUser);
  				$('#navScore').text("SCORE: " + navData.weekly);
  			}
  		});
  	});

  	$('week').click(function()
  	{
	  	socket.emit('week', $('#username').val());
	  	socket.on('setWeekScore', function(WeekScore)
	  	{
  			$('#navScore').text("SCORE: " + WeekScore);
  		});
  	});

  	$('month').click(function()
  	{
	  	socket.emit('month', $('#username').val());
	  	socket.on('setMonthScore', function(monthScore)
	  	{
  			$('#navScore').text("SCORE: " + monthScore);
  		});
  	});

  	$(span1).click(function() 
  	{
  		modal1.style.display = "none";
  	});

  	$('#leave').click(function()
  	{
  		var data = {};
  		data.houseName = "gryffindor";
  		$.ajax({
  			type: 'post',
  			url: '/leaveRoom',
  			data: data,
  			success: function(other)
  			{
  				window.location.href = "/";
  			}
  		});
  	});

  	$('#reset').click(function() 
  	{
	  	socket.emit('reset', "gryffindor");
	  	socket.on('group', function(group) 
	  	{
  			window.location.href = group;
  		});
  	});

  	socket.on('timer', function(seconds_left)
  	{
  		document.getElementById('timer').innerHTML = seconds_left;
  	});

  	socket.on('timeOut', function(done)
  	{
  		$('#hit').attr("disabled", true);
  		$('#score').html(hit);
  		modal.style.display = "block";
  		setTimeout(function()
  		{
  			modal.style.display = "none";
  			var submitScore = { username: $('#username').val(), score: hit, room: 'gryffindor'};
	  		socket.emit('submitScore', submitScore);
  		}, 1000);
  	});

  	socket.on('gryfWinner', function(winner)
  	{
		$('#winner').html("The winner is: " + winner.winUser);
  		$('#winningScore').html("Score: " + winner.maxScore);
  		modal1.style.display = "block";
  	});