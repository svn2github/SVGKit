/***
SVGPlot 0.1

See <http://svgkit.sourceforge.net/> for documentation, downloads, license, etc.

(c) 2006 Jason Gallicchio.  All rights Reserved.

Utilities for handling dates, times, 
datetime stamps, and time intervals

Some JavaScript Info:
    Date objects internally store the number of milliseconds since 
    the epoc midnight Jan 1, 1970 GMT
    
    You can make a new Date object representing the epoc
    d = new Date(0)
    d.getHours()  will not return 0 for midnight unless you are in the GMT timezone
    
    JavaScript Date objects can be compared 
    (only greater than / less than not equal) to return true and false
    Dates can be subtracted to give a difference in ms, 
    d.getTime() returns milliseconds since midnight Jan 1, 1970
    d.setTime(ms) sets the time in ms since 1970
    GMT-0400 (Eastern Daylight Time)
    GMT-0500 (Eastern Standard Time)
    What about daylight savings time?  Repeat the same time-chunk twice?
    American style 1/17/2007 versus european style 17-1-2007 vs ordered 2007-01-17
    d.getTimezoneOffset() difference in minutes between local time and Greenwich Mean Time (GMT)
    Input timezone: included with each stamp, assume GMT, assume local (what about daylight?)
    Output timezone: show as UTC, show as local (what about daylight savings?)
        
***/


SVGPlot.DateTime = {
    /***
        These codes are chosen to eliminate ambiguity when parsing a formatting string
        The thing I don't like about this are the mintes being n's rather than m's,
        but I don't know how to encode both single-digit months and single-leter months
        unless I use a different letter for minutes.  Other systems which use
        capital M for months and lowercase m for minutes can't have single letter months
        Maybe 'Month' and 'Mon' and 'Mo' cold be the codes for the named months
        
        Everything that's not a format code is just passed, but try to use only
        standard things like '-', '/', ':', ' ', otherwise new formatting codes will break
        
        Right now intervals don't work.  There should be a distinction between
        the interval '12 minutes, 34 seconds, 567 ms' and 
        the absolute datetime '1970-01-01 00:12:34.567'
        
        If there is an 'elapsed time' code like 'dddd', 'hhh', 'nnn', 'sss', or 'uuuuu'
        The date is treated as an elapsed time and reported as such.
        
        yyyy = numeric year
        yy = numeric year 00-99
        Mmmm = full month e.g. January (use mmmm for january)
        Mmm = three-character month e.g. Jan (use MMM for JAN or mmm for jan)
        mm = numeric month 01-12
        m = one or two digit month 1/23 or 12/23
        M = one character month (upper case) : J F M A M J J A S O N D
        dddd = days of elapsed time (no limit)
        ddd = days since begining of given year
        dd = numeric day 01-31
        d = numeric day 1-31
        f = fraction of a day. Use ff, fff, or ffff for more digits
        Wwww = Full weekday
        Www = three character weekday (use Www or WWW for capitalized)
        Ww = Two characters (Su, Mo, Tu, We, Th, Fr, Sa)
        w = single character weekday (use W for capitalized)  (SMTWTFS)
        r = 1, 2, 3 or 4 (quarter year notations)
        q = the letter q or Q (quarter year notations)
        
        hhh = hours of elapsed time, no upper limit
        hh = hours, 00 to 24 (00 to 11 for am/pm notation)
        h = hours, 0 to 24, (0 to 11 for am/pm notation)
        nnn = minutes of elapsed time  895:43.4
        nn = minute 00 to 59
        n = minute 0 to 59
        sss = seconds of elapsed time
        ss = second 00 to < 60
        s = second 0 to < 60
        uuuuu = total number of miliseconds (since 1970)
        u = miliseconds use uu, uuu, or uuuu for more digits
        aa = am/pm  AA for AM/PM  (12AM midnight and 12PM noon)
        a = a/p  A for A/P (Some formatters use tt or p)
        
        zzzz = Time zone offset (returns 0500 for Eastern Standard Time)
        z = Time Zone offset in minutes
        zz 	Timezone offset, 2 digits 	{0:zz} 	-05
        zzz 	Full timezone offset 	{0:zzz} 	-05:00
        
        gg = Era with periods (A.D.)
        g = Era no periods (AD)
        
        missing:  week in year (Ambiguity between starting on Sunday or Monday)
                  and week in month (for 2nd Tuesday in May)
    ***/
    months : [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    days : [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],
    milliseconds : {
        'millisecond' : 1,
        'scond'       : 1000,
        'minute'      : 1000*60,
        'hour'        : 1000*60*60,
        'day'         : 1000*60*60*24,
        'week'        : 1000*60*60*24*7,
        'month'       : 1000*60*60*24*7*30,
        'year'        : 1000*60*60*24*7*365
    },
    fields : [ // These are prepended with 'get', 'set', 'getUTC', or 'setUTC' to access JS Date object
        'FullYear', 
        'Month', 
        'Date', 
        'Hours', 
        'Minutes' , 
        'Seconds', 
        'Milliseconds' 
    ],
    format : function(date, code, output_utc /* = false */) {
        /***
            Takes a JavaScript Date object and a format code like 'yyyy-mm-dd'
            and returns a string that is a formated version of the information in date
        
            If output_utc is set, dates and times will be reported in UTC,
            otherwise in the local timezone
            
            If date is a number, assume it's milliseconds since the epoc GMT
        ***/
        if (typeof(date) == "number")
            date = new Date(date)
            
        output_utc = SVGKit.firstNonNull(output_utc, false)
        
        // If the format code includes an 'interval' character,
        // we must treat count hours, days, etc as if they were UTC
        if ( code.indexOf('dddd') != -1 || 
             code.indexOf('hhh') != -1 || 
             code.indexOf('nnn') != -1 || 
             code.indexOf('sss') != -1 || 
             code.indexOf('uuuuu') != -1 )
            output_utc = true
        
        // String to be added to getters and setters if UTC is requested
        var utc = output_utc ? 'UTC' : ''
    
        var pad = function(number, digits) {
            // Returns a string that represents number, possily padded 
            // with zeros to make a string of length digits
            var str = '' + number
            while (str.length < digits)
                str = '0' + str
            return str
        }
        
        // Short names for these items
        var c = code
        var d = date
        var ms = this.milliseconds
        var m = this.months
        var w = this.days;
        
        var year = d['get'+utc+'FullYear']()  // four digit year
        var mon = d['get'+utc+'Month']()  // from 0-11
        var date = d['get'+utc+'Date']()  // from 1-31
        var day = d['get'+utc+'Day']()     // from 0-6
        var hrs = d['get'+utc+'Hours']()  // from 0-23
        var min = d['get'+utc+'Minutes']()  // from 0-59
        var sec = d['get'+utc+'Seconds']()  // from 0-59
        var ms = d['get'+utc+'Milliseconds']()  // from 0-999
        var z = d.getTimezoneOffset()
        
        var dcpy = new Date(d.getTime()) // A temporary copy to modify
        dcpy.setFullYear(1970)
        
        var f = (d.getTime() % ms['day'])/ms['day']  // Fraction of a day
        var u = (d.getTime() % ms['second'])/ms['second']  // Fraction of a second
        
       
        // Do the AM/PM thing
        var aa = hrs < 12 ? 'AM' : 'PM'
        var a = hrs < 12 ? 'A' : 'P'
        // If the format code includes an AM/PM designator, the hour must be changed
        if (c.indexOf('a') >= 0 || c.indexOf('A') >= 0) {
            if (hrs > 12)
                hrs = hrs-12;
            if (hrs == 0)
                hrs = 12;
        }
        
        var replacements = [
            // Note that order can't be changed -- longer strings must be replaced first
            ['yyyy', ''+year ],
            ['yy', pad(year%100, 2) ],
        
            ['Mmmm', m[mon] ],
            ['mmmm', m[mon].toLowerCase() ],
            ['MMMM', m[mon].toUpperCase() ],
            ['Mmm', m[mon].substr(0,3) ],
            ['mmm', m[mon].substr(0,3).toLowerCase() ],
            ['MMM', m[mon].substr(0,3).toUpperCase() ],
            ['mm', pad(mon+1,2)  ],
            ['m', ''+(mon+1)  ],
            ['M', m[mon].substr(0,1) ],
        
            ['r', ''+(Math.floor(mon/4)+1) ],
        
            ['dddd', Math.floor((d.getTime())/ms['day']) ],
            ['ddd', Math.floor((dcpy.getTime())/ms['day']) ],
            ['dd', pad(date,2)  ],
            ['d', ''+date  ],
            ['ffff', pad(10000*f, 4)  ],
            ['fff', pad(1000*f, 3)  ],
            ['ff', pad(100*f, 2)  ],
            ['f', pad(10*f, 1)  ],
        
            ['Wwww', w[day] ],
            ['wwww', w[day].toLowerCase() ],
            ['WWWW', w[day].toUpperCase() ],
            ['Www', w[day].substr(0,3) ],
            ['www', w[day].substr(0,3).toLowerCase() ],
            ['WWW', w[day].substr(0,3).toUpperCase() ],
            ['Ww', w[day].substr(0,2) ],
            ['ww', w[day].substr(0,2).toLowerCase() ],
            ['WW', w[day].substr(0,2).toUpperCase() ],
            ['w', w[day].substr(0,1).toLowerCase()  ],
            ['W', w[day].substr(0,1) ],
        
            ['hhh', Math.floor((dcpy.getTime())/ms['hour']) ],
            ['hh', pad(hrs,2)  ],
            ['h', ''+hrs  ],
        
            ['nnn', Math.floor((dcpy.getTime())/ms['minute']) ],
            ['nn', pad(min,2)  ],
            ['n', ''+min  ],
        
            ['sss', Math.floor((dcpy.getTime())/ms['second']) ],
            ['ss', pad(sec,2)  ],
            ['s', ''+sec  ],
      
            ['uuuuu', ''+d.getTime()  ],
            ['uuuu', pad(10000*u, 4)  ],
            ['uuu', pad(1000*u, 3)  ],
            ['uu', pad(100*u, 2)  ],
            ['u', pad(10*u, 1)  ],
        
            ['zzzz', ''+Math.floor(z/60)+''+(z%60) ],
            ['z', ''+z ],
            
            ['AA', aa ],
            ['aa', aa.toLowerCase() ],
            ['A', aa[0] ],
            ['a', aa[0].toLowerCase() ],
            
            ['gg', year >= 1 ? 'A.D.' : 'B.C.'],
            ['g', year >= 1 ? 'AD' : 'BC'],
        ]
        
        var result = ''
        // March through the format string.
        while (c != '') { 
            var replacement_made = false  // If nothing matches, copy one character
            for (var i=0; i<replacements.length; i++) {
                var pattern = replacements[i][0]
                var len = pattern.length
                var replacement = replacements[i][1]
                if (c.substring(0,len) == pattern) {
                    result = result + replacement
                    c = c.substring(len)
                    replacement_made = true
                }
            }
            if (replacement_made == false) {
                result = result + c[0]
                c = c.substring(1)
            }
        }
        return result
    },
    read : function(string, code) {
        /***
            Parse the string, returning a Date() object
            If no code is passed in, use a list of most likeley heuristics.
            These differ based on country.
            This uses the strings stored in months and days, so can be localized
        ***/
        return null
    },
    firstDifferent : function(start, end) {
        /***
           Pass in two date objects and get back an integer
           representing where the date objects start to differ
           as defined by the fields array:
           0 means FullYear, 1 means Month, ... 6 means Milliseocnds
        ***/
        for (var i=0; i<this.fields.length; i++) {
            var getter = 'get' + this.fields[i]
            if (start[getter]() != end[getter]()) {
                return i
            }
        }
        // The dates are the same
        return null
    },
    commonPart : function(start, end) {
        /***
        If passed '2006-01-23 8:30' and '2006-01-25 10:55', it will
        return 2006-01 indicating that the year and the month
        are the same, but things start to differ at the date
        
        If the years differ, this returns an empty string.
        
        This is used to label the whole axis with the 
        common part of a date range
        ***/
        // iso looks like "2007-01-27 2:23:36"
        var seperator = ['', '-', '-', ' ', ':', ':', '.']
        var result = ''
        var i = this.firstDifferent(start, end)
        for (var j=0; j<i; j++) {
            var getter = 'get' + this.fields[j]
            result += seperator[j]
            var value = '' + start[getter]()
            // Zero pad if necessary
            if (value.length == 1)
                result += '0'
            result += value
        }
        // If the common part was an hour, don't leave the hour dangling
        if (i==4)
            result += ':00'
        return result
    },
    roundDate : function(date, i, round_up /*=false*/) {
        /***
            Copy the date and round the date to the nearest 
            year/month/etc as defined by i.
            
            Pass it (2006-01-23 8:30, 2 (Date), 'down')
            and get back 2006-01-23 00:00
            
            Pass it (2006-01-23 8:30, 2 (Date), 'up')
            and get back 2006-01-24 00:00
        ***/
        round_up = SVGKit.firstNonNull(round_up, false);
        
        var iter = new Date(date.getTime())
        
        // Check to see if it's already rounded, in which case return it
        var rounded = true
        for (var j=i+1; j<this.fields.length; j++) {
            var getter = 'get' + this.fields[j]
            if (getter=='getDate')  // The dates go 1-31, the rest start at 0
                if (iter[getter]() != 1)
                    rounded = false
            else
                if (iter[getter]() != 0)
                   rounded = false
        }
        if (rounded)
            return iter
        
        // Zero out all shorter interval fields
        for (var j=i+1; j<this.fields.length; j++) {
            var setter = 'set' + this.fields[j]
            if (setter=='setDate')  // The dates go 1-31, the rest start at 0
                iter[setter](1)
            else
                iter[setter](0)
        }
        
        // If we're to round up, increment the i'th field by one 
        // (this could roll others, but that' okay and works in Firefox)
        if (round_up) {
            var getter = 'get' + this.fields[i]
            var setter = 'set' + this.fields[i]
            var value = iter[getter]()
            value += 1
            iter[setter](value)
        }
        return iter
    }
}


format_test = function() {
    var run = function(date, tests) {
        for (var i=0; i<tests.length; i++) {
            var code = tests[i][0]
            var goal = tests[i][1]
            var result = SVGPlot.DateTime.format(date, code)
            log("'"+code+"'", "want: '"+goal+"'", "got: '"+result+"'", goal==result)
        }
    }
    var date;
    
    date = isoTimestamp('1970-01-01 00:00:00')
    tests = [
        ['m/d', '1/1'],
        ['m/d/yy', '1/1/70'],
        ['mm/dd/yyyy', '01/01/1970'],
        ['dd-Mmm', '01-Jan'],
        ['dd-Mmm-yy', '01-Jan-70'],
        ['dd-Mmmm', '01-January'],
        ['Mmmm d, yyyy', 'January 1, 1970'],
        ['yyyy-mm-dd hh:nn:ss', '1970-01-01 00:00:00'],
        ['yyyy-mm-dd hh:nn:ss aa', '1970-01-01 12:00:00 am'],
        ['yyyy-mm-dd hh:nn:ss a', '1970-01-01 12:00:00 a'],
        ['M', 'J'],
        ['M-yy', 'J-70'],
        ['h:nna', '12:00a'],
        ['haa', '12am'],
        ['Wwww', 'Thursday'],  // The epoc was on a Thursday
        ['wwww', 'thursday'],
        ['Www', 'Thu'],
        ['www', 'thu'],
        ['Ww', 'Th'],
        ['ww', 'th'],
        ['W', 'T'],
        ['w', 't']
    ]
    run(date, tests)
    
    date = isoTimestamp('2006-04-05 15:02:01')
    tests = [
        ['m/d', '4/5'],
        ['m/d/yy', '4/5/06'],
        ['mm/dd/yyyy', '04/05/2006'],
        ['dd-Mmm', '05-Apr'],
        ['dd-Mmm-yy', '05-Apr-06'],
        ['dd-Mmmm', '05-April'],
        ['Mmmm d, yyyy', 'April 5, 2006'],
        ['yyyy-mm-dd hh:nn:ss', '2006-04-05 15:02:01'],
        ['yyyy-mm-dd hh:nn:ss aa', '2006-04-05 03:02:01 pm'],
        ['yyyy-mm-dd hh:nn:ss A', '2006-04-05 03:02:01 P'],
        ['M', 'A'],
        ['M-yy', 'A-06'],
        ['h:nna', '3:02p'],
        ['haa', '3pm'],
    ]
    run(date, tests)
    
    date = isoTimestamp('1988-12-31 00:02:01')
    tests = [
        ['m/d', '12/31'],
        ['m/d/yy', '12/31/88'],
        ['mm/dd/yyyy', '12/31/1988'],
        ['dd-Mmm', '31-Dec'],
        ['dd-Mmm-yy', '31-Dec-88'],
        ['dd-Mmmm', '31-December'],
        ['Mmmm d, yyyy', 'December 31, 1988'],
        ['yyyy-mm-dd hh:nn:ss', '1988-12-31 00:02:01'],
        ['yyyy-mm-dd hh:nn:ss aa', '1988-12-31 12:02:01 am'],
        ['yyyy-mm-dd hh:nn:ss a', '1988-12-31 12:02:01 a'],
        ['M', 'D'],
        ['M-yy', 'D-88'],
        ['h:nna', '12:02a'],
        ['haa', '12am'],
    ]
    run(date, tests)
    
    // Test the absolute days, hours, minutes, seconds, etc.  (the four letter codes)
}
//format_test()
