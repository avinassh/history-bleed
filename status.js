document.addEventListener("DOMContentLoaded", function(dcle) {
    var backroundData = chrome.extension.getBackgroundPage().backroundData;
    if (backroundData.status){
        $("#status").text(backroundData.status);
    }
    $("#affected").text(backroundData.affected);
    $("#checked").text(backroundData.checked);
    backroundData.affectedSites.forEach(function(site) {
        var rowData = "<tr><td>"+ site +"</td></tr>"
        $("#sites").append(rowData);
    });
});