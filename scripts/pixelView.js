var PixelView = {
    base:  "/pixel_view/",
    idbase: "pixel_view_",
    parameter_list: ["SETI_status",
                     "SETI_history",
                     "astro_status",
                     "astro_count_rates",
                     "astro_history",
                     "instrument_highlight"],

    loadParameters: function(selection) {
        forEach(PixelView.parameter_list, 
            function(param) {
                elem_id = PixelView.idbase + "parameters_" + param;
                parameter_div = document.getElementById(elem_id);
                addElementClass(parameter_div, "invisible");
            }
        );
        elem_id = PixelView.idbase + "parameters_" + selection;
        parameter_div = document.getElementById(elem_id);
        removeElementClass(parameter_div, "invisible");
    },

};
