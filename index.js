var map = L.map('map', {
    center: [35.779590, -78.638179],
    zoom: 13,
    zoomControl: false
});

L.control.zoom({
    position:'topright'
}).addTo(map);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

map.on('click', function(e) {
    console.log(e.latlng)
});

// Initialize CARTO
var client = new carto.Client({
    apiKey:'default_public',
    username: 'maptastik'
});

baseQuery = `
select p.*, z.zone_type, z.zone_type_decode
from parcels_raleigh p,
	 raleigh_search_areas r,
     (SELECT the_geom, zone_type, zone_type_decode
	  FROM raleigh_zoning
      WHERE zone_type_decode IN ('Residential-6')) z
WHERE r.name = 'ITB' 
AND st_intersects(st_centroid(p.the_geom), r.the_geom)
AND st_intersects(st_centroid(p.the_geom), z.the_geom)
AND (st_area(st_transform(p.the_geom, 2264))/43560) > 0.333
AND (st_area(st_transform(p.the_geom, 2264))/43560) < 1000000
AND p.land_cla_1 NOT IN ('EXEMPT')
`;

var style = new carto.style.CartoCSS(`
    #layer {
        line-width: 0.25;
        line-color: #000;
        polygon-opacity: 0.75;
        [zone_type = 'R-1'] {
            polygon-fill: rgb(220, 255, 210);  
        }
        [zone_type = 'R-2'] {
            polygon-fill: rgb(255, 251, 212);  
        }
        [zone_type = 'R-4'] {
            polygon-fill: rgb(255, 250, 150);  
        }
        [zone_type = 'R-6'] {
            polygon-fill: rgb(255, 245, 0);  
        }
        [zone_type = 'R-10'] {
            polygon-fill: rgb(234, 208, 0);  
        }
        [zone_type = 'RX-'] {
            polygon-fill: rgb(255, 150, 0);  
        }
        [zone_type = 'OP-'] {
            polygon-fill: rgb(0, 92, 230);  
        }
        [zone_type = 'OX-'] {
            polygon-fill: rgb(115, 225, 255);  
        }
        [zone_type = 'NX-'] {
            polygon-fill: rgb(255, 168, 175);  
        }
        [zone_type = 'CX-'] {
            polygon-fill: rgb(255, 0, 0);  
        }
        [zone_type = 'DX-'] {
            polygon-fill: rgb(115, 0, 0);  
        }
        [zone_type = 'IX-'] {
            polygon-fill: rgb(200, 166, 255);  
        }
        [zone_type = 'CM'] {
            polygon-fill: rgb(122, 201, 115);  
        }
        [zone_type = 'AP'] {
            polygon-fill: rgb(200, 247, 79);  
        }
        [zone_type = 'IH'] {
            polygon-fill: rgb(133, 81, 162);  
        }
        [zone_type = 'MH'] {
            polygon-fill: rgb(137, 112, 68);  
        }
        [zone_type = 'CMP'] {
            polygon-fill: rgb(102, 153, 205);  
        }
        [zone_type = 'PD'] {
            polygon-fill: rgb(255, 115, 223);  
        }
    }
`);

var parcelSource = new carto.source.SQL(baseQuery);
var layer = new carto.layer.Layer(parcelSource, style, {
    featureClickColumns: ['pin_num', 'owner', 'addr1', 'addr2']
});

client.addLayer(layer);
client.getLeafletLayer().addTo(map);

// Query Functions

function getZoningValues(){
    var selectZoning = $(".selectZoning")
    var selectedZoningArray = []
    for (var i = 0; i<selectZoning.length; i++){
        if (selectZoning[i].checked === true)
        {
            selectedZoningArray.push("'" + selectZoning[i].value + "'")
        }
    }
    return String(selectedZoningArray)
}

function getRadioValue(name){
    var val;
    var radios = document.getElementsByName(name);

    for (var i = 0; i < radios.length; i++){
        if (radios[i].checked) {
            val = radios[i].value;
            break
        }
    }
    return val;
}

function getNumericInput(name){
    return document.getElementsByName(name)[0].value;
}

var getUserQuery = function(){
    userZoningValues = getZoningValues()
    userExemptSelection = getRadioValue("optExempt")
    if (userExemptSelection === 'EXEMPT') {
        var userExemptSeletionQuery = "AND p.land_cla_1 NOT IN ('EXEMPT')";
    } else {
        var userExemptSeletionQuery = "";
    }
    var userSearchArea = getRadioValue("optSearchArea")
    var userMinParcelSize = getNumericInput("minParcelSizeInput")
    var userMaxParcelSize = getNumericInput("maxParcelSizeInput")

    var userQuery = `
    select p.*, z.zone_type, z.zone_type_decode
    from parcels_raleigh p,
        raleigh_search_areas r,
        (SELECT the_geom, zone_type, zone_type_decode
        FROM raleigh_zoning
        WHERE zone_type_decode IN (${userZoningValues})) z
    WHERE r.name = '${userSearchArea}' 
    AND st_intersects(st_centroid(p.the_geom), r.the_geom)
    AND st_intersects(st_centroid(p.the_geom), z.the_geom)
    AND (st_area(st_transform(p.the_geom, 2264))/43560) > ${userMinParcelSize}
    AND (st_area(st_transform(p.the_geom, 2264))/43560) < ${userMaxParcelSize}
    ${userExemptSeletionQuery}
    `
    return parcelSource.setQuery(userQuery);
}

$("#runQueryButton").click(getUserQuery);

