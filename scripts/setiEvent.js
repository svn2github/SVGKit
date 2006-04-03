var setiEvent = {
    base:  "/expt/",
    idbase: "seti_event_",
    rows:    4,
    columns: 8,
    plotWidth:  600,
    plotHeight: 100,
    
    clearView: function () {
        //plotTableElem = $(setiEvent.idbase+'plot_table');
        for (i=0; i<8; i++) {
                currentCell = $(setiEvent.idbase+'plot_'+i);
                currentCell.innerHTML = "";
        }
    },
    
    setView: function() {
        setiEvent.clearView();
        setiEvent.rows = getElement(document.forms[this.idbase].elements['set_rows']).value
        setiEvent.plotHeight = setiEvent.plotWidth * 3/4;
        for (i=0; i<setiEvent.rows; i++) {
            var blankImg = IMG( {'src':'/static/images/blank_600x100.png'} );
            currentCell = $(setiEvent.idbase+'plot_'+i);
            currentCell.appendChild(blankImg);
        }
    },
};

