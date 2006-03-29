var ObsSvg = {

    roof_base: '/roof/',
    roof_idbase: 'roof_',
    tele_base: '/telescope/',
    tele_idbase: 'telespope_',
    obsSvgs: [],

    addObs: function (name) {
        ObsSvg.obsSvgs.push(document.getElementById(name).contentDocument);
        log("Initializing observatory svg " + name);
    },
    
    translateRoof: function (percentOpen) {
        for (i=0; i<ObsSvg.obsSvgs.length; i++) {
            var roof = ObsSvg.obsSvgs[i].getElementById("roof");
            roof.setAttribute("transform", 'translate(' + 290*(1-percentOpen/100) + ',0)' );
        }
    },
    
    rotateTelescope: function (degrees) {
    	// You have to rotate the telescope down from the vertical, 
	    // but we always store and pass in degrees up from the horizontal.
        var transform  = 'translate(535,210) rotate(' + (90-degrees) + ') translate(-535,-210)';
        
        for (i=0; i<ObsSvg.obsSvgs.length; i++) {
            var telescope = ObsSvg.obsSvgs[i].getElementById("telescope");
            telescope.setAttribute("transform", transform);
        }
    },
    
    rotateTelescopeDeclination: function (declination) {
        var degrees  = (parseFloat(declination) + 42.5);
        ObsSvg.rotateTelescope(degrees) ;
    },

};
