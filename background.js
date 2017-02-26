var backroundData;
backroundData = {status: false};

// Add a context menu item which displays the bleed status page
chrome.runtime.onInstalled.addListener(function(details){
   chrome.contextMenus.create({
        "title": "Bleed Status",
        "contexts": ["browser_action"],
        "onclick": function() {
            chrome.tabs.create({url: 'status.html'});
        }
    });
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.notifications.create('status.html', {
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'History Bleed started',
        message: 'The extension will now check your history against the Cloudflare sites. Refresh the status page for progress report'
     }, function(notificationId) {
        chrome.tabs.create({"url": notificationId});
     });

    backroundData.status = "Initializing";

    $.get('sorted_unique_cf.txt', function(cfData) {
        var myArray = new Set(cfData.split('\n'));
        var affectedSites = new Set();

        backroundData = {status: 'Running', affected: 0, checked: 0, affectedSites: null};
        
        // https://blog.cloudflare.com/incident-report-on-memory-leak-caused-by-cloudflare-parser-bug/
        // The earliest date memory could have leaked is 2016-09-22.

        var startTime = 1474329600000 // this is 2016-09-21 in ms

        // API - https://developer.chrome.com/extensions/history#method-search
        // method signature: search(text, startTime, endTime, maxResults)
        // give maxResults as 0 to retrieve all results

        chrome.history.search({text: '', 'startTime': startTime, maxResults: 0}, function(data) {
            data.forEach(function(page) {
                var domain = extractDomain(page.url);
                backroundData.checked = backroundData.checked + 1;
                if (myArray.has(domain)) {
                    affectedSites.add(domain);
                }
            })
            backroundData.status = "Completed";
            backroundData.affected = affectedSites.size;
            backroundData.affectedSites = affectedSites;
            chrome.notifications.create('status.html', {
                type: 'basic',
                iconUrl: 'icon128.png',
                title: 'History Bleed completed',
                message: 'History Bleed check has completed. Refresh the status page.'
            }, function(notificationId){}
            );
        });
    });
});

// from: http://stackoverflow.com/a/23945027/1382297
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf('://') > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];

    // remove www or whatever the first part few parts are and
    // return the last two parts
    // TODO: for two or more characters of TLD following would fail
    // like google.co.in
    domain = domain.split('.').slice(-2).join('.');
    return domain;
}