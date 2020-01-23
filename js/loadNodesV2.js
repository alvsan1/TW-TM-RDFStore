/*\
title: $:/plugins/alvsan/semantic/js/loadNodesV2
type: application/javascript
module-type: startup
Semantic processing
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Export name and synchronous status
exports.name = "loadNodes";
exports.platforms = ["browser"];
exports.after = ["story"];
exports.synchronous = true;

exports.startup = function(callback) {


	var vistas = $tw.wiki.filterTiddlers("[newView[true]]");
	vistas.forEach( function (nodeName) {

		var nodeNew = $tw.wiki.getTiddlerAsJson(nodeName);
		var nodeJson = JSON.parse(nodeNew);

		JSON.parse(nodeJson.concepts).forEach( function(ct){

			console.log(ct);
			console.log(ct["@id"]);

			Object.keys(ct).forEach( function(param , index) {
				console.log(param);
			    console.log(ct[param]);
			    console.log(index);
			}); 

		});



			//var nodeId = $tm.adapter.getId(ct.concept.value);
//			if ( typeof  nodeId === "undefined" ) {
//				var nodeView = { label: ct.description.value, 
//								 title: ct.concept.value , 
//								 know: true,
//								 text: $tw.wiki.getTiddler("$:/linekedhealth/concept_view").fields.text , 
//								 term: "",								 
//								 state: "$:/state/" + ct.concept.value,
//								 default: "$(currentTiddler)"
//								};
//				$tw.wiki.addTiddler(nodeView);
//				nodeId = $tm.adapter.assignId(ct.concept.value);
//			}
		
		





	});
};

})();
