// JavaScript Document// Cache selectors outside callback for performance. 
   var $window = $(window),
       $topstickyEl = $('#top-sticky-div'),
       elTop = $topstickyEl.offset().top;

   $window.scroll(function() {
        $topstickyEl.toggleClass('sticky-top', $window.scrollTop() > elTop);
    });
	
   var $window = $(window),
       $bottomstickyEl = $('#bottom-sticky-div'),
	   $bottomstickymarkerEl = $('#bottom-sticky-marker'),
       elTop = $bottomstickymarkerEl.offset().top;

   $window.scroll(function() {
        $bottomstickyEl.toggleClass('sticky-bottom', $window.scrollTop() > elTop);
    });