//Initalise events
$(document).ready(function() {
    console.log('ready')
    //Apply Filter
    $("#filterApply").click(filterMap(mymap))

    //Enter to search
    $("#searchbox").keyup(function (e) {
        if (e.which == 13) {
            localeSearch()
        }
    });
    $("#searchRadius")[0].value = localStorage[5]

    //Check favbox
    $(document).on('change', 'input[type="checkbox"]', function(e){
        $(".favcheck").click(selectedFavList())
    });

    //Fix easyautocomplete style issue
    $('div.easy-autocomplete').removeAttr('style');

    if(localStorage[6] == 0){
        document.getElementById("LGBTchecked").checked = false
        document.getElementById("ASPEchecked").checked = false
    }else if(localStorage[6] == 1){
        document.getElementById("LGBTchecked").checked = true
        document.getElementById("ASPEchecked").checked = false
    }else if(localStorage[6] == 2){
        document.getElementById("LGBTchecked").checked = false
        document.getElementById("ASPEchecked").checked = true
    }


});

//Create default filter options
if(!localStorage[99]){
    localStorage[2] = true //Govt
    localStorage[3] = true //Private
    localStorage[4] = true //Catholic
    localStorage[5] = 3 //Radius
    localStorage[6] = 1 //Programs (1 = LGBT)
    localStorage[7] = 1 //State (1 = Bulying)
    localStorage[98] = -37.814
    localStorage[97] = 144.96332
}

//Establish leaflet map
let mymap = L.map('mapid',{
    loadingControl: true
})
mymap.zoomControl.setPosition('bottomright');

//Build leaflet map
function buildMap(){


    let latlon = L.latLng(localStorage[98],localStorage[97])

    //Generate nearby schools based on initial map value
    let searchMarker = new  L.marker()
    searchMarker = L.marker(latlon).addTo(mymap);
    searchMarker.bindPopup(localStorage[96])
    nearbySchools(latlon)

    mymap.setView(latlon,13);
    // Load tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets-basic',
        accessToken: 'pk.eyJ1Ijoiam9zenRyZWljaGVyIiwiYSI6ImNqNmJicmxtczE3ZnUydnFybWl4am94bnAifQ.AqK2Zt30_RpbcPHLatRS2A'
    }).addTo(mymap);



    mymap.spin(true)
    if (localStorage[7] !== 0){
        loadGeoJSON(mymap)
    }
    else{
        console.log('GeoJSON disabled')
    }
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

            console.log(LGA)
            LGA.addTo(map)
            }).then(mymap.spin(false))
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
            if(sectorEnabled(data[i])){
                addmarker(data[i])
            }
        }
     }

    map.addLayer(markers)

}

//Define marker
let getIcon = (data) => {

    if(localStorage[6] == 1) {
        switch (data.Sector) {
            case "Government":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Govt2-LGBT.png"
                })
                break
            case "Independent":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Private-LGBT.png"
                })
                break
            case "Catholic":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Catholic-LGBT.png"
                })
                break
            default:
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Govt-LGBT.png"
                })
        }
    }
    else if(localStorage[6] == 2){
        switch(data.Sector){
            case "Government":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Govt-ASPE.png"
                })
                break
            case "Independent":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Private-ASPE.png"
                })
                break
            case "Catholic":
                var icon = L.icon({
                    iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Catholic-ASPE.png"
                })
                break
            default:
                var icon = L.icon({
                    iconUrl: "icons/icons8-Govt.png"
                })
        }
    }else{
            switch(data.Sector){
                case "Government":
                    var icon = L.icon({
                        iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Govt2.png"
                    })
                    break
                case "Independent":
                    var icon = L.icon({
                        iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Private.png"
                    })
                    break
                case "Catholic":
                    var icon = L.icon({
                        iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Catholic.png"
                    })
                    break
                default:
                    var icon = L.icon({
                        iconUrl: "http://www.eduwell.ga/EduWell/icons/icons8-Govt.png"
                    })
            }
        }





    // if(data.AS_Phys == "N" && !(localStorage[6] == 2)){
    //     switch(data.Sector){
    //         case "Government":
    //             var icon = L.icon({
    //                 iconUrl: "icons/icons8-Govt2.png"
    //             })
    //             break
    //         case "Independent":
    //             var icon = L.icon({
    //                 iconUrl: "icons/icons8-Private.png"
    //             })
    //             break
    //         case "Catholic":
    //             var icon = L.icon({
    //                 iconUrl: "icons/icons8-Catholic.png"
    //             })
    //             break
    //         default:
    //             var icon = L.icon({
    //                 iconUrl: "icons/icons8-Govt.png"
    //             })
    //     }
    // }

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
            return "<img src='http://www.eduwell.ga/EduWell/icons8-LGBT Flag-48.png' height='30'> Safe Schools (LGBTA support) <br>";
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
    document.getElementById("selectedSchool").style.height = "40%";
    document.getElementById("schoolDisplay").style.height = "60%";
    document.getElementById("selectedSchool").innerHTML = (props ?
        "<div class='favbox'><input class='favcheck glyphicon glyphicon-star-empty' type='checkbox' id='" +
        props.School_Id + "'></div>" +
        '<h3>' + props.School_Name + '</h3><br>'
        + '<b>Address: </b>' + props.Address1
        + props.Address2 + ",<br> " +
        props.Town + " " + props.PPostcode
        + '<br><b>Ph. No: </b>' + props.Phone + "<br>" +
        "<b>Website:</b> <a href='" + props.web + "'>" + props.web + "</a><br>"
        + "<b>Students enrolled: </b>" + parseInt(props.Total) + "<br>" +
        "<b>Buildings: </b>" + getBuildings(props) + "<br>" +
        "<b>Total building area: </b>" + getFloorArea(props) + "<br>"
        + "<b>Average Annual Investment: </b> " + getInvest(props) + "<br>"
        + "<br><h4>Special Programs:</h4>" + isLGBT(props) + isASPE(props) + isNone(props)
        : '<h4>Click a school to see info</h4>')

    nearbySchools(L.latLng(props.Latitude, props.Longitude))
}



function filterMap(map) {
    let error = document.getElementById("error")
    let govt = document.getElementById("GovernmentCheck").checked
    let private = document.getElementById("PrivateCheck").checked
    let catholic = document.getElementById("CatholicCheck").checked
    let LGBT = document.getElementById("LGBTchecked").checked
    let ASPE = document.getElementById("ASPEchecked").checked
    let Bullying = document.getElementById("bullyingChecked").checked

    error.innerHTML = ""

    if(!govt && !private && !catholic){
        console.log("Click a school")
        error.innerHTML = "Please select at least one school type"
    }
    else{
        if(govt){
            localStorage[2] = true
        }
        if(private){
            localStorage[3] = true
        }
        if(catholic){
            localStorage[4] = true
        }
        if(LGBT){
            localStorage[6] = 1
        }
        else if(ASPE){
            localStorage[6] = 2
        }
        else{
            localStorage[6] = 0
        }
        if(Bullying){
            localStorage[7] = 1
        }
        else{
            localStorage[8] = 0
        }
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

    let threshold = localStorage[5]*1000 //Threshold for distance to travel
    //default to 3000 if invalid
    console.log(threshold)
    if(threshold == undefined || threshold < 1000 || threshold > 10000){
        threshold = 3000
    }
    let nearbySchools = []
    $.getJSON("data/schoolList.json", function(json) {
        json.map((item) =>{
            let schoolLoc = L.latLng(item.Latitude,item.Longitude)
            let distance = area.distanceTo(schoolLoc)
            if(distance < threshold && distance > 0){
                console.log(item)
                item.distance = distance
                if(sectorEnabled(item)){
                    nearbySchools.push(item)
                }
            }
        })

        nearbySchools.sort(function(a, b) {
            return parseFloat(a.distance) - parseFloat(b.distance);
        });

        nearbySchools.map((school) => {
            document.getElementById('schoolDisplay').innerHTML += "<div class='schoolListEntry'>" +
                "<div class='favbox'><input class='favcheck glyphicon glyphicon-star-empty' type='checkbox' id='" +
                school.School_Id + "'></div><h4>" + school.School_Name + "</h4>"
                + "<span id='info'><b>Distance:</b>" + (school.distance/1000).toFixed(2) + "km"
                + "<br><b>School Type: </b>" + school.Sector +
                "<br><b>Students: </b>" + parseInt(school.Total) + '<br>' +
                '<b>Address: </b>' + school.Address1
                + school.Address2 + ",<br> " +
                school.Town + " " + school.PPostcode
                + '<br><b>Ph. No: </b>' + school.Phone + "<br>" +
                "<b>Website:</b> <a href='" + school.web + "'>" + school.web + "</a><br>" + "</span></div>";
        })
    })
}



//Activate Search
let searchMarker = new  L.marker()
function localeSearch(){
    console.log(document.getElementById('searchRadius').value)
    mymap.removeLayer(searchMarker)
    document.getElementById('searcherror').innerHTML = ""
    let query = document.getElementById('searchbox').value;
    $.getJSON("data/localities.json", function(json) {
        let x = 0
        json.map((item) =>{
            if(item.SearchName == query){
                x = 1
                let searchLocale2 = L.latLng(item.Lat, item.Lon)
                localStorage[5] = $("#searchRadius")[0].value
                console.log(searchLocale2)
                if(searchLocale2.Lat !== "undefined"){
                    searchMarker = L.marker(searchLocale2).addTo(mymap);
                    searchMarker.bindPopup(item.SearchName)
                    document.getElementById("selectedSchool").style.height = "15%";
                    document.getElementById("schoolDisplay").style.height = "85%";
                    document.getElementById("selectedSchool").innerHTML = '<h3>' + item.SearchName + '</h3>'
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
        }else if(document.getElementById('searchRadius').value < 1 || document.getElementById('searchRadius').value > 10){
            document.getElementById('searcherror').innerHTML = "Please enter a distance between 1-10km"
        }else{
            console.log("Valid Query")

        }
    })
}

//Fetch IDs for schools in which compare is checked
function compare(){
    let favList = []
    $("#compare_error")[0].innerHTML = ""
    let favs = $(".favcheck")

    for(i = 0; i < favs.length; i++){
        if(favs[i].checked){
            favList.push(favs[i].id)
        }
    }
    if(favList.length < 2){
        $("#compare_error")[0].innerHTML = "Select at least 2 schools to compare"
    }
    else{
        localStorage[100] = favList.length
        for(i in favList){
            localStorage[i] = favList[i]
        }
        window.location.href = 'comparison.html';
        return favList
    }
}

function selectedFavList(){
    {
        let favList = []
        let favs = $(".favcheck")
        for(i = 0; i < favs.length; i++){
            if(favs[i].checked){
                favList.push(favs[i].id)
            }
        }
        let favNum = favList.length


        document.getElementById('numToCompare').innerHTML = favNum;
        document.getElementById('selectedSchools').innerHTML = "";

        let favNames = []
        favList.map((e)=>{
            $.getJSON("data/schoolList.json", function(json) {
                json.map((school) => {
                    if(school.School_Id == e){
                        favNames.push(school.School_Name)
                    }
                    return(favNames)
                })
                return(favNames)
            }).then(() =>{
                document.getElementById('selectedSchools').innerHTML = "";
                for(i = 0; i < favNames.length; i++){
                    console.log(favNames[i])
                    document.getElementById('selectedSchools').innerHTML += "<li>" + favNames[i] + "</li>";
                }
            })
        })
    }
}


function sectorEnabled(item){
    if(item.Sector == "Government" && document.getElementById("GovernmentCheck").checked){
        return true
    }
    else if(item.Sector == "Independent" && document.getElementById("PrivateCheck").checked){
        return true
    }
    else if(item.Sector == "Catholic" && document.getElementById("CatholicCheck").checked){
        return true
    }
    else{
        false
    }
}

function test(){
    $.getJSON("data/schoolList.json", function(json) {
        console.log(json);
    })
}

function getInvest(props){
    if(parseInt(props.Investment) > 1){
        return "$" + props.Investment
    }
    else{
        return "Not Available"
    }
}

function getBuildings(props){
    if(props.BuildingNumber > 1){
        return parseInt(props.BuildingNumber)
    }
    else{
        return "Not Available"
    }
}

function getFloorArea(props) {
    if(props.FloorArea > 1){
        return parseInt(props.FloorArea) + "m<sup>2</sup>"
    }
    else{
        return "Not Available"
    }
}

function isASPE(props) {
    if(props.AS_Phys == "Y"){
        return "<img src='http://www.eduwell.ga/EduWell/icons/icons8-Exercise-48.png' height='30'> After-school Physical Activity <br>";
    }else{
        return ""
    }

}

function isNone(props){
    if(!props.LGBT && props.AS_Phys == "N"){
        return "None Available"
    }else{
        return ""
    }
}



mymap.spin(false)








