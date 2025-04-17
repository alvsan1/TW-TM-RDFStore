/*\
title: $:/plugins/alvsan/semantic/knowledge
type: application/javascript
module-type: startup

\*/


( function(){ 

"use strict";

exports.name = "knowledgeV2";
exports.platforms = ["node"];
exports.after = ["story"];
exports.synchronous = true;


exports.startup = function(callback) {


    console.log("TW SHCE HI !");
    var Client = require("node-rest-client").Client;
    var client = new Client();

    var args = {
        headers: { "Accept": "application/ld+json, */*;q=0.5" } // request headers 
    };

    var config = JSON.parse($tw.wiki.getTiddlerAsJson("Initial Config"));

    if (config.initial === true){
        client.get(config.rdfstorage+"?query=" + encodeURIComponent($tw.wiki.getTiddler(config.sparqll1).fields.text),args, function (data, response) { 

                
               console.log("------------------ Initial -----------------------");
               console.log($tw.wiki.getTiddler(config.sparqll1).fields.text);
               console.log(JSON.stringify(JSON.parse(data)));
                
                


                var nodeView = {title: config.nameConcept, concepts: JSON.stringify(JSON.parse(data)), newKn: true };
                $tw.wiki.addTiddler(nodeView);
                



                /*
                //Pensar en un arranque mas General desde un tiddly
                var initialKnowledge = {title: config.initialConcept ,label: config.nameConcept};    
                $tw.wiki.addTiddler(initialKnowledge);
                */
        });
    }

    $tw.wiki.addEventListener("change",function(changes) {

        if ( JSON.parse(JSON.stringify(changes))["$:/StoryList"] ){
                console.log("--------------------------------------------------------");
                console.log(JSON.parse($tw.wiki.getTiddlerAsJson("$:/StoryList")));
                let changeStory = $tw.utils.parseStringArray(JSON.parse($tw.wiki.getTiddlerAsJson("$:/StoryList")).list)[0];
                let patt = /Draft of/;
                if ( ! patt.test(changeStory) &&  changeStory != "GettingStarted"){
                    //$tw.wiki.getTiddlerAsJson(changeStory).know;
                    if (JSON.parse($tw.wiki.getTiddlerAsJson(changeStory))['know'] == "true"  ) { 
                        $tw.wiki.setText(changeStory,"know",0,"false","");
                        var nodeGraph = JSON.parse($tw.wiki.getTiddlerAsJson(changeStory))['nodeGraph']
                        if ( typeof nodeGraph === "undefined" ){
                            var queryKw = $tw.wiki.getTiddler(config.sparqll2).fields.text.replace(/##ConceptTW##/g,changeStory);
                            var endpoint = config.rdfstorage
                            console.log("-------------------Query-------------------------------------");
                            console.log(queryKw);                            
                        }else{
                            var endpoint = config[nodeGraph + "_endpoint" ];
                            var tiddlyQuery = "$:/linkedhealth/"+ nodeGraph;
                            var queryKw = $tw.wiki.getTiddler(tiddlyQuery).fields.text.replace(/##ConceptTW##/g,changeStory);
                            console.log("-------------------Query-------------------------------------");
                            console.log(queryKw);                            
                        }
                        client.get(endpoint + "?query=" + encodeURIComponent(queryKw),args, function (dataV, responseV) {   
                        var nodeKw = { title: "Kn__" + changeStory , concepts: JSON.stringify(JSON.parse(dataV)), newkn: true , nodeGraph};
                        $tw.wiki.addTiddler(nodeKw);
                        setTimeout(function() {
                        },5000);
                        //To do : SI NO SE REQUIERE ACUTALIZACION MEJORA EL USO DE LA HERRAMIENTA
                    });
                    }                    
                }


            }

        });
        // To do : Pensar en un arranque mas General desde un tiddly
}})();