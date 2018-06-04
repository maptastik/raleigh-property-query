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