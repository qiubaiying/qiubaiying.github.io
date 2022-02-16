// Some services provide a share form that can conveniently be displayed in a popup.
// This event handler opens such a popup when attached to the click event of a share link:
function sharePopup (event, config) {
	"use strict";
 
	// only open popup when clicked with left mouse button
	// (middle click should still open the link in a new tab and
	// right click should still open the context menu)
	/*if ('buttons' in event) {
		if (!(event.buttons & 1)) {
			return true;
		}
	}
	else if (event.button !== 0) {
		return true;
	}*/
 
	// gather popup parameters
	var href = config.href;
	var params = {
		menubar:   "no",
		location:  "no",
		toolbar:   "no",
		status:    "no",
		resizable: "yes",
		width:     "640",
		height:    "480"
	};
 
	for (var name in params) {
		var value = config.name;
		if (value) {
			params[name] = value;
		}
	}
 
	// center popup window
	var width  = parseInt(params.width,10);
	var height = parseInt(params.height,10);
 
	params.top  = Math.max(0, Math.round((screen.height - height) * 0.5));
	params.left = Math.max(0, Math.round((screen.width  - width) * 0.5));
 
	var spec = [];
	for (var name in params) {
		spec.push(name+"="+params[name]);
	}
 
	// open window
	window.open(href,'_blank',spec.join(","));
 
	// prevent navigation to the share form
	if ('preventDefault' in event) {
		event.preventDefault();
	}
	else {
		event.returnValue = false;
	}
	
	return false;
}