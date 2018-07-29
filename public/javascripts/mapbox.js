mapboxgl.accessToken = 'pk.eyJ1IjoiaWMtYWRlbCIsImEiOiJjajlxNmh3Z2c1dGo0MzJsc2g4dmtwemtmIn0.OaHM_ansPzWj1GehUGluMw';
var crimeData;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ic-adel/cjhy2zm3z1d3y2sr9ci4elavj',
    center: [-116.94, 32.48],
    zoom: 10
});
var popup = new mapboxgl.Popup({
    closeButton: false
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
    
    
    
    var zoom = document.getElementById('zoom');
    
    
    // blur.addEventListener('input', function() {
    //     map.setPaintProperty('crime-heat','heatmap-blur',parseInt(blur.value,10));
    // });
    
    points.addEventListener('input', function() {
        if (points.checked === true) {
            map.setLayoutProperty('crime-point','visibility','visible');
            map.setLayoutProperty('crime-clusters','visibility','visible');
            map.setLayoutProperty('cluster-count','visibility','visible');
        } else {
            map.setLayoutProperty('crime-point','visibility','none');
            map.setLayoutProperty('crime-clusters','visibility','none');
            map.setLayoutProperty('cluster-count','visibility','none');
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
    
    document.addEventListener('wheel', function () {
        zoom.innerText = map.getZoom();
    });
    
}

function getCrimeData() {
    $.ajax({
        url: "http://localhost:3000/API/crimes",
        contentType: "application/json",
        type: "GET",
        success: function(response){
           
        },
        error: function(error,status){
            
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
        clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
    });
    
    //heatmap
    map.addLayer({
        "id": "crime-heat",
        "type": "heatmap",
        "source": "crime",
        // "maxzoom": 9,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": 0.5,
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            // "heatmap-intensity": [
            //     "interpolate",
            //     ["linear"],
            //     ["zoom"],
            //     0, 1,
            //     9, 3
            // ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(0, 255, 0, 0)",
                0.2, "rgb(255, 255, 0)",
                0.4, "rgb(255, 125, 0)",
                0.6, "rgb(255, 0, 0)",
                0.8, "rgb(175, 0, 0)",
                1, "rgb(100, 0, 100)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10.4, 6,
                11.4, 15,
                12.7, 35,
                13.9, 60,
                14.8, 99
            ],
            "heatmap-opacity": 0.5
        }
    },"road-label-small"); //water label is the first label layer for the current style
    //crimes
    map.addLayer({
        "id": "crime-point",
        "type": "symbol",
        "source": "crime-clustered",
        filter: ["!has", "point_count"],
        "layout": {
            "icon-image": "{DELITO}",
            "icon-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, .4,
                15, .6
            ],
            "icon-allow-overlap":true
        },
        // "minzoom": 7,
        
    });
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
                "interpolate",
                ["linear"],
                ["get", "point_count"],
                2,"#e0ff7c",
                10,"#ffeb5b",
                50,"#ffa75b",
                100,"#ff5b5b",
                500,"#ff0000",
                1000,"#b20000"
                
            ],
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "point_count"],
                2, 15,
                50, 25,
                100, 30,
                500, 35,
                1000, 40
            ],
            'circle-opacity': 0.8,
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
    //add popups
    map.on('mousemove', 'crime-point', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        
        // Populate the popup and set its coordinates based on the feature.
        var feature = e.features[0];
        popup.setLngLat(feature.geometry.coordinates)
        .setText(feature.properties.DELITO)
        .addTo(map);
    });
    //remove popups
    map.on('mouseleave', 'crime-point', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
    
}

function createChart(){
    var delito;
    var options = {
        title: {text: 'Title'},
        subtitle: {text: 'Subtitle'},
        xAxis: {categories: []},
        yAxis: {title: {text: 'Count'}},
        series: [{name: 'Count', data: []}]
    };
    for (var i = crimeData.features.length - 1; i >= 0; i--) {
        delito = crimeData.features[i].properties.DELITO;
        if(!options.xAxis.categories.indexOf(delito))
        options.xAxis.categories.push(delito);
    };
    //options.series[0].data.push(data[i].Count);
    $('#container').highcharts(options);
}

$( document ).ready(function() {
    //mapTweaking();
    var points = document.getElementById('points');
    var heat = document.getElementById('heat');
    
    points.addEventListener('input', function() {
        if (points.checked === true) {
            map.setLayoutProperty('crime-point','visibility','visible');
            map.setLayoutProperty('crime-clusters','visibility','visible');
            map.setLayoutProperty('cluster-count','visibility','visible');
        } else {
            map.setLayoutProperty('crime-point','visibility','none');
            map.setLayoutProperty('crime-clusters','visibility','none');
            map.setLayoutProperty('cluster-count','visibility','none');
        }
    });
    
    heat.addEventListener('input', function() {
        if (heat.checked === true) {
            map.setLayoutProperty('crime-heat','visibility','visible');
        } else {
            map.setLayoutProperty('crime-heat','visibility','none');
        }
    });
    
    map.on('load', function() {
        map.loadImage('./images/banco.png', function(error, image) {
            if (error) throw error;
            map.addImage('ROBO A BANCO', image);
        });
        map.loadImage('./images/casa.png', function(error, image) {
            if (error) throw error;
            map.addImage('ROBO CALIFICADO A CASA HABITACI?N', image);
            map.addImage('ROBO CON VIOLENCIA A CASA', image);
        });
        map.loadImage('./images/comercio.png', function(error, image) {
            if (error) throw error;
            map.addImage('ROBO CALIFICADO A COMERCIO', image);
            map.addImage('ROBO CON VIOLENCIA A COMERCIO', image);
        });
        map.loadImage('./images/culposas.png', function(error, image) {
            if (error) throw error;
            map.addImage('LESIONES CULPOSAS', image);
        });
        map.loadImage('./images/dolosas.png', function(error, image) {
            if (error) throw error;
            map.addImage('LESIONES INTENCIONALES', image);
        });
        map.loadImage('./images/homicidio.png', function(error, image) {
            if (error) throw error;
            map.addImage('HOMICIDIO CALIFICADO (VIOLENTO)', image);
        });
        map.loadImage('./images/robo simple.svg', function(error, image) {
            if (error) throw error;
            map.addImage('ROBO SIMPLE', image);
        });
        map.loadImage('./images/secuestro.png', function(error, image) {
            if (error) throw error;
            map.addImage('SECUESTRO (CONFIRMADO)', image);
        });
        map.loadImage('./images/vehiculo.png', function(error, image) {
            if (error) throw error;
            map.addImage('ROBO DE VEH?CULO', image);
            map.addImage('ROBO DE VEH?CULO CON VIOLENCIA', image);
        });
        
    });
    
    getCrimeData();
    
});


