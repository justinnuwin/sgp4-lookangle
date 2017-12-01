function getMST(lon) {
    "use strict";

    let now = new Date(),
        year   = now.getUTCFullYear(),
        month  = now.getUTCMonth() + 1,
        day    = now.getUTCDate(),
        hour   = now.getUTCHours(),
        minute = now.getUTCMinutes(),
        second = now.getUTCSeconds();

    if( month == 1 || month == 2 )
    {
        year = year - 1;
        month = month + 12;
    }


    let a = Math.floor( year/100 );
    let b = 2 - a + Math.floor( a/4 );
    let c = Math.floor(365.25 * year);
    let d = Math.floor(30.6001 * (month + 1));

    let jd = b + c + d - 730550.5 + day + (hour + minute/60.0 + second/3600.0)/24.0;
    let jt   = (jd)/36525.0;

    let GMST = rev(280.46061837 + 360.98564736629*jd + 0.000387933*jt*jt - jt*jt*jt/38710000 + lon);

    return GMST;
}

function rev(angle) {

    if( angle > 0.0 ) {
        while( angle > 360.0 )
            angle = angle-360.0;
    }
    else {
        while( angle< 0.0 )
            angle =angle+ 360.0;
    }
    return(angle)
}

function div(a, b) {
    return((a - a % b) / b);
}

function daynumber(dd,mm,yyyy,hh,min,sec) {

    return 367 * yyyy -
        div((7 * (yyyy + (div((mm + 9),12)))), 4) +
        div((275 * mm),9) +
        dd - 730530 + hh/24 +
        min / (60 * 24) +
        sec / (24 * 60 * 60);

}