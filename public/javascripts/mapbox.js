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
    //     map.setPaintProperty('earthquakes-heat','heatmap-blur',parseInt(blur.value,10));
    // });
    
    points.addEventListener('input', function() {
        if (points.checked === true) {
            map.setLayoutProperty('earthquakes-point','visibility','visible');
        } else {
            map.setLayoutProperty('earthquakes-point','visibility','none');
        }
    });
    
    heat.addEventListener('input', function() {
        if (heat.checked === true) {
            map.setLayoutProperty('earthquakes-heat','visibility','visible');
        } else {
            map.setLayoutProperty('earthquakes-heat','visibility','none');
        }
    });
    
    weight.addEventListener('input', function() {
        map.setPaintProperty('earthquakes-heat','heatmap-weight',parseFloat(weight.value,10));
        weight_value.innerText = weight.value;
    });
    
    intensity.addEventListener('input', function() {
        map.setPaintProperty('earthquakes-heat','heatmap-intensity',parseFloat(intensity.value,10));
        intensity_value.innerText = intensity.value;
    });
    
    radius.addEventListener('input', function() {
        map.setPaintProperty('earthquakes-heat','heatmap-radius',parseFloat(radius.value,10));
        radius_value.innerText = radius.value;
    });
    
    opacity.addEventListener('input', function() {
        map.setPaintProperty('earthquakes-heat','heatmap-opacity',parseFloat(opacity.value,10));
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

    });    
}

function addMapData() {
    // Add a geojson point source.
    // Heatmap layers also work with a vector tile source.
    map.addSource('earthquakes', {
        "type": "geojson",
        "data": crimeData
    });
    
    map.addLayer({
        "id": "earthquakes-heat",
        "type": "heatmap",
        "source": "earthquakes",
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
    
    map.addLayer({
        "id": "earthquakes-point",
        "type": "circle",
        "source": "earthquakes",
        // "minzoom": 7,
        "paint": {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 1,
                    6, 4
                ],
                16, [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, 5,
                    6, 50
                ]
            ],
            // Color circle by earthquake magnitude
            "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "mag"],
                1, "rgba(33,102,172,0)",
                2, "rgb(103,169,207)",
                3, "rgb(209,229,240)",
                4, "rgb(253,219,199)",
                5, "rgb(239,138,98)",
                6, "rgb(178,24,43)"
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            // Transition from heatmap to circle layer by zoom level
            // "circle-opacity": [
            //     "interpolate",
            //     ["linear"],
            //     ["zoom"],
            //     7, 0,
            //     8, 1
            // ]
        }
    },"water_label");
}

$( document ).ready(function() {
    mapTweaking();
    getCrimeData();
    
});


