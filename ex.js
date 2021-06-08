
    
var jsonLayer;
var selected;
var minZoom = 8;

var center = new L.LatLng(34.05246386116084,-118.24546337127686);
var map = new L.Map('map-canvas', {
    zoom: minZoom,
    maxZoom: 16,
    minZoom: minZoom,
    maxBounds: new L.LatLngBounds(
        new L.LatLng(36.1912, -112.044),
        new L.LatLng(31.5037, -122.3272)
    )
});
map.setView(center, minZoom);
tiles = new L.TileLayer("http://{s}.latimes.com/quiet-la-0.4.0/{z}/{x}/{y}.png", {
    attribution: "Map data (c) <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>",
    subdomains: [
        'tiles1',
        'tiles2',
        'tiles3',
        'tiles4'
    ]
});
map.addLayer(tiles);

var defaultStyle = {
    weight: 1,
    color: "#2662CC",
    opacity: 0.75,
    fill: true,
    fillColor: "#2262CC",
    fillOpacity: 0.2
};

var highlightStyle = {
    weight: 3,
    color: "#244f79",
    opacity: 1,
    fill: true,
    fillColor: "#2262CC",
    fillOpacity: 0.5
};

var onEachFeature = function(feature, layer) {
    (function(layer, feature) {
      layer.on("click", function (e) {
          if (feature.properties.external_id === selected) {
            jsonLayer.resetStyle(layer);
            $('#resultinfo').html("");
            return false;
          }
          jsonLayer.eachLayer(function(l){jsonLayer.resetStyle(l);});
          layer.setStyle(highlightStyle);
          var html = _.template(
            $("#boundary_template").html(), 
            {obj: feature.properties}
          );
          $('#resultinfo').html(html);
          selected = feature.properties.external_id;
          return false;
      });
    })(layer, feature);
};

var reloadLayer = function () {
    
    var url = "http://s3-us-west-2.amazonaws.com/boundaries.latimes.com/archive/1.0/boundary-set/la-county-neighborhoods-v4.geojson";
    
    $("#loader").show();
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        success: function (response) {
            var geojson = response;
            if (jsonLayer) { map.removeLayer(jsonLayer); }
            jsonLayer = new L.geoJson(geojson, {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }).addTo(map);
            $("#loader").hide();
            
        }
    });
}

reloadLayer();





