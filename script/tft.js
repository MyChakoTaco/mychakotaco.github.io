$(document).ready(function () {
    setTimeout(function () {
        $(".cover").addClass("hide-cover");
    }, 1500);
    setTimeout(function () {
        $(".cover").addClass("disable-cover");
    }, 2000);

    loadJSON();

    setTimeout(function () {
    initializeTFTTable();
    initializeToolbar();
    }, 500);

    setTimeout(function () {
        initializeResizing();
        initializeOnHover();
        initializeFilterChange();
        // initializeOnClick();
        updateTextFloat();
    }, 1000);
});

// #region onHover
var hoverTimer;
var hoverDuration = 700;

function initializeOnHover() {
    $(".combined-item").click(function() {
        $(this).addClass("is-hover-select");
        animateHover();
    })

    $(".combined-item").mouseenter(function () {
        $(this).addClass("is-hover-select");
        hoverTimer = setTimeout(function () {
            animateHover();
        }, hoverDuration);
    }).mouseleave(function () {
        $(this).removeClass("is-hover-select");
        unanimateHover();
        clearTimeout(hoverTimer);
    });
}

function animateHover() {
    let selectedItem = $(".combined-item.is-hover-select");
    let selectedItemRow = parseInt(selectedItem.attr("row"));
    let selectedItemCol = parseInt(selectedItem.attr("col"));

    let unselectedItems = $(".combined-item").not(".is-hover-select").add(".base-item.first-row[col!=" + selectedItemCol + "]").add(".base-item.first-col[row!=" + selectedItemRow + "]");

    $.each(unselectedItems, function (key, value) {
        $(value).addClass("hover-dimmed");
    });

    $(".combined-item.is-hover-select .tfti-item-text").addClass("is-float-text");
}

function unanimateHover() {
    $(".item").stop();
    let unselectedItem = $(".combined-item").add($(".base-item"));
    unselectedItem.removeClass("hover-dimmed");

    $(".combined-item.is-hover-select .tfti-item-text").removeClass("is-float-text");
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
    updateTextFloat();
}

function hideRow(rowNum) {
    $(".all-item[row='" + rowNum + "']").addClass("is-hide-row");
    updateTextFloat();
}

function updateTextFloat() {
    $.each($(".combined-item"), function(key, value) {
        selectedItem = $(value);

        let numColBefore = selectedItem.prevAll().not(".is-hide-col").length;
        let numColAfter = selectedItem.nextAll().not(".is-hide-col").length;
        let isFloatLeft = numColBefore > 4 && numColAfter < 4;

        let numRowBefore = selectedItem.parent().prevAll().not(".is-hide-row").length;
        let numRowAfter = selectedItem.parent().nextAll().not(".is-hide-row").length;
        let isFloatUp = numRowBefore > 4 && numRowAfter < 4;
        
        let textElement = selectedItem.children(".tfti-item").children(".tfti-item-text");
        textElement.removeClass("mod-up mod-left");
        textElement.addClass((isFloatLeft ? "mod-left " : "") + (isFloatUp ? "mod-up" : ""));
    });
}
// #endregion

// #region filter
function initializeFilterChange() {
    // icon only
    // $("#cbIconOnly").change(function () {
    //     if ($("#cbIconOnly").is(":checked"))
    //         $(".tfti-table").addClass("icons-only");
    //     else
    //         $(".tfti-table").removeClass("icons-only");
    //     tftResize();
    // });

    $(".toolbar-filters-item-dropdown").change(function () {
        filterItems();
    });
}

function filterItems() {
    let properties = [];
    $(".toolbar-filters-item-dropdown").each(function() {
        if (this.value.length > 0) {
            properties.push("." + this.value);
        }
    });

    $(".combined-item").addClass("filter-dimmed");
    $(".combined-item" + properties.join("")).removeClass("filter-dimmed");
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
    let toolbarContainerEle = $(".toolbar");
    let numOfVisibleRows = $(".all-item.first-col").not(".is-hide-row").length + 1;

    let newHeightValue = window.innerHeight;

    if (isFullScreen()) {
        newHeightValue = Math.min(
            (window.innerHeight - toolbarContainerEle.innerHeight() - 5) / numOfVisibleRows,
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
    let toolbarContainerEle = $(".toolbar");

    if (isFullScreen()) {
        containerEle.css({
            top: 0,
            left: 0
        });
    }
    else {
        containerEle.css({
            top: Math.max((window.innerHeight - toolbarContainerEle.innerHeight() - containerEle.height()) / 2, 0),
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

var baseItems;
var combinedItems;
var keyTexts;
// #region Load JSON
function loadJSON() {
    $.getJSON("tft.json", function (data) {
        baseItems = data["tftitems"]["items"]["baseitems"];
        combinedItems = data["tftitems"]["items"]["combineditems"];
        keyTexts = data["tftitems"]["texts"];
    });
}
// #endregion

// #region Table Construction
function initializeTFTTable() {
    let numBaseItems = Object.keys(baseItems).length;
    let table = $(".tfti-table").empty()

    // create new empty table
    table.empty();
    for (let i = 0; i < numBaseItems + 1; i++) {
        table.append("<tr row='" + i + "'></tr>");
    }
    for (let i = 0; i < numBaseItems + 1; i++) {
        table.children("tr").append("<td></td>");
    }

    table.addClass("icons-only");

    // prepare base items
    $.each(baseItems, function (key, value) {
        let position = value["position"] + 1;
        let name = value["name"];
        let image = value["image"];
        let stats = value["stats"];

        let baseItemInnerHTML = "" +
            "<span class='tfti-item'>" +
            "<span class='tfti-item-image'>" +
            "<img class='tfti-item-image-img' src='images/" + image + "' alt='" + name + "'>" +
            "</span>" +
            "<span class='tfti-item-text'>" +
            "<span class='tfti-item-text-name'>" + name + "</span>" +
            (Object.keys(stats).length > 0 ? "<span class='tfti-item-text-stats'>" + listStats(value, null) + "</span>" : "") +
            "</span>" +
            "</span>";

        let rows = $(".tfti-table")[0].rows;

        let cell1 = rows[0].cells[position];
        cell1.innerHTML = baseItemInnerHTML;
        cell1.className = "base-item item first-row";
        cell1.setAttribute("row", 0);
        cell1.setAttribute("col", position);

        // used when doing unique flipped
        // let cell2 = rows[numBaseItems - baseItemID].cells[0];
        let cell2 = rows[position].cells[0];
        cell2.innerHTML = baseItemInnerHTML;
        cell2.className = "base-item item first-col";
        cell2.setAttribute("row", position);
        cell2.setAttribute("col", 0);
    });

    // prepare combined items
    $.each(combinedItems, function (key, value) {
        let ingredients = value["baseitems"];
        let baseItem1 = baseItems[ingredients[0]];
        let baseItem2 = baseItems[ingredients[1]];
        let name = value["name"];
        let description = value["description"];
        let shortdescription = value["shortdescription"];
        let image = value["image"];
        let filters = value["filter"]

        let combinedItemInnerHTML = "" +
            "<span class='tfti-item'>" +
            "<span class='tfti-item-image'>" +
            "<img class='tfti-item-image-img' src='images/" + image + "' alt='" + name + "'>" +
            "</span>" +
            "<span class='tfti-item-text'>" +
            "<span class='tfti-item-text-name'>" + name + "</span>" +
            "<span class='tfti-item-text-short-description'>" + shortdescription + "</span>" +
            "<span class='tfti-item-text-description'>" + description + "</span>" +
            (Object.keys(baseItem1["stats"]).length+Object.keys(baseItem2["stats"]).length > 0 ? "<span class='tfti-item-text-stats'>" + listStats(baseItem1, baseItem2) + "</span>" : "") +
            "</span></span>";

        let rows = $(".tfti-table")[0].rows;

        // used when flipped
        // let cell1 = rows[numBaseItems - baseItemID1].cells[baseItemID2 + 1];
        // cell1.innerHTML = combinedItemInnerHTML;
        // cell1.className = "combined-item duplicate-item";

        // let cell2 = rows[numBaseItems - baseItemID2].cells[baseItemID1 + 1]
        // cell2.innerHTML = combinedItemInnerHTML;
        // cell2.className = "combined-item";

        let position1 = baseItem1["position"] + 1;
        let position2 = baseItem2["position"] + 1;

        let cell1 = rows[position1].cells[position2];
        cell1.innerHTML = combinedItemInnerHTML;
        cell1.className = "combined-item item " + filters.join(" ");
        cell1.setAttribute("row", position1);
        cell1.setAttribute("col", position2);

        let cell2 = rows[position2].cells[position1]
        cell2.innerHTML = combinedItemInnerHTML;
        cell2.className = "combined-item item " + filters.join(" ");
        cell2.setAttribute("row", position2);
        cell2.setAttribute("col", position1);
    });
}

function listStats(baseItem1, baseItem2) {
    let html = "";
    if (baseItem2 == null) {
        for (let stat in baseItem1["stats"]) {
            html + "<li>+" + baseItem1[stat] + " " + keyTexts["stats"][stat] + "</li>"
        }
    }
    else {
        let type = "both";
        if (baseItem1["name"] == "Sparring Gloves")
            type = baseItem2["type"];
        else if (baseItem2["name"] == "Sparring Gloves")
            type = baseItem1["type"];

        let stats = [];
        for (let stat1 in baseItem1["stats"]) {
            stats.push(stat1);
        }
        for (let stat2 in baseItem2["stats"]) {
            if (stats.indexOf(stat2) == -1)
                stats.push(stat2);
        }

        for (let i = 0; i < stats.length; i++) {
            let stat = stats[i];

            statVal1 = baseItem1["stats"][stat];
            statVal2 = baseItem2["stats"][stat];
            let sum = (typeof statVal1 === 'undefined' ? 0 : statVal1) + (typeof statVal2 === 'undefined' ? 0 : statVal2);

            if (baseItem1["name"] == "Golden Spatula" || baseItem2["name"] == "Golden Spatula") {
                sum += sum;
            }
            else {
                switch (type) {
                    case "offensive":
                        if (stat == "critchance")
                            sum += sum;
                        else if (stat == "dodgechance")
                            continue;
                        break;
    
                    case "defensive":
                        if (stat == "dodgechance")
                            sum += sum;
                        else if (stat == "critchance")
                            continue;
                        break;
                }
            }

            let addPercent = false;
            switch (stat) {
                case "critchance":
                case "dodgechance":
                case "attackspeed":
                    addPercent = true;
            }
            html += "<li>+" + sum + (addPercent ? "%" : "") + " " + keyTexts["stats"][stat] + "</li>"
        }
    }
    return html;
}
// #endregion

// #region Filter Construction
function initializeToolbar() {
    let filter = $(".toolbar-filters").empty();
    let filterTypes = keyTexts["filter"];
    let counter = 0;

    $.each(filterTypes, function (key, value) {
        if (counter%3==0) {
            filter.append("<span class='toolbar-filters-item-row'></span>");
        }
        counter++;

        let latestRow = filter.children(".toolbar-filters-item-row").last();
        latestRow.append("<span class='toolbar-filters-item'>" +
        "<label class='toolbar-filters-item-label'>" + value["text"] + "</label>" +
        "<select class='toolbar-filters-item-dropdown' id='" + key + "'/>" +
        "</span>");

        let target = "#" + key;
        $(target).append(new Option("",""));
        
        let properties = value["properties"];
        for (let prop in properties) {
            // $("#"+key).append("<option value='"+prop+"'>"+properties[prop]+"</option>");
            $("#"+key).append(new Option(properties[prop], prop));

        }
    })
}
// #end region
