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
	var nodeId = $tm.adapter.getId(id);
	
	/*
	* Define id node if no exist.
	*/
	if ( typeof  nodeId === "undefined" ) {
		var nodeView = { title: id , 
						 know: true,
						 text: $tw.wiki.getTiddler("$:/linekedhealth/concept_viewV2").fields.text , 
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
		newView.setConfig({physics_mode: true });

		var node = $tm.adapter.selectNodeById(nodeId);
		node.x = 0;
		node.y = 0;
		newView.addNode( node );
		newView.addPlaceholder( node );
		newView.saveNodePosition(node);



		var nodosvista = newView.getNodeData();	    
		nodosvista[nodeId]['open-view'] = id;
		newView.saveNodeData(nodosvista);


		newView.setConfig({physics_mode: true});

	}
	return nodeId;
}



/*
* 
*/
function addObjectInSubjectView( subject, property, object){
	//Get the tilddy resource object
	let nodeObjectId = nodeIdResource(object);
	let nodeObject = $tm.adapter.selectNodeById(nodeObjectId);
	let subjectId = nodeIdResource(subject)

	//Set la x y del nodo antes de agregarlo en la vista
	//Resta investigar como impacata en otras vistas cuadno 
	nodeObject.x = 0;
	nodeObject.y = 0;

	/*
	* Get the resourse's label and insert node in subject view
	*/
	let label = subject.replace(/.*\/(.*)/g,"$1");
	let viewSubject = new $tm.ViewAbstraction(label,{ isCreate: true});
	viewSubject.addNode( nodeObject );
	viewSubject.addPlaceholder( nodeObject );
	viewSubject.saveNodePosition( nodeObject );

	let nodosvista = viewSubject.getNodeData();	    
	nodosvista[nodeObjectId]['open-view'] = object;
	viewSubject.saveNodeData(nodosvista);


	let toWL = [];
	toWL[object] = true;
	let typeWL = [];
	//typeWL[propertyLabel] = true;
	typeWL[property] = true;
	//console.log(" Object.keys($tm.adapter.getEdges( subject ,toWL, typeWL)).length : " + Object.keys($tm.adapter.getEdges( subject ,toWL, typeWL)).length);
	if ( Object.keys($tm.adapter.getEdges( subject ,toWL, typeWL)).length == 0 ) {
		//var propertyLabel = property.replace(/.*\.(.*)/g,"$1");
		//console.log("++++++++++++++++++++++++ propertyLabel ++++++++++++++++++");
		//console.log(nodeObjectId + " +++++ " + propertyLabel + " +++++ " + subject );
		//let edgeId = $tm.adapter.getId(property);
		var edge = { from: subjectId, to: nodeObjectId, type: property};
		$tw.wiki.addTiddler(edge);		
		$tm.adapter.insertEdge(edge);
		$tw.wiki.setText("$:/plugins/felixhayashi/tiddlymap/graph/edgeTypes/"+property,"label",0,property.replace(/.*[\.|\#)](.*)$/g,"$1"),"");
	}

}


/*
* Applay the sentence in tilddyWiki and tiddlyMaps, construed by (id, property, object).
* @param {string} id - The id de subject in sentence.
* @param {string} property - The property de subject in sentence.
* @param {string} object - The object de subject in sentence.
*/
function sentenceProcess(subject , property , object){

	//var nodeId = nodeIdResource(subject);
	
	switch( property){
		case "@id":
			nodeIdResource(subject);
		break;
		case "http://www.w3.org/2000/01/rdf-schema#comment": 
			//podria ser definido como un js independiente.
			var textComment = "";
			object.forEach( function( ocommept ){
				textComment += "# " + ocommept["@value"] + " <br>";
			});
			$tw.wiki.setText(subject,"comments",0,textComment,"")
			break;
		case "http://www.w3.org/2000/01/rdf-schema#label":
			let nodeLabel = object[0]["@value"];
			$tw.wiki.setText(subject,"label",0,nodeLabel,"");
			$tw.wiki.setText(subject,"caption",0,nodeLabel,"");
			break;
		case "http://purl.org/dc/elements/1.1/tittle": case "http://purl.org/dc/elements/1.1/title" :
			let nodeDescription = object[0]["@value"];
			$tw.wiki.setText(subject,"description",0,nodeDescription,"");
			break;
		case "http://www.w3.org/2000/01/rdf-schema#subClassOf" :

			addObjectInSubjectView( subject, "http://www.w3.org/2000/01/rdf-schema#subClassOf", object[0]["@id"])			

			break;
		case "http://www.w3.org/2000/01/rdf-schema#domain" :
			object.forEach( function (oparameter){
				/*var nodeNew = { title: oparameter["@id"] ,
									 know: false,
									 text: $tw.wiki.getTiddler("$:/linekedhealth/parameter_view").fields.text , 
									 term: "",				
									 tags: [subject],				 
									 state: "$:/state/" + oparameter["@id"] ,
									 default: "$(currentTiddler)"
									};
					
				$tw.wiki.addTiddler(nodeNew);
				$tm.adapter.assignId(oparameter["@id"]);*/
				let tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(oparameter["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(oparameter["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(oparameter["@id"],"tags",0,tags,"");
				$tw.wiki.setText(oparameter["@id"],"text",0,$tw.wiki.getTiddler("$:/linekedhealth/parameter_view").fields.text,"");

			});
			
		break;
		case "http://www.w3.org/2002/07/owl#allValuesFrom" :
				//Get the tilddy resource object
				//let nodeObjectId = nodeIdResource(object[0]["@id"]);
				let tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(object[0]["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(object[0]["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(object[0]["@id"],"tags",0,tags,"");				
				let subjectTo = subject.replace(/(.*)\..*/g,"$1");
				addObjectInSubjectView( subjectTo, subject, object[0]["@id"]);	
		break;
		case "http://www.w3.org/2002/07/owl#someValuesFrom" :
			object.forEach( function (reference){
				//Get the tilddy resource object
				//var nodeObjectId = nodeIdResource(reference["@id"]);
				
				var tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(reference["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(reference["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(reference["@id"],"tags",0,tags,"");				
				var subjectTo = subject.replace(/(.*)\..*/g,"$1");
				addObjectInSubjectView( subjectTo, subject, reference["@id"]);	
				
			});
			
		break;
		case "http://www.w3.org/2000/01/rdf-schema#range" :
			object.forEach( function (typeNode){
				//var nodeObjectId = nodeIdResource(typeNode["@id"]);
				
				var tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(typeNode["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(typeNode["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(typeNode["@id"],"tags",0,tags,"");				
				//var subjectTo = subject.replace(/(.*)\..*/g,"$1");
				//addObjectInSubjectView( subjectTo, subject, typeNode["@id"]);
		});	
		
		break;

		default:
			//console.log("--------------------Default-----------------");
			//console.log("id : " + subject + ", property : " + property + ", object : " + object);
	}



}

exports.startup = function(callback) {

	$tw.wiki.addEventListener("change",function(changes) {
		var vistas = $tw.wiki.filterTiddlers("[newKn[true]]");
		vistas.forEach( function (nodeName) {

			var nodeJson = JSON.parse($tw.wiki.getTiddlerAsJson(nodeName));
			var myView = new $tm.ViewAbstraction(nodeJson.title,{ isCreate: true});
			

			JSON.parse(nodeJson.concepts).forEach( function(ct){

				
				Object.keys(ct).forEach( function(param , index) {
					var subject = ct["@id"];
					sentenceProcess( subject, param , ct[param]);
				}); 

			});
			$tw.wiki.deleteTiddler(nodeName);

			//No lo esta borrando del servidor ?
		}); 


		if ( JSON.parse(JSON.stringify(changes))["$:/StoryList"] ){
                    let changeStory = $tw.utils.parseStringArray(JSON.parse($tw.wiki.getTiddlerAsJson("$:/StoryList")).list)[0];
                    let patt = /Draft of/;
                    if ( ! patt.test(changeStory) ){
                        $tw.wiki.getTiddlerAsJson(changeStory).know;
                        if (JSON.parse($tw.wiki.getTiddlerAsJson(changeStory))['know'] == "true" ) {
                        	setTimeout(function() {
								$tw.syncer.syncFromServer();
								console.log("++++++++++++++++++++ Sync ++++++++++++++++++");
							},5000);
							setTimeout(function() {
								$tw.syncer.syncFromServer();
								console.log("++++++++++++++++++++ Sync2 ++++++++++++++++++");
							},20);
                        }
                    }
        }

/*
		*/
				
	});
};

})();
