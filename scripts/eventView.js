var EventView = {
    base:  "/event_view/",
    idbase: "event_view_",
    filterElems: [],
    controlElems: [],
	controlSettings: [],
    
    getFilterElems: function () {
        var filter   = document.getElementById(EventView.idbase+'filter');
        EventView.filterElems = filter.getElementsByTagName('input');
        EventView.controlElems = document.getElementById(EventView.idbase+'controls');
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

	loadTable: function () {
        //get current control & filter settings 
        EventView.getControlSettings();
        EventView.getFilterElems();
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
                checkedFilters += comma + 
                                  filters[i].slice(EventView.idbase.length, 
                                                   filters[i].length);
            }
        }
        if (checkedFilters == "") {return}
        var query = "event/getEvents?typeFilter=" + checkedFilters;
        //separate cases for displaying different sets of events
        if (settings[prefix + "sel_recent"] == true) {
            var typeQuery = "";
            var maxElemName = EventView.idbase + "controls_max_events";
            var maxEvents = EventView.controlSettings[maxElemName]; 
        }
        else if (settings[prefix + "sel_since_id"] == true) {
            var sinceEvent   = EventView.idbase + "controls_events_id";
            var maxElemName1 = EventView.idbase + "controls_max_events";
            var maxElemName2 = EventView.idbase + "controls_num_events_id";
            var typeQuery = "&sinceEvent=" + EventView.controlSettings[sinceEvent];
            var maxEvents = Math.min(parseInt(EventView.controlSettings[maxElemName1]),
                                     parseInt(EventView.controlSettings[maxElemName2]));
            log(maxEvents);
        }
        else if (settings[prefix + "sel_since_time"] == true) {
            var sinceDate    = EventView.idbase + "controls_events_time";
            var maxElemName1 = EventView.idbase + "controls_max_events";
            var maxElemName2 = EventView.idbase + "controls_num_events_time";
            var typeQuery = "&sinceDate=" + EventView.controlSettings[sinceDate];
            var maxEvents = Math.min(parseInt(EventView.controlSettings[maxElemName1]),
                                     parseInt(EventView.controlSettings[maxElemName2])); 
        }
        else {return}
        var maxResults = "&maxResults=" + maxEvents;
        //construct query string and send to server
        query += maxResults + typeQuery;
        sortableManager.loadFromURL(query)
	},
    
	clearTable: function () {
        tab = document.getElementById("sortable_table");
        for (i=tab.rows.length-1;i>0;i--) {
            removeElement(tab.rows[i]);
        }
	},
    

    
    //features to add: highlight new rows, settings stored in cookies, autoload,
    //                 remove duplicate events?, max visible rows, max rows in table
};
addLoadEvent(EventView.getFilterElems);
addLoadEvent(EventView.insertCurrentTime);


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
        
        // set up the data anchors to do loads
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
        this.loadFromURL("event/getEvents?typeFilter=RoofEvent&maxResults=200");
    },
   
    
    "loadFromURL": function (url) {
        log('loadFromURL', url);
        var d;
        if (this.deferred) {
            this.deferred.cancel();
        }       
        format = "json";
        d = loadJSONDoc(url)
        // keep track of the current deferred, so that we can cancel it
        this.deferred = d;
        var self = this;
        // on success or error, remove the current deferred because it has
        // completed, and pass through the result or error
        d.addBoth(function (res) {
            self.deferred = null; 
            log('Events received from server.  Inserting into Event View table.');
            //log(res);
            return res;
        });
        // on success, tag the result with the format used so we can display it
        d.addCallback(function (res) {
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
        //log("dir(data) = " + dir(data));
        //log("data.columns = " + data.columns);
        //log("data.format  = " + data.format);
        //log("data.rows    = " + data.rows);
        var domains = [];
        var rows = data.rows;
        var cols = data.columns;
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
            this.data['rows'] += ','+data['rows'];
        }
        // perform a sort and display based upon the previous sort state,
        // defaulting to an ascending sort if this is the first sort
        var order = this.sortState[this.sortkey];
        if (typeof(order) == 'undefined') {
            order = false;
        }
        this.drawSortedRows(this.sortkey, order, false);
    },
   
    "onSortClick": function (name) {
        // save ourselves from doing a bind
        var self = this;
        // on click, flip the last sort order of that column and sort
        return function () {
            //log('onSortClick', name);
            var order = self.sortState[name];
            if (typeof(order) == 'undefined') {
                // if it's never been sorted by this column, sort descending
                order = false;
            } else if (self.sortkey == name) {
                // if this column was sorted most recently, flip the sort order
                order = !((typeof(order) == 'undefined') ? false : order);
            }
            self.drawSortedRows(name, order, true);
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
            col.onmouseout = mouseOutFunc;
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
        //var domains = this.data.domains;
        var domains = this.data.domains;
        //log("domains.length="+domains.length);
        //log("this.data.rows.split(',').length/3="+this.data.rows.split(',').length/this.data.columns.length);
        if (this.initial_flag == true) {
            this.initial_flag = false;
        }
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
            //log('template', i, template);
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

