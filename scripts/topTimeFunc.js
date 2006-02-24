function topTimeFunc() {       
        topTimeRefresh = window.setTimeout( "topTimeFunc()", 1000 );       
        var dateToday = new Date();       
        $('top_time').innerHTML= toISOTimestamp(dateToday);    
        }
