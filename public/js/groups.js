	var socket = io.connect('http://localhost:3000');
	var modal = document.getElementById('myModal');
	var modal1 = document.getElementById('myModal1');
	var btn = document.getElementsByClassName("common");
	var span = document.getElementsByClassName("close")[0];
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
	$('#gryffindor').click(function() 
	{
		var gryfData = {house: "gryffindor", username: $('#username').val()};
		socket.emit('gryfCreate', gryfData);
	});
	$('#hufflepuff').click(function() 
	{
		var huffleData = {house: "hufflepuff", username: $('#username').val()};
		socket.emit('huffCreate', huffleData);
	});

	$('#slytherin').click(function() 
	{
		var slythData = {house: "slytherin", username: $('#username').val()};
		socket.emit('slythCreate', slythData);
	});

	$('#ravenclaw').click(function() 
	{
		var ravenData = {house: "ravenclaw", username: $('#username').val()};
		socket.emit('ravenCreate', ravenData);
	});

	$('.common').click(function() 
	{
		modal.style.display = "block";
	});

	$(span).click(function() 
	{
		modal.style.display = "none";
	});

	$(window).click(function(event) 
	{
		if (event.target == modal) 
		{
			modal.style.display = "none"; 
		}
	});

	socket.on("seconds", function(count) 
	{
		$('#timer').html("Game will start in <b>" + count + "</b> seconds");
	});

	socket.on('redirect', function(destination) 
	{
		window.location.href = destination;
	});

	socket.on('gameFailed', function(destination) 
	{
		window.location.href = destination;
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

	$('#weekTopper').click(function()
	{
		$.ajax(
		{
			type: 'get',
			url: '/weekTopper',
			success: function(navData) 
			{
				modal1.style.display = "block";
				var tr;
				for (var i = 0; i < navData.length; i++) 
				{
					tr = $('<tr/>');
					tr.append("<td>" + navData[i].id + "</td>");
					tr.append("<td>" + navData[i].username + "</td>");
					tr.append("<td>" + navData[i].week + "</td>");
					$('tbody').append(tr);
				}
			}
		});
	});

	$('#monthTopper').click(function()
	{
		$.ajax(
		{
			type: 'get',
			url: '/monthTopper',
			success: function(navData) 
			{
				modal1.style.display = "block";
				var tr;
				for (var i = 0; i < navData.length; i++) 
				{
					tr = $('<tr/>');
					tr.append("<td>" + navData[i].id + "</td>");
					tr.append("<td>" + navData[i].username + "</td>");
					tr.append("<td>" + navData[i].month + "</td>");
					$('table').append(tr);
				}
			}
		});
	});

	$(window).click(function(event) 
	{
		if (event.target == modal1) 
		{
			modal1.style.display = "none"; 
			$("#classTable tr>td").remove();
		}
	});