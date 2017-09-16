$(document).ready(function() {
    // defineSearch()

    $("#mainsearch").keyup(function (e) {
        if (e.which == 13) {
            if(chkInputs() & chkAdvanced()){
                document.getElementById('searcherror').innerHTML = ""
                // localeSearch()
                doGeocode()
            }
        }
    });
    $("#mainsearchbutton").click(function () {
        if(chkInputs() & chkAdvanced()){
            document.getElementById('searcherror').innerHTML = ""
            // localeSearch()
            doGeocode()
        }
    });

    initAutocomplete()




})



var autocomplete;
function initAutocomplete() {
    var southWest = new google.maps.LatLng( -39.0777905,148.8913944);
    var northEast = new google.maps.LatLng( -34.0061134,140.9758421);
    var vicBounds = new google.maps.LatLngBounds( southWest, northEast )
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(document.getElementById('mainsearch')),
        { types: ['geocode'],
            componentRestrictions: {country:'AU'}
        });
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
    });
}

function doGeocode() {
    var addr = document.getElementById("mainsearch");
    // Get geocoder instance
    var geocoder = new google.maps.Geocoder();

    // Geocode the address
    geocoder.geocode({
        'address': addr.value,
        region: 'VIC, Aus',
        componentRestrictions: {country:'AU'}
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

            // set it to the correct, formatted address if it's valid
            // addr.value = results[0].formatted_address;;

            lat = results[0].geometry.location.lat()
            lon = results[0].geometry.location.lng()
            console.log(lat)
            console.log(lon)

            //Set bounds to victoria
            if(lon > 150.718821 || lon < 140.6568968 || lat > -33.8030981 || lat < -39.0317517){
                console.log("Invalid Query")
                document.getElementById('searcherror').innerHTML = "Please enter a valid location"
            }else{
                console.log("Valid Query")
                console.log(addr)
                console.log(status)
                console.log(results[0])
                sendSearchQuery(lat,lon,addr.value)
            }



            //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
            // show an error if it's not
        } else {
            document.getElementById('searcherror').innerHTML = "Please enter a valid locality"
            console.log("Invalid Query")
        }
    });
};

// function localeSearch(){
//     document.getElementById('searcherror').innerHTML = ""
//
//     let query = document.getElementById('mainsearch').value;
//     $.getJSON("data/localities.json", function(json) {
//         let x = 0
//         json.map((item) =>{
//             if(item.SearchName == query){
//                 x = 1
//                 let searchLat = item.Lat
//                 let searchLon = item.Lon
//                 sendSearchQuery(searchLat, searchLon, query)
//             }
//             return x
//         })
//         if(x == 0){
//             document.getElementById('searcherror').innerHTML = "Please enter a valid locality"
//             console.log("Invalid Query")
//         }else{
//             console.log("Valid Query")
//
//         }
//     })
// }

function chkInputs(){
    GovernmentChecked = $("#GovernmentCheck")[0].checked
    PrivateChecked = $("#PrivateCheck")[0].checked
    CatholicChecked = $("#CatholicCheck")[0].checked
    if(GovernmentChecked || PrivateChecked || CatholicChecked){
        return true
    }
    else{
        document.getElementById('searcherror').innerHTML = "Please select at least one school type"
        return false
    }
}

function chkAdvanced() {
    if($("#advanced_options").attr("aria-expanded")){
        if(document.getElementById('searchRadius').value < 1 || document.getElementById('searchRadius').value > 10){
            document.getElementById('searcherror').innerHTML = "Please enter a distance between 1-10km"
            return false
        }
        else{
            return true
        }
    }
    else{
        return true
    }
}

function sendSearchQuery(lat, lon, query){
    localStorage[98] = lat
    localStorage[97] = lon
    localStorage[96] = query
    if($("#GovernmentCheck")[0].checked){
        localStorage[2] = 1
    }
    else{
        localStorage[2] = 0
    }
    if($("#PrivateCheck")[0].checked){
        localStorage[3] = 1
    }
    else{
        localStorage[3] = 0
    }
    if($("#CatholicCheck")[0].checked){
        localStorage[4] = 1
    }else{
        localStorage[4] = 0
    }

    if($("#advanced_options").attr("aria-expanded")){
        localStorage[5] = $('#searchRadius')[0].value
        if($('#LGBTCheck')[0].checked){
            localStorage[6] = 1
        }
        else{
            localStorage[6] = 0
        }
        if($('#ASPECheck')[0].checked){
            localStorage[8] = 1
        }
        else{
            localStorage[8] = 0
        }

        if($('#stats')[0].value == "Bullying Rate"){
            localStorage[7] = 1
        }
        else{
            localStorage[7] = 0
        }
    }
    else{
        localStorage[5] = 3
        localStorage[6] = 1
        localStorage[8] = 1
        localStorage[7] = 0
    }
    localStorage[99] = 1
    localStorage[55] = 0
    window.location.href = 'maptest.html';
}