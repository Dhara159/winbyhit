	var delayInMilliseconds = 2000;
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

	setTimeout(function() 
	{
		var seconds_left = 15;
		var interval = setInterval(function() 
		{
			document.getElementById('timer').innerHTML = --seconds_left;
			if (seconds_left <= 0)
			{
	       		clearInterval(interval);
	       		console.log(hit);
	       		$('#hit').attr("disabled", true);
	       		$('#score').html(hit);
	       		modal.style.display = "block";
	      }
	  }, 1000);
	}, delayInMilliseconds);

	$(span).click(function() 
	{
		modal.style.display = "none";
		var submitScore = { username: $('#username').val(), score: hit, room: 'hufflepuff'};
		socket.emit('submitScore', submitScore);

		socket.on('huffleWinner', function(winner)
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
  		var data = {};
  		data.houseName = "hufflepuff";
  		$.ajax({
  			type: 'post',
  			url: '/leaveRoom',
  			data: data,
  			success: function(data)
  			{
  				window.location.href = "/";
  			}
  		});
  	});

	$('#reset').click(function() 
	{
		socket.emit('reset', "hufflepuff");
		socket.on('group', function(group) 
		{
			window.location.href = group;
		});
	});