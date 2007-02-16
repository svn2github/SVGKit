var compare_obj = function (o1, o2) {
    if (typeof(o2) != "object")
        return compare(o1, o2)
    var comp_key = function(key) {
        //log('compareing keys', key, o1[key], o2[key])
        if (typeof(o1[key]) == "undefined" || typeof(o2[key]) == "undefined")
            return 2
        return compare(o1[key], o2[key])
    }
    for (key in o2) {
        var comp = comp_key(key)
        if (comp != 0)
            return comp
    }
    for (key in o1) {
        var comp = comp_key(key)
        if (comp != 0)
            return comp
    }
    return 0
}

var obj_to_str = function (obj) {
    if (typeof(obj) != "object")
        return obj
    var str = '{'
    var first = true
    for (key in obj) {
        if (!first)
            str += ', '
        first = false
        str += key + ':' + obj[key]
    }
    str += '}'
    return str
}

with (datetime) {
    var tests = [
        ['is_leap(1999)', false],
        ['is_leap(2000)', true],
        ['is_leap(1900)', false],
        ['days_in_month(1999, 2)', 28],
        ['days_in_month(2000, 2)', 29],
        ['days_before_month(2000, 1)', 0],
        ['days_before_month(2000, 2)', 31],
        ['days_before_month(2000, 3)', 60],
        ['days_before_month(1999, 3)', 59],
        ['days_before_year(1)', 0],
        ['days_before_year(2)', 365],
        ['days_before_year(2007)', 732676],
        ['var dt= {}; ord_to_ymd(dt, 1); dt', {year:1, month:1, day:1}],
        ['var dt= {}; ord_to_ymd(dt, 2); dt', {year:1, month:1, day:2}],
        ['ymd_to_ord(1,1,2)', 2],
        ['ymd_to_ord(2000,12,31)', 730485],
        ['weekday(2007, 2, 16)', 4],
        ['iso_week1_monday(1)', 1],
        ['iso_week1_monday(2000)', 730122],
        ["var dt= {second:0, microsecond:1000001}; normalize_pair(dt, 'second', 'microsecond', 1000000); dt", {second:1, microsecond:1}],
        ["var dt= {day:0, second:0, microsecond:1000001}; normalize_d_s_us(dt); dt", {day:0, second:1, microsecond:1}],
        ["var dt= {day:0, second:0, microsecond:1000000}; normalize_d_s_us(dt); dt", {day:0, second:1, microsecond:0}],
        ["var dt= {day:0, second:24*3600, microsecond:0}; normalize_d_s_us(dt); dt", {day:1, second:0, microsecond:0}],
        ["var dt= {day:0, second:24*3600-1, microsecond:1000000}; normalize_d_s_us(dt); dt", {day:1, second:0, microsecond:0}],
        ["var dt= {year:2000, month:1, day:32}; normalize_y_m_d(dt); dt", {year:2000, month:2, day:1}],
        ["var dt= {year:2000, month:2, day:30}; normalize_y_m_d(dt); dt", {year:2000, month:3, day:1}],
        ["var dt= {year:1999, month:2, day:30}; normalize_y_m_d(dt); dt", {year:1999, month:3, day:2}],
        ["var dt= {year:1999, month:2, day:30}; normalize_date(dt); dt", {year:1999, month:3, day:2}],
        ["var dt= {year:1999, month:2, day:30}; normalize_date(dt)", 0],
        ["var dt= {year:9999, month:12, day:32}; normalize_date(dt)", -1],
        ["var dt= {year:2000, month:12, day:31, hour:23, minute:59, second:59, microsecond:1000000}; normalize_datetime(dt); dt", 
                {year:2001, month:1, day:1, hour:0, minute:0, second:0, microsecond:0}],
                
        ['julianDay({year:1858, month:11, day:16})', 2400000],
        ['julianDay({year:2132, month:8, day:31})', 2500000],
        ['julianDay({year:1970, month:1, day:1, hour:0, minute:0, second:0, microsecond:0})', 2440587.5],
        ['julianDay({year:2007, month:2, day:16})%7', 4],
        ['julianDay({year:2000, month:12, day:1, hour:0})', 2451879.5],
        ['siderealTime({year:1994, month:6, day:16, hour:18})', 174.77111347427126],
        
    ]
    forEach(tests, function(row) {
        log('match?', 0==compare_obj(eval(row[0]), row[1]), '  compare:  ', row[0], '->', obj_to_str(eval(row[0])), '  wanted', obj_to_str(row[1]))
    })
    
}

format_test = function() {
    var run = function(date, tests) {
        for (var i=0; i<tests.length; i++) {
            var code = tests[i][0]
            var goal = tests[i][1]
            var result = datetime.format(date, code)
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