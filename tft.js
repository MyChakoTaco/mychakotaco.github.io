$(document).ready(function () {
    console.log("hello test");

    createTFTTable();
});

function createTFTTable() {
    $.getJSON("tft.json", function(data) {
        let baseItems = data["tftitems"]["baseitems"];
        let combinedItems = data["tftitems"]["combineditems"];
        let numBaseItems = Object.keys(baseItems).length;

        $("#tftitemstable").empty();
        for (let i = 0; i < numBaseItems + 1; i++) {
            $("#tftitemstable").append("<tr></tr>");
        }
        for (let i = 0; i < numBaseItems + 1; i++) {
            $("#tftitemstable > tr").append("<td></td>");
        }

        $.each(baseItems, function(key, value) {
            let baseItemID = value["baseitemid"];
            let baseItemName = value["name"];
            let rows = $("#tftitemstable")[0].rows;
            rows[baseItemID+1].cells[0].innerHTML = "<span>"+baseItemName+"</span>";
            rows[0].cells[baseItemID+1].innerHTML = "<span>"+baseItemName+"</span>";
        });

        $.each(combinedItems, function(key, value) {
            let baseItemID1 = value["baseitemid1"];
            let baseItemID2 = value["baseitemid2"];
            let combinedItemName = value["name"];
            let description = value["description"];
            let rows = $("#tftitemstable")[0].rows;

            let innerHTML = "<span>"+combinedItemName+": "+description+"</span>"

            rows[baseItemID1+1].cells[baseItemID2+1].innerHTML = innerHTML;
            rows[baseItemID2+1].cells[baseItemID1+1].innerHTML = innerHTML;
        });
    });
    
}

function statsToString(item) {
    return "stats"
}