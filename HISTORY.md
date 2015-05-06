# History

## v3.0.1
### FIXED
 * iOS smooth scrolling

## v3.0
### ADDED
 * Methods `state`, `destroy` and `refresh`
 * Fully style-able with options `css` and `mainCanvasCss` (or with CSS classes ;))
 * Complete control over animations with `animate` and `mainCanvasAnimate`
 * Default options can now be changed with `$.fn.offcanvas.defaults`
 * Added Callbacks
	* onShowBefore - Triggered before the off-canvas is shown
	* onShowAfter - Triggered after the off-canvas is shown
	* onHideBefore - Triggered before the off-canvas is hidden
	* onHideAfter - Triggered after the off-canvas is hidden
	* onMainCanvasClick - Triggered after clicking on the main canvas
 
### CHANGED
 * Width and height of the off-canvas element are now pooled in an object called `css`
 * Option `animateFallback` now called with `jsFallback`
 * Animation options like duration etc. are now pooled in an object called `animate`
 * Removed `mainCanvasOverlay`, `mainCanvasOverlayClick`, `mainCanvasOverlayDuration`
 * Renamed modes to prevent confusions (`overlay` => `cover`, `underlay` => `base`)
 * New default mainCanvas: Full-page as main canvas requires a wrapper - `body` as main canvas caused troubles
 * Less wrappers to simplify the plug-in - it's now a completely new mark-up

### FIXED
 * URI hash fragment doesn't work
 
## v2.2.0
### ADDED
 * Multiple elements on one main canvas
 * Method `hideAll` hides all off-canvas elements with same main canvas
 
### FIXED
 * Duration doesn't work on `show` event
 
## v2.1.0
### ADDED
 * Clone element option
 * Animation with jQuery Transit; Fallback to jQuery's animate function
 * More options
 
### FIXED
 * Some bugfixes
 
## v2.0.0
First official release