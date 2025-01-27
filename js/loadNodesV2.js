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
exports.after = ["story_no"];
exports.synchronous = true;


function createView(id, label){
	var newView = new $tm.ViewAbstraction(label,{ isCreate: true});
	newView.setConfig({physics_mode: true });

	var nodeId = $tm.adapter.getId(id);
	var node = $tm.adapter.selectNodeById(nodeId);
	node.x = 0;
	node.y = 0;
	newView.addNode( node );
	newView.addPlaceholder( node );
	newView.saveNodePosition(node);



	var nodosvista = newView.getNodeData();	   
	//Todo : Comentar esta sentencia y representar en el diagrama 
	nodosvista[nodeId]['open-view'] = id;
	newView.saveNodeData(nodosvista);


	newView.setConfig({physics_mode: true});
}

function nodeIdResource(id){
	var nodeId = $tm.adapter.getId(id);
	var config = JSON.parse($tw.wiki.getTiddlerAsJson("Initial Config"));
	
	/*
	* Define id node if no exist.
	*/
	if ( typeof  nodeId === "undefined" ) {
		
		var nodeView;

		if (id.match(/_:node/g) == null ){
			nodeView = { title: id , 
						 know: true,
						 text: $tw.wiki.getTiddler(config.conceptView).fields.text , 
						 term: "",								 
						 state: "$:/state/" + id,
						 default: "$(currentTiddler)"
						};

		}else{
			nodeView = { title: id , 
						 know: false,
						 node: true,
						 term: "",								 
						 state: "$:/state/" + id,
						 default: "$(currentTiddler)"
						};
		}
		/*
		** Create tiddler node
		*/
		
		$tw.wiki.addTiddler(nodeView);
		/*
		** Assign id of TiddlyMaps the id node and return the node.
		*/
		nodeId = $tm.adapter.assignId(id);


		//Create vist and insert the node in the new vist.
		//var label = id.replace(/.*\/(.*)/g,"$1");
		//createView(id, label);

	}
	return nodeId;
}



/*
* 
*/
function addObjectInSubjectView( subject, object){
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
	//let label = subject.replace(/.*\/(.*)/g,"$1");
	let label = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).label;
	if ( typeof label != "undefined" ){
		let viewSubject = new $tm.ViewAbstraction(label,{ isCreate: true});
		viewSubject.addNode( nodeObject );
		viewSubject.addPlaceholder( nodeObject );
		viewSubject.saveNodePosition( nodeObject );

		let nodosvista = viewSubject.getNodeData();	    
		nodosvista[nodeObjectId]['open-view'] = object;
		viewSubject.saveNodeData(nodosvista);
	}
}




/*
* Agrega el nodo a la vista y crea la relación
*/
function addObjectInSubjectViewProperty( subject, property, object){
	//Get the tilddy resource object
	let nodeObjectId = nodeIdResource(object);
	let nodeObject = $tm.adapter.selectNodeById(nodeObjectId);
	let subjectId = nodeIdResource(subject)

	//Set la x y del nodo antes de agregarlo en la vista
	//Resta investigar como impacata en otras vistas 
	nodeObject.x = 0;
	nodeObject.y = 0;

	/*
	* Get the resourse's label and insert node in subject view
	*/
	//let label = subject.replace(/.*\/(.*)/g,"$1");
	let label = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).label;
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
	
	console.log("Subject : " + subject )
	console.log("Property : " + property )
	console.log("Object : " + object )
	console.log("ObjectJSON : " + JSON.stringify(object ))

	switch( property){
		case "@id":
			nodeIdResource(subject);
		break;
		case "rdfs:comment": case "field/Description.term.en-us.synonym": 
			//podria ser definido como un js independiente.
			var textComment = "";
			//object.forEach( function( ocommept ){
			//	textComment += "# " + ocommept["@value"] + " <br>";
			//});
			textComment += "# " + object["@value"] + " <br>";
			$tw.wiki.setText(subject,"comments",0,textComment,"")
			break;
		case "rdfs:label":
			createView(subject,object["@value"]);
			let nodeLabel = object["@value"];
			$tw.wiki.setText(subject,"label",0,nodeLabel,"");
			$tw.wiki.setText(subject,"caption",0,nodeLabel,"");

			
			$tw.wiki.search(subject,{literal: true, invert: false, field: ["subclassof"]}).forEach( function (reference){
				addObjectInSubjectView( subject, reference )
			});
			
			break;
		case "dc:tittle": case "dc:title": case "field/Description.term.en-us.preferred" :
			let nodeDescription = object["@value"];
			$tw.wiki.setText(subject,"description",0,nodeDescription,"");
			break;
		case "rdfs:subClassOf" :
			//object.forEach( function (reference){
				//Get the tilddy resource object

				//var nodeObjectId = nodeIdResource(reference["@id"]);
				
				var subClassOf;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(subject)).subClassOf === "undefined" ) {
					subClassOf = object["@id"];
				}else{
					subClassOf = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).subClassOf + " " +object["@id"]
				}
				$tw.wiki.setText(subject,"subclassof",0,subClassOf,"");
				addObjectInSubjectViewProperty( subject, "http://www.w3.org/2000/01/rdf-schema#subClassOf", object["@id"])			
				addObjectInSubjectView(object["@id"],subject);
				

				console.log("----------------------subject--------------------------")
				console.log(subject)
				console.log("----------------------object[@id]--------------------------")
				console.log(object["@id"])
				console.log("----------------------subClassOf--------------------------")
				console.log(subClassOf)
				console.log("----------------------object[@id]--------------------------")
				console.log(object["@id"])

			//});			
		break;
		case "rdfs:domain" :
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
				nodeIdResource(oparameter["@id"]);
				let tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(oparameter["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(oparameter["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(oparameter["@id"],"tags",0,tags,"");
				//Podria ya estar definida.
				$tw.wiki.setText(oparameter["@id"],"text",0,$tw.wiki.getTiddler("$:/linekedhealth/parameter_view").fields.text,"");

			});
			
		break;
		case "rdfs:range" :
			console.log(object)
			console.log(object)
			object.forEach( function (typeNode){
				//var nodeObjectId = nodeIdResource(typeNode["@id"]);
				
				var tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(typeNode["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(typeNode["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(typeNode["@id"],"tags",0,tags,"");				
				/*JSON.parse($tw.wiki.getTiddlerAsJson(subject)).tags.forEach( function (concept){
					addObjectInSubjectView( concept, subject, typeNode["@id"]);
				});*/
			});	
		
		break;
		case "owl:allValuesFrom" :
				//Get the tilddy resource object
				//let nodeObjectId = nodeIdResource(object[0]["@id"]);
				let tags;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(object[0]["@id"])).tags === "undefined" ) {
					tags = subject;
				}else{
					tags = JSON.parse($tw.wiki.getTiddlerAsJson(object[0]["@id"])).tags + " " +subject
				}
				$tw.wiki.setText(object["@id"],"tags",0,tags,"");				
				let subjectTo = subject.replace(/(.*)\..*/g,"$1");
				addObjectInSubjectViewProperty( subjectTo, subject, object[0]["@id"]);	
		break;
		
		case "owl:someValuesFrom" :

			if (subject.match("_:node.*").length > 0 ){
				object.forEach( function (reference){
					//Get the tilddy resource object
					//var nodeObjectId = nodeIdResource(reference["@id"]);
					
					var tags;
					if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(subject)).tags === "undefined" ) {
						tags = reference["@id"];
					}else{
						tags = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).tags + " " +reference["@id"]
					}
					$tw.wiki.setText(subject,"tags",0,tags,"");				
					//var subjectTo = subject.replace(/(.*)\..*/g,"$1");
					//addObjectInSubjectViewProperty( subjectTo, subject, reference["@id"]);	
					
				});

			}else{

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
					addObjectInSubjectViewProperty( subjectTo, subject, reference["@id"]);	
					
				});
			}	
		break;

		case "owl:onProperty" :
			object.forEach( function (reference){
				//Get the tilddy resource object
				//var nodeObjectId = nodeIdResource(reference["@id"]);
				
				var properties;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(subject)).properties === "undefined" ) {
					properties = reference["@id"];
				}else{
					if (!JSON.parse($tw.wiki.getTiddlerAsJson(subject)).properties.split(" ").includes(reference["@id"])){
						properties = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).properties + " " +reference["@id"];
					}else{
						properties = JSON.parse($tw.wiki.getTiddlerAsJson(subject)).properties;
					}
				}
				$tw.wiki.setText(subject,"properties",0,properties,"");				
				//var subjectTo = subject.replace(/(.*)\..*/g,"$1");
				//addObjectInSubjectViewProperty( subjectTo, subject, reference["@id"]);	
				
			});
			
		break;
		case "rdf:List" :
			$tw.wiki.setText(subject,"text",0,$tw.wiki.getTiddler("$:/linekedhealth/node_view").fields.text,"");
			object.forEach( function (conteiner){
				//Get the tilddy resource object
				//var nodeObjectId = nodeIdResource(reference["@id"]);
				
				var listElements;
				if ( typeof JSON.parse($tw.wiki.getTiddlerAsJson(conteiner["@id"])).listElements === "undefined" ) {
					listElements = subject;
				}else{
					if (!JSON.parse($tw.wiki.getTiddlerAsJson(conteiner["@id"])).listElements.split(" ").includes(subject)){
						listElements = JSON.parse($tw.wiki.getTiddlerAsJson(conteiner["@id"])).listElements + " " + subject;
					}else{
						listElements = JSON.parse($tw.wiki.getTiddlerAsJson(conteiner["@id"])).listElements;
					}
				}

				//console.log(conteiner["@id"] + "                " + listElements + "++++++++++++++++++++++++")
				$tw.wiki.setText(conteiner["@id"],"listElements",0,listElements,"");			
				//var subjectTo = subject.replace(/(.*)\..*/g,"$1");
				//addObjectInSubjectViewProperty( subjectTo, subject, reference["@id"]);	
				
			});
			
		break;
		default:
			console.log("--------------------Default-----------------");
			console.log("id : " + subject + ", property : " + property + ", object : " + object);
	}



}

exports.startup = function(callback) {

	console.log("aca-------------------")

	$tw.wiki.addEventListener("change",function(changes) {
		var vistas = $tw.wiki.filterTiddlers("[newKn[true]]");
		//console.log("aca2-------------------")
		vistas.forEach( function (nodeName) {
			console.log("aca2-------------------" + nodeName + "-----------")
			var nodeJson = JSON.parse($tw.wiki.getTiddlerAsJson(nodeName));
			var myView = new $tm.ViewAbstraction(nodeJson.title,{ isCreate: true});


			console.log("nodeJson.title-------------------" + nodeJson.title + "-----------")
			console.log("****************************nodeJson***********************")
			if (nodeJson.concepts != "{}"){
				console.log(JSON.parse(nodeJson.concepts));
				JSON.parse(nodeJson.concepts)['@graph'].forEach( function(ct){
					console.log("aca3-------------------");
					console.log(ct);
					//Todo : Se podria sacar del forEach ?
					var subject = ct["@id"];
					Object.keys(ct).forEach( function(param , index) {
						sentenceProcess( subject, param , ct[param]);
					}); 

				});
			}
			// To do
			$tw.wiki.deleteTiddler(nodeName);
			$tw.syncer.syncToServer();

			//No lo esta borrando del servidor ?
		}); 


		//Si cambio la historio y tiene conocimiento pendientede se dispara el analsisi anterior.
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
