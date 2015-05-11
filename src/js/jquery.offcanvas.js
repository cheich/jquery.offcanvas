/*!
 * jquery.offcanvas.js v3.0.1 - 2015-05-06
 * Copyright 2014 Christoph Heich | http://cheich.github.io/jquery.offcanvas/
 * Released under the MIT license | https://github.com/cheich/jquery.offcanvas/blob/master/LINCENSE.md
 * @TODO: Add swipe gestures (v3.1)
 * @TODO: Add option: wrap (whether to wrap the off-canvas or not)
 * @TODO: Add option: append|prepend (insert content)
 */
 
!(function($) {

	var elemCount = 0;

	$.fn.offcanvas = function(pluginArgs) {

		var elem = this;
		var opts = {};
		var main = {};

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
			main.elem = $(opts.mainCanvas);
			if (main.elem.length < 1) {
				$.error('Main canvas element not found');
			}else if (main.elem.get(0).tagName.toLowerCase() == 'body') {
				$.error('Main canvas should not be "body"');
			}

			/* Off-canvas: Markup */
			elem.addClass('offcanvas-element')
				.addClass('offcanvas-' + opts.position)
				.addClass('offcanvas-' + opts.mode)
				.css(opts.css);
			elem.data('offcanvas-id', elemId);

			/* Main canvas */
			var elems = {};
			if (typeof main.elem.data('offcanvas-elements') !== 'undefined') {
				elems = main.elem.data('offcanvas-elements');
			}else{
				/* Main canvas: Markup */
				main.elem.addClass('offcanvas-main')
					.css(opts.mainCanvasCss)
					.wrap('<div class="offcanvas-viewport" />');
			}

			/* Main canvas: Bindings */
			elem.data('offcanvas-main', main); // Bind main to element
			elems[elemId] = elem;
			main.elem.data('offcanvas-elements', elems);

			/* Inject it */
			if (opts.injectPosition == 'after') {
				elem.insertAfter(main.elem);
			}else{
				elem.insertBefore(main.elem);
			}

			/* Add overlay (one time) */
			if (main.elem.children('.offcanvas-overlay').length == 0) {
				main.elem.prepend('<div class="offcanvas-overlay" />');
			}

			/* Bind click event */
			if (opts.mainCanvasClick) {
				main.elem.children('.offcanvas-overlay').on('click', function(e) {
					elem.offcanvas('hideAll');
					opts.onMainCanvasClick(e, elem);
				});
			}
			
			/* Still enable URI hash-fragment (Just reload it)
			 * Error caused from inserting wrappers */
			if (window.location.hash) {
				window.location.hash = window.location.hash;
			}
			
			/* Hide */
			methods.refresh();
		};

		/**
		 * Handle Options
		 */
		var optionHandler = function(settings) {
			/* Merge defaults and options */
			var options = $.extend(true, {}, $.fn.offcanvas.defaults, settings);

			/* position */
			options.position.toLowerCase();
			if ($.inArray(options.position, ['top', 'right', 'bottom', 'left']) == -1) {
				options.position = 'left';
			}

			/* mode */
			options.mode = options.mode.toLowerCase();
			if ($.inArray(options.mode, ['push', 'cover', 'base']) == -1) {
				options.mode = 'push';
			}

			/* injectPosition */
			options.injectPosition.toLowerCase();
			if ($.inArray(options.injectPosition, ['before', 'after']) == -1) {
				options.injectPosition = 'before';
			}
			
			/* Split animate options and properties */
			var aniOpts = ['duration', 'easing', 'queue', 'specialEasing', 'step', 'progress', 'complete', 'start', 'done', 'fail', 'always'];
			
			/* Split animate */
			elemOpts = {};
			elemProps = {};
			$.each(options.animate, function(key, value) {
				if ($.inArray(key, aniOpts) != -1) {
					elemOpts[key] = value;
				}else{
					elemProps[key] = value;
				}
			});
			delete options.animate;
			options.animate = {
				opts: elemOpts,
				props: elemProps,
			};
			
			/* Split mainCanvasAnimate */
			mainElemOpts = {};
			mainElemProps = {};
			$.each(options.mainCanvasAnimate, function(key, value) {
				if ($.inArray(key, aniOpts) != -1) {
					mainElemOpts[key] = value;
				}else{
					mainElemProps[key] = value;
				}
			});
			delete options.mainCanvasAnimate;
			options.mainCanvasAnimate = {
				opts: mainElemOpts,
				props: mainElemProps,
			};
			
			/* mainCanvasAnimate.opts: extend options from `animate.opts` */
			options.mainCanvasAnimate.opts = $.extend(true, {}, options.animate.opts, options.mainCanvasAnimate.opts);
			
			/* mainCanvasAnimate.complete: callbacks */
			var mainElemCb = $.Callbacks();
			mainElemCb.add(function() { // Set state
				main.elem.state = 'animated';
			});
			mainElemCb.add(allAnimationsComplete); // Check all animations
			if (typeof options.mainCanvasAnimate.opts.complete === 'function') {
				mainElemCb.add(options.mainCanvasAnimate.opts.complete); // User complete function
			}else if (typeof options.animate.opts.complete === 'function') {
				mainElemCb.add(options.animate.opts.complete); // Fallback to opts.animate
			}
			options.mainCanvasAnimate.opts.complete = function() {
				if (main.elem.state == 'progress') {
					mainElemCb.fire(elem);
				}
			}
			
			/* animate.complete: callbacks */
			var elemCb = $.Callbacks();
			elemCb.add(function() { // Set state
				elem.state = 'animated';
			});
			elemCb.add(allAnimationsComplete); // Check all animations			
			if (typeof options.animate.opts.complete === 'function') {
				elemCb.add(options.animate.opts.complete); // User complete function
			}
			options.animate.opts.complete = function() {
				elemCb.fire(elem);
			}

			/* Bind options to element */
			elem.data('offcanvas-options', options);
			
			/* Safe to global 'opts' */
			opts = options;
		};

		/**
		 * Apply animate-able styles
		 * Uses jQuery transit, if exists
		 */
		var applyStyle = function(el, props, options) {
			/* Perform style changes with .transition */
			if (opts.animate !== false && typeof $.fn.transition !== 'undefined' && $.support.transition) {
				el.transition(props, options);

			/* Fallback to jQuery .animate */
			}else if (opts.animate !== false && opts.jsFallback) {
				el.animate(props, options);

			/* Fallback to .css (no transition/animations) */
			}else{
				el.css(props);
			}
		};

		/**
		 * Get reseted properties of off-canvas element
		 * @return object
		 */
		var defaultElemProperties = function() {
			var elemProps = {};
			if ($.inArray(opts.mode, ['cover', 'push']) != -1) {
				if ($.inArray(opts.position, ['top', 'bottom']) != -1) {
					elemProps[opts.position] = '-' + opts.css.height;
				}else{
					elemProps[opts.position] = '-' + opts.css.width;
				}
			}
			return elemProps;
		};

		/**
		 * Get reseted properties of main canvas element
		 * @return object
		 */
		var defaultMainElemProperties = function() {
			return {
				top: '',
				left: '',
			};
		};

		/**
		 * Check all animations; Set states and callbacks
		 * Called after each animations
		 */
		var allAnimationsComplete = function() {
			/* Check state of elem and main.elem */			
			if (elem.state == 'animated' && main.elem.state == 'animated') {
				if (elem.data('offcanvas-state') == 'pre-inactive') {
					/* Set state */
					elem.data('offcanvas-state', 'inactive');
					main.elem.removeClass('offcanvas-main-inactive');
					elem.addClass('offcanvas-inactive');
					
					/* User callback */
					opts.onHideAfter(elem);
				}else if (elem.data('offcanvas-state') == 'pre-active') {
					/* Set state */
					elem.data('offcanvas-state', 'active');
					
					/* User callback */
					opts.onShowAfter(elem);
				}
			}
		};

		/** ==========================================================
		 *  = Public Methods
		 *  ==========================================================
		 */
		var methods = {

			/**
			 * Show selected off-canvas element
			 */
			show: function() {
				if (elem.data('offcanvas-state') == 'inactive') {
					/* On show before */
					opts.onShowBefore(elem);
					elem.data('offcanvas-state', 'pre-active');
					elem.state = 'progress';
					main.elem.state = 'progress';
					main.elem.addClass('offcanvas-main-inactive');
					elem.removeClass('offcanvas-inactive');

					/* Properties */
					var elemProps = {};
					elemProps[opts.position] = 0;
					var mainElemProps = {};

					switch (opts.mode) {

						/* Push */
						case 'push':
							switch (opts.position) {
								case 'top':
									mainElemProps['top'] = opts.css.height;
									break;
								case 'right':
									mainElemProps['left'] = '-' + opts.css.width;
									break;
								case 'bottom':
									mainElemProps['top'] = '-' + opts.css.height;
									break;
								case 'left':
								default:
									mainElemProps['left'] = opts.css.width;
									break;
							}
							break;

						/* Base */
						case 'base':
							switch (opts.position) {
								case 'top':
									mainElemProps['top'] = opts.css.height;
									break;
								case 'right':
									mainElemProps['left'] = '-' + opts.css.width;
									break;
								case 'bottom':
									mainElemProps['top'] = '-' + opts.css.height;
									break;
								case 'left':
								default:
									mainElemProps['left'] = opts.css.width;
									break;
							}
							break;

						/* Default: Cover */
						case 'cover':
						default:
							break;
					}
				}

				/* Move element */
				$.extend(true, elemProps, opts.animate.props);
				applyStyle(elem, elemProps, opts.animate.opts);

				/* Move main element */
				$.extend(true, mainElemProps, opts.mainCanvasAnimate.props);
				applyStyle(main.elem, mainElemProps, opts.mainCanvasAnimate.opts);

				/* Show main canvas overlay */
				applyStyle(main.elem.children('.offcanvas-overlay'), {
					opacity: 1,
				}, opts.mainCanvasAnimate.opts);
			},

			/**
			 * Hide selected off-canvas element
			 */
			hide: function() {
				if (elem.data('offcanvas-state') == 'active') {
					/* On hide before */
					opts.onHideBefore(elem);
					elem.data('offcanvas-state', 'pre-inactive');
					elem.state = 'progress';
					main.elem.state = 'progress';

					/* Reset: Off-canvas */
					applyStyle(elem, defaultElemProperties(), opts.animate.opts);

					/* Reset: Main canvas */
					applyStyle(main.elem, defaultMainElemProperties(), opts.mainCanvasAnimate.opts);

					/* Reset: Main canvas overlay */
					applyStyle(main.elem.children('.offcanvas-overlay'), {
						opacity: 0,
					}, opts.mainCanvasAnimate.opts);
				}
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

			/**
			 * Wazzup now, hu?
			 * @return string pre-active|active|pre-inactive|inactive
			 */
			state: function() {
				return elem.data('offcanvas-state');
			},

			/**
			 * Be fresh
			 */
			refresh: function() {
				elem.data('offcanvas-state', 'inactive');

				/* Reset: Main canvas */
				main.elem.css(defaultMainElemProperties());
				main.elem.removeClass('offcanvas-main-inactive');

				/* Reset: Off-canvas */
				elem.css(defaultElemProperties());
				elem.addClass('offcanvas-inactive');

				/* Reset: Main canvas overlay */
				main.elem.children('.offcanvas-overlay').css('opacity', 0);
			},

			/**
			 * Destroooy!!!!
			 */
			destroy: function() {
				/* Destroy: off-canvas */
				elem.unwrap();
				elem.removeClass('offcanvas-element offcanvas-push offcanvas-cover offcanvas-base');
				elem.removeClass('offcanvas-top offcanvas-right offcanvas-bottom offcanvas-left');
				elem.css({
					top: '',
					right: '',
					bottom: '',
					left: '',
					width: '',
					height: '',
				});
				elem.removeData('offcanvas-linked-id offcanvas-options offcanvas-id offcanvas-main offcanvas-state');

				/* Destroy: main canvas */
				main.elem.removeClass('offcanvas-main offcanvas-inactive');
				main.elem.css({
					top: '',
					right: '',
					bottom: '',
					left: '',
					width: '',
					height: '',
				});
				main.elem.removeData('offcanvas-elements');

				/* Destroy: main canvas overlay */
				main.elem.children('.offcanvas-overlay').remove();
			},
		};

		/** ==========================================================
		 *  = Plugin
		 *  ==========================================================
		 */

		/**
		 * Cloned element
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

		/* Retrieve stored data */
		if (typeof elem.data('offcanvas-main') !== 'undefined') {
			main = elem.data('offcanvas-main');
		}
		if (typeof elem.data('offcanvas-options') !== 'undefined') {
			opts = elem.data('offcanvas-options');
		}

		/**
		 * Call plug-in methods / options
		 */
		/* Find methods */
		if (methods[pluginArgs]) {
			if (typeof elem.data('offcanvas-id') !== 'undefined') {
				methods[pluginArgs].apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				$.error('Element was not initialized with jQuery Offcanvas');
			}

		/* Find options */
		}else if (typeof pluginArgs === 'object' || !pluginArgs) {
			init.apply(this, arguments);

		/* Nothing found */
		}else{
			$.error('Method "' +  pluginArgs + '" does not exist in jQuery Offcanvas');
		}

		return elem;
	};
	
	/** ==========================================================
	 *  = Default Options
	 *  ==========================================================
	 */
	$.fn.offcanvas.defaults = {
		/* Off-canvas */
		position:			'left',			// top|right|bottom|left
		mode:				'push',			// push|cover|base
		injectPosition:		'before',		// before|after, relative to main canvas
		cloneElement:		false,			// Instead of moving it
		css:				{
			width:				'100%',		// <length>, <percentage>
			height:				'100%',		// <length>, <percentage>
		},
		jsFallback:			true,			// If browser doesn't support CSS3 transitions or Transit isn't available
		animate:			{},				// Add further animation options @see http://api.jquery.com/animate/

		/* Main canvas */
		mainCanvas:			'#page',		// Selector or jQuery object
		mainCanvasClick:	true,			// Make the main canvas click-able
		mainCanvasAnimate:	{},				// Add further animation options @see http://api.jquery.com/animate/ - Overwrites 'animate'
		mainCanvasCss:		{},				// Add CSS styles to the main canvas

		/* Callbacks */
		onShowBefore:		function() {},	// Triggered before the off-canvas is shown
		onShowAfter:		function() {},	// Triggered after the off-canvas is shown
		onHideBefore:		function() {},	// Triggered before the off-canvas is hidden
		onHideAfter:		function() {},	// Triggered after the off-canvas is hidden
		onMainCanvasClick:	function() {},	// Triggered after clicking on the main canvas
	};
}(jQuery));
