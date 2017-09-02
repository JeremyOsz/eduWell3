$(document).ready(function() {
    defineSearch()

    $("#mainsearch").keyup(function (e) {
        if (e.which == 13) {
            if(chkInputs() & chkAdvanced()){
                document.getElementById('searcherror').innerHTML = ""
                localeSearch()
            }
        }
    });
    $("#mainsearchbutton").click(function () {
        if(chkInputs() & chkAdvanced()){
            document.getElementById('searcherror').innerHTML = ""
            localeSearch()
        }
    });



})

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

    $("#mainsearch").easyAutocomplete(options);
    $('div.easy-autocomplete').removeAttr('style');
}


function localeSearch(){
    document.getElementById('searcherror').innerHTML = ""
    let query = document.getElementById('mainsearch').value;
    $.getJSON("data/localities.json", function(json) {
        let x = 0
        json.map((item) =>{
            if(item.SearchName == query){
                x = 1
                let searchLat = item.Lat
                let searchLon = item.Lon
                sendSearchQuery(searchLat, searchLon, query)
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
        localStorage[2] = true
    }
    if($("#PrivateCheck")[0].checked){
        localStorage[3] = true
    }
    if($("#CatholicCheck")[0].checked){
        localStorage[4] = true
    }
    if($("#advanced_options").attr("aria-expanded")){
        localStorage[5] = $('#searchRadius')[0].value
        if($('#programs')[0].value == "Safe Schools (LGBT Support)"){
            localStorage[6] = 1
        }else if($('#programs')[0].value == "After School Physical Education"){
            localStorage[6] = 2
        }
        else{
            localStorage[6] = 0
        }

        if($('#stats')[0].value == "Bullying Rate"){
            localStorage[7] = 1
        }
        else{
            localStorage[7] = 0
        }
    }
    localStorage[99] = true
    window.location.href = 'maptest.html';
}