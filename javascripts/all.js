/*!
 * Javascript Cookie v1.5.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */

(function (factory) {
	var jQuery;
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		try {
			jQuery = require('jquery');
		} catch(e) {}
		module.exports = factory(jQuery);
	} else {
		// Browser globals
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory(window.jQuery);
		api.noConflict = function() {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return api.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return api.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(api.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return api.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = api.raw ? s : parseCookieValue(s);
		return isFunction(converter) ? converter(value) : value;
	}

	function extend() {
		var key, options;
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			options = arguments[ i ];
			for (key in options) {
				result[key] = options[key];
			}
		}
		return result;
	}

	function isFunction(obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	}

	var api = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !isFunction(value)) {
			options = extend(api.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {},
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()".
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');

			if (key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	api.get = api.set = api;
	api.defaults = {};

	api.remove = function (key, options) {
		// Must not alter options, thus extending a fresh object...
		api(key, '', extend(options, { expires: -1 }));
		return !api(key);
	};

	if ( $ ) {
		$.cookie = api;
		$.removeCookie = api.remove;
	}

	return api;
}));
// Make sure Highlight elements (.highlight) have an ID.

$(function () {
  var showScrollTop = 100; // pixels scrolled before showing highlights
  var showDelay = 400; // ms before showing
  var cookieExpiresOnClose = 1 / 24 / 60 * 10; // 10 MINUTES till the cookie expires after closing
  var cookieExpiresOnSubmit = 30; // DAYS the cookie expires after submitting
  var cookiePath = '/';
  var cookiePrefix = 'defacto_';
  var cookieValue = 'hidden';
  var cookies = Cookies.get();
  var $window = $(window);
  var $body = $('body');
  var highlightsShown;

  // console.log(Cookies.get()); // show all coockies
  // Cookies.remove('defacto_highlight-ebook', { path: '/' }); // remove ebook cookie

  // Hide hightlight
  function hide ($highlight, cookieExpires) {
    $highlight.addClass('highlight-hide');

    setTimeout(function () {
      $highlight.remove();
    }, 400);

    var id = $highlight[0].id;
    if (cookieExpires && id) {
      Cookies.set(cookiePrefix + id, cookieValue, { expires: cookieExpires, path: cookiePath });
    }
  }

  // Remove highlights the user has closed
  $('.highlight').each(function () {
    if (this.id && cookies[cookiePrefix + this.id] === cookieValue) {
      $(this).remove();
    }
  });

  // Show highlight after scroll
  $window.on('scroll', function () {

    if (!highlightsShown && $window.scrollTop() > showScrollTop) {
      setTimeout(function () {
        $('.highlight').addClass('highlight-show');
        highlightsShown = true;
      }, showDelay);
    }
  });

  // Close highlight button
  $body.on('click', '.highlight .close', function (event) {
    event.preventDefault();

    var $highlight = $(this).closest('.highlight');
    hide($highlight, cookieExpiresOnClose);
  });

  // Ebook form submit
  $body.on('submit', '#highlight-ebook form', function (event) {
    event.preventDefault();

    var ebookUrl = '/pdf/Handboek Leren en laten Leren.pdf';
    var $form = $(this);
    var $submit = $form.find('button[type=submit]');

    // Submit form
    $.ajax({
      type: 'POST',
      url: $form.prop('action'),
      accept: {
        javascript: 'application/javascript'
      },
      data: $form.serialize(),
      beforeSend: function () {
        $submit.prop('disabled', 'disabled');
      }
    }).always(function () {
      $submit.prop('disabled', false);
    });

    // Download ebook
    window.open(ebookUrl, '_blank');

    // hide hightlight
    var $highlight = $form.closest('.highlight');
    hide($highlight, cookieExpiresOnSubmit);
  });
});
var map;

function mapInit() {
  var canvas = document.getElementById('map-canvas');

  if (canvas) {
    var defactoHQ = new google.maps.LatLng(53.212124, 6.57214);
    var mapOptions = {
      zoom: 16,
      center: defactoHQ,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      draggable: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var image = '/images/marker-orange.svg';
    var defactoMarker = new google.maps.Marker({
      position: defactoHQ,
      clickable: false,
      map: map,
      icon: image
    });
  }
}

google.maps.event.addDomListener(window, 'load', mapInit);
$(function () {
  $('.modal-state').on('change', function () {
    $('body').toggleClass('modal-open', $(this).is(':checked'));
  });

  $('.modal-window').on('click', function () {
    $(this).closest('.modal').find('.modal-state').prop('checked', false).change();
  });

  $('.modal-inner').on('click', function (event) {
    event.stopPropagation();
  });
});
$(function () {
  // These values should be identical to the ones in _highlight.js
  var cookieExpiresOnSubmit = 30;
  var cookiePath = '/';
  var cookiePrefix = 'defacto_';
  var cookieValue = 'hidden';

  // Hide hightlight
  function hideHighlight () {
    var $highlight = $('#highlight-ebook');

    if ($highlight.length == 0) {
      return;
    }

    $highlight.addClass('highlight-hide');

    setTimeout(function () {
      $highlight.remove();
    }, 400);

    var id = $highlight[0].id;
    if (cookieExpiresOnSubmit && id) {
      Cookies.set(cookiePrefix + id, cookieValue, { expires: cookieExpiresOnSubmit, path: cookiePath });
    }
  }

  // Ebook form submit
  $('#ebook-download form').on('submit', function (event) {
    event.preventDefault();

    var ebookUrl = '/pdf/Handboek Leren en laten Leren.pdf';
    var $form = $(this);
    var $submit = $form.find('button[type=submit]');

    // Submit form
    $.ajax({
      type: 'POST',
      url: $form.prop('action'),
      accept: {
        javascript: 'application/javascript'
      },
      data: $form.serialize(),
      beforeSend: function () {
        $submit.prop('disabled', 'disabled');
      }
    }).always(function () {
      $submit.prop('disabled', false);
    });

    // Download ebook
    window.open(ebookUrl, '_blank');

    // hide hightlight
    hideHighlight();
  });
});



$(function () {
  'use strict';

  // Mobile navigation
  var $menu = $('#header-menu');
  var $menuToggle = $('#mobile-menu-toggle');
  $menuToggle.on('click', function (event) {
    event.preventDefault();
    $menu.slideToggle(200, function () {
      if($menu.is(':hidden')) {
        $menu.removeAttr('style');
      }
    });
  });

  // var $window = $(window);
  // $('[data-parallax="background"]').each(function () {
  //   var $this = $(this);
  //   var speed = $this.data('parallax-speed');
  //   var offset = $this.data('parallax-offset') || 0;

  //   $window.on('scroll', function () {
  //     var yPos = -($window.scrollTop() / speed);
  //     var coords = '50% ' + (yPos + offset) + 'px';
  //     $this.css('backgroundPosition', coords);
  //   });

  //   $window.scroll()
  // });
});
