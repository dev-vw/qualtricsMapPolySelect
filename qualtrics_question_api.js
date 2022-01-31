// instantiate a couple variables, (1) question and (2) layerArray
var question;
var choiceArray = [];

// toggles a question choice based on "choice" (which is the optionID
// or feature.properties.['OBJECTID'])
function toggleChoice(choice) {
    if (question.getChoiceValue(choice)) {
        question.setChoiceValue(choice, false);
    } else {
        question.setChoiceValue(choice, true);
    }

}

// takes all question choices and marks it as false; basically
// deselects all choices
function selectNone() {
    jQuery(".QuestionBody input").each(function(e) {
        var id = this.id;
        var choice = id.split("~")[2];

        if(choiceArray[choice] !== undefined) {

            toggleChoice(choice);
            choiceArray[choice] = undefined;
        }
    });
}

Qualtrics.SurveyEngine.addOnload(function() {
    // TODO: uncomment this in final deployment!
    this.hideChoices();
    //jQuery(".QuestionText small").eq(0).after("<div id='toggleLinks'>Select <a href='javascript:selectNone()'>None</a></div>");
});

Qualtrics.SurveyEngine.addOnReady(function() {

    
    // create a variable, 'question', to represent 'this'
    question = this;
    var map = L.map("map").setView([34.048679618744664, -118.25313039127253], 8);

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
             subdomains: "abcd",
             maxZoom: 19,
             minZoom: 7
         }).addTo(map);
    
    // -- DON'T FORGET THE CSS!!!
    var info = L.control();
    
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // alternative from above, to change text in the hover box
    info.update = function (props, choice) {
        this._div.innerHTML = '<h2>Regions and Neighborhoods of LA/Orange Counties</h2>' +  (choice == 1 ? '<b>Click this REGION to show underlying neighborhoods:</b><br />' + props.name :
                                                                                             choice == 2 ? '<b>Select this NEIGHBORHOOD:</b><br />' + props.name :
                                                                                             choice == 3 ? '<b>If you live OUTSIDE LA and Orange Counties, SELECT THIS</b><br />' :
                                                                                             'Hover over a REGION or NEIGHBORHOOD');
    };
    
    info.addTo(map);

    var selected;
    
    function style(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.1,
            fillColor: '#FFB409'
        };
    }

    function neighborhoodStyle(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.3,
            fillColor: '#2887AE'
        };
    }

    function exteriorStyle(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.1,
            fillColor: '#b3b3b3'
        };
    }

    function highlightFeature(e) {
        var layer = e.target;
        var choice;
        if (layer.feature.properties.kind == 'L.A. County Region (V6)') {
            choice = 1;
        } else if (layer.feature.properties.kind == 'L.A. County Neighborhood (V6)') {
            choice = 2;
        } else {
            choice = 3;
        }
        
        info.update(layer.feature.properties, choice);

        if (e.target.feature.properties.kind == "L.A. County Neighborhood (V6)") {
            layer.setStyle({
                weight: 3,
                opacity: 1,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.3,
                fillColor: '#2887AE'
            });
        } else if (e.target.feature.properties.kind == undefined) {
            layer.setStyle({
                weight: 3,
                opacity: 1,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.1,
                fillColor: '#b3b3b3'
            });
        } else {
            layer.setStyle({
                weight: 3,
                opacity: 1,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.4
            });
        }
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds(), {
	    maxZoom: 11});
    }

    function resetHighlight(e, is_selected) {
        info.update();

        if (exterior_toggled == 1) {
            e.target.setStyle({
                weight: 3,
                opacity: 1,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.1,
                fillColor: '#b3b3b3'
            });
            la_regions.setStyle(style);
            la_neighborhoods.setStyle(neighborhoodStyle);
        } else if (is_selected == 0) {
            la_neighborhoods.setStyle(neighborhoodStyle);
            exterior.setStyle(exteriorStyle);
            la_regions.setStyle(style);
        } else {
            la_neighborhoods.eachLayer(function(l) {
                if (l.feature.properties.objectID == selected) {
                    l.setStyle({
                        weight: 3,
                        opacity: 1,
                        color: 'black',
                        dashArray: '',
                        fillOpacity: 0.3,
                        fillColor: '#2887AE'
                    });
                } else {
                    la_neighborhoods.resetStyle(l);
                }
            });
            
            exterior.setStyle(exteriorStyle);
            la_regions.setStyle(style);                 
        }
    }

    function changeToggle(toggle) {
        if (toggle == 1) {
            return toggle = 0;
        } else {
            return toggle = 1;
        }
    }
    
    function toggleNeighborhoods(e, is_toggled) {
        if (is_toggled == 0) {
            map.fitBounds(e.target.getBounds());
            la_neighborhoods = L.geoJson(neighborhoods, {
                style: neighborhoodStyle,
                filter: function(feature, layer) {
                    return feature.properties.metadata.region == e.target.feature.properties.metadata.slug;
                },
                onEachFeature: onEachFeature
            });
            map.addLayer(la_neighborhoods);
        } else {
            la_neighborhoods.eachLayer(function(l) {
                la_neighborhoods.resetStyle(l);
            });
            selected = undefined;
            map.removeLayer(la_neighborhoods);
        }
    }

    function onEachFeature(feature, layer) {
             layer.on({
                 mouseover: function(e) {
                     if (exterior_toggled == 1 && e.target.feature.properties.objectID == 319) {
                         info.update(e.target.feature.properties, 3);
                         e.target.setStyle({
                             weight: 3,
                             opacity: 1,
                             color: 'black',
                             dashArray: '',
                             fillOpacity: 0.1,
                             fillColor: '#b3b3b3'
                         });
                     } else if (e.target.feature.properties.objectID == selected && e.target.feature.properties.kind == "L.A. County Neighborhood (V6)") {
                         info.update(e.target.feature.properties, 2);
                         e.target.setStyle({
                             weight: 3,
                             opacity: 1,
                             color: 'black',
                             dashArray: '',
                             fillOpacity: 0.3,
                             fillColor: '#2887AE'
                         });
                     } else {
                         highlightFeature(e);
                     }
                 },
                 mouseout: function(e) {
                     if (selected == undefined) {
                         resetHighlight(e, 0);
                     } else {
                         resetHighlight(e, 1);
                     }
                 },
                 click: function(e) {
                     if (exterior_toggled == 0 && e.target.feature.properties.kind == undefined) {
                         optionID = e.target.feature.properties.objectID;

			 selectNone();
			 toggleChoice(optionID);
			 choiceArray[optionID] = true;

                         e.target.setStyle({
                             weight: 3,
                             opacity: 1,
                             color: 'black',
                             dashArray: '',
                             fillOpacity: 0.1,
                             fillColor: '#b3b3b3'
                         });
			 if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                             e.target.bringToFront();
                         }
                         exterior_toggled = 1;
                     } else if (exterior_toggled == 1 && e.target.feature.properties.kind == undefined) {
                         exterior.setStyle({
                             weight: 1,
                             opacity: 1,
                             color: 'black',
                             dashArray: '',
                             fillOpacity: 1,
                             fillColor: '#b3b3b3'                             
                         });
                         exterior_toggled = 0;
                     }

                     if (is_toggled == 0) {
                         toggleNeighborhoods(e, is_toggled);

                         is_toggled = changeToggle(is_toggled);
                         
                         // if (is_toggled == 1) {
                         //     is_toggled = 0;
                         // } else {
                         //     is_toggled = 1;
                         // }

                         if (exterior_toggled == 1) {
                             exterior.setStyle({
                                 weight: 1,
                                 opacity: 1,
                                 color: 'black',
                                 dashArray: '',
                                 fillOpacity: 0.2,
                                 fillColor: '#b3b3b3'                             
                             });
                             exterior_toggled = 0;
                         }
                     } else if (is_toggled == 1 && e.target.feature.properties.kind == "L.A. County Neighborhood (V6)") {

                         optionID = e.target.feature.properties.objectID;

			 selectNone();
			 toggleChoice(optionID);
			 choiceArray[optionID] = true;

                         if (feature.properties.objectID === selected) {
                             la_neighborhoods.resetStyle(e.target);
                             selected = undefined;
                         } else {
                             la_neighborhoods.eachLayer(function(l) {
                                 la_neighborhoods.resetStyle(l);
                             });

                             e.target.setStyle({
                                 weight: 3,
                                 opacity: 1,
                                 color: 'black',
                                 dashArray: '',
                                 fillOpacity: 0.3,
                                 fillColor: '#2887AE'
                             });
                             selected = feature.properties.objectID;
                         }
                         
                         if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                             e.target.bringToFront();
                         }

                         zoomToFeature(e);
                     } else if (is_toggled == 1 && e.target.feature.properties.kind == "L.A. County Region (V6)") {
                         toggleNeighborhoods(e, is_toggled);
                         is_toggled = changeToggle(is_toggled);
                         // if (is_toggled == 1) {
                         //     is_toggled = 0;
                         // } else {
                         //     is_toggled = 1;
                         // }
                     } else if (is_toggled == 1 && e.target.feature.properties.kind == undefined) {
                         toggleNeighborhoods(e, is_toggled);
                         is_toggled = changeToggle(is_toggled);
                         // if (is_toggled == 1) {
                         //     is_toggled = 0;
                         // } else {
                         //     is_toggled = 1;
                         // }
                     }
                 }
             });
         }
    
    var la_regions = L.geoJson(regions, {
        style: style,
        onEachFeature: onEachFeature
    });

    var exterior = L.geoJson(la_exterior, {
        style: exteriorStyle,
        onEachFeature: onEachFeature
    });
    
    var la_neighborhoods = L.geoJson(neighborhoods, {
        style: style,
        onEachFeature: onEachFeature
    });

    var is_toggled = 0;
    
    var exterior_toggled = 0;

    var geojson = L.featureGroup([la_regions, exterior]);
    
    map.addLayer(geojson);
});

Qualtrics.SurveyEngine.addOnPageSubmit(function() {

    // find which value of choiceArray is true
    var choiceIndex_arr = choiceArray.reduce(
        (out, bool, index) => bool ? out.concat(index) : out, []
    )

    var choiceIndex = choiceIndex_arr[0]
    
    var x_coord = nbhd_coords[choiceIndex-1]['x_coord']
    var y_coord = nbhd_coords[choiceIndex-1]['y_coord']

    Qualtrics.SurveyEngine.setEmbeddedData("x", x_coord);
    Qualtrics.SurveyEngine.setEmbeddedData("y", y_coord);
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    /*Place your JavaScript here to run when the page is unloaded*/
});
