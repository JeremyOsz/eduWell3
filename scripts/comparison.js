$(document).ready(function() {
    showCards()
})

function showCards() {

    let element = document.getElementById('data');

    $.getJSON("data/schoolList1.json", function (data)
    {

        var mydata = JSON.parse(data);
        var passdata = {1:"1000G", 2:"1001G", 3:"1002G"};

        for(var i = 0;i < mydata.length; i++)
        {
            for(j in passdata)
            {
                if(passdata[j] == mydata[i].School_Id)
                {
                    element.innerHTML = element.innerHTML + "<div class='card' id="+i+">"+ mydata[i].School_Name + " - " + mydata[i].Sector +"</div>";
                }
            }
        }
    })
}