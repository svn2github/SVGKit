

var testFunctions = {
    'CSV' : function(p) {
        csv = $("csv_input").value;
        table = SVGPlot.CSV.parseCSV(csv);
        table = p.transpose(table);
        p.plot(table[0], table[1]);
        p.render();
    }
}

type = 'plot'
