
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

// patch focus tracker to not auto-blur elements that were removed from DOM,
// like in case of react hiding accordion pages

FocusTracker.prototype['add'] = function ( element ) {
	if ( this._elements.has( element ) ) {
		/**
		 * This element is already tracked by {@link module:utils/focustracker~FocusTracker}.
		 *
		 * @error focustracker-add-element-already-exist
		 */
		throw new Error( 'focustracker-add-element-already-exist', this );
	}
	this.listenTo( element, 'focus', (a, b) => { this._focus( element )}, { useCapture: true } );
	this.listenTo( element, 'blur', (a, b) => { this._blur(b.target) }, { useCapture: true } );
	this._elements.add( element );
}

FocusTracker.prototype['_focus']  = function (element) {
    console.log('FOCUS', element)
    clearTimeout( this._nextEventLoopTimeout );

    this.focusedElement = element;
    this.isFocused = true;
}
FocusTracker.prototype['_blur']  = function (element) {
	clearTimeout( this._nextEventLoopTimeout );

    //console.log('BLUR', element)

	this._nextEventLoopTimeout = setTimeout( () => {
		if (!document.contains(element) || element.getBoundingClientRect().width == 0) {
			return ;
		}
        //console.log('OIII BLUR', element)
		this.focusedElement = null;
		this.isFocused = false;
	}, 0 );
}