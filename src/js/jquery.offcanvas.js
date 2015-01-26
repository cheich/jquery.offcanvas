/*!
 * jquery.offcanvas.js v2.2 - 2015-01-26
 * Copyright 2014 Christoph Heich | http://cheich.github.io/Offcanvas/
 * Released under the MIT license | https://github.com/cheich/jquery.offcanvas/blob/gh-pages/LICENSE.md
 * @TODO: Add new mode: shrink
 */

$(function($) {

	/** ==========================================================
	 *  = Default Options
	 *  ==========================================================
	 */
	var defaults = {
		/* Off-canvas */
		position:					'left', // top|right|bottom|left
		width:						'100%', // <length>, <percentage>
		height:						'100%', // <length>, <percentage>
		mode:						'overlay', // push|overlay|underlay|shrink
		injectPosition:				'before', // before|after
		cloneElement:				true,
		animateFallback:			true,
		easing:						'linear',
		duration:					$.fx.speeds._default, // Default jQuery speed

		/* Main canvas */
		mainCanvas:					'body', // Selector or jQuery object
		mainCanvasOverlay:			true, // Add an overlay over the main canvas
		mainCanvasOverlayClick:		true, // Hide on click on the main canvas overlay
		mainCanvasOverlayDuration:	$.fx.speeds._default, // Default jQuery speed
	}

	var mainCount = 0;
	var elemCount = 0;

	$.fn.offcanvas = function(methOrOpts) {

		var elem = this;
		var opts = {}
		var main = {}

		/** ==========================================================
		 *  = Private functions
		 *  ==========================================================
		 */

		/**
		 * Initialization
		 */
		var init = function(settings) {

			/* Counter */
			var elemId = ++elemCount;

			/* Handle options */
			optionHandler(settings);

			/* Clone element */
			if (opts.cloneElement) {
				elem = elem.clone(true);
				this.data('offcanvas-linked-id', elemId);
			}

			/* Exceptions */
			if ($(opts.mainCanvas).length < 1) {
				$.error('Main canvas element not found');
			}

			/* Off-canvas */
			if (typeof elem.data('offcanvas-id') === 'undefined') {
				elem.data('offcanvas-id', elemId);
				elem.addClass('offcanvas-element');
			}

			/* Main canvas */
			var elems = {};
			if (typeof $(opts.mainCanvas).data('offcanvas-elements') !== 'undefined') {
				elems = $(opts.mainCanvas).data('offcanvas-elements');
				main.elem = $(opts.mainCanvas).find('.offcanvas-main').first();
			}else{
			
				/* Main canvas: Markup (one time) */
				$(opts.mainCanvas).wrapInner('<div class="offcanvas-main" />');
				main.elem = $(opts.mainCanvas).children();
				if (typeof elem.data('offcanvas-main') === 'undefined') {
					if (typeof main.id === 'undefined') {
						main.id = ++mainCount;
					}
				}
				main.elem.wrap('<div class="offcanvas-viewport" />')
					.wrap('<div class="offcanvas-wrapper" />');			
			}
			
			/* Main canvas: Bindings */
			elem.data('offcanvas-main', main); // Bind main to element
			elems[elemId] = elem;
			$(opts.mainCanvas).data('offcanvas-elements', elems);

			/* Off-canvas element: Classes and sizing */
			elem.addClass('offcanvas-' + opts.position)
				.addClass('offcanvas-' + opts.mode)
				.css({
					width:	opts.width,
					height:	opts.height,
				});

			/* Off-canvas element: Position (only mode push and overlay)  */
			if ($.inArray(opts.mode, ['push', 'overlay']) != -1) {
				switch (opts.position) {
					case 'top':
					case 'bottom':
						elem.css(opts.position, '-'+opts.height);
						break;
					case 'right':
					case 'left':
					default:
						elem.css(opts.position, '-'+opts.width);
				}
			}

			/* Inject it */
			if (opts.injectPosition == 'after') {
				elem.insertAfter(main.elem);
			}else{
				elem.insertBefore(main.elem);
			}

			/* Hide by click the main canvas overlay */
			if (opts.mainCanvasOverlay) {
			
				/* Add overlay (one time) */
				if (main.elem.children('.offcanvas-main-overlay').length == 0) {
					main.elem.prepend('<div class="offcanvas-main-overlay" />');
				}
				main.elem.children('.offcanvas-main-overlay').on('click', function() {
					methods.hide();
				});
			}

			/* Hide (Reset) */
			methods.hide();
		}

		/**
		 * Handle Options
		 */
		var optionHandler = function(settings) {

			/* Merge defaults and options */
			var options = $.extend(true, {}, defaults, settings);

			/* position */
			options.position.toLowerCase();
			if ($.inArray(options.position, ['top', 'right', 'bottom', 'left']) == -1) {
				options.position = 'left';
			}

			/* mode */
			options.mode = options.mode.toLowerCase();
			if ($.inArray(options.mode, ['push', 'overlay', 'underlay', 'shrink']) == -1) {
				options.mode = 'overlay';
			}

			/* injectPosition */
			options.injectPosition.toLowerCase();
			if ($.inArray(options.injectPosition, ['before', 'after']) == -1) {
				options.injectPosition = 'before';
			}

			/* Bind options to element */
			elem.data('offcanvas-options', options);

			opts = options;
		}

		/**
		 * Apply animate-able styles
		 * Use jQuery transit, if exists
		 */
		var applyStyle = function(el, props) {
			/* .animate and .transition properties:
			 *	( properties [, duration ] [, easing ] [, complete ] )
			 */
			var duration = props['duration'];
			delete props['duration'];

			var easing = props['easing'];
			delete props['easing'];

			var complete = props['complete'];
			delete props['complete'];

			/* Queues are never needed */
			props['queue'] = false;

			/* Perform style changes with .transition */
			if (opts.duration > 0 && typeof $.fn.transition !== 'undefined' && $.support.transition) {
				el.transition(props, duration, easing, complete);

			/* Fallback to jQuery .animate */
			}else if (opts.duration > 0 && opts.animateFallback) {
				el.animate(props, duration, easing, complete);

			/* Fallback to .css (no transition/animations) */
			}else{
				el.css(props);
			}
		}

		/** ==========================================================
		 *  = Public Methods
		 *  ==========================================================
		 */
		var methods = {

			/**
			 * Show
			 */
			show: function() {
				/* First, hide all */
				methods.hideAll();

				/* Toggle classes */
				main.elem.addClass('offcanvas-main-inactive');
				elem.removeClass('offcanvas-inactive');

				var defProps = {
					easing:		opts.easing,
					duration:	opts.duration,
				}

				switch (opts.mode) {

					/* Push */
					case 'push':
						switch (opts.position) {
							case 'top':
								var wrapperProps = $.extend(true, {}, defProps, { top: opts.height });
								break;
							case 'right':
								var wrapperProps = $.extend(true, {}, defProps, { left: '-'+opts.width });
								break;
							case 'bottom':
								var wrapperProps = $.extend(true, {}, defProps, { top: '-'+opts.height });
								break;
							case 'left':
							default:
								var wrapperProps = $.extend(true, {}, defProps, { left: opts.width });
								break;
						}
						applyStyle(main.elem.parent(), wrapperProps);
						break;

					/* Shrink */
					case 'shrink':
						/* Struggle code here */
						break;

					/* Underlay */
					case 'underlay':
						switch (opts.position) {
							case 'top':
								var mainProps = $.extend(true, {}, defProps, { top: opts.height });
								break;
							case 'right':
								var mainProps = $.extend(true, {}, defProps, { left: '-' + opts.width });
								break;
							case 'bottom':
								var mainProps = $.extend(true, {}, defProps, { top: '-' + opts.height });
								break;
							case 'left':
							default:
								var mainProps = $.extend(true, {}, defProps, { left: opts.width });
								break;
						}
						applyStyle(main.elem, mainProps);
						break;

					/* Default: Overlay */
					case 'overlay':
					default:
						var elemProps = {};
						elemProps[opts.position] = 0;
						applyStyle(elem, $.extend(true, {}, defProps, elemProps));
						break;
				}

				/* Hide main canvas overlay */
				if (opts.mainCanvasOverlayDuration > 0 && opts.mainCanvasOverlay) {
					applyStyle(main.elem.children('.offcanvas-main-overlay'), {
						opacity:	1,
						duration:	opts.mainCanvasOverlayDuration,
					});
				}

				/* Set state */
				elem.data('offcanvas-state', 'active');
			},

			/**
			 * Hide
			 */
			hide: function() {

				/* Reset: Element */
				var elemProps = {}
				if ($.inArray(opts.mode, ['overlay', 'push']) != -1) {
					elemProps = {
						easing:		opts.easing,
						duration:	opts.duration,
					}
					if ($.inArray(opts.position, ['top', 'bottom']) != -1) {
						elemProps[opts.position] = '-'+opts.height;
					}else{
						elemProps[opts.position] = '-'+opts.width;
					}
				}
				applyStyle(elem, elemProps);

				/* Reset: Wrapper */
				applyStyle(main.elem.parent(), {
					top: 		'',
					left: 		'',
					easing:		opts.easing,
					duration:	opts.duration
				});

				/* Reset: main canvas */
				applyStyle(main.elem, {
					top: 		'',
					left: 		'',
					easing:		opts.easing,
					duration:	opts.duration,
					complete: 	function() {
						if (elem.data('offcanvas-state') == 'inactive') {
							main.elem.removeClass('offcanvas-main-inactive');
							elem.addClass('offcanvas-inactive');
						}
					}
				});

				/* Hide main canvas overlay */
				if (opts.mainCanvasOverlayDuration > 0 && opts.mainCanvasOverlay) {
					applyStyle(main.elem.children('.offcanvas-main-overlay'), {
						opacity:	0,
						duration:	opts.mainCanvasOverlayDuration,
					});
				}

				/* Set state */
				elem.data('offcanvas-state', 'inactive');
			},

			/**
			 * Hide all
			 */
			hideAll: function() {
				$.each($(opts.mainCanvas).data('offcanvas-elements'), function(i, e) {
					e.offcanvas('hide');
				});
			},

			/**
			 * Toggle
			 */
			toggle: function() {
				if (elem.data('offcanvas-state') == 'inactive') {
					methods.show();
				}else if (elem.data('offcanvas-state') == 'active') {
					methods.hide();
				}
			},
		}

		/** ==========================================================
		 *  = Start plugin
		 *  ==========================================================
		 */

		/**
		 * Cloned elements
		 */
		if (typeof elem.data('offcanvas-linked-id') !== 'undefined') {
			var linkedId = elem.data('offcanvas-linked-id');
			elem.each(function(i, e) {
				e = $(e);
				if (typeof e.data('offcanvas-id') !== 'undefined' && e.data('offcanvas-id') == linkedId) {
					elem = e;
					return;
				}
			});
		}

		/* Set shorter vars */
		if (typeof elem.data('offcanvas-main') !== 'undefined') {
			main = elem.data('offcanvas-main');
		}
		if (typeof elem.data('offcanvas-options') !== 'undefined') {
			opts = elem.data('offcanvas-options');
		}

		/**
		 * Call plug-in methods / options
		 */
		/* Find meth - stands for methods! */
		if (methods[methOrOpts]) {
			if (typeof elem.data('offcanvas-id') !== 'undefined') {
				methods[methOrOpts].apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				$.error('Element was not initialized with jQuery Offcanvas');
			}

		/* Find options */
		}else if (typeof methOrOpts === 'object' || !methOrOpts) {
			init.apply(this, arguments);

		/* Nothing found */
		}else{
			$.error('Public method "' +  methOrOpts + '" does not exist in jQuery Offcanvas');
		}

		return elem;
	}
}(jQuery));
