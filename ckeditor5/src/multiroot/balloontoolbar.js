import { Plugin } from "@ckeditor/ckeditor5-core";
import  FocusTracker from "@ckeditor/ckeditor5-utils/src/focustracker";
import { BalloonToolbar, BalloonPanelView, normalizeToolbarConfig } from "@ckeditor/ckeditor5-ui";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { debounce } from 'lodash-es';
import  { generatePositions } from "@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview.js";
import { env, global } from '@ckeditor/ckeditor5-utils';
class MultirootBalloonToolbar extends Plugin {
    static pluginName = 'MultrootBalloonToolbar'
    constructor( editor ) {
		super(editor);

		/**
		 * A cached and normalized `config.balloonToolbar` object.
		 *
		 * @type {module:core/editor/editorconfig~EditorConfig#balloonToolbar}
		 * @private
		 */
		this._balloonConfig = normalizeToolbarConfig( editor.config.get( 'balloonToolbar' ) );

		/**
		 * The toolbar view displayed in the balloon.
		 *
		 * @type {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = this._createToolbarView();

		/**
		 * Tracks the focus of the {@link module:core/editor/editorui~EditorUI#getEditableElement editable element}
		 * and the {@link #toolbarView}. When both are blurred then the toolbar should hide.
		 *
		 * @readonly
		 * @type {module:utils:focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		// Wait for the EditorUI#init. EditableElement is not available before.
		editor.ui.once( 'ready', () => {
            editor.ui.view.editables.forEach((e) => this.focusTracker.add( e.element ))
			//this.focusTracker.add( editor.ui.getEditableElement() );
			this.focusTracker.add( this.toolbarView.element );
		} );

		/**
		 * An instance of the resize observer that allows to respond to changes in editable's geometry
		 * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
		 *
		 * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
		 * {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar configuration}.
		 *
		 * **Note:** Created in {@link #init}.
		 *
		 * @protected
		 * @member {module:utils/dom/resizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @type {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * Fires {@link #event:_selectionChangeDebounced} event using `lodash#debounce`.
		 *
		 * This function is stored as a plugin property to make possible to cancel
		 * trailing debounced invocation on destroy.
		 *
		 * @private
		 * @type {Function}
		 */
		this._fireSelectionChangeDebounced = debounce( () => this.fire( '_selectionChangeDebounced' ), 200 );

		// The appearance of the BalloonToolbar method is event–driven.
		// It is possible to stop the #show event and this prevent the toolbar from showing up.
		this.decorate( 'show' );

		// fixme: Why do we have to handle conflict of balloon & image toolbars? 
		// doesnt see to be the case in official builds.
		// this hides inline range toolbar which only shows link button
		this.on('show', (e) => {
			
			const editor = this.editor;
			const selection = editor.model.document.selection;
			const schema = editor.model.schema;
			const element = selection.getSelectedElement();
			if (this._balloon._viewToStack.keys().next().value) {
				e.stop();
			}
			if (element && element.name == 'imageBlock') {
				e.stop();
			}
		}, {priority: 'highest'})
	}
	
	_getBalloonPositions( isBackward ) {
		const isSafariIniOS = env.isSafari && env.isiOS;

		// https://github.com/ckeditor/ckeditor5/issues/7707
		const positions = isSafariIniOS ? generatePositions( {
			// 20px when zoomed out. Less then 20px when zoomed in; the "radius" of the native selection handle gets
			// smaller as the user zooms in. No less than the default v-offset, though.
			verticalOffset: Math.max(
				BalloonPanelView.arrowVerticalOffset,
				Math.round( 20 / global.window.visualViewport.scale )
			)
		} ) : BalloonPanelView.defaultPositions;

		return isBackward ? [
			/*positions.northWestArrowSouth,
			positions.northWestArrowSouthWest,
			positions.northWestArrowSouthEast,
			positions.northWestArrowSouthMiddleEast,
			positions.northWestArrowSouthMiddleWest,*/
			positions.southWestArrowNorth,
			positions.southWestArrowNorthWest,
			positions.southWestArrowNorthEast,
			positions.southWestArrowNorthMiddleWest,
			positions.southWestArrowNorthMiddleEast
		] : [
			positions.southEastArrowNorth,
			positions.southEastArrowNorthEast,
			positions.southEastArrowNorthWest,
			positions.southEastArrowNorthMiddleEast,
			positions.southEastArrowNorthMiddleWest,
			/*
			positions.northEastArrowSouth,
			positions.northEastArrowSouthEast,
			positions.northEastArrowSouthWest,
			positions.northEastArrowSouthMiddleEast,
			positions.northEastArrowSouthMiddleWest */
		];
	}
}


MultirootBalloonToolbar.prototype.init = BalloonToolbar.prototype.init;
MultirootBalloonToolbar.prototype.afterInit = BalloonToolbar.prototype.afterInit;
MultirootBalloonToolbar.prototype.show = BalloonToolbar.prototype.show;
MultirootBalloonToolbar.prototype.hide = BalloonToolbar.prototype.hide;
MultirootBalloonToolbar.prototype._createToolbarView = BalloonToolbar.prototype._createToolbarView;
MultirootBalloonToolbar.prototype._updatePosition = BalloonToolbar.prototype._updatePosition;
MultirootBalloonToolbar.prototype.destroy = BalloonToolbar.prototype.destroy;
MultirootBalloonToolbar.prototype._getBalloonPositionData = BalloonToolbar.prototype._getBalloonPositionData;

export default MultirootBalloonToolbar;