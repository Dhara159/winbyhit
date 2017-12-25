	function validateAdminLogin(username,password) 
	{
		var validUser = validateUsername(username);
		if (validUser) 
		{
			$.ajax({
				type: 'post',
				url: '/validateAdminInput',
				data: {
					username: username,
					password : password
				},
				success: function(response)
				{
					if (response == "YES") 
					{
						window.location.href = '/main';
					}
					else
					{
						$('#err').html("Wrong username or password!");
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