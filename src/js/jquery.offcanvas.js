/*!
 * jquery.offcanvas.js v2.1 - 2015-01-21
 * Copyright 2014 Christoph Heich | http://cheich.github.io/Offcanvas/
 * Released under the MIT license | http://opensource.org/licenses/MIT
 * @TODO: Add new mode: shrink
 * @TODO: multiple elements with same parent
 */

$(function($) {

	/** ==========================================================
	 *  = Default Options
	 *  ==========================================================
	 */
	var defaults = {
		mainCanvas:					'.main-canvas',
		position:					'left', // top|right|bottom|left
		width:						'100%',
		height:						'100%',
		mode:						'overlay', // push|overlay|underlay|shrink
		injectPosition:				'before', // before|after
		cloneElement:				false,
		animateFallback:			true,

		mainCanvasOverlay:			true, // Add an overlay over the main canvas
		mainCanvasOverlayClick:		true, // Hide on click on the main canvas overlay
		mainCanvasOverlayDuration:	$.fx.speeds._default,

		easing:						'linear',
		duration:					$.fx.speeds._default,
	}

	// var oc = {}; // Off-canvas namespace
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

			/* Main canvas */
			main.elem = $(opts.mainCanvas);
			if (typeof elem.data('offcanvas-main') === 'undefined') {
				if (typeof main.id === 'undefined') {
					main.id = ++mainCount;
				}
				elem.data('offcanvas-main', main); // Bind main to element
			}

			/* Off-canvas */
			if (typeof elem.data('offcanvas-id') === 'undefined') {
				elem.data('offcanvas-id', elemId);
			}

			/* Exceptions */
			if ($(opts.mainCanvas).length < 1) {
				$.error('Main canvas element not found');
			}
			if ($(opts.mainCanvas).get(0).tagName == 'BODY') {
				$.error('Please do NOT use the body-tag as main canvas');
			}

			/* Markup (one time) */
			if (!main.initialized) {
				main.elem.addClass('offcanvas-main')
					.wrap('<div class="offcanvas-viewport" />')
					.wrap('<div class="offcanvas-wrapper" />');
			}

			/* Off-canvas element: Classes and sizing */
			elem.addClass('offcanvas-' + opts.position)
				.addClass('offcanvas-' + opts.mode)
				.css({
					width:	opts.width,
					height:	opts.height,
				});

			/* Off-canvas element: Position  */
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
				if (main.elem.children('.offcanvas-main-overlay').length == 0) { // Add overlay
					main.elem.prepend('<div class="offcanvas-main-overlay" />');
				}
				main.elem.children('.offcanvas-main-overlay').on('click', function() {
					methods.hide();
				});
			}

			/* Hide */
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
				// methods.hideAll();

				/* Toggle classes */
				main.elem.addClass('offcanvas-main-inactive');
				elem.removeClass('offcanvas-inactive');

				switch (opts.mode) {

					/* Push */
					case 'push':
						switch (opts.position) {
							case 'top':
								applyStyle(main.elem.parent(), { top: opts.height });
								break;
							case 'right':
								applyStyle(main.elem.parent(), { left: '-'+opts.width });
								break;
							case 'bottom':
								applyStyle(main.elem.parent(), { top: '-'+opts.height });
								break;
							case 'left':
								applyStyle(main.elem.parent(), { left: opts.width });
								break;
						}
						break;

					/* Shrink */
					case 'shrink':
						// struggle code here
						break;

					/* Underlay */
					case 'underlay':
						switch (opts.position) {
							case 'top':
								applyStyle(main.elem, { top: opts.height });
								break;
							case 'right':
								applyStyle(main.elem, { left: '-' + opts.width });
								break;
							case 'bottom':
								applyStyle(main.elem, { top: '-' + opts.height });
								break;
							case 'left':
								applyStyle(main.elem, { left: opts.width });
								break;
						}
						break;

					/* Default: Overlay */
					case 'overlay':
					default:
						var args = {};
						args[opts.position] = 0;
						applyStyle(elem, args);
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
				if ($.inArray(opts.mode, ['overlay', 'push']) != -1) {
					var elemProps = {
						easing:		opts.easing,
						duration:	opts.duration
					}
					if ($.inArray(opts.position, ['top', 'bottom']) != -1) {
						elemProps[opts.position] = '-'+opts.height;
					}else{
						elemProps[opts.position] = '-'+opts.width;
					}
					applyStyle(elem, elemProps);
				}

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
				$.each(elems[elem.data('mainCanvas')], function(index, elem) {
					methods.hide();
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
		/* Find method */
		if (methods[methOrOpts]) {
			if (typeof elem.data('offcanvas-id') !== 'undefined') {
				methods[methOrOpts].apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				$.error('Element did not be initialized with jQuery Offcanvas');
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
