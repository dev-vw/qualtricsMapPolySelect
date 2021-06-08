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
    alert(question.getChoiceValue(choice));
}

// takes all question choices and marks it as false; basically
// deselects all choices
function selectNone() {
    jQuery(".QuestionBody input").each(function(e) {
        var id = this.id;
        var choice = id.split("~")[2];

        if(choiceArray[choice] !== undefined) {
	    alert(choice);
            toggleChoice(choice);
            choiceArray[choice] = undefined;
        }
    });
}

Qualtrics.SurveyEngine.addOnload(function() {
    // TODO: uncomment this in final deployment!
    //this.hideChoices();
    jQuery(".QuestionText small").eq(0).after("<div id='toggleLinks'>Select <a href='javascript:selectNone()'>None</a></div>");
});

Qualtrics.SurveyEngine.addOnReady(function() {

    
    // create a variable, 'question', to represent 'this'
    question = this;
    var map = L.map("map").setView([34.048679618744664, -118.25313039127253], 8);

    L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution/">CartoDB</a>',
        subdomains: "abcd",
        maxZoom: 19
    }).addTo(map);

    /* L.tileLayer(
     *     "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
     *         attribution: "&copy; OpenStreetMap"
     * }).addTo(map);
     */

    // control that shows region ore neighborhood name on hover
    //var info = L.control();

    //info.onAdd = function (map) {
    //this._div = L.DomUtil.create('div', 'info');
    //this.update();
    //return this._div;
    //}
    
    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.7,
            fillColor: '#FFB409'
        };
    }

    function neighborhoodStyle(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 1,
            fillColor: '#2887AE'
        };
    }
    
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.4
        });

        if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }
    
    /* function zoomToFeature(e) {
     *     if (curr_layer == "counties") {
     *         map.fitBounds(e.target.getBounds());
     *     }
     *     else if (curr_layer == "regions") {
     *         toggleNeighborhoods(e, is_toggled);
     *     }
     *     else if (curr_layer = "neighborhoods") {
     *         map.fitBounds(e.target.getBounds());
     *     }
     * }
     */
    function resetHighlight(e) {
        la_neighborhoods.setStyle(neighborhoodStyle);
        geojson.setStyle(style);
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
            // is_toggled = 1;
            // curr_layer = "neighborhoods";
        } else {
            // curr_layer = "regions";
            map.removeLayer(la_neighborhoods);
            // is_toggled = 0;
        }
    }

    // backup version
    /* function toggleNeighborhoods(e, is_toggled) {
     *     if (curr_layer == "counties") {
     *         map.fitBounds(e.target.getBounds());
     *     }
     *     else if (curr_layer == "regions") {
     *         map.fitBounds(e.target.getBounds());
     *         curr_layer = "neighborhoods";
     *         alert(e.target.feature.properties.metadata.slug);
     *         map.removeLayer(geojson);
     *         L.geoJson(la_neighborhoods, {
     *             style: style,
     *             filter: function(feature, layer) {
     *                 return feature.properties.metadata.region == e.target.feature.properties.metadata.slug;
     *             },
     *             onEachFeature: onEachFeature
     *         }).addTo(map);
     *     }
     *     else if (curr_layer = "neighborhoods") {
     *         map.fitBounds(e.target.getBounds());
     *     }
     * }
     */

    // backup version
    /* function onEachFeature(feature, layer) {
     *     layer.on({
     *         mouseover: highlightFeature,
     *         mouseout: resetHighlight,
     *         click: zoomToFeature
     *     });
     * }
     */

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: function(e) {
		if (is_toggled == 0) {
                    toggleNeighborhoods(e, is_toggled);
                    if (is_toggled == 1) {
                        is_toggled = 0;
                    } else {
                        is_toggled = 1;
                    }
                } else if (is_toggled == 1 && e.target.feature.properties.kind == "L.A. County Neighborhood (V6)") {
		    optionID = e.target.feature.properties.objectID;
                    alert(optionID);
		    selectNone();
		    toggleChoice(optionID);
		    choiceArray[optionID] = true;
                    zoomToFeature(e);
                } else if (is_toggled == 1 && e.target.feature.properties.kind == "L.A. County Region (V6)") {
                    toggleNeighborhoods(e, is_toggled);
                    if (is_toggled == 1) {
                        is_toggled = 0;
                    } else {
                        is_toggled = 1;
                    }
                }
            }
        });
    }
    
    var la_regions = L.geoJson(regions, {
        style: style,
        onEachFeature: onEachFeature
    });

    var la_neighborhoods = L.geoJson(neighborhoods, {
        style: style,
        onEachFeature: onEachFeature
    });
    
    var is_toggled = 0;
    var curr_layer = "regions";
    var geojson = la_regions;
    map.addLayer(geojson);
    
    // map_layers = L.layerGroup([neighborhoods]).addTo(map);
    
    /* map.on('zoomend', function(e) {
     *     if (map.getZoom() < 6) {
     *         curr_layer = "counties";
     *         map.removeLayer(geojson);
     *         geojson = counties;
     *         geojson.addTo(map);
     *     }
     *     else if (map.getZoom() >= 6 && map.getZoom() < 11) {
     *         curr_layer = "regions";
     *         map.removeLayer(geojson);
     *         geojson = regions;
     *         geojson.addTo(map);
     *     }
     *     else {
     *         curr_layer = "neighborhoods";
     *         map.removeLayer(geojson);
     *         geojson = neighborhoods;
     *         geojson.addTo(map);
     *     }
     * }); */
    
    // Add the greater SoCal layer
    /* var socal_geojson = L.geoJson(socal, {
     *     style: style,
     *     onEachFeature: onEachFeature
     * }); */
    /* var socal = fetch("data/socal.geojson")
     *     .then(function(response) {
     *         return response.json();
     *     })
     *     .then(function(data) {
     *         L.geoJSON(data).addTo(map);
     *     });
     */

    // add LA neighborhoods
    /* var neighborhoods_geojson = L.geoJson(neighborhoods, {
     *     style: style,
     *     onEachFeature: onEachFeature
     * }); */
    /* var neighborhoods = fetch("data/neighborhoods.geojson")
     *     .then(function(response) {
     *         return response.json();
     *     })
     *     .then(function(data) {
     *         L.geoJSON(data).addTo(map);
     *     }); */
    
    // geojson = L.layerGroup([socal_geojson, neighborhoods_geojson]).addTo(map);
    


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
