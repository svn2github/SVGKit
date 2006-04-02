var setiEvent = {
    base:  "/expt/",
    idbase: "seti_event_",
    rows:    4,
    columns: 8,
    plotWidth:  80,
    plotHeight: 60,
    
    clearView: function () {
        //plotTableElem = $(setiEvent.idbase+'plot_table');
        for (j=0; j<8; j++) {
            for (i=0; i<8; i++){
                currentCell = $(setiEvent.idbase+'plot_'+i+"_"+j);
                currentCell.innerHTML = "";
            }
        }
    },
    
    setView: function() {
        setiEvent.columns = getElement(document.forms[this.idbase].elements['set_columns']).value
        setiEvent.rows    = getElement(document.forms[this.idbase].elements['set_rows']).value
        setiEvent.clearView();
        if      (setiEvent.columns == 1) {setiEvent.plotWidth = 640}
        else if (setiEvent.columns == 2) {setiEvent.plotWidth = 320}
        else if (setiEvent.columns == 4) {setiEvent.plotWidth = 160}
        else if (setiEvent.columns == 8) {setiEvent.plotWidth = 80}        
        setiEvent.plotHeight = setiEvent.plotWidth * 3/4;
        var blankImg = IMG( {'src':'/static/images/blank_'+
                                    setiEvent.plotWidth+'x'+
                                    setiEvent.plotHeight+'.png'} );
        for (j=0; j<setiEvent.rows; j++) {
            for (i=0; i<setiEvent.columns; i++){
                var blankImg = IMG( {'src':'/static/images/blank_'+
                                            setiEvent.plotWidth+'x'+
                                            setiEvent.plotHeight+'.png'} );
                currentCell = $(setiEvent.idbase+'plot_'+i+"_"+j);
                currentCell.appendChild(blankImg);
            }
        }
    },
};

