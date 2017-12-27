	function validateSubmit(username) 
	{
		var validUser = validateUsername(username);
		if (validUser) 
		{
			$.ajax({
				type: 'post',
				url: '/validateInput',
				data: {
					username: username,
				},
				success: function(response)
				{
					if (response == "YES") 
					{
						$('#err').html("Username alredy in use!");
					}
					else
					{
						socket.emit("signup", username);
						socket.on('afterSignUp', function(afterSignUpMsg)
						{
							alert(afterSignUpMsg);
							window.location.href = '/';
						});
					}
				}
			});
		}
	}

	function validateLogin(username) 
	{
		var validUser = validateUsername(username);
		if (validUser) 
		{
			$.ajax({
				type: 'post',
				url: '/validateInput',
				data: {
					username: username,
				},
				success: function(response)
				{
					if (response == "YES") 
					{
						// window.location.href = '/login/'+username;
						socket.emit('login',username);
						socket.on('afterLogin', function(afterLogin) 
						{	
							window.location.href = afterLogin;
						});
					}
					else
					{
						if (response == "Banned") 
						{
							$('#err').html("User is Banned!");	
						}
						else
						{
							$('#err').html("Username does not exist!");	
						}
					}
				}
			});
		}
	}

	function validateUsername(username)
	{
		var check = true;
		if (username)
		{
			var userLength = username.length;
			if (userLength < 3) 
			{
				$('#err').html("Username must be greater than 3 letters!");
				return check = false;
			}
			else
			{
				return check;
			}
		}
		else
		{
			$('#err').html("Please enter the username!");
			return check = false;
		}
	}