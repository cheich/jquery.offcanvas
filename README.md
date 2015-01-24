# [jQuery Offcanvas](http://cheich.github.io/jquery.offcanvas/)

Set any element as an off-canvas element to any element (excepts 'body' ;)).
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

## How to use

After initialization, call the public methods show/hide/toggle by clicking a link or a button

``` javascript
$("#offcanvas-box").offcanvas();

$("button#toggle").click(function() {
	$("#offcanvas-box").offcanvas("toggle");
});
```

## Important Options

To see the full documentation, go to the [project page](http://cheich.github.io/jquery.offcanvas/)

### 'mainCanvas'

The main canvas selector or jQuery object.
Note: Don't set it to 'body'! This plug-in wraps certain elements around the main canvas, so the main canvas could not be the body-tag. You can use a div, that wraps all the content of your page.

	Default: '.main-canvas'
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
	
## License
jQuery Offcanvas is released under the [MIT license](http://opensource.org/licenses/MIT)