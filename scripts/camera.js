var Camera = {
    base: "/cameras/",
    idbase: "camera_",
    
    bigIndex: -1,
    
    hideDeferred: null,
    
    grabImage: function(which) {
        log("Camera: grabbing " + which)
        deferred = loadJSONDoc(Camera.base + "webCapture?which=" + which);
        if(which == "all") {
            which = [0, 1, 2, 3];
        }
        
        deferred.addCallback(function(files) {
            if(typeof(files) == "string") {
                // error
                // nothing to do for now
                return;
            }
            
            for(i in files) {
                idx = files[i].idx;
                file = files[i].file;
                img = getElement(Camera.idbase + "image_" + idx);
                img.src = file;
                if(Camera.bigIndex == idx) {
                    bigimg = getElement(Camera.idbase + "big_image");
                    bigimg.src = file;
                }
            }
        });
        deferred.addErrback(function(err) {
            log("Camera: error grabbing images (" + err + ")");
        });
    },
    
    setBigImage: function(idx) {
        if(Camera.hideDeferred != null) {
            Camera.hideDeferred.cancel();
            Camera.hideDeferred = null;
        }
        img = getElement(Camera.idbase + "image_" + idx);
        bigimg = getElement(Camera.idbase + "big_image");
        bigimg.src = img.src;
        removeElementClass(bigimg, "invisible");
        Camera.bigIndex = idx;
    },
    
    unsetBigImage: function(idx) {
        log("unset " + idx);
        if(Camera.bigIndex != idx) return;
        Camera.bigIndex = -2;
        if(Camera.hideDeferred != null) {
            Camera.hideDeferred.cancel();
            Camera.hideDeferred = null;
        }
        Camera.hideDeferred = callLater(0.5, function() {
            log("unsetting now");
            if(Camera.bigIndex == -2) {
                log("really unsetting");
                bigimg = getElement(Camera.idbase + "big_image");
                addElementClass(bigimg, "invisible");
            }
        });
    },
};
