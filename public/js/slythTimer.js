	var delayInMilliseconds = 2000;
	var hit = 0;

	$('#hit').click(function() 
	{
		hit++;
	});

	$(document).ready(function()
	{
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

	var modal = document.getElementById('myModal');
	var modal1 = document.getElementById('myModal1');
	var btn = document.getElementsByClassName("common");
	var span = document.getElementsByClassName("close")[0];
	var span1 = document.getElementsByClassName("close")[1];

	setTimeout(function() 
	{
		var seconds_left = 15;
		var interval = setInterval(function() 
		{
			document.getElementById('timer').innerHTML = --seconds_left;
			if (seconds_left <= 0)
			{
	       		// document.getElementById('timer').innerHTML = "Time's up!";
	       		clearInterval(interval);
	       		console.log(hit);
	       		$('#hit').attr("disabled", true);
	       		$('#score').html(hit);
	       		modal.style.display = "block";
	       		$.ajax(
	       		{
	       			type: 'get',
	       			url: 'getUserName',
	       			success: function(username) 
	       			{
	       				$('#username').val(username);
	       			}
	       		});
	       	}
	       }, 1000);
	}, delayInMilliseconds);

	$(span).click(function() 
	{
		modal.style.display = "none";
		var submitScore = { username: $('#username').val(), score: hit, room: 'slytherin'};
		socket.emit('submitScore', submitScore);

		socket.on('slythWinner', function(winner)
		{
			$('#winner').html("The winner is: " + winner.winUser);
			$('#winningScore').html("Score: " + winner.maxScore);
			modal1.style.display = "block";
		});
	});

	$(span1).click(function() 
	{
		modal1.style.display = "none";
	});

	$('#leave').click(function()
  	{
  		$.ajax({
  			type: 'get',
  			url: '/leaveRoom',
  			success: function(data)
  			{
  				window.location.href = "/";
  			}
  		});
  	});

	$('#reset').click(function() 
	{
		socket.emit('reset', "slytherin");
		socket.on('group', function(group) 
		{
			window.location.href = group;
		});
	});




