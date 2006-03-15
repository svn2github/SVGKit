var obsSvg = {

    roof_base: '/roof/',
    roof_idbase: 'roof_',
    tele_base: '/telescope/',
    tele_idbase: 'telespope_',
    obsSvg1: [],

    init: function () {
        obsSvg.obsSvg1 = document.getElementById("obsSvg1").contentDocument ;
    },

    translateRoof: function (percentOpen) {
        var roof = document.getElementById("obsSvg1").contentDocument.getElementById("roof");
        roof.setAttribute("transform", 'translate(' + 290*(1-percentOpen/100) + ',0)' );
    },
    
    rotateTelescope: function (degrees) {
        var telescope = document.getElementById("obsSvg1").contentDocument.getElementById("telescope");
        var transform = 'translate(535,210) rotate(' + degrees + ') translate(-535,-210)';
        telescope.setAttribute("transform", transform);
    },

    rotateTelescopeDeclination: function (declination) {
        var degrees = 90.0 - (declination + 42.5);
        obsSvg.rotateTelescope(degrees) ;
    },

};

addLoadEvent(function() {obsSvg.init});