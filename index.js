var map = L.map('map', {
    center: [35.779590, -78.638179],
    zoom: 12
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
})

// Query Functions

function getZoningValues(){
    var selectZoning = $(".selectZoning")
    var selectedZoningArray = []
    for (var i = 0; i<selectZoning.length; i++){
        if (selectZoning[i].checked === true)
        {
            selectedZoningArray.push(selectZoning[i].value)
        }
    }
    return selectedZoningArray
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

$("#divSubmitButton").click(function(){
    console.log("Submit Button Clicked")
    console.log("SELECT ZONING CLASS")
    console.log(getZoningValues())
    console.log("CHOOSE IF EXEMPT PROPERTIES WILL BE INCLUDED")
    console.log(getRadioValue("optExempt"))
    console.log("CHOOSE THE SEARCH AREA")
    console.log(getRadioValue("optSearchArea"))
    console.log("SET MINIMUM PARCELS SIZE")
    console.log(getNumericInput("minParcelSizeInput"))
    console.log("SET MAXIMUM PARCEL SIZE")
    console.log(getNumericInput("maxParcelSizeInput"))
})
