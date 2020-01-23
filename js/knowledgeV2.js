/*\
title: $:/plugins/alvsan/semantic/knowledgeV2.js
type: application/javascript
module-type: startup

\*/


( function(){ 

"use strict";

exports.name = "knowledgeV2";
exports.platforms = ["node"];
exports.after = ["lhmacro"];
exports.synchronous = true;


exports.startup = function(callback) {


    console.log("JHola");
    var Client = require("node-rest-client").Client;
    var client = new Client();

    var args = {
        headers: { "Accept": "application/ld+json, */*;q=0.5" } // request headers 
    };

    var config = JSON.parse($tw.wiki.getTiddlerAsJson("Initial Config"));


    //client.get("http://10.0.3.15:8080/rdf4j-server/repositories/snomed02?query=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+sctf%3A+%3Chttp%3A%2F%2Fsnomed.info%2Ffield%2F%3E%0APREFIX+scti%3A+%3Chttp%3A%2F%2Fsnomed.info%2Fid%2F%3E%0ASelect+%3Fconcept+%3Fdescription%0Awhere+%7B+%3Fconcept+sctf%3ADescription.term.en-us.preferred+%3Fdescription+.%0A++++++++%3Fconcept+rdfs%3AsubClassOf+scti%3A138875005+++%7D",args, function (data, response) {
    //client.get(config.rdfstorage + "?query=" + encodeURIComponent($tw.wiki.getTiddler("$:/linekedhealth/snomedct_l1_v1").fields.text),args, function (data, response) {   
   
    client.get(config.rdfstorage+"?query=" + encodeURIComponent($tw.wiki.getTiddler(config.sparqll1).fields.text),args, function (data, response) { 

            var jsonldresponse = JSON.parse(data);


            var nodeView = {title: config.nameConcept, concepts: JSON.stringify(JSON.parse(data)), newView: true };
            $tw.wiki.addTiddler(nodeView);
            

            /*
            //Pensar en un arranque mas General desde un tiddly
            var initialKnowledge = {title: config.initialConcept ,label: config.nameConcept};    
            $tw.wiki.addTiddler(initialKnowledge);
            */

    });


           /*


            Object.keys(jsonldresponse).forEach( function(param , index) {
                console.log(jsonldresponse[param]);
                console.log(index);


                toTiddlyKnow(jsonldresponse[param]);



            });*/

            //var nodeView = {title: config.nameConcept, concepts: JSON.stringify(JSON.parse(data).results.bindings), newView: true };
            //$tw.wiki.addTiddler(nodeView);



/*

            function jsonldparse(conceptName, compacted, context, param, jsonIn){
        console.log("****************************************")
        console.log(ConceptName);
        console.log(param);
        //console.log(JSON.parse(JSON.stringify(req.erm.result))[param]);

        ------>>> let conceptSchema = require('mongoose').model(conceptName).schema;
        ------>>> console.log(conceptSchema.paths[param].path);


        //var type = typeof JSON.parse(JSON.stringify(req.erm.result))[param];
        var type = typeof JSON.parse(JSON.stringify(jsonIn))[param];
        if (type == "number") {
            // do stuff
        }
        else if (type == "string") {
            console.log("------------String---------------------String---------------------");
            console.log(param);
            if (param === "_id"){
              console.log("------------Id---------------------Id---------------------");
              compacted["@id"] = "fhir:"+conceptName+"#"+Array(req.erm.result)[0]["_id"];
            }else{
              context[param] = "fhir:"+conceptName+"."+param;
            }
            // do stuff
        }
        else if (type == "object") { // either array or object
          console.log("*****************************Object***************************");
          let compactedObject = {};

          Object.keys( param ).forEach( function(paramObject , index) {
            jsonldparse(conceptName, compactedObject, context, paramObject);
          });
          //if (elem instanceof Buffer) {
          //}
        }
        return param;
      }


      let context = {};
      let jsonIn = JSON.parse(JSON.stringify(req.erm.result));
      Object.keys(jsonIn).forEach( function(param , index) {
          jsonldparse(conceptName, compacted, context,param, jsonIn);
      });
      */

  


}})();