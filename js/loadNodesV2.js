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


function nodeIdResource(id){
	console.log("**************");
	console.log(id);
	var nodeId = $tm.adapter.getId(id);
	
	/*
	* Define id node if no exist.
	*/
	if ( typeof  nodeId === "undefined" ) {
		var nodeView = { title: id , 
						 know: true,
						 text: $tw.wiki.getTiddler("$:/linekedhealth/concept_view").fields.text , 
						 term: "",								 
						 state: "$:/state/" + id,
						 default: "$(currentTiddler)"
						};
		/*
		** Create tiddler node
		*/
		
		$tw.wiki.addTiddler(nodeView);
		/*
		** Assign id of TiddlyMaps the id node and return the node.
		*/
		nodeId = $tm.adapter.assignId(id);


		//Create vist and insert the node in the new vist.
		var label = id.replace(/.*\/(.*)/g,"$1");
		var newView = new $tm.ViewAbstraction(label,{ isCreate: true});
		newView.setConfig({physics_mode: true, know: true, url: id });

		var node = $tm.adapter.selectNodeById(nodeId);
		node.x = 0;
		node.y = 0;
		newView.addNode( node );
		newView.addPlaceholder( node );
		newView.saveNodePosition(node);



		var nodosvista = myView.getNodeData();	    
		nodosvista[nodeId]['open-view'] = id;
		myView.saveNodeData(nodosvista);




	}
	return nodeId;
}

/*
* Applay the sentence in tilddyWiki and tiddlyMaps, construed by (id, property, object).
* @param {string} id - The id de subject in sentence.
* @param {string} property - The property de subject in sentence.
* @param {string} object - The object de subject in sentence.
*/
function sentenceProcess(id , property , object){

	var nodeId = nodeIdResource(id);
	
	switch( property){
		case "http://www.w3.org/2000/01/rdf-schema#comment": 
			//podria ser definido como un js independiente.
			var textComment = "";
			object.forEach( function( ocommept ){
				textComment += "# " + ocommept["@value"] + " <br>";
			});
			$tw.wiki.setText(id,"comments",0,textComment,"")
			break;
		case "http://www.w3.org/2000/01/rdf-schema#label":
			let nodeLabel = object[0]["@value"];
			$tw.wiki.setText(id,"label",0,nodeLabel,"");

			break;
		case "http://www.w3.org/2000/01/rdf-schema#subClassOf" :

			var nodeObjectId = nodeIdResource(object[0]["@id"]);
			var nodeObject = $tm.adapter.selectNodeById(nodeObjectId);
			nodeObject.x = 0;
			nodeObject.y = 0;

			var label = id.replace(/.*\/(.*)/g,"$1");
			var viewSubject = new $tm.ViewAbstraction(label,{ isCreate: true});
			viewSubject.addNode( nodeObject );
			viewSubject.addPlaceholder( nodeObject );
			viewSubject.saveNodePosition(nodeObject);

			var nodosvista = viewSubject.getNodeData();	    
			nodosvista[nodeObjectId]['open-view'] = object;
			viewSubject.saveNodeData(nodosvista);




			var toWL = [];
			toWL[object[0]["@id"]] = true;
			var typeWL = [];
			typeWL["rdfs:subClassOf"] = true;
			var listE = $tm.adapter.getEdges( id ,toWL, typeWL);


			if ( Object.keys(listE).length == 0 ) {
				//var edgeLabel = ct.property.value.replace(/.*#(.*)/g,"$1");
				//var edge = { from: nodeOId, to: nodeId, label: edgeLabel, type: ct.property.value};
				var edge = { from: nodeObjectId, to: nodeId, label: "subClassOf", type: "rdfs:subClassOf"};
				$tw.wiki.addTiddler(edge);
				$tm.adapter.insertEdge(edge);
			}

			break;
		default:
			console.log("--------------------Default-----------------");
			console.log("id : " + id + ", property : " + property + ", object : " + object);
	}



}

exports.startup = function(callback) {


	var vistas = $tw.wiki.filterTiddlers("[newView[true]]");
	vistas.forEach( function (nodeName) {

		var nodeNew = $tw.wiki.getTiddlerAsJson(nodeName);
		var nodeJson = JSON.parse(nodeNew);
		var myView = new $tm.ViewAbstraction(nodeJson.title,{ isCreate: true});
		

		JSON.parse(nodeJson.concepts).forEach( function(ct){

			console.log(ct);
			console.log(ct["@id"]);

			Object.keys(ct).forEach( function(param , index) {
				console.log(param);
			    console.log(ct[param]);
			    console.log(index);

			    sentenceProcess( ct["@id"], param , ct[param]);



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
