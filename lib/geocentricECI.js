/*
 * This is based on (straight copied-from) Jens T. Satre's Satellite Tracker
 * http://www.satellite-calculations.com/TLETracker/SatTracker.htm
 */

function geocentricECI(gsLat, gsLon) {
    "use strict";

    const sin = Math.sin,
        cos = Math.cos,
        pow = Math.pow,
        sqrt = Math.sqrt;

    const toRad = (2 * Math.PI) / 360;
    const earthFlattening = 1 / 298.26;
    const earthEquatorialRadius = 6378.135;

    let gsX, gsY, gsZ;
    let omega, c, s;


    omega = getMST(0.0) + gsLon;
    c = 1 / sqrt(1 + earthFlattening * (earthFlattening - 2) * pow(sin(toRad * gsLat),2));
    s = (1 - earthFlattening)^2 * c;

    gsX = earthEquatorialRadius * c * cos(toRad * gsLat) * cos(toRad * omega);
    gsY = earthEquatorialRadius * c * cos(toRad * gsLat) * sin(toRad * omega);
    gsZ = earthEquatorialRadius * s * sin(toRad * gsLat);

    return [gsX, gsY, gsZ];
}

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