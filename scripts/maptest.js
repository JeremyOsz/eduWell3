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
    // infoControl(mymap)
    mymap.spin(false)

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
function getIcon(data){


    if(data.is)
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
// function infoControl(map){
    let info = L.control()

    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div','info')
        this.update()
        return this._div
    }

    info.update = function(props){
        this._div.innerHTML =  (props ?
            '<h4>' + props.School_Name + '</h4><br>'
            + '<b>Address: </b>' + props.Address1
            + props.Address2 + ",<br> " +
            props.Town + " " + props.PPostcode
            + '<br><b>Ph. No: </b>' + props.Phone + "<br>"
            + "<b>Students enrolled: </b>" + parseInt(props.Total)
            : 'Click a school to see info');
    }

    info.addTo(mymap)



//Click school event
function clickSchool(e){
    console.log(e.target.properties)
    info.update(e.target.properties)
}








