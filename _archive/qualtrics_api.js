// instantiate a couple variables, (1) question and (2) layerArray
var question;
var layerArray = [];

// toggles a question choice based on "choice" (which is the optionID
// or feature.properties.['OBJECTID'])
function toggleChoice(choice) {
    if (question.getChoiceValue(choice)) {
        question.setChoiceValue(choice, false);
    } else {
	alert(choice);
        question.setChoiceValue(choice, true);
    }
}

// takes all question choices and marks it as false; basically
// deselects all choices
function selectNone() {
    jQuery(".QuestionBody input").prop("checked", false);

    jQuery(".QuestionBody input").each(function(e) {
        var id = this.id;
        var choice = id.split("~")[2];

        if(layerArray[choice] !== undefined){
            map.removeLayer(layerArray[choice]);
            layerArray[choice] = undefined;
        }
    });
}

Qualtrics.SurveyEngine.addOnload(function() {
    jQuery(".QuestionText small").eq(0).after("<div id='toggleLinks'>Select <a href='javascript:selectNone()'>None</a></div>");

    // might take this out, not sure why this is here...
    //jQuery(".QuestionText small").eq(1).parent().before("<div id='toggleLinks'>Select <a href='javascript:selectNone()'>None</a></div>");
});

Qualtrics.SurveyEngine.addOnReady(function() {
    // create a variable, 'question', to represent 'this'
    question = this;

    var geojson;

    function baseStyle(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 0.2,
            fillColor: '#FFEDA0'
        };
    }

    function selectStyle(feature) {
        return {
            color: "#000",
            fillColor: "#FF5F3C",
            weight: 2,
            opacity: 0.4,
            fillOpacity: 0.7
        };
    }

    // create a variable, 'highlightLayer', to represent highlighted polygons
    var highlightLayer;
    
    function highlightFeature(e) {
        geojson.resetStyle();

        highlightLayer = e.target;        

        highlightLayer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.7
        });

        if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            highlightLayer.bringToFront();
        }

        highlightLayer.openPopup();
    }

    var resetLayer;
    
    function resetHighlight(e) {
        resetLayer =  e.target;
	map.closePopup();
        geojson.resetStyle(resetLayer);
        // geojson.resetStyle(e.target);
    }
    
    // instantiate the map object
    var map = L.map("lamap_test", {
        center: [33.88432859591012, -118.11950729095284],
        zoomControl: true,
	doubleClickZoom: false,
        maxZoom: 11,
        minZoom: 2
    }).fitBounds([[33.671579110998074, -118.64178064610743],
                  [34.399774609859676, -117.82621343982969]]);

    // set max bounds of map
    //map.setMaxBounds([[33.057900526160225, -118.80935614420011],
    //                  [42.52232416332261, -118.82039094199308]]);

    // add the tile layer
    var cartodb_tilelayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution/">CartoDB</a>',
        subdomains: "abcd",
        maxZoom: 11,
        opacity: 1.0
    });

    // add the tile layer to the map
    cartodb_tilelayer.addTo(map);
    
    // define the onEachFeature function
    function onEachFeature(feature, layer) {
        var popupContent = '<table>\ <tr>\ <td>' + feature.properties['name'] + '</td>\ </tr>\ </table>';

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });

        layer.bindPopup(popupContent, {maxHeight: 400});
        
	layer.on('click', function(e) {
	    
            optionID = feature.properties['objectID'];
            
	    alert(optionID);

            if (layerArray[optionID] === undefined) {
                var polygon = L.geoJson(feature, {
                    style: {
                        color: "#000",
                        fillcolor: "#fff",
                        weight: 4,
                        opacity: 0.4
                    }
                });

	        alert(layerArray[optionID]);

                layerArray[optionID] = polygon;

		alert(layerArray[optionID]);

                polygon.addTo(map);
            } else {
                map.removeLayer(layerArray[optionID]);
                layerArray[optionID] = undefined;
            }
	    alert(layerArray[optionID] === undefined);
            toggleChoice(optionID);
        });
    }

    map.createPane('pane_base_geojson');
    map.getPane('pane_base_geojson').style.zIndex = 401;
    
    // --- TODO --- rename to another layer!!!
    geojson = new L.geoJson(regions, {
        pane: 'pane_base_geojson',
        style: baseStyle,
        onEachFeature: onEachFeature
    });

    // bounds_group.addLayer(geojson);
    // geojson.addTo(map);
    
    map.setZoom(5);
    
    // modify the choice selection in qualtrics
    // jQuery("#" + this.questionId + " input:radio[id^='QR\\~"+ this.questionId + "\\~']").change(function(e) {
    //     var id = e.target.id;
    //     alert(id);
    //     var choice = id.split("~")[2];
    //     alert("id " + choice);
        
    //     alert("polygon? " + layerArray[choice]);

    //     if(layerArray[choice] === undefined) {
    //         alert("allllerrrt:")
    //         var polygon = L.geoJson(regions, {
    //             filter: function(feature, layer) {
    //     	    alert("inside" + feature.properties["objectID"]);
    // 	            return feature.properties.objectID == choice;
    //             },
    //             style: selectStyle
    //         });
    //         //var polygon = L.geoJson(geojson.features[choice - 1], {
    //         //    style: {
    //         //        color: "#000",
    //         //        fillColor: "#fff",
    //         //        weight: 10,
    //         //        opacity: 0.65
    //         //    }
    //         //});
    //         layerArray[choice] = polygon;
    //         alert("allllerrrt2:" + polygon)
    //         polygon.addTo(map);
    //     } else {
    //         alert("else")
    //         map.removeLayer(layerArray[choice]);
    //         layerArray[choice] = undefined;
    //     }
    // });

    jQuery("#" + this.questionId + " .Selection ").on("click change", function() {
        alert('entered1');
        jQuery("input[type='radio']").each(function() {
            alert('entered2');
            if (this.prop("checked") == true) {
                var id = jQuery(this).attr("id");
                alert(id);                
                
                var choice = id.split("~")[2];
	        alert("id " + choice);
	        alert("polygon? " + layerArray[choice]);

                if (layerArray[choice] === undefined) {
                    alert("allllerrrt:")
	            var polygon = L.geoJson(regions, {
	                filter: function(feature, layer) {
		            alert("inside" + feature.properties["objectID"]);
    	                    return feature.properties.objectID == choice;
                        },
                        style: selectStyle
                    });
	            //var polygon = L.geoJson(geojson.features[choice - 1], {
                    //    style: {
                    //        color: "#000",
                    //        fillColor: "#fff",
                    //        weight: 10,
                    //        opacity: 0.65
                    //    }
                    //});
                    layerArray[choice] = polygon;
                    alert("allllerrrt2:" + polygon)
                    polygon.addTo(map);
                } else {
                    alert("else")
                    map.removeLayer(layerArray[choice]);
                    layerArray[choice] = undefined;
                }
            }
        });
    });

    for(var i = 0, len = this.getSelectedChoices().length; i < len; i++) {
        var choice = this.getSelectedChoices()[i];
        if (layerArray[choice] === undefined) {
            alert('loop')
            var polygon = L.geoJson(geojson, {
	        filter: function(feature, layer) {
    	            return feature.properties["objectID"] == choice;
        	}
            });
	    
	    //var polygon = L.geoJson(geojson.features[choice - 1], {
            //    style: {
            //        color: "#000",
            //        fillColor: "#fff",
            //        weight: 10,
            //        opacity: 0.65
            //    }
            //});

            layerArray[choice] = polygon;
            polygon.addTo(map);
        }
    }	
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    /*Place your JavaScript here to run when the page is unloaded*/
});
