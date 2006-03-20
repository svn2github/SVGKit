var PixelView = {
    base:  "/pixel_view/",
    idbase: "pixel_view_",
    parameterList: ["SETI_status",
                    "SETI_history",
                    "astro_status",
                    "astro_count_rates",
                    "astro_history",
                    "instrument_highlight",
                    "instrument_debugging",
                    "none"],
    keyList: ["none",
              "SETI_status_status",
              "SETI_status_threshold_level",
              "SETI_status_threshold_voltage",
              "SETI_status_veto",
              "SETI_status_clockhalf",
              "SETI_status_coincblock",
              "astro_status_status",
              "astro_status_threshold_level",
              "astro_status_threshold_voltage",
              "astro_status_pixel",
              "instrument_highlight_SETI_uC",
              "instrument_highlight_astro_uC",
              "instrument_highlight_pulsenet",
              "instrument_highlight_4color",
              "instrument_debugging_snake",
              "discrete",
              "continuous"],
               
    SETI_status_values:      ["Not Programmed", 
                              "Reset", 
                              "Programmed", 
                              "Coincidence Waiting", 
                              "Coincidence Read"  ],
    SETI_status_colors:      [ 5, 2, 1, 0, 3 ], 
    astro_status_values:     ["Not Programmed", 
                              "Reset", 
                              "Programmed", 
                              "Counters Started", 
                              "Counters Stopped",
                              "Counters Read" ],
    astro_status_colors:     [ 5, 2, 3, 1, 0, 12 ], 
    threshold_level_values:  [ "0", "1", "2", "3", "4", "5", "6" ],
    threshold_level_colors:  [ 0, 1, 2, 3, 4, 5, 6 ], 
    enabled_values:          [ "Disabled", "Enabled" ],
    enabled_colors:          [ 0, 1 ], 
    pulsenet_pixel_values:   [ "0",  "1",  "2",  "3",  "4",  "5",  "6",  "7",  
                               "8",  "9", "10", "11", "12", "13", "14", "15" ],
    pulsenet_pixel_colors:   [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
    SuC_values:              [ "0", "1", "2", "3", "4", "5", "6", "7" ],
    SuC_colors:              [ 0, 1, 2, 3, 4, 5, 6, 7 ],
    AuC_values:              [ "8", "9", "10", "11" ],
    AuC_colors:              [ 0, 1, 2, 3 ],
    PN_values:               [  "0",  "1",  "2",  "3",  "4",  "5",  "6",  "7",  
                                "8",  "9", "10", "11", "12", "13", "14", "15",
                               "16", "17", "18", "19", "20", "21", "22", "23",  
                               "24", "25", "26", "27", "28", "29", "30", "31" ],
    PN_colors:               [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
                               16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31 ],
    FCT_values:              [ "0", "1", "2", "3" ],
    FCT_colors:              [ 3, 2, 1, 0 ],
    
    
    loadParameters: function(selection) {
        //clear previous key div & SVG display
        PMT.all(1);
        PixelView.clearParameterDivs(selection);
        //display new parameter div
        var elem_id = PixelView.idbase + "parameters_" + selection;
        var parameter_div = document.getElementById(elem_id);
        removeElementClass(parameter_div, "invisible");
    },

    clearParameterDivs: function(selection) {
        //clear previous parameter div
        forEach(PixelView.parameterList, 
            function(param) {
                var elem_id = PixelView.idbase + "parameters_" + param;
                var parameter_div = document.getElementById(elem_id);
                addElementClass(parameter_div, "invisible");
            }
        );
    },

    loadKeys: function(selection) {
        //clear previous key div & SVG display
        PMT.all(1);
        PixelView.clearKeyDivs(selection);
        //display new key div
        var elem_id = PixelView.idbase + "key_" + selection;
        var key_div = document.getElementById(elem_id);
        removeElementClass(key_div, "invisible");
        //start new SVG display & insert new key content (if necessary)
        if      (selection == "none") {}
        else if (selection == "SETI_status_status") {
            PMT.setAllDiscrete("SETI", "programmingStatus",  selection, 
                               PixelView.SETI_status_values, 
                               PixelView.SETI_status_colors);
        }
        else if (selection == "SETI_status_threshold_level") {
            PMT.setAllDiscrete("SETI", "thresholdVrefNumber",  selection, 
                               PixelView.threshold_level_values, 
                               PixelView.threshold_level_colors);
        }
        else if (selection == "SETI_status_threshold_voltage")  {
            PMT.setAllContinuous("SETI", 0, 2.5);
        }
        else if (selection == "SETI_status_veto")               {
            PMT.setAllDiscrete("SETI", "vetoMode", selection, 
                               PixelView.enabled_values, 
                               PixelView.enabled_colors);
        }
        else if (selection == "SETI_status_clockhalf")          {
            PMT.setAllDiscrete("SETI", "clockHalfMode", selection, 
                               PixelView.enabled_values, 
                               PixelView.enabled_colors);
        }
        else if (selection == "SETI_status_coincblock")         {
            PMT.setAllDiscrete("SETI", "coincBlock", selection,
                               PixelView.enabled_values, 
                               PixelView.enabled_colors);
        }
        else if (selection == "astro_status_status")            {
            PMT.setAllDiscrete("Astro", "programmingStatus",  selection, 
                               PixelView.astro_status_values, 
                               PixelView.astro_status_colors);
        }
        else if (selection == "astro_status_threshold_level")   {
            PMT.setAllDiscrete("Astro", "thresholdVrefNumber",  selection, 
                               PixelView.threshold_level_values, 
                               PixelView.threshold_level_colors);
        }
        else if (selection == "astro_status_threshold_voltage") {
            PMT.setAllContinuous("Astro", 0, 2.5);
        }
        else if (selection == "astro_status_pixel")             {
            PMT.setAllDiscrete("Astro", "pixelAddress",  selection, 
                               PixelView.pulsenet_pixel_values, 
                               PixelView.pulsenet_pixel_colors);
        }
        else if (selection == "instrument_highlight_SETI_uC")   {
            PMT.setAllDiscrete("SuC", null,  selection, 
                               PixelView.SuC_values, 
                               PixelView.SuC_colors);
        } 
        else if (selection == "instrument_highlight_astro_uC")  {
            PMT.setAllDiscrete("AuC", null,  selection, 
                               PixelView.AuC_values, 
                               PixelView.AuC_colors);
        } 
        else if (selection == "instrument_highlight_pulsenet")  {
            PMT.setAllDiscrete("PN", null,  selection, 
                               PixelView.PN_values, 
                               PixelView.PN_colors);
        } 
        else if (selection == "instrument_highlight_4color")    {
            PMT.setAllDiscrete("FCT", null,  selection, 
                               PixelView.FCT_values, 
                               PixelView.FCT_colors);
        } 
        else if (selection == "instrument_debugging_snake")     {
            PMT.snake();
        }
    },

    clearKeyDivs: function(selection) {
        forEach(PixelView.keyList,
            function(key) {
                var elem_id = PixelView.idbase + "key_" + key;
                var key_div = document.getElementById(elem_id);
                addElementClass(key_div, "invisible");
            }
        );
    },
    
    makeDiscreteKey: function (selection, valueArray, colorArray) {
        var rows = [];
        if  (valueArray.length <= 16) {
            for (i=0; i<valueArray.length; i++) {
               var tdColor = PixelView.keyTD("color", PMT.color[colorArray[i]]);
               var tdKey   = PixelView.keyTD("key",   valueArray[i]);
               rows[i]     = TR(null, [tdColor, tdKey]);
            }
        }
        else {
            for (i=0; i<valueArray.length/2; i++) {
               var tdColor1 = PixelView.keyTD("color", PMT.color[colorArray[i]]);
               var tdColor2 = PixelView.keyTD("color", PMT.color[colorArray[i+valueArray.length/2]]);
               var tdKey1   = PixelView.keyTD("key",   valueArray[i]);
               var tdKey2   = PixelView.keyTD("key",   valueArray[i+valueArray.length/2]);
               var tdSpacer = TD( { "style" : {"width" : "8px"} }, null);
               rows[i]      = TR(null, [tdColor1, tdKey1, tdSpacer, tdColor2, tdKey2]);
            }
        }
        var newTable = TABLE(null, TBODY(null, rows));
        var elem_id = PixelView.idbase + "key_" + selection;
        document.getElementById(elem_id).innerHTML = toHTML(newTable);
    },

    keyTD: function (type, value) {
        if (type == "color") {
            var mytd = TD({ "style" : {"backgroundColor" : value, "width"   : "12px", 
                                       "height"  : "12px",        "border"  :  "0px", 
                                       "padding" :  "0px",        "margin"  : "-2px" } }, null);
        }
        else if (type == "key") {
            var mytd = TD({ "style" : {"height"  : "12px", "border" :  "0px", 
                                       "padding" : "0px",  "margin" : "-2px" } }, value);
        }
        return mytd
    },
    
    
    
};

//IDEAS:
//* highlight pixel for the coincidence plot you're looking at
//* clickable pixel map?: PulseNet#, uC#, plots of coincidences

