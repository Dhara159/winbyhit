	var socket = io.connect('https://secret-sands-26285.herokuapp.com');
	var modal = document.getElementById('myModal');
	var modal1 = document.getElementById('myModal1');
	var btn = document.getElementsByClassName("common");
	var hit = 0;

	$('#hit').click(function() 
	{
		hit++;
	});

	$(document).ready(function()
	{
		socket.emit("reached", "slytherin");
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

	$('#leave').click(function()
  	{
  		var data = {};
  		data.houseName = "slytherin";
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
		socket.emit('reset', "slytherin");
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
  			var submitScore = { username: $('#username').val(), score: hit, room: 'slytherin'};
	  		socket.emit('submitScore', submitScore);
  		}, 1000);
  	});

  	socket.on('slythWinner', function(winner)
  	{
		$('#winner').html("The winner is: " + winner.winUser);
  		$('#winningScore').html("Score: " + winner.maxScore);
  		modal1.style.display = "block";
  	});