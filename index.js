var map = L.map('map', {
    center: [35.779590, -78.638179],
    zoom: 13
});

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);
// var marker = L.marker([-78.638179, 35.779590]).addTo(map);
var sidebar = L.control.sidebar('sidebar', {
    closeButton: false
}).addTo(map);
sidebar.show();

map.on('click', function(e) {
    console.log(e.latlng)
});

// Initialize CARTO
var client = new carto.Client({
    apiKey:'default_public',
    username: 'maptastik'
});

baseQuery = `
select p.*
from parcels_raleigh p,
	 raleigh_search_areas r,
     (SELECT the_geom
	  FROM raleigh_zoning
      WHERE zone_type IN ('R-6')) z
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
        polygon-fill: #abc123;
    }
`)

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
    console.log("Submit Button Clicked")
    console.log("SELECT ZONING CLASS")
    userZoningValues = getZoningValues()
    console.log(getZoningValues())
    console.log("CHOOSE IF EXEMPT PROPERTIES WILL BE INCLUDED")
    userExemptSelection = getRadioValue("optExempt")
    if (userExemptSelection === 'EXEMPT') {
        var userExemptSeletionQuery = "AND p.land_cla_1 NOT IN ('EXEMPT')";
    } else {
        var userExemptSeletionQuery = "";
    }
    console.log(getRadioValue("optExempt"))
    console.log("CHOOSE THE SEARCH AREA")
    var userSearchArea = getRadioValue("optSearchArea")
    console.log(getRadioValue("optSearchArea"))
    console.log("SET MINIMUM PARCELS SIZE")
    var userMinParcelSize = getNumericInput("minParcelSizeInput")
    console.log(getNumericInput("minParcelSizeInput"))
    console.log("SET MAXIMUM PARCEL SIZE")
    var userMaxParcelSize = getNumericInput("maxParcelSizeInput")
    console.log(getNumericInput("maxParcelSizeInput"))

    var userQuery = `
    select p.*
    from parcels_raleigh p,
        raleigh_search_areas r,
        (SELECT the_geom
        FROM raleigh_zoning
        WHERE zone_type_decode IN (${userZoningValues})) z
    WHERE r.name = '${userSearchArea}' 
    AND st_intersects(st_centroid(p.the_geom), r.the_geom)
    AND st_intersects(st_centroid(p.the_geom), z.the_geom)
    AND (st_area(st_transform(p.the_geom, 2264))/43560) > ${userMinParcelSize}
    AND (st_area(st_transform(p.the_geom, 2264))/43560) < ${userMaxParcelSize}
    ${userExemptSeletionQuery}
    `
    console.log(userQuery)
    return parcelSource.setQuery(userQuery);

}

$("#divSubmitButton").click(getUserQuery);
