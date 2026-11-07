import { DropdownButtonView } from "@ckeditor/ckeditor5-ui";
import DropdownPanelView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownpanelview";
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";

export function createDropdownSticky( locale, ButtonClass = DropdownButtonView ) {
	const buttonView = new ButtonClass( locale );

	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	buttonView.bind( 'isEnabled' ).to( dropdownView );

	//if ( buttonView instanceof DropdownButtonView ) {
		buttonView.bind( 'isOn' ).to( dropdownView, 'isOpen' );
	//} else {
	//	buttonView.arrowView.bind( 'isOn' ).to( dropdownView, 'isOpen' );
	//}

	//addDefaultBehavior( dropdownView );

	return dropdownView;
}