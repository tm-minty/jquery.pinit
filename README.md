# jQuery.pinit #

A jQuery plugin that pins DOM elements to the viewport top and according their order places them under each other.

Original: **8505** bytes.

Minified: **2670** bytes.

Gzipped:  **632** bytes.

## Requirements

-  jQuery >= 1.10.2 (plugin developed and tested on that version)

## Usage

```javascript
	$('.js-pinit').pinit({
		pinnedClass: 'my-pinned-class',
		setOriginalDimensions: true
	});
```

## Options
**pinnedClass** *string*

CSS class name which adds to element on pin.

*Default: pinned*

----------

**setOriginalDimensions** *boolean*

Option to pass pinned element it's original dimensions. When plugin pins element, it sets `position` property to `fixed` and element's dimesions can be changed.

*Default: false*