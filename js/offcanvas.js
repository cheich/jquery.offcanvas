/*!
 * offcanvas.js v2.0.1 - 2015-01-16
 * Copyright 2014 Christoph Heich | http://cheich.github.io/Offcanvas/
 * Released under the MIT license | http://opensource.org/licenses/MIT
 * TODO: Add new type: shrink
 */

$(function($) {
	/**
	 * Default Options
	 */
	var defaults = {
		pageSelector:		'div.page',
		position:			'left', // top|right|bottom|left
		width:				'100%',
		height:				'100%',
		type:				'overlay', // push|overlay|underlay|shrink
		injectPosition:		'before', // before|after
		pageOverlay:		true, // boolean; Whether to add an overlay over the main page
		pageOverlayClick:	true, // boolean; Whether to hide on click on the main page overlay ('pageOverlay' must be true)
	}

	var elem;
	var elems = {};

	/**
	 * Start the Offcanvas Plugin
	 */
	$.fn.offcanvas = function(moo) {
		elem = this;

		/* Find method */
        if (methods[moo]) {
            return methods[moo].apply(this, Array.prototype.slice.call(arguments, 1));

		/* Find options */
        }else if (typeof moo === 'object' || !moo) {
            return init.apply(this, arguments);

		/* Nothing found */
        }else{
            // $.error('Method ' +  moo + ' does not exist on Offcanvas Plugin');
        }
	}

	/**
	 * Initialization
	 */
	var init = function(settings) {

		/* Handle settings */
		optionsHandler(settings);

		/* Markup (one time) */ 
		elem.data('page', $(elem.data('options').pageSelector)); // Bind main page to element
		if (!elem.data('page').hasClass('offcanvas-main') && !elem.data('page').parent('.offcanvas-wrapper').length) {
			elem.data('page').addClass('offcanvas-main')
				.wrap('<div class="offcanvas-viewport" />')
				.wrap('<div class="offcanvas-wrapper" />');
		}
		elem.data('wrapper', elem.data('page').parent('.offcanvas-wrapper')); // Bind wrapper to element

		/* Merge all elements, indexed by page selector */
		if ($.inArray(elems, elem.data('page')) == -1) {
			elems[elem.data('page')] = [];
		}
		elems[elem.data('page')].push(elem);

		/* Offcanvas element */
		elem.addClass('offcanvas-' + elem.data('options').position)
			.addClass('offcanvas-' + elem.data('options').type);
		if (elem.data('options').type == 'shrink') {
			if ($.inArray(elem.data('options').position, ['top', 'bottom'] != -1)) {
				elem.css({height: elem.data('options').height, width: 0});	
			}else{
				elem.css({width: elem.data('options').width, height: 0});	
			}
		}else{
			elem.css({
					width:	elem.data('options').width,
					height:	elem.data('options').height,
				});		
		}
		
		/* Inject it */
		if (elem.data('options').injectPosition == 'after') {
			elem.insertAfter(elem.data('page'));
		}else{
			elem.insertBefore(elem.data('page'));
		}
		
		/* Hide by click the main page overlay */
		if (elem.data('options').pageOverlay) {
			if (elem.data('page').children('.offcanvas-main-overlay').length == 0) {
				elem.data('page').prepend('<div class="offcanvas-main-overlay" />');
			}
			elem.data('page').children('.offcanvas-main-overlay').on('click', function() {
				methods.hide();
			});				
		}

		/* Hide */
		methods.hide();
		
		return this;
	}

	/**
	 * Handle Options
	 */
	var optionsHandler = function(settings) {

		/* Merge defaults and options */
		options = $.extend(true, {}, defaults, settings);

		/* position */
		if ($.inArray(options.position, ['top', 'right', 'bottom', 'left']) == -1) {
			options.position = 'top';
		}
		options.position = options.position.toLowerCase();

		/* type */
		options.type = options.type.toLowerCase();
		if ($.inArray(options.type, ['push', 'overlay', 'underlay', 'shrink']) == -1) {
			options.type = 'push';
		}

		/* injectPosition */
		if (options.injectPosition.toLowerCase() == 'prepend') {
			options.injectPosition = 'prepend';
		}else{
			options.injectPosition = 'append';
		}

		/* Bind options to element */
		elem.data('options', options);

		return this;
	}

	/**
	 * Methods
	 */
	var methods = {

		/* Show */
		show: function(that = elem) {

			/* First, hide all */
			methods.hideAll();

			switch (that.data('options').type) {
			
				/* Push */
				case 'push':
					switch (that.data('options').position) {
						case 'top':
							that.data('wrapper').css('top', that.data('options').height);
							break;
						case 'right':
							that.data('wrapper').css('left', '-' + that.data('options').width);
							break;
						case 'bottom':
							that.data('wrapper').css('top', '-' + that.data('options').height);
							break;
						case 'left':
							that.data('wrapper').css('left', that.data('options').width);
							break;
					}
					break;
				
				/* Shrink */
				case 'shrink':
					// code here
					break;
			
				/* Underlay */
				case 'underlay':
					switch (that.data('options').position) {
						case 'top':
							that.data('page').css('top', that.data('options').height);
							break;
						case 'right':
							that.data('page').css('left', '-' + that.data('options').width);
							break;
						case 'bottom':
							that.data('page').css('top', '-' + that.data('options').height);
							break;
						case 'left':
							that.data('page').css('left', that.data('options').width);
							break;
					}
					
					break;
			
				/* Default: Overlay */
				case 'overlay':
				default:
					that.css(that.data('options').position, 0);
					break;
			}

			/* Toggle classes */
			$(elem.selector).data('page').addClass('offcanvas-main-inactive');
		
			/* Set state */
			that.data('state', 'shown');

			return this;
		},

		/* Hide */
		hide: function(that = elem) {
			/* Reset all positions */
			if ($.inArray(that.data('options').type, ['push', 'overlay']) != -1) { 
				switch (that.data('options').position) {
					case 'top':
					case 'bottom':
						that.css(that.data('options').position, '-' + that.data('options').height);
						break;
					case 'left':
					case 'right':
						that.css(that.data('options').position, '-' + that.data('options').width);
						break;
				}
			}
			that.data('wrapper').css({
				top: '', left: '',
			});
			that.data('page').css({
				top: '', left: '',
			});
			
			/* Toggle classes */
			that.data('page').removeClass('offcanvas-main-inactive');

			/* Set state */
			that.data('state', 'hidden');
			
			return this;
		},

		/* Hide all, in current page */
		hideAll: function() {
			$.each(elems[elem.data('page')], function(index, that) {
				methods.hide(that);
			});
			
			return this;
		},

		/* Toggle */
		toggle: function(that = elem) {
			if (that.data('state') == 'hidden') {
				methods.show(that);
			}else{
				methods.hide(that);
			}

			return this;
		},
	}
}(jQuery));
