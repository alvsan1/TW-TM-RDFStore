/*\
title: $:/plugins/alvsan/semantic/knowledge.js
type: application/javascript
module-type: startup

\*/


( function(){ 

"use strict";

exports.name = "knowledge";
exports.platforms = ["node"];
exports.after = ["lhmacro_no"];
exports.synchronous = true;

exports.startup = function(callback) {
	
	var Client = require("node-rest-client").Client;
	var client = new Client();

	var args = {
	    headers: { "Accept": "application/sparql-results+json, */*;q=0.5" } // request headers 
	};

    var config = JSON.parse($tw.wiki.getTiddlerAsJson("Initial Config"));


    //client.get("http://10.0.3.15:8080/rdf4j-server/repositories/snomed02?query=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+sctf%3A+%3Chttp%3A%2F%2Fsnomed.info%2Ffield%2F%3E%0APREFIX+scti%3A+%3Chttp%3A%2F%2Fsnomed.info%2Fid%2F%3E%0ASelect+%3Fconcept+%3Fdescription%0Awhere+%7B+%3Fconcept+sctf%3ADescription.term.en-us.preferred+%3Fdescription+.%0A++++++++%3Fconcept+rdfs%3AsubClassOf+scti%3A138875005+++%7D",args, function (data, response) {
	//client.get(config.rdfstorage + "?query=" + encodeURIComponent($tw.wiki.getTiddler("$:/linekedhealth/snomedct_l1_v1").fields.text),args, function (data, response) {	
   
    client.get(config.rdfstorage+"?query=" + encodeURIComponent($tw.wiki.getTiddler(config.sparqll1).fields.text),args, function (data, response) {	

    	    var nodeView = {title: config.nameConcept, concepts: JSON.stringify(JSON.parse(data).results.bindings), newView: true };
    		$tw.wiki.addTiddler(nodeView);
    	    
    	    //Pensar en un arranque mas General desde un tiddly
    	    var nodeSnCT = {title: config.initialConcept ,label: config.nameConcept};    
    		$tw.wiki.addTiddler(nodeSnCT);//acca    



    		$tw.wiki.addEventListener("change",function(changes) {
                //console.log("---------------------------------------------/n");
                //console.log(changes);     
                //console.log(JSON.stringify(changes));
                Object.keys(changes).forEach(item => {
                    if ( JSON.parse($tw.wiki.getTiddlerAsJson(item)).initResearch == "true"){
                        console.log("initResearch");

                    }       
                 });
    			
    			

               //console.log("---------------------------------------------/n");
    		    
    			if ( JSON.parse(JSON.stringify(changes))["$:/plugins/felixhayashi/tiddlymap/misc/defaultViewHolder"] ){
    				console.log("-----------------Actualizando----------------------/n");
    				var viewName = $tw.wiki.getTiddler("$:/plugins/felixhayashi/tiddlymap/misc/defaultViewHolder").fields.text;
    				//console.log(vistName);
    				//console.log("---------------------------------------------/n");
    				var vista = $tw.wiki.getTiddlerAsJson("$:/plugins/felixhayashi/tiddlymap/graph/views/" + vistName);
    				//console.log(JSON.parse(vista)['config.know'] == "true"  );
    				//console.log(JSON.parse(vista)['config.url']);
    				
    				//console.log("-----------------Actualizando----------------------/n");
    				if (JSON.parse(vista)['config.know'] == "true" ) {
    					$tw.wiki.setText("$:/plugins/felixhayashi/tiddlymap/graph/views/" + viewName,"config.know",0,false,"");
    					var queryKw = $tw.wiki.getTiddler(config.sparqll2).fields.text.replace(/##ConceptTW##/g,"<"+JSON.parse(vista)['config.url']+">");
    					console.log(queryKw);
    					
                        client.get(config.rdfstorage+ "?query=" + encodeURIComponent(queryKw),args, function (dataV, responseV) {	
    						//console.log("-----------------2Do nivel----------------------/n");
//    						
    						//console.log("-----------------JSON.parse(responseV)----------------------/n");
    						//console.log(responseV);//acca    
//
    						//console.log("-----------------JSON.parse(dataV)----------------------/n");
    						//console.log(JSON.parse(dataV));//acca    
//    
//    
//
    						//console.log("-----------------JSON.parse(dataV).results.bindings----------------------/n");
    						//console.log(JSON.parse(dataV).results.bindings);//acca    
//
    						//console.log("-----------------JSON.parse(dataV).results.bindings----------------------/n");					
    						//console.log(JSON.stringify(JSON.parse(dataV).results.bindings));//acca    
//
    						//console.log("-----------------2Do nivel----------------------/n");
    						var nodeKw = { title: "Kn__" + JSON.parse(vista)['config.url'] , concepts: JSON.stringify(JSON.parse(dataV).results.bindings), newkn: true };
    						$tw.wiki.addTiddler(nodeKw);
    	     

    	    				//SI NO SE REQUIERE ACUTALIZACION MEJORA EL USO DE LA HERRAMIENTA
    						console.log("-----------------Fin 2do nivel----------------------/n");
    					});
    				}   

    				console.log("-----------------Fin Actualizando----------------------/n");
    				
    				//JSON.parse(vista)['config.url']//acca    

    				//var query = $tw.wiki.getTiddler("$:/linekedhealth/snomedct_l1_v2").fields.text;
    				/*
    				client.get("http://192.168.56.1:8080/rdf4j-workbench/repositories/snomed02/explore?resource=%3Chttp%3A%2F%2Fsnomed.info%2Fid%2F123038009%3E",args, function (data, response) {	
    					console.log(data);//acca    

    				});   

    				
    				console.log("----------------------------------------------/n");
    			
    				if ( JSON.parse($tw.wiki.getTiddlerAsJson(val)).know == "true" ){
    					console.log("-----------------Knowledge----------------------/n");
    					console.log(JSON.parse($tw.wiki.getTiddlerAsJson(val)).know);
    				}
    			*/   

    			}
    			
    

    	/*		console.log("-----------------Actualizando----------------------/n");
    			for (var val in JSON.parse(JSON.stringify(changes))){
    				
    				if ( JSON.parse($tw.wiki.getTiddlerAsJson(val)).know == "true" ){
    					console.log("-----------------Knowledge----------------------/n");
    					console.log(JSON.parse($tw.wiki.getTiddlerAsJson(val)).know);
    				}//acca    
    

    			}
    			console.log("---------------------------------------------/n");
    	*/   
    

    		});  

    ///////////////////////////////////////////////////////////////////////////////
    /*
    	    JSON.parse(data).results.bindings.forEach( function(ct){ 
    	        //console.log(ct);//acca    
    

    	        var nodeView = { label: ct.description.value, title: ct.concept.value, newView: true };
    	    	$tw.wiki.addTiddler(nodeView);	    	//acca    

    	    });
    */ 

    /////////////////////////////////////////////////////////////////////////////////acca    

    	    // JSON.parse(data).results.bindings.forEach( function(concept){ 
    	    //     console.log(concept);//acca    

    	    //     var nodeView = { label: concept.description.value, title: concept.description.value };
    	    // 	nodes.push(nodeView)//acca    

    	    // });//acca    

    	    // var newViews = {title: "Snomed CT", nodes: nodes, newView: true}
    	    // $tw.wiki.addTiddler(newViews);
    	    //acca    
    

    	        
    	});
}


})();

