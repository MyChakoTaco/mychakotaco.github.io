$(document).ready(function () {
    initializeTFTTable();
    setTimeout(function() {
        // initializeResizing();
        initializeOnHover();
        initializeToggles();
    }, 50)
});

// #region onHover
var hoverTimer;
var hoverDuration = 1000;

function initializeOnHover() {
    // $(".combineditem").mouseenter(function() {
        
    //     var that = this;
    //     $(that).addClass("ishover", 1000, "easeInOutQuint");

    //     hoverTimer = setTimeout(function(){
    //         animateDim();
    //         console.log("animateDim()");
    //     }, hoverDuration);
    // }).mouseleave(function() {
    //     var that = this;
    //     $(that).removeClass("ishover", 1000, "easeInOutQuint");
    //     clearTimeout(hoverTimer);
    // });
}

function animateDim() {

}
// #endregion

// #region toggles
function initializeToggles() {
    $("#cbShowText").change(function() {
        if ($("#cbShowText").is(":checked")) {
            $("#tftitemstable").addClass("show-text");
        }
        else {
            $("#tftitemstable").removeClass("show-text");
        }
    })
}
function showTextToggle() {
    
    
}

// #endregion

// #region Resize
function initializeResizing() {
    tftResize();
    window.addEventListener("resize", tftResize);
}

function tftResize() {
    resizeTable();
    repositionTable();
}

function resizeTable() {
    $("#tftitemstable").removeClass("sm");

    let containerEle = $("#tftitemstable-container");
    let containerHeight = containerEle.height();
    let containerWidth = containerEle.width();
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    if (containerHeight > windowHeight || containerWidth > windowWidth) {
        $("#tftitemstable").addClass("sm");
    }
}

function repositionTable() {
    let containerEle = $("#tftitemstable-container");
    let containerHeight = containerEle.height();
    let containerWidth = containerEle.width();
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    containerEle.css({
        top: (windowHeight - containerHeight) / 2,
        left: (windowWidth - containerWidth) / 2
    });
}
// #endregion

// #region Table Construction
var baseItems, combinedItems;
var statNames = {
    "attackdamage": "Attack Damage",
    "magicdamage": "Ability Damage",
    "critchance": "Critical Chance",
    "dodgechance": "Dodge Chance",
    "attackspeed": "Attack Speed",
    "health": "Health",
    "armor": "Armor",
    "magicresist": "Magic Resist",
    "startingmana": "Starting Mana"
};

function initializeTFTTable() {
    $.getJSON("tft.json", function (data) {
        baseItems = data["tftitems"]["baseitems"];
        combinedItems = data["tftitems"]["combineditems"];
        let numBaseItems = Object.keys(baseItems).length;

        // create new empty table
        $("#tftitemstable").empty();
        for (let i = 0; i < numBaseItems + 1; i++) {
            $("#tftitemstable").append("<tr></tr>");
        }
        for (let i = 0; i < numBaseItems + 1; i++) {
            $("#tftitemstable > tr").append("<td></td>");
        }

        // prepare base items
        $.each(baseItems, function (key, value) {
            let baseItemID = value["baseitemid"];
            let name = value["name"];
            let image = value["image"];

            let baseItemInnerHTML = "<span class='baseitem'>" +
                "<span class='name'>" + name + "</span>" +
                "<span class='image'><img src='images/" + image + "' alt='" + name + "'></span>" +
                baseStatsHTML(value) +
                "</span>";

            let rows = $("#tftitemstable")[0].rows;
            rows[baseItemID + 1].cells[0].innerHTML = baseItemInnerHTML;
            rows[0].cells[baseItemID + 1].innerHTML = baseItemInnerHTML;
        });

        // prepare combined items
        $.each(combinedItems, function (key, value) {
            let baseItemID1 = value["baseitemid1"];
            let baseItemID2 = value["baseitemid2"];
            let name = value["name"];
            let shortdescription = value["shortdescription"];
            let image = value["image"];


            let combinedItemInnerHTML = "<span class='combineditem'>" +
                "<span class='name'>" + name + "</span>" +
                "<span class='image'><img src='images/" + image + "' alt='" + name + "'></span>" +
                "<span class='shortdescription'>" + shortdescription + "</span>" +
                combinedStatsHTML(value) +
                "</span>";

            let rows = $("#tftitemstable")[0].rows;
            rows[baseItemID1 + 1].cells[baseItemID2 + 1].innerHTML = combinedItemInnerHTML;
            rows[baseItemID2 + 1].cells[baseItemID1 + 1].innerHTML = combinedItemInnerHTML;
        });
    });

}

function baseStatsHTML(baseItem) {
    if (baseItem["baseitemid"] == 8)
        return "";

    let statsHTML = "<ul class='stats'>";
    for (let stat in statNames) {
        if (baseItem.hasOwnProperty(stat)) {
            statsHTML += "<li>+" + baseItem[stat] + " " + statNames[stat] + "</li>";
        }
    }
    statsHTML += "</ul>";

    return statsHTML;
}

function combinedStatsHTML(combinedItem) {
    let baseItemID1 = combinedItem["baseitemid1"];
    let baseItemID2 = combinedItem["baseitemid2"];
    if (baseItemID1 == 8 && baseItemID2 == 8)
        return "";

    // start stat styling
    let statsHTML = "<ul class='stats'>";
    let hasCustomStats = false;

    // check for custom stats
    for (let stat in statNames) {
        if (combinedItem.hasOwnProperty(stat)) {
            statsHTML += "<li>+" + combinedItem[stat] + " " + statNames[stat] + "</li>";
            hasCustomStats = true;
        }
    }

    // do mathematics to add base item stats
    if (!hasCustomStats) {
        let hasSpatula = baseItemID1 == 8 || baseItemID2 == 8;

        let statsArray = {
            "attackdamage": 0,
            "magicdamage": 0,
            "critchance": 0,
            "dodgechance": 0,
            "attackspeed": 0,
            "health": 0,
            "armor": 0,
            "magicresist": 0,
            "startingmana": 0
        }

        // find base items
        let baseItem1, baseItem2;
        for (let baseItem in baseItems) {
            if (baseItems[baseItem]["baseitemid"] == baseItemID1) {
                baseItem1 = baseItems[baseItem];
            }
            if (baseItems[baseItem]["baseitemid"] == baseItemID2) {
                baseItem2 = baseItems[baseItem];
            }
        }

        // add all stats of base items
        for (let stat in statsArray) {
            if (baseItem1.hasOwnProperty(stat)) {
                statsArray[stat] += hasSpatula ? baseItem1[stat] * 2 : baseItem1[stat];
            }
            if (baseItem2.hasOwnProperty(stat)) {
                statsArray[stat] += hasSpatula ? baseItem2[stat] * 2 : baseItem2[stat];
            }
            if (statsArray[stat] > 0) {
                statsHTML += "<li>+" + statsArray[stat] + " " + statNames[stat] + "</li>"
            }
        }
    }
    statsHTML += "</ul>";

    return statsHTML;
}

// #endregion