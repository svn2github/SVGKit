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
              "instrument_debugging_snake"],
               
    SETI_status_values:      ["Not Programmed", 
                              "Reset", 
                              "Programmed", 
                              "Coincidence Waiting", 
                              "Coincidence Read"  ],
    SETI_status_colors:      [ 0, 1, 2, 3, 4 ], 
    astro_status_values:     ["Not Programmed", 
                              "Reset", 
                              "Programmed", 
                              "Counters Started", 
                              "Counters Stopped",
                              "Counters Read" ],
    astro_status_colors:     [ 0, 1, 2, 3, 4, 5 ], 
    threshold_level_values:  [ "0", "1", "2", "3", "4", "5", "6" ],
    threshold_level_colors:  [ 0, 1, 2, 3, 4, 5, 6 ], 
    enabled_values:          [ "Disabled", "Enabled" ],
    enabled_colors:          [ 2, 3 ], 
    pulsenet_pixel_values:   [ "0",  "1",  "2",  "3",  "4",  "5",  "6",  "7",  
                               "8",  "9", "10", "11", "12", "13", "14", "15" ],
    pulsenet_pixel_colors:   [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
    
    
    loadParameters: function(selection) {
        //clear previous key div & SVG display
        PMT.all(0);
        PixelView.clearParameterDivs(selection);
        //display new parameter div
        elem_id = PixelView.idbase + "parameters_" + selection;
        parameter_div = document.getElementById(elem_id);
        removeElementClass(parameter_div, "invisible");
    },

    clearParameterDivs: function(selection) {
        //clear previous parameter div
        forEach(PixelView.parameterList, 
            function(param) {
                elem_id = PixelView.idbase + "parameters_" + param;
                parameter_div = document.getElementById(elem_id);
                addElementClass(parameter_div, "invisible");
            }
        );
    },

    loadKeys: function(selection) {
        //clear previous key div & SVG display
        PMT.all(0);
        PixelView.clearKeyDivs(selection);
        //display new key div
        elem_id = PixelView.idbase + "key_" + selection;
        key_div = document.getElementById(elem_id);
        removeElementClass(key_div, "invisible");
        //start new SVG display & insert new key content (if necessary)
        if      (selection == "none") {}
        else if (selection == "SETI_status_status") {
            PMT.setAllWithOptions("PN", "SETI", "programmingStatus",  selection, 
                                  PixelView.SETI_status_values, 
                                  PixelView.SETI_status_colors);
        }
        else if (selection == "SETI_status_threshold_level") {
            PMT.setAllWithOptions("PN", "SETI", "thresholdVrefNumber",  selection, 
                                  PixelView.threshold_level_values, 
                                  PixelView.threshold_level_colors);
        }
        else if (selection == "SETI_status_threshold_voltage")  {}
        else if (selection == "SETI_status_veto")               {
            PMT.setAllWithOptions("PN", "SETI", "vetoMode", selection, 
                                  PixelView.enabled_values, 
                                  PixelView.enabled_colors);
        }
        else if (selection == "SETI_status_clockhalf")          {
            PMT.setAllWithOptions("PN", "SETI", "clockHalfMode", selection, 
                                  PixelView.enabled_values, 
                                  PixelView.enabled_colors);
        }
        else if (selection == "SETI_status_coincblock")         {
            PMT.setAllWithOptions("PN", "SETI", "coincBlock", selection,
                                  PixelView.enabled_values, 
                                  PixelView.enabled_colors);
        }
        else if (selection == "astro_status_status")            {
            PMT.setAllWithOptions("PN", "Astro", "programmingStatus",  selection, 
                                  PixelView.astro_status_values, 
                                  PixelView.astro_status_colors);
        }
        else if (selection == "astro_status_threshold_level")   {
            PMT.setAllWithOptions("PN", "Astro", "thresholdVrefNumber",  selection, 
                                  PixelView.threshold_level_values, 
                                  PixelView.threshold_level_colors);
        }
        else if (selection == "astro_status_threshold_voltage") {}
        else if (selection == "astro_status_pixel")             {
            PMT.setAllWithOptions("PN", "Astro", "pixelAddress",  selection, 
                                  PixelView.pulsenet_pixel_values, 
                                  PixelView.pulsenet_pixel_colors);
        }
        else if (selection == "instrument_highlight_SETI_uC")   {}
        else if (selection == "instrument_highlight_astro_uC")  {}
        else if (selection == "instrument_highlight_pulsenet")  {}
        else if (selection == "instrument_highlight_4color")    {}
        else if (selection == "instrument_debugging_snake")     {
            PMT.snake();
        }
    },

    clearKeyDivs: function(selection) {
        forEach(PixelView.keyList,
            function(key) {
                elem_id = PixelView.idbase + "key_" + key;
                key_div = document.getElementById(elem_id);
                addElementClass(key_div, "invisible");
            }
        );
    },
    
    makeDiscreteKey: function (selection, valueArray, colorArray) {
        var rows = [];
        for (i=0; i<valueArray.length; i++) {
            var tdColor = TD({ "style" : {"backgroundColor" : PMT.color[colorArray[i]], 
                                          "width"   : "12px", 
                                          "height"  : "12px",
                                          "border"  :  "0px",
                                          "padding" :  "0px",
                                          "margin"  : "-2px" } }, null);
            var tdKey   = TD({ "style" : {"height"  : "12px", 
                                          "border"  :  "0px",
                                          "padding" : "0px", 
                                          "margin" : "-2px" } }, valueArray[i]);
            rows[i]   = TR(null, [tdColor, tdKey] );
        }
        var newTable = TABLE(null, TBODY(null, rows));
        elem_id = PixelView.idbase + "key_" + selection;
        document.getElementById(elem_id).innerHTML = toHTML(newTable);
    },
};

//IDEAS:
//* highlight pixel for the coincidence plot you're looking at
//* clickable pixel map?: PulseNet#, uC#, plots of coincidences



//  PixelView.makeDiscreteKey("SETI_status_veto", PixelView.enabled_values, PMT.color)
