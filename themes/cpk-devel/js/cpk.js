var cookies_agreed = function(yesNo) {

    if (yesNo) {
        var date = new Date();
        date.setFullYear(date.getFullYear() + 10);
        document.cookie = 'eu-cookies=1; path=/; expires=' + date.toGMTString();

        $('.eu-cookies').remove();
    } else {
        document.cookie = 'eu-cookies=1; path=/';

        // Do not remove the div as the user didn't agree
    }
}

function isRecordPage() {
    return document.location.pathname.match(/\/Record\/\w+[.].*/) != null;
}

if (isRecordPage()) {
    $(getHoldingStatuses());
}

function getHoldingsIds() {
    ids = [];
    $("div#holdings-tab tbody tr:not(.loading, .loaded)").each(function() {
        ids.push($(this).attr('id'));
        
        // Add loading class so that we know about being it parsed
        $(this).addClass('loading');
    });
    return ids;
}

function updateHoldingId(id, value) {
    var tableRow = $("tr#" + id.replace(/([.:])/g,'\\$1')),
    statusDiv = tableRow.find('div')[1],
    icon = $(statusDiv).children('i'),
    label = $(statusDiv).children('span.label');
    
    // Purge the loading icon
    icon.remove();
    
    // Set status to the label
    label.text(value);
    
    // TODO: Add some kind of style appropriate to the status parsed ...
    label.removeClass('label-primary').addClass('label-success');
    
    tableRow.removeClass('loading').addClass('loaded');
    
}

function processGetHoldingStatusesResponse(r) {
    
    var data = r.data;

    $.each(data.statuses, function(key, value) {
        updateHoldingId(key, value);
    });
    
    if (data.remaining) {
        // FIXME pass nextItemTokens somehow if any ...
        getHoldingStatuses()(data.remaining);
    }
}

// Async holdings loader
// TODO: Make the request cancellable after user chooses any filter
function getHoldingStatuses() {
    return function(ids) {

        if (document.location.pathname.indexOf('Record/') || ids === true) {
            
            if( Object.prototype.toString.call( ids ) !== '[object Object]' )
                ids = getHoldingsIds();
            
            var ajaxResponse = $.getJSON(
                    '/AJAX/JSON?method=getHoldingsStatuses', {
                        ids : ids
                    }, function(response) {
                        processGetHoldingStatusesResponse(response);
                    });
        }
    }
}