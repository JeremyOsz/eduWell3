$(document).ready(function() {
    console.log('ready')
    $("#filterApply").click(filterMap(mymap))
    $("#searchbox").keyup(function (e) {
        if (e.which == 13) {
            localeSearch()
        }
    });
});


//Establish leaflet map
let mymap = L.map('mapid',{
    loadingControl: true
})
mymap.zoomControl.setPosition('bottomright');

function buildMap(){

    let latlon = L.latLng(-37.814,144.96332);

    nearbySchools(latlon)

    mymap.setView([-37.814, 144.96332],13);
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
    LGA.setStyle({fillColor: 'red'})

    console.log(LGA)
    //Get GeoJSON data on LGAs
    $.getJSON("data/LGA_geojson.GeoJSON", function (data) {
            //Bind LGA to map
            $(data.features).each(function (key, data) {
                LGA.addData(data);
            })

            //Colour LGA by bullying rate
            if (document.getElementById("bullyingChecked").checked) {
                bullyingColor(LGA)
            }
            map.spin(false)
            }).then(LGA.addTo(map))
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
    })
}

//Add marker
function addSchoolMarkers(data, map){


    var markers = L.markerClusterGroup({ animateAddingMarkers : true});
    var markersList = [];

    let addmarker = (data) => {
        let icon = getIcon(data)
        let latlon = L.latLng(data.Latitude,data.Longitude)
        var marker = L.marker(latlon,{icon: icon})
        marker.properties = data
        marker.on('click',clickSchool)
        markersList.push(marker)
        markers.addLayer(marker)
        markers.bind
    }

    for(i = 0; i < data.length; i++){
        if(data[i].Type.includes("Pri")){
            if(data[i].Sector == "Government" && document.getElementById("GovernmentCheck").checked){
                addmarker(data[i])
            }
            if(data[i].Sector == "Independent" && document.getElementById("PrivateCheck").checked){
                addmarker(data[i])
            }
            if(data[i].Sector == "Catholic" && document.getElementById("CatholicCheck").checked){
                addmarker(data[i])
            }



        }
     }

    map.addLayer(markers)

}

//Define marker
let getIcon = (data) => {

    if(data.LGBT && document.getElementById("LGBTchecked").checked) {
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

    if(!data.LGBT || !document.getElementById("LGBTchecked").checked){
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
    icon.options.className = "leafletIcon";
    return icon
}

//Configure easy complete search bar
function defineSearch(){
    var options = {
        url: "data/localities.json",

        getValue: "SearchName",

        list: {
            match: {
                enabled: true
            }
        }
    };

    $("#searchbox").easyAutocomplete(options);
}


mymap = buildMap()
defineSearch()

// //build Info control


    // let info = L.control()
    //
    // info.onAdd = function (map) {
    //     this._div = L.DomUtil.create('div', 'info')
    //     this.update()
    //     return this._div
    // }
    //
    //
    let isLGBT = (props) => {
        if(props.LGBT){
            return "<img src='icons/icons8-LGBT Flag-48.png' height='30'> Safe Schools (LGBTA support) <br>";
        }
        else{
            return ""
        }
    }
    //
    // info.update = function (props) {
    //     this._div.innerHTML = (props ?
    //         '<h3>' + props.School_Name + '</h3><br>'
    //         + '<b>Address: </b>' + props.Address1
    //         + props.Address2 + ",<br> " +
    //         props.Town + " " + props.PPostcode
    //         + '<br><b>Ph. No: </b>' + props.Phone + "<br>"
    //         + "<b>Students enrolled: </b>" + parseInt(props.Total) + "<br><br>"
    //         + "<h4>Special Progrmas Offered</h4>" + isLGBT(props)
    //         : '<h4>Click a school to see info</h4>');
    //
    //
    // }
    //
    // info.addTo(mymap)


//Click school event
function clickSchool(e) {
    let props = e.target.properties;
    // info.update(e.target.properties);
    document.getElementById("selectedSchool").style.height = "200px";
    document.getElementById("selectedSchool").style.height = "200px";
    document.getElementById("selectedSchool").innerHTML = (props ?
        '<h3>' + props.School_Name + '</h3><br>'
        + '<b>Address: </b>' + props.Address1
        + props.Address2 + ",<br> " +
        props.Town + " " + props.PPostcode
        + '<br><b>Ph. No: </b>' + props.Phone + "<br>"
        + "<b>Students enrolled: </b>" + parseInt(props.Total) + "<br><br>"
        + "<h4>Special Progrmas Offered</h4>" + isLGBT(props)
        : '<h4>Click a school to see info</h4>')
}



function filterMap(map) {
    let error = document.getElementById("error")
    let govt = document.getElementById("GovernmentCheck").checked
    let private = document.getElementById("PrivateCheck").checked
    let catholic = document.getElementById("CatholicCheck").checked

    error.innerHTML = ""

    if(!govt && !private && !catholic){
        console.log("Click a school")
        error.innerHTML = "Please select at least one school type"
    }
    else{
        console.log(map)
        mymap.eachLayer(function (layer) {
            mymap.removeLayer(layer);
        });
        buildMap()
    }
}


//Find nearby schools to specified area
function nearbySchools(latlon){
    document.getElementById('schoolDisplay').innerHTML = "<h2>Nearby Schools</h2>"
    let area = latlon //Area from which nearby schools is measured
    let threshold = 3000 //Threshold for distance to travel
    let nearbySchools = []
    $.getJSON("data/schoolList.json", function(json) {
        json.map((item) =>{
            let schoolLoc = L.latLng(item.Latitude,item.Longitude)
            let distance = area.distanceTo(schoolLoc)
            if(distance < threshold){
                item.distance = distance
                nearbySchools.push(item)

            }
        })

        nearbySchools.sort(function(a, b) {
            return parseFloat(a.distance) - parseFloat(b.distance);
        });

        nearbySchools.map((school) => {
            document.getElementById('schoolDisplay').innerHTML += "<div class='schoolListEntry'><div class='favbox'><input class='favcheck' type='checkbox' id='" + school.School_Id + "'></div><h4>" + school.School_Name + "</h4>"
                + '<b>Distance:</b> ' + (school.distance/1000).toFixed(2) + "km"
                + "<br><b>School Type: </b>" + school.Sector +
                "<br><b>Students: </b>" + parseInt(school.Total) + "</div>";
        })
    })
}

// //Generate nearby school list
// function nearbySchoolList(school, distance){
//     document.getElementById('sidebar').innerHTML += "<div class='schoolListEntry'><h4>" + school.School_Name + "</h4>"
//         + '<b>Distance:</b> ' + (distance/1000).toFixed(2) + "km" + "</div>";
// }

//Activate Search
let searchMarker = new  L.marker()
function localeSearch(){

    mymap.removeLayer(searchMarker)
    document.getElementById('searcherror').innerHTML = ""
    let query = document.getElementById('searchbox').value;
    $.getJSON("data/localities.json", function(json) {
        let x = 0
        json.map((item) =>{
            if(item.SearchName == query){
                x = 1
                let searchLocale2 = L.latLng(item.Lat, item.Lon)
                console.log(searchLocale2)
                if(searchLocale2.Lat !== "undefined"){
                    searchMarker = L.marker(searchLocale2).addTo(mymap);
                    mymap.setView(searchLocale2,13);
                    nearbySchools(searchLocale2)
                    return x
                }
            }
        return x
        })
        if(x == 0){
            document.getElementById('searcherror').innerHTML = "Please enter a valid locality"
            console.log("Invalid Query")
        }else{
            console.log("Valid Query")

        }
    })
}

//Fetch IDs for schools in which compare is checked
function compare(){
    let favList = []
    let favs = $(".favcheck")
    console.log(favs);
    for(i = 0; i < favs.length; i++){
        if(favs[i].checked){
            favList.push(favs[i].id)
        }
    }
    console.log(favList)
    return favList
}







mymap.spin(false)








