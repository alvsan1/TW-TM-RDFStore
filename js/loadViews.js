/*\
title: $:/plugins/alvsan/semantic/js/loadViews
type: application/javascript
module-type: startup
Semantic processing
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "loadviews";
exports.platforms = ["browser"];
exports.after = ["loadNodes"];
exports.synchronous = true;

exports.startup = function(callback) {
	

	$tw.wiki.addEventListener("change",function(changes) {

		var vistas = $tw.wiki.filterTiddlers("[newView[true]]");
		vistas.forEach( function (nodeName) {

			setTimeout(function() {
				$tw.syncer.syncFromServer();
				console.log("--------------------- Sync loadviews-----------------------")
			},5000);
			setTimeout(function() {
				$tw.syncer.syncFromServer();
				console.log("--------------------- Sync 2 loadviews -----------------------")
			},200);
		});
	});
};

})();

		
    


