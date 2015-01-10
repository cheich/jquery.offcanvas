/*!
 * offcanvas.js v2.0 - 2015-01-09
 * Copyright 2014 Christoph Heich | http://cheich.github.io/Offcanvas/
 * Released under the MIT license | http://opensource.org/licenses/MIT
 * TODO: Add new type: shrink
 */

$(function($) {
	/**
	 * Default Options
	 */
	var defaults = {
		pageSelector:	'div.page',
		position:		'left', // top|right|bottom|left
		width:			'100%',
		height:			'100%',
		type:			'overlay', // push|overlay|underlay|shrink
		injectPosition:	'before', // before|after
		pageClick:		true, // boolean; Whether to hide on click on the main page
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
		
		if (elem.data('options').injectPosition == 'after') {
			elem.insertAfter(elem.data('page'));
		}else{
			elem.insertBefore(elem.data('page'));
		}
		
		/* Hide by click the main page */
		if (elem.data('options').pageClick) {
			elem.data('page').on('click', function() {
				methods.hide();
			});				
		}

		/* Hide */
		elem.data('state', 'shown');
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
							elem.data('wrapper').css('top', that.data('options').height);
							break;
						case 'right':
							elem.data('wrapper').css('left', '-' + that.data('options').width);
							break;
						case 'bottom':
							elem.data('wrapper').css('top', '-' + that.data('options').height);
							break;
						case 'left':
							elem.data('wrapper').css('left', that.data('options').width);
							break;
					}
					break;
				
				/* Shrink */
				case 'shrink':
					// switch (that.data('options').position) {
						// case 'top':
						// case 'bottom':
							// that.css('height', that.data('options').height);
							// elem.data('page').css('height', that.data('options').height);
							// break;
						// case 'right':
						// case 'left':
							// that.css('width', that.data('options').width);
							// break;
					// }
					break;
			
				/* Underlay */
				case 'underlay':
					switch (that.data('options').position) {
						case 'top':
							elem.data('page').css('top', that.data('options').height);
							break;
						case 'right':
							elem.data('page').css('left', '-' + that.data('options').height);
							break;
						case 'bottom':
							elem.data('page').css('top', '-' + that.data('options').height);
							break;
						case 'left':
							elem.data('page').css('left', that.data('options').height);
							break;
					}
				
					if ($.inArray(that.data('options').position, ['top', 'bottom']) != -1) {
						elem.data('page').css(that.data('options').position, that.data('options').height);
					}else{
						elem.data('page').css(that.data('options').position, that.data('options').width);
					}					
					break;
			
				/* Default: Overlay */
				case 'overlay':
				default:
					that.css(that.data('options').position, 0);
					break;
			}

			/* Toggle classes */
			elem.data('page').addClass('offcanvas-main-inactive');

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
			elem.data('wrapper').css({
				top: '', left: '',
			});
			elem.data('page').css({
				top: '', left: '',
			});
			
			/* Toggle classes */
			elem.data('page').removeClass('offcanvas-main-inactive');

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
			if (elem.data('state') == 'hidden') {
				methods.show(that);
			}else{
				methods.hide(that);
			}

			return this;
		},
	}
}(jQuery));
