$(document).ready(function () {
    initializeTFTTable();
    setTimeout(function () {
        initializeResizing();
        initializeOnHover();
        initializeToggles();
        initializeOnClick();
    }, 500)
});

// #region onHover
var hoverTimer;
var hoverDuration = 1000;

function initializeOnHover() {
    $(".combined-item").mouseenter(function () {
        $(this).addClass("is-hover-select");
        hoverTimer = setTimeout(function () {
            animateHover();
        }, hoverDuration);
    }).mouseleave(function () {
        unanimateHover();
        $(this).removeClass("is-hover-select");
        clearTimeout(hoverTimer);
    });
}

function animateHover() {
    let selectedItem = $(".combined-item.is-hover-select");
    let selectedItemRow = parseInt(selectedItem.attr("row"));
    let selectedItemCol = parseInt(selectedItem.attr("col"));

    let unselectedItems = $(".combined-item").not(".is-hover-select");
    let unselectedRowBaseItem = $(".base-item.first-row[col!="+selectedItemCol+"]");
    let unselectedColBaseItem = $(".base-item.first-col[row!="+selectedItemRow+"]");

    $.each(unselectedItems.add(unselectedRowBaseItem).add(unselectedColBaseItem), function (key, value) {
        let currRow = parseInt($(value).attr("row"));
        let currCol = parseInt($(value).attr("col"));
        let rowDiff = Math.abs(currRow - selectedItemRow);
        let colDiff = Math.abs(currCol - selectedItemCol);

        $(value).animate({
            opacity: 0.1
        }, (rowDiff + colDiff) * 100)
    });
}

function unanimateHover() {
    $(".combined-item").add($(".base-item")).stop();

    let unselectedItem = $(".combined-item").add($(".base-item"));
    unselectedItem.animate({
        opacity: 1
    });
}
// #endregion

// #region onclick
function initializeOnClick() {
    $(".base-item.first-col").click(function () {
        let rowNum = $(this).attr("row");
        hideRow(rowNum);
        tftResize();
    });

    $(".base-item.first-row").click(function () {
        let colNum = $(this).attr("col");
        hideColumn(colNum);
        tftResize();
    })
}

function hideColumn(colNum) {
    $(".all-item[col='" + colNum + "']").addClass("is-hide-col");
}

function hideRow(rowNum) {
    $(".all-item[row='" + rowNum + "']").addClass("is-hide-row");
}

// #endregion

// #region toggles
function initializeToggles() {
    // icon only
    $("#cbIconOnly").change(function () {
        if ($("#cbIconOnly").is(":checked")) {
            $(".tfti-table").addClass("icons-only");
        }
        else {
            $(".tfti-table").removeClass("icons-only");
        }
        tftResize();
    })
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
    let filterContainerEle = $(".filter");
    let numOfVisibleRows = $(".all-item.first-col").not(".is-hide-row").length + 1;

    let newHeightValue = window.innerHeight;

    if (isFullScreen()) {
        newHeightValue = Math.min(
            (window.innerHeight - filterContainerEle.innerHeight() - 5) / numOfVisibleRows,
            120);
    }
    else {
        newHeightValue = "initial";
    }

    $(".combined-item").css({
        height: newHeightValue
    })
}

function repositionTable() {
    let containerEle = $(".tfti");
    let filterContainerEle = $(".filter");

    if (isFullScreen()) {
        containerEle.css({
            top: 0,
            left: 0
        });
    }
    else {
        containerEle.css({
            top: Math.max((window.innerHeight - filterContainerEle.innerHeight() - containerEle.height()) / 2, 0),
            left: (window.innerWidth - containerEle.width()) / 2
        });
    }
}

function isFullScreen() {
    let isIconsOnly = $(".tfti-table").hasClass("icons-only");
    let isSmallWindow = window.innerWidth < 1600;

    return !isIconsOnly && isSmallWindow;

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
        let table = $(".tfti-table").empty()

        // create new empty table
        table.empty();
        for (let i = 0; i < numBaseItems + 1; i++) {
            table.append("<tr></tr>");
        }
        for (let i = 0; i < numBaseItems + 1; i++) {
            table.children("tr").append("<td></td>");
        }

        table.addClass("icons-only");

        // prepare base items
        $.each(baseItems, function (key, value) {
            let baseItemID = value["baseitemid"];
            let name = value["name"];
            let image = value["image"];

            let baseItemInnerHTML = "<span class='tfti-item'>" +
                "<span class='tfti-item-image'><img class='tfti-item-image-img' src='images/" + image + "' alt='" + name + "'></span>" +
                "<span class='tfti-item-text'>" +
                    "<span class='tfti-item-text-name'>" + name + "</span>" +
                    baseStatsHTML(value) +
                "</span></span>";

            let rows = $(".tfti-table")[0].rows;

            let cell1 = rows[0].cells[baseItemID + 1];
            cell1.innerHTML = baseItemInnerHTML;
            cell1.className = "base-item all-item first-row";
            cell1.setAttribute("row", 0);
            cell1.setAttribute("col", baseItemID + 1);

            // let cell2 = rows[numBaseItems - baseItemID].cells[0];
            let cell2 = rows[baseItemID + 1].cells[0];
            cell2.innerHTML = baseItemInnerHTML;
            cell2.className = "base-item all-item first-col";
            cell2.setAttribute("row", baseItemID + 1);
            cell2.setAttribute("col", 0);
        });

        // prepare combined items
        $.each(combinedItems, function (key, value) {
            let baseItemID1 = value["baseitemid1"];
            let baseItemID2 = value["baseitemid2"];
            let name = value["name"];
            let description = value["description"];
            let shortdescription = value["shortdescription"];
            let image = value["image"];


            let combinedItemInnerHTML = "<span class='tfti-item'>" +
                "<span class='tfti-item-image'><img class='tfti-item-image-img' src='images/" + image + "' alt='" + name + "'></span>" +
                "<span class='tfti-item-text'>" +
                    "<span class='tfti-item-text-name'>" + name + "</span>" +
                    "<span class='tfti-item-text-short-description'>" + shortdescription + "</span>" +
                    "<span class='tfti-item-text-description'>" + description + "</span>" +
                    combinedStatsHTML(value) +
                "</span></span>";

            let rows = $(".tfti-table")[0].rows;

            // let cell1 = rows[numBaseItems - baseItemID1].cells[baseItemID2 + 1];
            // cell1.innerHTML = combinedItemInnerHTML;
            // cell1.className = "combined-item duplicate-item";

            // let cell2 = rows[numBaseItems - baseItemID2].cells[baseItemID1 + 1]
            // cell2.innerHTML = combinedItemInnerHTML;
            // cell2.className = "combined-item";

            let cell1 = rows[baseItemID1 + 1].cells[baseItemID2 + 1];
            cell1.innerHTML = combinedItemInnerHTML;
            cell1.className = "combined-item all-item";
            cell1.setAttribute("row", baseItemID1 + 1);
            cell1.setAttribute("col", baseItemID2 + 1);

            let cell2 = rows[baseItemID2 + 1].cells[baseItemID1 + 1]
            cell2.innerHTML = combinedItemInnerHTML;
            cell2.className = "combined-item all-item";
            cell2.setAttribute("row", baseItemID2 + 1);
            cell2.setAttribute("col", baseItemID1 + 1);
        });
    });

}

function baseStatsHTML(baseItem) {
    if (baseItem["baseitemid"] == 8)
        return "<span class='tfti-item-text-stats'>Golden Spatula</span>";

    let statsHTML = "<ul class='tfti-item-text-stats'>";
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
    let statsHTML = "<ul class='tfti-item-text-stats'>";
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