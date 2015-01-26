# [jQuery Offcanvas](https://cheich.github.io/jquery.offcanvas/)

Set any element as an off-canvas element to any element.

This plugin is ready to use for mobile sites with a hidden menu. By clicking a button, the menu will be shown.  

## Setup

Include [jquery.offcanvas.js](https://github.com/cheich/jquery.offcanvas/blob/gh-pages/src/js/jquery.offcanvas.js) and [jquery.offcanvas.css](https://github.com/cheich/jquery.offcanvas/blob/gh-pages/src/css/jquery.offcanvas.css) after jQuery

``` html
<script src='jquery.js'></script>
<script src='jquery.offcanvas.js'></script>
<link rel="stylesheet" href="jquery.offcanvas.css" />
```

Initialize an off-canvas element

``` javascript
$("#offcanvas-box").offcanvas();
```

## Dependencies

jQuery Offcanvas requires jQuery 1.7.0 or higher. Certainly, it works with jQuery 2.x as well.

It is not necessary, but the animations are much smoother with the newest version of [jQuery Transit](https://github.com/rstacruz/jquery.transit).

## How to use

After initialization, call the public methods `show`, `hide`, or `toggle` by clicking a link or a button

``` javascript
$("#offcanvas-box").offcanvas();

$("button#toggle").click(function() {
	$("#offcanvas-box").offcanvas("toggle");
});
```

## Options

To see the full documentation, go to the [project page](https://cheich.github.io/jquery.offcanvas/)

All options and there default values:

``` javascript
$("#offcanvas-box").offcanvas({
	position:					'left', // top|right|bottom|left
	width:						'100%', // <length>, <percentage>
	height:						'100%', // <length>, <percentage>
	mode:						'overlay', // push|overlay|underlay|shrink
	injectPosition:				'before', // before|after
	cloneElement:				true,
	animateFallback:			true,
	easing:						'linear',
	duration:					$.fx.speeds._default, // Default jQuery speed

	mainCanvas:					'body', // Selector or jQuery object
	mainCanvasOverlay:			true, // Add an overlay over the main canvas
	mainCanvasOverlayClick:		true, // Hide on click on the main canvas overlay
	mainCanvasOverlayDuration:	$.fx.speeds._default, // Default jQuery speed
});
```

### 'mainCanvas'

Main canvas as selector or jQuery object.

All content of this element will be wrapped into a 'div' and gets the class `.offcanvas-main`.
Then, all off-canvas elements and markups will be inserted into your main canvas element.

	Default: 'body'
	Options: jQuery selector or jQuery object

### 'mode'

The mode of the off-canvas effect.

	Default: 'overlay'
	Options: 'overlay', 'push', 'underlay', 'shrink' (comming soon)
	
### 'position'

The position of the off-canvas element, relative to the main canvas.

	Default: 'left'
	Options: 'left', 'right', 'top', 'bottom'
	
### 'width' and 'height'

Width/Height of the off-canvas element.

	Default: '100%'
	Options: <length>, <percentage>
	
## Release Notes
### v2.2
 * NEW: Multiple elements on one main canvas
 * NEW: Main canvas can be 'body' -> default set to 'body'
 * NEW: Method 'hideAll' hides all off-canvas elements with same main canvas
 * NEW: Ready for navigations out of the box
 * FIX: Duration doesn't work on 'show' event
 
### v2.1
 * NEW: Clone element optional
 * NEW: Animation with jQuery Transit; Fallback to jQuery's animate function
 * NEW: More options
 * FIX: Some bugfixes
	
## License
jQuery Offcanvas is released under the [MIT license](https://github.com/cheich/jquery.offcanvas/blob/gh-pages/LICENSE.md)