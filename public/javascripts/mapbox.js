mapboxgl.accessToken = 'pk.eyJ1IjoiaWMtYWRlbCIsImEiOiJjajlxNmh3Z2c1dGo0MzJsc2g4dmtwemtmIn0.OaHM_ansPzWj1GehUGluMw';
var crimeData;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/bright-v9',
    center: [-116.94, 32.48],
    zoom: 10
});

function mapTweaking() {
    //dev tweaking
    var blur = document.getElementById('blur');
    var weight = document.getElementById('weight');
    var intensity = document.getElementById('intensity');
    var radius = document.getElementById('radius');
    var opacity = document.getElementById('opacity');
    
    var blur_value = document.getElementById('blur-value');
    var weight_value = document.getElementById('weight-value');
    var intensity_value = document.getElementById('intensity-value');
    var radius_value = document.getElementById('radius-value');
    var opacity_value = document.getElementById('opacity-value');
    
    var points_layer = document.getElementById('points');
    var heat_layer = document.getElementById('heat');
    
    var zoom = document.getElementById('zoom');
    
    
    // blur.addEventListener('input', function() {
    //     map.setPaintProperty('crime-heat','heatmap-blur',parseInt(blur.value,10));
    // });
    
    points.addEventListener('input', function() {
        if (points.checked === true) {
            map.setLayoutProperty('crime-point','visibility','visible');
        } else {
            map.setLayoutProperty('crime-point','visibility','none');
        }
    });
    
    heat.addEventListener('input', function() {
        if (heat.checked === true) {
            map.setLayoutProperty('crime-heat','visibility','visible');
        } else {
            map.setLayoutProperty('crime-heat','visibility','none');
        }
    });
    
    weight.addEventListener('input', function() {
        map.setPaintProperty('crime-heat','heatmap-weight',parseFloat(weight.value,10));
        weight_value.innerText = weight.value;
    });
    
    intensity.addEventListener('input', function() {
        map.setPaintProperty('crime-heat','heatmap-intensity',parseFloat(intensity.value,10));
        intensity_value.innerText = intensity.value;
    });
    
    radius.addEventListener('input', function() {
        map.setPaintProperty('crime-heat','heatmap-radius',parseFloat(radius.value,10));
        radius_value.innerText = radius.value;
    });
    
    opacity.addEventListener('input', function() {
        map.setPaintProperty('crime-heat','heatmap-opacity',parseFloat(opacity.value,10));
        opacity_value.innerText = opacity.value;
    });
}

function getCrimeData() {
    $.ajax({
        url: "http://localhost:3000/API/crimes",
        contentType: "application/json",
        type: "GET",
        success: function(response){
            console.log("Success");
        },
        error: function(error,status){
            console.error(error);
        }
    }).done(function (data) {
        crimeData = data[0];
        if (map.loaded()) {
            addMapData();
        }

        // add markers to map
    // crimeData.features.forEach(function(marker) {
        
    //     // create a HTML element for each feature
    //     var el = document.createElement('div');
    //     el.className = 'marker';
        
    //     // make a marker for each feature and add to the map
    //     new mapboxgl.Marker(el)
    //     .setLngLat(marker.geometry.coordinates)
    //     .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    //     .setHTML('<h3>' + marker.properties.DELITO + '</h3><p>' + marker.properties.MUNICIPIO + '</p>'))
    //     .addTo(map);
    // });
    });    
}

function addMapData() {
    // Add a geojson point source.
    // Heatmap layers also work with a vector tile source.
    map.addSource('crime', {
        "type": "geojson",
        "data": crimeData
    });

    map.addSource('crime-clustered', {
        "type": "geojson",
        "data": crimeData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 25 // Radius of each cluster when clustering points (defaults to 50)
    });
    
    //heatmap
    map.addLayer({
        "id": "crime-heat",
        "type": "heatmap",
        "source": "crime",
        // "maxzoom": 9,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                0, 0, //input, output
                6, 1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                9, 3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(33,102,172,0)",
                0.2, "rgb(103,169,207)",
                0.4, "rgb(209,229,240)",
                0.6, "rgb(253,219,199)",
                0.8, "rgb(239,138,98)",
                1, "rgb(178,24,43)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                9, 0
            ],
            // Transition from heatmap to circle layer by zoom level
            // "heatmap-opacity": [
            //     "interpolate",
            //     ["linear"],
            //     ["zoom"],
            //     7, 1,
            //     9, 0
            // ],
        }
    },"water_label"); //water label is the first label layer for the current style
    //crimes
    map.addLayer({
        "id": "crime-point",
        "type": "symbol",
        "source": "crime-clustered",
        filter: ["!has", "point_count"],
        "layout": {
            "icon-image": "police-15"
        },
        // "minzoom": 7,
        
    },"water_label"); //place layer before all map labels
    //crime clusters
    map.addLayer({
        id: "crime-clusters",
        type: "circle",
        source: "crime-clustered",
        filter: ["has", "point_count"],
        paint: {
            // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                100,
                "#f1f075",
                750,
                "#f28cb1"
            ],
            "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });
    //cluster labels
    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "crime-clustered",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });
}

$( document ).ready(function() {
    mapTweaking();
    getCrimeData();
    
});


