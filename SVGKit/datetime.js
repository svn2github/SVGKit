/***

datetime 0.1

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

assert = function(assertion) {
    if (!assertion) {
        log('An assertion failed!')
    }
}

datetime = {
    /***
        Output formatting:  yyyy-mm-dd hh:nn:ss.uuu
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
    
    /***
        .NET Formatting Patterns

        The following list shows the various patterns that can be used to
        convert the datetime object to custom formatted string. The patterns are
        case-sensitive; for example, "MM" is different from "mm".

        If the custom pattern contains white-space characters or characters
        enclosed in single quotation marks, the output string will also contain
        those characters. Characters not part of a format pattern or not format
        characters are reproduced 'as it is'.

        Pre-defined Format Patterns and Description (From the MSDN Documentation)


        d 	The day of the month. Single-digit days will not have a leading  zero. 
        dd 	The day of the month. Single-digit days will have a leading zero. 
        ddd 	The abbreviated name of the day of the week, as defined in AbbreviatedDayNames. 
        dddd 	The full name of the day of the week, as defined in DayNames. 
        M 	The numeric month. Single-digit months will not have a leading zero. 
        MM 	The numeric month. Single-digit months will have a leading zero. 
        MMM 	The abbreviated name of the month, as defined in AbbreviatedMonthNames. 
        MMMM 	The full name of the month, as defined in MonthNames. 
        y 	The year without the century. If the year without the century is less than 10, 
        		the year is displayed with no leading zero. 
        yy 	The year without the century. If the year without the century is less than 10, 
        		the year is displayed with a leading zero. 
        yyyy 	The year in four digits, including the century. 
        gg 	The period or era. This pattern is ignored if the date to be formatted does 
        		not have an associated period or era string. 
        h 	The hour in a 12-hour clock. Single-digit hours will not have a leading zero. 
        hh 	The hour in a 12-hour clock. Single-digit hours will have a leading zero. 
        H 	The hour in a 24-hour clock. Single-digit hours will not have a leading zero. 
        HH 	The hour in a 24-hour clock. Single-digit hours will have a leading zero. 
        m 	The minute. Single-digit minutes will not have a leading zero. 
        mm 	The minute. Single-digit minutes will have a leading zero. 
        s 	The second. Single-digit seconds will not have a leading zero. 
        ss 	The second. Single-digit seconds will have a leading zero. 
        f 	The fraction of a second in single-digit precision. The remaining digits are truncated. 
        ff 	The fraction of a second in double-digit precision. The remaining digits are truncated. 
        fff 	The fraction of a second in three-digit precision. The remaining digits are truncated. 
        ffff 	The fraction of a second in four-digit precision. The remaining digits are truncated. 
        fffff 	The fraction of a second in five-digit precision. The remaining digits are truncated. 
        ffffff 	The fraction of a second in six-digit precision. The remaining digits are truncated. 
        fffffff 	The fraction of a second in seven-digit precision. The remaining digits are truncated. 
        t 	The first character in the AM/PM designator defined in AMDesignator or PMDesignator, if any. 
        tt 	The AM/PM designator defined in AMDesignator or PMDesignator, if any. 
        z 	The time zone offset ("+" or "-" followed by the hour only). Single-digit hours will 
        		not have a leading zero. For example, Pacific Standard Time is "-8". 
        zz 	The time zone offset ("+" or "-" followed by the hour only). Single-digit hours 
        		will have a leading zero. For example, Pacific Standard Time is "-08". 
        zzz 	The full time zone offset ("+" or "-" followed by the hour and minutes). Single-digit 
        		hours and minutes will have leading zeros. For example, Pacific Standard Time is "-08:00". 
        : 	The default time separator defined in TimeSeparator. 
        / 	The default date separator defined in DateSeparator. 
        % c  	- Where c is a format pattern if used alone. The "%" character can be omitted if the 
        		format pattern is combined with literal characters or other format patterns. 
        \ c  	- Where c is any character. Displays the character literally. To display the backslash 
        		character, use "\\". 
                
                
        GNUPltot format:
            %f floating point notation
            %e or %E exponential notation; an ”e” or ”E” before the power
            %g or %G the shorter of %e (or %E) and %f
            %x or %X hex
            %o or %O octal
            %t mantissa to base 10
            %l mantissa to base of current logscale
            %s mantissa to base of current logscale; scientific power
            %T power to base 10
            %L power to base of current logscale
            %S scientific power
            %c character replacement for scientific power
            %P multiple of pi
            
        GNUPlot date/time format:
            %a abbreviated name of day of the week
            %A full name of day of the week
            %b or %h abbreviated name of the month
            %B full name of the month
            %d day of the month, 1–31
            %D shorthand for "%m/%d/%y"
            %H or %k hour, 0–24
            %I or %l hour, 0–12
            %j day of the year, 1–366
            %m month, 1–12
            %M minute, 0–60
            %p ”am” or ”pm”
            %r shorthand for "%I:%M:%S %p"
            %R shorthand for %H:%M"
            %S second, 0–60
            %T shorthand for "%H:%M:%S"
            %U week of the year (week starts on Sunday)
            %w day of the week, 0–6 (Sunday = 0)
            %W week of the year (week starts on Monday)
            %y year, 0-99
            %Y year, 4-digit
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
        formats = [
            'm/d/yyyy',
            'm/d/yy',
            'h:m'
        ]
        /*
            Look for the various items:
            Words are either weekdays, months, or timezones
            Things seperated by slashes or dashes are dates
            Things seperated by colons are times h:m or m:s
            Use valid ranges to determine month/day/year order ambiguity
            If ranges fail, favor either month first or day first
            
            How to tell intervals versus absolute date/times?
            Excel cheats and treats "5:04" as "1/0/1900 5:04 AM"
            using Jan-0 to mean "abstract time" 
            It treats 1/1 as "1/1/<current year>"
        */
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
    },
    
    
    /********************************************************
       The following are brutally ripped and translated from 
       Python's datetimemodule.c,comments and all
    ********************************************************/
    MINYEAR : 1,
    MAXYEAR : 9999,
     /* For each month ordinal in 1..12, the number of days in that month,
     * and the number of days before that month in the same year.  These
     * are correct for non-leap years only.
     */
    _days_in_month : [
    	0, /* unused; this vector uses 1-based indexing */
    	31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ],

    _days_before_month : [
    	0, /* unused; this vector uses 1-based indexing */
    	0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334
    ],

    /* year -> 1 if leap year, else 0. */
    is_leap : function(year)
    {
    	return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    },

    /* year, month -> number of days in that month in that year */

    days_in_month : function(year, month)
    {
    	assert(month >= 1);
    	assert(month <= 12);
    	if (month == 2 && datetime.is_leap(year))
    		return 29;
    	else
    		return datetime._days_in_month[month];
    },

    /* year, month -> number of days in year preceeding first day of month */
    days_before_month : function(year, month)
    {
    	var days;

    	assert(month >= 1);
    	assert(month <= 12);
    	days = datetime._days_before_month[month];
    	if (month > 2 && datetime.is_leap(year))
    		++days;
    	return days;
    },

    /* year -> number of days before January 1st of year.  Remember that we
     * start with year 1, so days_before_year(1) == 0.
     */
    days_before_year : function(year)
    {
    	var y = year - 1;
    	/* This is incorrect if year <= 0; we really want the floor
    	 * here.  But so long as MINYEAR is 1, the smallest year this
    	 * can see is 0 (this can happen in some normalization endcases),
    	 * so we'll just special-case that.
    	 */
    	assert (year >= 0);
    	if (y >= 0)
    		return y*365 + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400);
    	else {
    		assert(y == -1);
    		return -366;
    	}
    },

    /* Number of days in 4, 100, and 400 year cycles.  That these have
     * the correct values is asserted in the module init function.
     */
    DI4Y :   1461,	/* days_before_year(5); days in 4 years */
    DI100Y : 36524,	/* days_before_year(101); days in 100 years */
    DI400Y : 146097,	/* days_before_year(401); days in 400 years  */

    /* ordinal -> year, month, day, considering 01-Jan-0001 as day 1. */
    ord_to_ymd: function(dt, ordinal)
    {
        var year, month, day
    	var n, n1, n4, n100, n400, leapyear, preceding;

    	/* ordinal is a 1-based index, starting at 1-Jan-1.  The pattern of
    	 * leap years repeats exactly every 400 years.  The basic strategy is
    	 * to find the closest 400-year boundary at or before ordinal, then
    	 * work with the offset from that boundary to ordinal.  Life is much
    	 * clearer if we subtract 1 from ordinal first -- then the values
    	 * of ordinal at 400-year boundaries are exactly those divisible
    	 * by DI400Y:
    	 *
    	 *    D  M   Y            n              n-1
    	 *    -- --- ----        ----------     ----------------
    	 *    31 Dec -400        -DI400Y       -DI400Y -1
    	 *     1 Jan -399         -DI400Y +1   -DI400Y      400-year boundary
    	 *    ...
    	 *    30 Dec  000        -1             -2
    	 *    31 Dec  000         0             -1
    	 *     1 Jan  001         1              0          400-year boundary
    	 *     2 Jan  001         2              1
    	 *     3 Jan  001         3              2
    	 *    ...
    	 *    31 Dec  400         DI400Y        DI400Y -1
    	 *     1 Jan  401         DI400Y +1     DI400Y      400-year boundary
    	 */
    	assert(ordinal >= 1);
    	--ordinal;
    	n400 = Math.floor(ordinal / datetime.DI400Y);
    	n = ordinal % datetime.DI400Y;
    	year = n400 * 400 + 1;

    	/* Now n is the (non-negative) offset, in days, from January 1 of
    	 * year, to the desired date.  Now compute how many 100-year cycles
    	 * precede n.
    	 * Note that it's possible for n100 to equal 4!  In that case 4 full
    	 * 100-year cycles precede the desired day, which implies the
    	 * desired day is December 31 at the end of a 400-year cycle.
    	 */
    	n100 = Math.floor(n / datetime.DI100Y);
    	n = n % datetime.DI100Y;

    	/* Now compute how many 4-year cycles precede it. */
    	n4 = Math.floor(n / datetime.DI4Y);
    	n = n % datetime.DI4Y;

    	/* And now how many single years.  Again n1 can be 4, and again
    	 * meaning that the desired day is December 31 at the end of the
    	 * 4-year cycle.
    	 */
    	n1 = Math.floor(n / 365);
    	n = n % 365;

    	year += n100 * 100 + n4 * 4 + n1;
    	if (n1 == 4 || n100 == 4) {
    		assert(n == 0);
    		year -= 1;
    		month = 12;
    		day = 31;
            
            dt.year = year;
            dt.month = month;
            dt.day = day;
    		return;
    	}

    	/* Now the year is correct, and n is the offset from January 1.  We
    	 * find the month via an estimate that's either exact or one too
    	 * large.
    	 */
    	leapyear = n1 == 3 && (n4 != 24 || n100 == 3);
    	assert(leapyear == datetime.is_leap(year));
    	month = (n + 50) >> 5;
    	preceding = (datetime._days_before_month[month] + (month > 2 && leapyear));
    	if (preceding > n) {
    		/* estimate is too large */
    		month -= 1;
    		preceding -= datetime.days_in_month(year, month);
    	}
    	n -= preceding;
    	assert(0 <= n);
    	assert(n < datetime.days_in_month(year, month));

    	day = n + 1;
        
        dt.year = year;
        dt.month = month;
        dt.day = day;
        return;
    },

    /* year, month, day -> ordinal, considering 01-Jan-0001 as day 1. */
    ymd_to_ord : function(year, month, day)
    {
    	return datetime.days_before_year(year) + 
            datetime.days_before_month(year, month) + day;
    },

    /* Day of week, where Monday==0, ..., Sunday==6.  1/1/1 was a Monday. */
    weekday : function(year, month, day)
    {
    	return (datetime.ymd_to_ord(year, month, day) + 6) % 7;
    },

    /* Ordinal of the Monday starting week 1 of the ISO year.  Week 1 is the
     * first calendar week containing a Thursday.
     */
    iso_week1_monday : function(year)
    {
    	var first_day = datetime.ymd_to_ord(year, 1, 1);	/* ord of 1/1 */
    	/* 0 if 1/1 is a Monday, 1 if a Tue, etc. */
    	var first_weekday = (first_day + 6) % 7;
    	/* ordinal of closest Monday at or before 1/1 */
    	var week1_monday  = first_day - first_weekday;

    	if (first_weekday > 3)	/* if 1/1 was Fri, Sat, Sun */
    		week1_monday += 7;
    	return week1_monday;
    },
    
    
     /*
     * Normalization utilities.
     */

    /* One step of a mixed-radix conversion.  A "hi" unit is equivalent to
     * factor "lo" units.  factor must be > 0.  If *lo is less than 0, or
     * at least factor, enough of *lo is converted into "hi" units so that
     * 0 <= *lo < factor.  The input values must be such that int overflow
     * is impossible.
     */
    normalize_pair : function(dt, hi, lo, factor)
    {
    	assert(factor > 0);
    	assert(lo != hi);
    	if (dt[lo] < 0 || dt[lo] >= factor) {
    		var num_hi = Math.floor(dt[lo] / factor)
            dt[lo] = dt[lo] % factor
    		var new_hi = dt[hi] + num_hi;
    		//assert(! SIGNED_ADD_OVERFLOWED(new_hi, *hi, num_hi));
    		dt[hi] = new_hi;
    	}
    	assert(0 <= dt[lo] && dt[lo] < factor);
    },

    
    /* Fiddle days (d), seconds (s), and microseconds (us) so that
     * 	0 <= *s < 24*3600
     * 	0 <= *us < 1000000
     * The input values must be such that the internals don't overflow.
     * The way this routine is used, we don't get close.
     */
    normalize_d_s_us : function(dt)
    {
    	if (dt['microsecond'] < 0 || dt['microsecond'] >= 1000000) {
    		datetime.normalize_pair(dt, 'second', 'microsecond', 1000000);
    		/* |s| can't be bigger than about
    		 * |original s| + |original us|/1000000 now.
    		 */

    	}
    	if (dt['second'] < 0 || dt['second'] >= 24*3600) {
    		datetime.normalize_pair(dt, 'day', 'second', 24*3600);
    		/* |d| can't be bigger than about
    		 * |original d| +
    		 * (|original s| + |original us|/1000000) / (24*3600) now.
    		 */
    	}
    	assert(0 <= dt['second'] && dt['second'] < 24*3600);
    	assert(0 <= dt['microsecond'] && dt['microsecond'] < 1000000);
    },

    /* Fiddle years (y), months (m), and days (d) so that
     * 	1 <= *m <= 12
     * 	1 <= *d <= days_in_month(*y, *m)
     * The input values must be such that the internals don't overflow.
     * The way this routine is used, we don't get close.
     */
    normalize_y_m_d : function(dt)
    {
    	var dim;	/* # of days in month */

    	/* This gets muddy:  the proper range for day can't be determined
    	 * without knowing the correct month and year, but if day is, e.g.,
    	 * plus or minus a million, the current month and year values make
    	 * no sense (and may also be out of bounds themselves).
    	 * Saying 12 months == 1 year should be non-controversial.
    	 */
    	if (dt['month'] < 1 || dt['month'] > 12) {
    		--dt['month'];
    		datetime.normalize_pair(dt, 'year', 'month', 12);
    		++dt['month'];
    		/* |y| can't be bigger than about
    		 * |original y| + |original m|/12 now.
    		 */
    	}
    	assert(1 <= dt['month'] && dt['month'] <= 12);

    	/* Now only day can be out of bounds (year may also be out of bounds
    	 * for a datetime object, but we don't care about that here).
    	 * If day is out of bounds, what to do is arguable, but at least the
    	 * method here is principled and explainable.
    	 */
    	dim = datetime.days_in_month(dt['year'], dt['month']);
    	if (dt['day'] < 1 || dt['day'] > dim) {
    		/* Move day-1 days from the first of the month.  First try to
    		 * get off cheap if we're only one day out of range
    		 * (adjustments for timezone alone can't be worse than that).
    		 */
    		if (dt['day'] == 0) {
    			--dt['month'];
    			if (dt['month'] > 0)
    				dt['day'] = datetime.days_in_month(dt['year'], dt['month']);
    			else {
    				--dt['year'];
    				dt['month'] = 12;
    				dt['day'] = 31;
    			}
    		}
    		else if (dt['day'] == dim + 1) {
    			/* move forward a day */
    			++dt['month'];
    			dt['day'] = 1;
    			if (dt['month'] > 12) {
    				dt['month'] = 1;
    				++dt['year'];
    			}
    		}
    		else {
    			var ordinal = datetime.ymd_to_ord(dt['year'], dt['month'], 1) + dt['day'] - 1;
    			datetime.ord_to_ymd(dt, ordinal);
    		}
    	}
    	assert(dt['month'] > 0);
    	assert(dt['day'] > 0);
    },

    /* Fiddle out-of-bounds months and days so that the result makes some kind
     * of sense.  The parameters are both inputs and outputs.  Returns < 0 on
     * failure, where failure means the adjusted year is out of bounds.
     */
    normalize_date : function(dt)
    {
    	var result;

    	datetime.normalize_y_m_d(dt);
    	if (datetime.MINYEAR <= dt['year'] && dt['year'] <= datetime.MAXYEAR)
    		result = 0;
    	else {
    		log("date value out of range");
    		result = -1;
    	}
    	return result;
    },

    /* Force all the datetime fields into range.  The parameters are both
     * inputs and outputs.  Returns < 0 on error.
     */
    normalize_datetime : function(dt)
    {
    	datetime.normalize_pair(dt, 'second', 'microsecond', 1000000);
    	datetime.normalize_pair(dt, 'minute', 'second', 60);
    	datetime.normalize_pair(dt, 'hour', 'minute', 60);
    	datetime.normalize_pair(dt, 'day', 'hour', 24);
    	return datetime.normalize_date(dt);
    },


    /*************************************
    End of the brutal Python ripping
    *************************************/
    
    
    _timestampRegexp : /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/,
    _periodRegexp :  /^P(?:([+-]?\d+)Y)?(?:([+-]?\d+)M)?(?:([+-]?\d*\.?\d*)D)?(?:[T ](?:([+-]?\d*\.?\d*)H)?(?:([+-]?\d*\.?\d*)M)?(?:([+-]?\d*\.?\d*)S)?)?$/,
    _periodRegexp2 : /^P(?:([+-]?\d+))?-(?:([+-]?\d+))?-(?:([+-]?\d*\.?\d*))?(?:[T ](?:([+-]?\d*\.?\d*))?:(?:([+-]?\d*\.?\d*))?:(?:([+-]?\d*\.?\d*))?)?$/,
    // Only integer years and months, but fractional everything else
    //_intervalRegexp1 : timestamp+'/'+timestamp,  // If any elements are missing from the second value, they are assumed to be the same as the first value, including time zone elements.
    //_intervalRegexp2 : timestamp+'/'+period,
    //_intervalRegexp3 : period+'/'+timestamp,
    
    
    parse : function(str) {
        /***
            isTimeStamp?
            isInterval?
            isPeriod?
            isIncomplete?
            (year, month, day, hour, minute, second, microseconds, timezone_offset, location, system)
        ***/
        str = str + "";
        if (typeof(str) != "string" || str.length === 0) {
            return null;
        }
        var res = str.match(MochiKit.DateTime._isoRegexp);
        if (typeof(res) == "undefined" || res === null) {
            return null;
        }
        var year, month, day, hour, min, sec, msec;
        year = parseInt(res[1], 10);
        if (typeof(res[2]) == "undefined" || res[2] === '') {
            return new Date(year);
        }
        month = parseInt(res[2], 10) - 1;
        day = parseInt(res[3], 10);
        if (typeof(res[4]) == "undefined" || res[4] === '') {
            return new Date(year, month, day);
        }
        hour = parseInt(res[4], 10);
        min = parseInt(res[5], 10);
        sec = (typeof(res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;
        if (typeof(res[7]) != "undefined" && res[7] !== '') {
            msec = Math.round(1000.0 * parseFloat("0." + res[7]));
        } else {
            msec = 0;
        }
        if ((typeof(res[8]) == "undefined" || res[8] === '') && (typeof(res[9]) == "undefined" || res[9] === '')) {
            return new Date(year, month, day, hour, min, sec, msec);
        }
        var ofs;
        if (typeof(res[9]) != "undefined" && res[9] !== '') {
            ofs = parseInt(res[10], 10) * 3600000;
            if (typeof(res[11]) != "undefined" && res[11] !== '') {
                ofs += parseInt(res[11], 10) * 60000;
            }
            if (res[9] == "-") {
                ofs = -ofs;
            }
        } else {
            ofs = 0;
        }
        return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
    },
    
    addUpToDay : function(t1, t2, result) {
        /***
            Modifies result in place and returns the number of days
            that got rolled over from adding the other quantities.
        ***/
        var microseconds = t1.microseconds + t2.microseconds
        p.microseconds = microseconds%1000000
        var seconds = t1.seconds + t2.seconds + Math.floor(microseconds/1000000)
        p.seconds = seconds%60
        var minutes = t1.minutes + t2.minutes + Math.floor(seconds/60)
        p.minutes = minutes%60
        var hours = t1.hours + t2.hours + Math.floor(minutes/60)
        p.hours = hours%24
        var days = Math.floor(hours/24)
        return days
    },
    
    addPeriods : function(p1, p2) {
        // TODO: Check all of these for null
        var p = {}
        // Don't attempt to roll over days, years, or months.
        p.days = p1.days + p2.days + datetime.addUpToDay(p1, p2, p)
        p.months = p1.months + p2.months
        p.years = p1.years + p2.years
        return p
    },
    negatePeriod : function(p) {
        // TODO: Check all of these for null
        var p2 = {}
        p2.microseconds = -p.microseconds
        p2.seconds = -p.seconds
        p2.minutes = -p.minutes
        p2.hours = -p.hours
        p2.days = -p.days
        p2.months = -p.months
        p2.years = -p.years
        return p2
    },
    addPeriod : function(ts, p) {
        // Here's where you have to worry about days in month and leap years
        // Worry about negative years?
        // What about order of ops: If month rolls over, it makes a difference if you do month first or rollover first.
        // TODO: Check all of these for null
        var result = {}
        
        // Here's where the shit hits the fan with 28/29/30/31 days/month and leapyears
        var days = datetime.addUpToDay(ts, p, result)
        result.month = ts.month
        result.year = ts.year
        addDays(result, p.days + days)  // Magic Function
        
        var months = ts.months-1 + p.months
        result.month = (months)%12 + 1
        result.year = ts.year + p.years + Math.floor(months/12)
        
        // Skip over year zero
        if (ts.year > 0 && result.year <= 0)
            result.year -= 1
        if (ts.year < 0 && result.year >= 0)
            result.year += 1
        
        return result
    },
    subPeriod : function(timestamp, period) {
        return addPeriod(timestamp, negatePeriod(period))
    },
    subTimestamps : function(ts1, ts2) {
        // Convert ts2 to the same timezone as ts1 before the subtraction is done
        var p = {}
        return p
    },
    
    
    
    julianDay : function(dt) {
        /* Note, this assumes the Gregorian was in effect since 0001-01-01,
          so is incorrect before 4 October 1582 in most of Europe or 
          September 1752 in England and US, up until which they 
          were using Julian Calendar 
          There is more complete JavaScript code that handles Julian at
          http://aa.usno.navy.mil/data/docs/JulianDate.html
         
          Also, Julian Day can't be used with leap seconds in the picture.
          It's really defined to be a count of days and fractions of a day.
        */
        var ord = datetime.ymd_to_ord(dt.year, dt.month, dt.day)
        var epoc2400000 = datetime.ymd_to_ord(1858, 11, 16)
        var jd =  2400000 + ord - epoc2400000
        //var jd = ord + 1721424.5
        // If no time is given, assume you've given a date that starts at noon
        if (typeof(dt.hour) != 'undefined')
            jd += (dt.hour-12)/24
        if (typeof(dt.minute) != 'undefined')
            jd += dt.minute/(24*60)
        if (typeof(dt.second) != 'undefined')
            jd += dt.second/(24*60*60)
        if (typeof(dt.microsecond) != 'undefined')
            jd += dt.microsecond/(24*60*60*1000000)
        return jd
    },
    modifiedJulianDay : function(dt) {
        return datetime.julianDay(dt) - 2400000.5
    },
    reducedJulianDay : function(dt) {
        return datetime.julianDay(dt) - 2400000
    },
    unixTime : function(dt) {
        return (datetime.julianDay(dt) - 2440587.5) * 86400
    },
    siderealTime : function(dt, longitude) {
        /***
            Longitude given in degrees, not necessarily an integer.
            
            Reference JavaScript Code:
            http://home.att.net/~srschmitt/script_clock.html
            
            Seems different from http://www.freepatentsonline.com/EP1493140.html
            which uses 2010 as the base and has an extra zero at the end of the cubic term
            
            Another textual reference:
            http://www2.arnes.si/~gljsentvid10/sidereal.htm
            
            Astronomical Algorithms  by Jean Meeus
        ***/
        //var J2000_0 = datetime.julianDay({year:2000, month:1, day:1})
        //var J2000_0 = datetime.julianDay({year:2000, month:1, day:1, hour:12})
        var J2000_0 = 2451545  // Julian day for 2000-01-01 @ noon
        var jd = datetime.julianDay(dt) - J2000_0
        var jt = jd/36525.0;  // julian centuries since J2000.0
        // Greenwich Mean Sidereal Time to third order (don't know what that means yet)
        var GMST = 280.46061837 + 360.98564736629*jd + 0.000387933*jt*jt - jt*jt*jt/38710000
        if (GMST < 0) {
            // Add enough multiples of 360 to make it positive for the mod below.
            GMST += 360.0*(Math.ceil(-GMST/360.0)+1)
        }
        GMST = GMST % 360.0
        if (typeof(longitude) == 'undefined' || longitude == null)
            return GMST
        // Local Mean Sidereal Time
        var LMST = GMST + Longitude
        return LMST
    },
    degreesToDMS : function(degrees) {
        return { degrees: degrees%360, 
                  minutes: (60*degrees/360)%60,
                  seconds: (60*60*degrees/360.0) }
    },
    DMSToDegrees : function(DMS) {
        return DMS.degrees + DMS.minutes/60.0 + DMS.seconds/(60.0*60.0)
    }
}



/***
    Places where JavaScript's built in Date falls short:
        No naive/floating date without timestamp
        Improper handling of leap seconds
        No concept of interval/duration, only delta in ms
        No handling of incomplete datetime information: just month.

    A new datetime based on ISO 8601.
    
    Timestamp: Absolute location on the timeline
        Includes a timezone or local one is assumed.
        Given in UTC+TZ
        Can be converted to: TAI, UT1, Julian Days, Siderial time, UNIX (POSIX or NTP)
        period(later_timestamp, earlier_timestamp) gives period
        the value of 60 for seconds is only allowed on leap seconds (error? warning? rollover?)
        the value of 24 for hours means midnight of the next day.  (error? warning? rolloover?)
        These have a native timezone.
            Does that timezone know about daylight savings time for add/sub like it does in Perl?
        Format examples from http://www.cl.cam.ac.uk/~mgk25/iso-time.html
        1995-02-04 or 19950204
        1995-02 or 1995
        1997-W01 or 1997W01     (careful because the first day of this week might not be in 1997)
        1997-W01-2 or 1997W012  (second day of the week: 0:Sun, 1:Mon, 2:Tue)
        1995-035 or 1995035   (Days since the start of the year)
        23:59:59 or 235959
        23:59, 2359, or 23
        23:59:59.9942 or 235959.9942
        1995-02-04 24:00 = 1995-02-05 00:00
        19951231T235959
        23:59:59Z or 2359Z
        +hh:mm, +hhmm, or +hh   (this is the amount to add to Z time to get the local time)
        -hh:mm, -hhmm, or -hh
        * 19930214 or 1993-02-14 (complete representation)
        * 1993-02 (reduced precision)
        * 1993
        * 19
        * 930214 or 93-02-14 (truncated, current century assumed)
        * -9302 or -93-02
        * -93
        * --0214 or --02-14
        * --02
        * ---14
        * 1993045 or 1993-045 (complete representation)
        * 93045 or 93-045
        * -045 
        * 1993W067 or 1993-W06-7 (complete representation)
        * 1993W06 or 1993-W06
        * 93W067 or 93-W06-7
        * 93W06 or 93-W06
        * -3W067 or -3-W06-7
        * -W067 or -W06-7
        * -W06
        * -W-7 (day of current week)
        * ---7 (day of any week)
        * 131030 or 13:10:30 (complete representation)
        * 1310 or 13:10
        * 13
        * -1030 or -10:30
        * -10
        * --30
        * 131030,7 or 13:10:30,7
        * 1310,5 or 13:10,5
        * 13,2
        * -1030,7 or -10:30,7
        * -10,5
        * --30,7
        * 19930214T131030 or 1993-02-14T13:10:30 
        
        The date and/or time components independently obey the rules already given in the sections above, with the restrictions:

           1. The date format should not be truncated on the right (i.e., represented with lower precision) and the time format should not be truncated on the left (i.e., no leading hyphens).
           2. When the date format is truncated on the left, the leading hyphens may be omitted. 
        * 19930214T131030/19930214T131031 (a very short period) 

       Note that if the higher order components of the second period are omitted, the corresponding values from the first period are used. Likewise, if a timezone is supplied for the first period but not the second, it is assumed to be used for both.
           * P18Y9M4DT11H9M8S (18 years, 9 months, 4 days, 11 hours, 9 minutes and 8 seconds.
           * P2W (2 weeks). 
       No extended representation is defined for this format.

       Alternatively, if required, a period of time may be expressed using the format specified for points in time, provided the values do not exceed 12 months, 30 days, 24 hours, 60 minutes, and 60 seconds. Weeks should not be used.
       Period with Specific Start:
           * 19930214T131030/P18Y9M4DT11H9M8S 
       Period with Specific End
           * P18Y9M4DT11H9M8S/19930214T131030
        
        
        
        
    Incomplete: Same form at Timestamp, but missing fields.
        Like a birthday or holiday where just the day and month are given
        "Every August 3rd" or "The 2nd Tuesday of every month/year"
        "03:05:12" as a time on an abstract day.
        How much math can be done here?
    Period (interval, duration) given by P###Y##M##DT##H##M##SS.SSSS
        Can subtract two timestamps to get a period. This includes year & month
        Each field in the period is treated seperatly when you add or subtract periods
        When you add/subtract two periods, fields don't roll over.
        When you have a timestamp and add/subtract a period, things do roll over to get a valid timestamp
            This addition/subtraction is not associative.
        Note that you are allowed to give a period of one month like P01M, or a year like P03Y
            but it can't be translated into absolute delta because months and years don't have a fixed number of ms.
        As long as you stick to weeks, days, hrs, min, sec, you can translate into delta, but adding
            and subtracting periods to time
        periodToDelta(period, units = 'ms')
    Delta: an honest-to-goodness absolute time difference in TAI seconds, 
            ms, ns or whatever that knows about leap seconds. 1 TAI sec. = 1 UTC sec.
        Two timestamps can be subtracted to get an absolute difference
        Takes into account leap seconds
        Equivalent to converting everything to TAI and subtracting
        Should this come with metric units?  '100ns' or '10d', '12345678901234567890ns'
        Is this exactly the same as differences in Julian Day?
            I don't think so becuase some days have leap seconds.
            Julian day is noon to noon UT2, not UTC. Fractions are fixed size
        delta(later_timestamp, earlier_timestamp, units = 'ms')
        addDelta, subtractDelta
        Adding/Subtracting a delta of 100000000s can be different from adding/subtracting a period
        or 10000000000s if you cross a leap second.
        
    Labels and ticks are assigned in UTC using Timestamps and Periods.
    Positioning along the axis is done using Deltas. 
        This may create very small decimals if a leap second 
        is overlapped, but floats are imperfect anyway.
    
                   TAI                   UTC              Unix time
        1999-01-01T00:00:29.75 	1998-12-31T23:59:58.75 	915 148 798.75
        1999-01-01T00:00:30.00 	1998-12-31T23:59:59.00 	915 148 799.00
        1999-01-01T00:00:30.25 	1998-12-31T23:59:59.25 	915 148 799.25
        1999-01-01T00:00:30.50 	1998-12-31T23:59:59.50 	915 148 799.50
        1999-01-01T00:00:30.75 	1998-12-31T23:59:59.75 	915 148 799.75
        1999-01-01T00:00:31.00 	1998-12-31T23:59:60.00 	915 148 800.00
        1999-01-01T00:00:31.25 	1998-12-31T23:59:60.25 	915 148 800.25
        1999-01-01T00:00:31.50 	1998-12-31T23:59:60.50 	915 148 800.50
        1999-01-01T00:00:31.75 	1998-12-31T23:59:60.75 	915 148 800.75
        1999-01-01T00:00:32.00 	1999-01-01T00:00:00.00 	915 148 800.00
        1999-01-01T00:00:32.25 	1999-01-01T00:00:00.25 	915 148 800.25
        1999-01-01T00:00:32.50 	1999-01-01T00:00:00.50 	915 148 800.50
        1999-01-01T00:00:32.75 	1999-01-01T00:00:00.75 	915 148 800.75
        1999-01-01T00:00:33.00 	1999-01-01T00:00:01.00 	915 148 801.00
        1999-01-01T00:00:33.25 	1999-01-01T00:00:01.25 	915 148 801.25
    
    Of course they might stop adding leap seconds, in which case all this work will have been for nothing.
    
***/
