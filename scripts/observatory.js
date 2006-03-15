var ObsSvg = {

    roof_base: '/roof/',
    roof_idbase: 'roof_',
    tele_base: '/telescope/',
    tele_idbase: 'telespope_',
    obsSvg1: [],
    obsSvg2: [],

    init: function () {
        ObsSvg.obsSvg1 = document.getElementById("obsSvg1").contentDocument;
        ObsSvg.obsSvg2 = document.getElementById("obsSvg2").contentDocument;
        log("Initializing observatory svgs.");
    },

    translateRoof: function (percentOpen) {
        var roof1 = document.getElementById("obsSvg1").contentDocument.getElementById("roof");
        var roof2 = document.getElementById("obsSvg2").contentDocument.getElementById("roof");
        roof1.setAttribute("transform", 'translate(' + 290*(1-percentOpen/100) + ',0)' );
        roof2.setAttribute("transform", 'translate(' + 290*(1-percentOpen/100) + ',0)' );
    },
    
    rotateTelescope: function (degrees) {
        var telescope1 = document.getElementById("obsSvg1").contentDocument.getElementById("telescope");
        var telescope2 = document.getElementById("obsSvg2").contentDocument.getElementById("telescope");
        var transform  = 'translate(535,210) rotate(' + degrees + ') translate(-535,-210)';
        telescope1.setAttribute("transform", transform);
        telescope2.setAttribute("transform", transform);
    },

    rotateTelescopeDeclination: function (declination) {
        var degrees = 47.5 - declination; // = 90 - (declination - latitude)
        ObsSvg.rotateTelescope(degrees) ;
    },

};

addLoadEvent(function() {ObsSvg.init});