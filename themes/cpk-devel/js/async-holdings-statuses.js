function isRecordPage() {
    return document.location.pathname.match(/\/Record\/\w+[.].*/) != null;
}

if ((isRecordPage())) {
    $(getHoldingStatuses); // Launch this function onLoad event
}

// Async holdings loader
function getHoldingStatuses(ids) {
    // TODO: Make the request cancellable after user chooses any filter

    if (typeof ids !== 'object')
        ids = getHoldingsIds();

    var ajaxResponse = $.ajax({
        type : 'POST',
        url : '/AJAX/JSON?method=getHoldingsStatuses',
        dataType : 'json',
        async : true,
        // json object to sent to the authentication url
        data : {
            ids : ids
        },
        success : function(response) {
            processGetHoldingStatusesResponse(response);
        }
    })

}

function getHoldingsIds(includingBeingLoadedIds) {

    if (typeof includingBeingLoadedIds === 'undefined')
        includingBeingLoadedIds = false;

    var ids = [];

    getAllNotLoadedHoldings(includingBeingLoadedIds).each(function() {
        ids.push($(this).attr('id'));

        // Add loading class so that we know about being it parsed
        $(this).addClass('loading');
    });

    return ids;
}

function getAllNotLoadedHoldings(includingBeingLoaded) {

    if (typeof includingBeingLoaded === 'undefined')
        includingBeingLoaded = true;

    var selector;

    if (includingBeingLoaded) {
        selector = 'div#holdings-tab tbody tr:not(.loaded)';
    } else {
        selector = 'div#holdings-tab tbody tr:not(.loading, .loaded)';
    }
    
    return $(selector);
}

function processGetHoldingStatusesResponse(r) {

    var data = r.data;

    if (typeof data.statuses !== 'undefined') {

        // Update the status
        $.each(data.statuses, function(key, value) {
            updateHoldingId(key, value);
        });

        if (data.remaining) {
            getHoldingStatuses(data.remaining);
        }
    } else {

        // Show error messages
        getAllNotLoadedHoldings(true).each(function() {
            updateHoldingId(this, data, true);
        });
    }
}

function updateHoldingId(id, value, setDangerLabel) {

    if (typeof setDangerLabel === 'undefined')
        setDangerLabel = false;
    
    var tableRow;
    
    if (! id)
        return null;
    
    if (typeof id === 'object') {
        
        tableRow = $(id);
                
    } else {

        // Escape special chars ..
        id = id.replace(/([.:])/g, '\\$1');
        
        tableRow = $("tr#" + id);
    }
    
    var statusDiv = tableRow.find('div')[1], 
        icon = $(statusDiv).children('i'),
        label = $(statusDiv).children('span.label');

    // Purge the loading icon
    icon.remove();

    var status = value.status;
    // Set status to the label
    if (typeof status !== 'undefined')
        label.text(status);
    else {
        label.text('unknown status');
        setDangerLabel = true;
    }

    var dueDate = value.due_date;
    if (typeof dueDate !== 'undefined') {
        
        // We have some due date here ..
        var dueDateColumn = $(tableRow.children('td')[1]);
        dueDateColumn.text(dueDate);

        label.removeClass('label-primary').addClass('label-warning');
        
    } else {

        if (setDangerLabel) {
            label.removeClass('label-primary').addClass('label-danger');
        } else {
            var labelType = typeof value.label === 'undefined' ? 'label-success' : value.label;
            
            label.removeClass('label-primary').addClass(labelType);
        }
    }

    tableRow.removeClass('loading').addClass('loaded');

}