var EventView = {
    base:   "/event/",
    idbase: "event_view_",
    filterElems:        [],
    controlElems:       [],
    liveEventsButton:   [],
	controlSettings:    [],
    statusElem:         null,
    autoLoad:           false, 
    autoLoadFinished:   false, 
    maxId:              0,
    eventDetails:       [],
    eventDetailLock:    false,
    stickyEventDetails: 0,
    
    //features to add: drop entries off the bottom of the table if in autoupdate mode,
    //                 cache event details,                 
    
    getElems: function () {
        EventView.controlElems      = document.getElementById(EventView.idbase+'controls');
        EventView.statusElem        = document.getElementById(EventView.idbase+'status_text');
        EventView.liveEventsButton  = document.getElementById(EventView.idbase+'controls_live_events_button');
        var filter                  = document.getElementById(EventView.idbase+'filter');
        EventView.filterElems       = filter.getElementsByTagName('input');
    },
    
    checkAllFilters: function(state) {
        var filterNames = EventView.getFilterNames();
        for (i=0; i<filterNames.length; i++) {
            $(filterNames[i]).checked = state;
        }
    },
    
   getFilterNames: function() {
        var filterNames = [];
        for (i=0; i<EventView.filterElems.length; i++) {
            filterNames.push(EventView.filterElems[i].id);
        }
        return filterNames;
    },
    
    getCheckedEventTypes: function() {
        var checkedEventTypes = "";
        for (i=0; i<EventView.filterElems.length; i++) {
            if (EventView.filterElems[i].checked == true) {
				if (checkedEventTypes == "") {
					checkedEventTypes += EventView.filterElems[i].name
				}
				else {
					checkedEventTypes +=  ',' + EventView.filterElems[i].name;
				}
            }
        }
        return checkedEventTypes;
    },
	
	getControlSettings: function () {
		forEach(EventView.controlElems, 
			function(elem) {
				elemName = elem.id;
                if      (elem.type == "radio" | elem.type == "checkbox") {
                    EventView.controlSettings[elemName] = elem.checked;
                }
                else if (elem.type == "text") {
                    EventView.controlSettings[elemName] = elem.value;
                }
			}
		);
	},
    
    insertCurrentTime: function () {
        var dateToday = toISOTimestamp(new Date());
        var match = EventView.idbase + "events_since_time"
        forEach (EventView.controlElems, 
            function (elem) {
                if (elem.name == match) {
                    elem.value = dateToday;
                }
            }
        );
    },

    setTableHeight: function (rows) {
        if (!isInt(rows)) {
            rows = 10;
        }
        var heightEventTable  = 24 + 14*rows;
        var heightEventFilter = heightEventTable - 48;
        updateNodeAttributes(EventView.idbase + "event_filter", 
                             {'style' : {'maxHeight' : heightEventFilter + 'px'}});
        updateNodeAttributes(EventView.idbase + "event_table", 
                             {'style' : {'maxHeight' : heightEventTable + 'px'}});
        updateNodeAttributes(EventView.idbase + "event_details", 
                             {'style' : {'maxHeight' : heightEventTable + 'px'}});
    },
    
    setTableHeightOnLoad: function (rows) {
        var cookieTableHeight = Cookie.read("event_view_controls_max_rows")
        var minTableHeight    = 10;
        var tableHeight       = Math.max(parseInt(cookieTableHeight), 
                                         parseInt(minTableHeight))
        EventView.setTableHeight(tableHeight);
    },
    
    saveCookies: function () {
        var settings = EventView.controlSettings;
        forEach(dir(settings),
            function(setting) {
                log("cookie saved for ", setting, "[", settings[setting], "]")
                Cookie.create(setting, settings[setting], 30)
            }
        );
    },
    
    applyCookies: function() {
        var settings = EventView.controlSettings;
        forEach(dir(settings),
            function(setting) {
                log($(setting).value);
                log(setting, " = ", Cookie.read(setting));
            }
        );
    },
    
    
    /*
INFO: cookie saved for event_view_controls_autoload_interval [ 5 ]
INFO: cookie saved for event_view_controls_events_id [ 100 ]
INFO: cookie saved for event_view_controls_events_time [ 2006-04-03 17:30:28 ]
INFO: cookie saved for event_view_controls_max_events [ 50 ]
INFO: cookie saved for event_view_controls_max_rows [ 10 ]
INFO: cookie saved for event_view_controls_sel_recent [ true ]
INFO: cookie saved for event_view_controls_sel_since_id [ false ]
INFO: cookie saved for event_view_controls_sel_since_time [ false ]
INFO: Updating state.
    
    */
    
    autoLoadTable: function () {
        var prefix = EventView.idbase + "controls_";
        var button = $(prefix + "live_events_button");
        //start autoload
        if (EventView.autoLoad == false) {
            swapElementClass(EventView.liveEventsButton, "smallbutton", "smallbutton_depressed");
            EventView.autoLoad = true;
            EventView.maxId    = 0;
            EventView.clearTable();
            EventView.loadTable();
        }
        //stop autoload
        else if (EventView.autoLoad == true) {
            swapElementClass(EventView.liveEventsButton, "smallbutton_depressed", "smallbutton");
            EventView.autoLoad         = false;
            EventView.autoLoadFinished = true;
            EventView.maxId            = 0;
        }
    },
    
	loadTable: function () {
        //get current control & filter settings 
        EventView.getControlSettings();
        EventView.getElems();
        filters = EventView.getFilterNames();
        //set variables
        var settings = EventView.controlSettings;
        var prefix   = EventView.idbase + "controls_";
        var checkedFilters = "";
        var comma          = "";
        //apply event type filter
        for (i=0; i<filters.length; i++) {
            if (EventView.filterElems[i].checked == true) {
                if (checkedFilters == "") {comma = "" ;}
                else                      {comma = ",";}
                checkedFilters += comma + filters[i].slice(EventView.idbase.length, 
                                                           filters[i].length);
            }
        }
        //if no query type selected, return with message
        if (checkedFilters == "") {
            EventView.statusElem.innerHTML ="Select event types in filter.";
            if (EventView.autoLoad == true) {
                EventView.autoLoad = false;
                swapElementClass(EventView.liveEventsButton, "smallbutton_depressed", "smallbutton");
            }   
            return;
            }
        //case 1: autoLoad continuting (loadEvent was called in autoload loop)
        if (parseInt(EventView.maxId) > 0 & EventView.autoLoad == true) { 
            //log("case 1.");
            var startId     = EventView.maxId + 1;
            var typeQuery   = "&sinceEvent=" + startId;
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents   = EventView.controlSettings[maxElemName];
        }
        //case 2: autoLoad was just disabled (loadEvent was called in autoload loop)
        else if (EventView.autoLoadFinished == true) {
            //log("case 2.");
            EventView.autoLoadFinished = false;
            return;
        }
        //case 3: autoLoad just started (loadEvent was called in autoLoadEvent) 
        else if (EventView.autoLoadFinished == false & EventView.autoLoad == true) {
            //log("case 3.");
            var typeQuery = "";
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents = EventView.controlSettings[maxElemName]; 
        }
        //case 4: load all recent events (called by UI button)
        else if (settings[prefix + "sel_recent"] == true) {
            //log("case 4.");
            var typeQuery = "";
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents = EventView.controlSettings[maxElemName]; 
            EventView.maxId = 0;
        }
        //case 5: load n events after id m (called by UI button)
        else if (settings[prefix + "sel_since_id"] == true) {
            //log("case 5.");
            var sinceEvent   = EventView.idbase + "controls_events_id";
            var typeQuery = "&sinceEvent=" + EventView.controlSettings[sinceEvent];
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents = EventView.controlSettings[maxElemName]; 
            //log(maxEvents);
            EventView.maxId = 0;
        }
        //case 6: load n events after time t (called by UI button)
        else if (settings[prefix + "sel_since_time"] == true) {
            //log("case 6.");
            var sinceDate    = EventView.idbase + "controls_events_time";
            var typeQuery = "&sinceDate=" + EventView.controlSettings[sinceDate];
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents = EventView.controlSettings[maxElemName]; 
            EventView.maxId = 0;
        }
        //case 7: no query type selected in UI
        else {
            //log("case 7.");
            EventView.statusElem.innerHTML = "Select query type (Recent, etc.).";
            EventView.maxId = 0;
            return;
        }
        //clear table unless in autoload mode
        if (EventView.autoLoad == false) {
            EventView.clearTable();
            EventView.stickyEventDetails = false;
        }
        var maxResults = "&maxResults=" + maxEvents;
        //construct query string and send to server
        EventView.statusElem.innerHTML ="Query sent to server...";
        var query = "event/getEvents?typeFilter=" + checkedFilters + maxResults + typeQuery;
        sortableManager.loadFromURL(query)
        //set event table and event filter heights
        var maxRows = settings[prefix + "max_rows"];
        EventView.setTableHeight(maxRows);
	},
    
	clearTable: function () {
        sortableManager.data.domains = sortableManager.data.domains.slice(0,0);
        sortableManager.data.rows = "";
        tab = document.getElementById("sortable_table");
        for (i=tab.rows.length-1;i>0;i--) {
            removeElement(tab.rows[i]);
        }
	},
    
    highlightRows: function () {
        tableElem = $("sortable_table");
        for (i=1; i<tableElem.rows.length; i++) {
            eventId   = tableElem.rows[i].cells[0].innerHTML;
            eventType = tableElem.rows[i].cells[2].innerHTML;
            tableElem.rows[i].onmousedown = ignoreEvent;
            tableElem.rows[i].onmouseover = EventView.mouseOverFunction;
            tableElem.rows[i].onmouseout  = EventView.mouseOutFunction;
            tableElem.rows[i].onclick     = EventView.mouseClickFunction;
        }
    },

    mouseOverFunction: function () {
        if (EventView.stickyEventDetails == 0 ) {
            addElementClass(this, "over");
            EventView.getEventDetails(this.cells[0].innerHTML, this.cells[2].innerHTML);
        }
    },

    mouseOutFunction: function () {
        if (EventView.stickyEventDetails == 0 ) {
            removeElementClass(this, "over");
            EventView.clearEventDetails();
        }
    },

    mouseClickFunction: function () {
        //make data shown in Event Details stay there when user clicks on row
        if      (EventView.stickyEventDetails == 0) {
            EventView.stickyEventDetails = this.cells[0].innerHTML;
            log("event stuck :" + EventView.stickyEventDetails);
            setNodeAttribute(this, "id", EventView.stickyEventDetails);
            log(this.id);
        }
        else if (EventView.stickyEventDetails != 0)  {
            log("event unstuck: " + EventView.stickyEventDetails);
            removeElementClass(EventView.stickyEventDetails, "over");
            EventView.clearEventDetails();
            EventView.stickyEventDetails = 0;
        }
    },

    getEventDetails: function (eventId, eventType) {
        if (EventView.eventDetailLock == false) {
            EventView.eventDetailLock = true;
            var deferred = loadJSONDoc(EventView.base + "getEventDetails?eventId=" + eventId);
            deferred.addCallback(function (eventDetails) {
                EventView.loadEventDetails(eventDetails, eventId, eventType);
                EventView.eventDetails = eventDetails;
                EventView.eventDetailLock = false;
            });
            deferred.addErrback(function (err) {
                log("Error retreiving details for event " + eventId + ": " + repr(err));
                EventView.eventDetailLock = false;
            });
        }
    },

    getEventWithCallback: function (eventId, callback) {
        var deferred = loadJSONDoc(EventView.base + "getEventDetails?eventId=" + eventId);
        deferred.addCallback(function (eventDetails) {
            callback(eventDetails, eventId);
        });
        deferred.addErrback(function (err) {
            log("Error retreiving details for event " + eventId + ": " + repr(err));
        });
    },
    
    loadEventDetails: function (eventDetails, eventId, eventType) {
        var fields     = keys(eventDetails);
        var tableElem  = $(EventView.idbase + "event_details_table");
        //var row0       = TR(null, [TH( null, "Event Details" )]);
        var row1       = TR(null, [TD( null, "Event Type" ), TD( null, eventType )]);
        var row2       = TR(null, [TD( null, "Id" ),         TD( null, eventId   )]);
        //tableElem.appendChild(row0);   
        tableElem.appendChild(row1);   
        tableElem.appendChild(row2);   
        for (i=0; i<fields.length; i++) {
            var fieldTD   = TD( null, fields[i] );
            var detailsTD = TD( null, eventDetails[fields[i]] );
            var row       = TR( { "style" : {"verticalAlign" : "top"} }, 
                                [fieldTD, detailsTD]);
            tableElem.appendChild(row);   
        }
    },
    
    clearEventDetails: function () {
        var tableElem = $(EventView.idbase + "event_details_table");
        for (i=1; i<tableElem.childNodes.length; i++) {
            replaceChildNodes(tableElem.childNodes[i]);
        }
        var row0 = TR(null, [TH( { "style" : {"width" : "70px"} }, 
                                 "Event Details" )]);
        tableElem.appendChild(row0);   
    },
    
};
addLoadEvent(EventView.getElems);
addLoadEvent(EventView.insertCurrentTime);
addLoadEvent(EventView.setTableHeightOnLoad);
addLoadEvent(EventView.clearEventDetails);

processMochiTAL = function (dom, data) {

    // nodeType == 1 is an element, we're leaving text nodes alone.
    if (dom.nodeType != 1) {
        return;
    }
    var attr;
    // duplicate this element for each item in the given list, and then process 
    // the duplicated element again (sans mochi:repeat tag)
    attr = getAttribute(dom, "mochi:repeat");
    if (attr) {
        dom.removeAttribute("mochi:repeat");
        var parent = dom.parentNode;
        attr = attr.split(" ");
        var name = attr[0];
        var lst = valueForKeyPath(data, attr[1]);
        if (!lst) {
            return;
        }
        for (var i = 0; i < lst.length; i++) {
            data[name] = lst[i];
            var newDOM = dom.cloneNode(true);
            processMochiTAL(newDOM, data);
            parent.insertBefore(newDOM, dom);
        }
        parent.removeChild(dom);
        return;
    }
    // do content replacement if there's a mochi:content attribute
    // on the element
    attr = getAttribute(dom, "mochi:content");
    if (attr) {
        dom.removeAttribute("mochi:content");
        replaceChildNodes(dom, valueForKeyPath(data, attr));
        return;
    }
    // we make a shallow copy of the current list of child nodes
    // because it *will* change if there's a mochi:repeat in there!
    var nodes = list(dom.childNodes);
    for (var i = 0; i < nodes.length; i++) {
        processMochiTAL(nodes[i], data);
    }
};

mouseOverFunc = function () {
    addElementClass(this, "over");
};

mouseOutFunc = function () {
    removeElementClass(this, "over");
};

ignoreEvent = function (ev) {
    if (ev && ev.preventDefault) {
        ev.preventDefault();
        ev.stopPropagation();
    } else if (typeof(event) != 'undefined') {
        event.cancelBubble = false;
        event.returnValue = false;
    }
};

SortTransforms = {
    "int"     : function (s) { 
                    var totalDigits = 8; //pad integer until it has this many digits
                    var pad = '';
                    if (totalDigits > s.length) {
                        for (i=0; i<(totalDigits-s.length); i++) {
                            pad += "0";
                        }
                    }
                    return pad + s; 
                }, 
    "str"     : operator.identity,
    "istr"    : function (s) { 
                    return s.toLowerCase(); 
                },
    "isoDate" : operator.identity //isoDate
};

getAttribute = function (dom, key) {
    try {
        return dom.getAttribute(key);
    } catch (e) {
        return null;
    }
};

valueForKeyPath = function (data, keyPath) {
    var chunks = keyPath.split(".");
    while (chunks.length && data) {
        data = data[chunks.shift()];
    }
    return data;
};


SortableManager = function () {
    this.initial_flag = true;
    this.thead = null;
    this.thead_proto = null;
    this.tbody = null;
    this.deferred = null;
    this.columns = [];
    this.rows = [];
    this.templates = [];
    this.sortState = {};
    bindMethods(this);
};

SortableManager.prototype = {

    "initialize": function () {
        // just rip all mochi-examples out of the DOM
        var examples = getElementsByTagAndClassName(null, "mochi-example");
        while (examples.length) {
            swapDOM(examples.pop(), null);
        }
        // make a template list
        var templates = getElementsByTagAndClassName(null, "mochi-template");
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var proto = template.cloneNode(true);
            removeElementClass(proto, "mochi-template");
            this.templates.push({
                "template": proto,
                "node": template
            });
        }
        
        // set up the data anchors to do loads -- needed any more?
        var anchors = getElementsByTagAndClassName("a", null);
        for (var i = 0; i < anchors.length; i++) {
            var node = anchors[i];
            var format = getAttribute(node, "mochi:dataformat");
            if (format) {
                node.onclick = loadFromDataAnchor;
            }
        }

        // to find sort columns
        this.thead = getElementsByTagAndClassName("thead", null)[0];
        this.thead_proto = this.thead.cloneNode(true);

        this.sortkey = "id";
        //this.loadFromURL("event/getEvents?maxResults=50");
        this.loadFromURL("event/getEvents?typeFilter=RoofEvent&maxResults=1");
    },

    "loadFromURL": function (url) {
        var d;
        if (this.deferred) {
            this.deferred.cancel();
        }       
        format = "json";
        d = loadJSONDoc(url)
        // keep track of the current deferred, so that we can cancel it
        this.deferred = d;
        var self = this;
        // save cookies while waiting for response
        EventView.saveCookies();
        // on success or error, remove the current deferred because it has
        // completed, and pass through the result or error
        d.addBoth(function (res) {
            self.deferred = null; 
            return res;
        });
        // on success, tag the result with the format used so we can display it
        d.addCallback(function (res) {
            EventView.statusElem.innerHTML ="Events received from server.  Inserting into table...";
            res.format = format;
            return res;
        });
        // call this.initWithData(data) once it's ready
        d.addCallback(this.initWithData);
        // if anything goes wrong, except for a cancellation, log the error
        d.addErrback(function (err) {
            if (err instanceof CancelledError) {
                return;
            }
            logError(err);
        });
        return d;
    },
    
    "initWithData": function (data) {
        // reformat to [{column:value, ...}, ...] style as the domains key
        var domains = [];
        var rows = data.rows;
        var cols = data.columns;
        tab = document.getElementById("sortable_table");
        idsInTable = [];
        for (i=1; i<tab.rows.length-1; i++) {
            idsInTable.push(tab.rows[i].cells[0].innerHTML);
        }
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var domain = {};
            for (var j = 0; j < cols.length; j++) {
                domain[cols[j]] = row[j];
            }
            domains.push(domain);
        }        
        if (this.initial_flag == true) {
            data.domains = domains;
            this.data = data;
        }
        else {
            this.data.domains = this.data.domains.concat(domains);
            this.data['rows'] += ',' + data['rows'];
        }
        // perform a sort and display based upon the previous sort state,
        // defaulting to an ascending sort if this is the first sort
        var order = this.sortState[this.sortkey];
        if (typeof(order) == 'undefined') {
            order = false;
        }
        EventView.statusElem.innerHTML ="Sorting table...";
        this.drawSortedRows(this.sortkey, order, false);
        EventView.statusElem.innerHTML ="";
        //load again, if autoload is set
        //TO-DO: find highest event id and autoload higher than that
        //find highest id in previous load
        var tableElem = $('sortable_table');
        var maxId = 0;
        for (i=1; i<tableElem.rows.length; i++) {
            currentId = parseInt(tableElem.rows[i].cells[0].innerHTML);
            if (currentId > maxId) {maxId = currentId}
        }
        EventView.maxId = maxId;
        var prefix           = EventView.idbase + "controls_";
        var autoLoadInterval = EventView.controlSettings[prefix + "autoload_interval"];
        if (EventView.autoLoad == true) {
            callLater(parseInt(autoLoadInterval), EventView.loadTable)
            //EventView.statusElem.innerHTML ="Autoload every " + autoLoadInterval + " seconds.";
        }
        this.initial_flag = false;
        //set event handlers for event table
        EventView.statusElem.innerHTML ="Adding eventListeners.";
        EventView.highlightRows()
        EventView.statusElem.innerHTML ="";
    },
   
    "onSortClick": function (name) {
        // save ourselves from doing a bind
        var self = this;
        // on click, flip the last sort order of that column and sort
        return function () {
            var order = self.sortState[name];
            if (typeof(order) == 'undefined') {
                // if it's never been sorted by this column, sort descending
                order = false;
            } else if (self.sortkey == name) {
                // if this column was sorted most recently, flip the sort order
                order = !((typeof(order) == 'undefined') ? false : order);
            }
            self.drawSortedRows(name, order, true);
            EventView.highlightRows()
        };
    },

    "drawSortedRows": function (key, forward, clicked) {
        // save it so we can flip next time
        this.sortState[key] = forward;
        this.sortkey = key;
        var sortstyle;
        // setup the sort columns   
        var thead = this.thead_proto.cloneNode(true);
        var cols = thead.getElementsByTagName("th");
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            var sortinfo = getAttribute(col, "mochi:sortcolumn").split(" ");
            var sortkey = sortinfo[0];
            col.onclick = this.onSortClick(sortkey);
            col.onmousedown = ignoreEvent;
            col.onmouseover = mouseOverFunc;
            col.onmouseout  = mouseOutFunc;
            // if this is the sorted column
            if (sortkey == key) {
                sortstyle = sortinfo[1];
                // \u2193 is down arrow, \u2191 is up arrow
                // forward sorts mean the rows get bigger going down
                var arrow = (forward ? "\u2193" : "\u2191");
                // add the character to the column header
                col.appendChild(SPAN(null, arrow));
                if (clicked) {
                    col.onmouseover();
                }
            }
        }
        this.thead = swapDOM(this.thead, thead);
        // apply a sort transform to a temporary column named __sort__,
        // and do the sort based on that column
        if (!sortstyle) {
            sortstyle = "str";
        }
        var sortfunc = SortTransforms[sortstyle];
        if (!sortfunc) {
            throw new TypeError("unsupported sort style " + repr(sortstyle));
        }
        var domains = this.data.domains;
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            domain.__sort__ = sortfunc(domain[key]);
        }
        // perform the sort based on the state given (forward or reverse)
        var cmp = (forward ? keyComparator : reverseKeyComparator);
        domains.sort(cmp("__sort__"));
        // process every template with the given data
        // and put the processed templates in the DOM
        for (var i = 0; i < this.templates.length; i++) {
            var template = this.templates[i];
            var dom = template.template.cloneNode(true);
            processMochiTAL(dom, this.data);
            template.node = swapDOM(template.node, dom);
        }
    },
    
};

// create the global SortableManager and initialize it on page load
sortableManager = new SortableManager();
addLoadEvent(sortableManager.initialize);

