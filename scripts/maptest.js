//Establish leaflet map
function buildMap(){
    let mymap = L.map('mapid',{
        loadingControl: true
    }).setView([-37.814, 144.96332],13);

    // Load tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets-basic',
        accessToken: 'pk.eyJ1Ijoiam9zenRyZWljaGVyIiwiYSI6ImNqNmJicmxtczE3ZnUydnFybWl4am94bnAifQ.AqK2Zt30_RpbcPHLatRS2A'
    }).addTo(mymap);



    mymap.spin(true)
    loadGeoJSON(mymap)
    getSchoolList(mymap)


    return mymap
}

//Load LGA
function loadGeoJSON(map){

    let LGA = new L.geoJson();
    LGA.addTo(map);

    //Get GeoJSON data on LGAs
    $.ajax({
        dataType: "json",
        url: "data/LGA_geojson.geojson",
        asynch: false,
        success: function (data) {

            //Bind LGA to map
            $(data.features).each(function (key, data) {
                LGA.addData(data);
            })

            //Colour LGA by bullying rate
            bullyingColor(LGA)
        },
        error: function () {
            map.spin(false)
            console.log('error')
        }
    })
    map.spin(false)
}

//Colour LGA by bullying rate
function bullyingColor(GeoJSON){
    GeoJSON.setStyle({fillColor: 'red'})
    GeoJSON.eachLayer(function(layer) {
        layer.setStyle({fillColor: getColor(layer.feature.properties.Indicator)})
            .bindPopup('Bullying rate: ' + layer.feature.properties.Indicator )
    })
}


// get color depending on bulling proportion value
function getColor(d) {
    if(d < 12.5){
        return '#34ff00'
    }
    else if(d >= 12.5 && d < 17.5){
        return '#fdff00'
    }
    else{
        return '#ff001b'
    }
}




//Get school and add marker
function getSchoolList(map) {
    $.getJSON("data/schoolList.json", function(json) {
        addSchoolMarkers(json, map)
    });
}

//Add marker
function addSchoolMarkers(data, map){


    var markers = L.markerClusterGroup({ animateAddingMarkers : true});
    var markersList = [];


    for(i = 0; i < data.length; i++){
        if(data[i].Type.includes("Pri")){

            let icon = getIcon(data[i])
            let latlon = L.latLng(data[i].Latitude,data[i].Longitude)
            marker = L.marker(latlon,{icon: icon})
            marker.properties = data[i]
            marker.on('click',clickSchool)
            markersList.push(marker)
            markers.addLayer(marker)
            markers.bind
        }
     }


     map.addLayer(markers)
}

//Define marker
let getIcon = (data) => {

    if(data.LGBT) {
        switch (data.Sector) {
            case "Government":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Govt2-LGBT.png"
                })
                break
            case "Independent":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Private-LGBT.png"
                })
                break
            case "Catholic":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Catholic-LGBT.png"
                })
                break
            default:
                var icon = L.icon({
                    iconUrl: "icons/icons8-Govt-LGBT.png"
                })
        }
    }

    if(!data.LGBT){
        switch(data.Sector){
            case "Government":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Govt2.png"
                })
                break
            case "Independent":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Private.png"
                })
                break
            case "Catholic":
                var icon = L.icon({
                    iconUrl: "icons/icons8-Catholic.png"
                })
                break
            default:
                var icon = L.icon({
                    iconUrl: "icons/icons8-Govt.png"
                })
        }
    }

    icon.options.iconSize = [data.totalScaled,data.totalScaled];
    return icon
}

function defineSearch(){
    $.getJSON("data/localities.json", function(json) {
        const options = json
        $("#basics").easyAutocomplete(options)
    })
}


mymap = buildMap()
defineSearch()

// //build Info control


    let info = L.control()

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info')
        this.update()
        return this._div
    }


    let isLGBT = (props) => {
        if(props.LGBT){
            return "<img src='icons/icons8-LGBT Flag-48.png' height='30'> Safe Schools (LGBTA support) <br>";
        }
        else{
            return ""
        }
    }

    info.update = function (props) {
        this._div.innerHTML = (props ?
            '<h3>' + props.School_Name + '</h3><br>'
            + '<b>Address: </b>' + props.Address1
            + props.Address2 + ",<br> " +
            props.Town + " " + props.PPostcode
            + '<br><b>Ph. No: </b>' + props.Phone + "<br>"
            + "<b>Students enrolled: </b>" + parseInt(props.Total) + "<br><br>"
            + "<h4>Special Progrmas Offered</h4>" + isLGBT(props)
            : '<h3>Click a school to see info</h3>');


    }

    info.addTo(mymap)

// build Legend control

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (mymap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = ["Low", "Medium", "High"],
        labels = [];

    // Set bullying rate legend
    div.innerHTML = "<h3>Legend</h3>" + "<h4>Bullying Rate</h4>" + "<div class='Low'></div> " +
         grades[0] + '<br>' +
        "<div class='Med'></div> " +
        grades[1] + '<br>' +
        "<div class='High'></div> " +
        grades[2];

    // Set school type legend
    div.innerHTML += "<br><br><h4>School Type</h4>" +
                    "<img src='icons/icons8-Govt2.png' height='30'> Government School <br>" +
                    "<img src='icons/icons8-Catholic.png' height='30'> Catholic School <br>" +
                    "<img src='icons/icons8-Private.png' height='30'> Private/ Independent School <br>"+
                    "<img src='icons/cluster.png' height='30'> School Cluster <br>"

    // Set programs legend
    div.innerHTML += "<br><br><h4>School Type</h4>" +
        "<img src='icons/icons8-LGBT Flag-48.png' height='30'> Safe Schools (LGBTA support) <br>";

    return div;
};

legend.addTo(mymap);

//Click school event
function clickSchool(e){
    info.update(e.target.properties)
}

mymap.spin(false)






