	var $item = $('.carousel .item'); 
	var $wHeight = $(window).height();
	$item.eq(0).addClass('active');
	$item.height($wHeight); 
	$item.addClass('full-screen');

	$('.carousel img').each(function() 
	{
		var $src = $(this).attr('src');
		$(this).parent().css(
		{
			'background-image' : 'url(' + $src + ')',
		});
		$(this).remove();
	});

	$(window).on('resize', function ()
	{
		$wHeight = $(window).height();
		$item.height($wHeight);
	});

	$('.carousel').carousel(
	{
		interval: false
	});

	$(".carousel").swipe(
	{
		swipe: function(event, direction, distance, duration, fingerCount, fingerData) 
		{
			if (direction == 'left') $(this).carousel('next');
			if (direction == 'right') $(this).carousel('prev');
		},
		allowPageScroll:"vertical"
	});
