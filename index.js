// let sgp4 = require('./lib/sgp4');
// let ECI = require('./lib/geocentricECI');
// let lookangle = require('./lib/lookangle');
// let util = require('./lib/util');

let express = require('express');
let app = express();


app.get('/', function (req, res) {
    let gsLat = 35.3008717,
        gsLon = -120.6600305;

    let argP = 184.6002,
        raan = 286.1293,
        inc = 51.6412,
        ecc = .0003547,
        satRevSiderealDay = 15.54046569,   // Mean Motion (revs/day)
        firstDerivMeanMotion = 0.00027757,
        meanAnomaly = 349.5541,
        epochYear = 17,
        epochDay = 335.12069444;

    let [satX, satY, satZ] = sgp4(argP, raan, inc, ecc, satRevSiderealDay, firstDerivMeanMotion, meanAnomaly, epochYear, epochDay);

    let [gsX, gsY, gsZ] = geocentricECI(gsLat, gsLon);

    let LST = getMST(gsLon);
    let lookAt = getLookAngle(satX, satY, satZ, gsX, gsY, gsZ, LST, gsLat, gsLon)

    res.send(lookAt);
});

app.listen(4000);
console.log('server is running');





// Garbage below don't look!
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

function getLookAngle(satX, satY, satZ, gsX, gsY, gsZ, LST, gsLat, gsLon) {
    "use strict";

    const sin = Math.sin,
        cos = Math.cos,
        asin = Math.asin,
        atan = Math.atan,
        sqrt = Math.sqrt;

    const toRad = (2 * Math.PI) / 360;
    const toDeg = 360 / (2 * Math.PI);



    let El, Az;
    let rS, rE, rZ;
    let range;
    let rx, ry, rz, fi;



    fi = LST + gsLon;
    rx = satX - gsX;
    ry = satY - gsY;
    rz = satZ - gsZ;


    rS = sin(toRad*gsLat)*cos(toRad*fi)*rx +
        sin(toRad*gsLat)*sin(toRad*fi)*ry -
        cos(toRad*gsLat)*rz;

    rE = sin(toRad*fi)*rx + cos(toRad*fi)*ry;

    rZ = cos(toRad*gsLat)*cos(toRad*fi)*rx +
        cos(toRad*gsLat)*sin(toRad*fi)*ry +
        sin(toRad*gsLat)*rz;


    range = sqrt(rS + rE + rZ);

    // El = toDeg * asin(rZ / range);
    El = rZ / range;
    Az = toDeg * atan(-rE / rS);

    console.log(rZ/range);
    console.log(asin(rZ/range));

    if (rS > 0) { Az += 180 }
    if (Az < 0) { Az += 360 }

    return {
        "Elevation": El,
        "Azimuth": Az,
    }
}

function sgp4(argP, raan, inc, ecc, satRevSiderealDay, firstDerivMeanMotion, meanAnomaly, epochYear, epochDay) {
    "use strict";

    const sin = Math.sin,
        cos = Math.cos,
        pow = Math.pow,
        sqrt = Math.sqrt;

    const toRad = (2 * Math.PI) / 360;
    const toDeg = 360 / (2 * Math.PI);
    const earthEquatorialRadius = 6378.135;



    let satX, satY, satZ;

    let Px, Py, Pz;
    let Qx, Qy, Qz;
    let X0, Y0;

    let rangeA, periodHr;
    let semimajorAxis, apogee, perigee, E, trueAnomaly;
    let perigeePerturbation, ascendingNodePerturbation;
    let epochNow, epochStart;

    let d = new Date();



    epochNow = daynumber(d.getUTCDate(), d.getUTCMonth(), d.getUTCFullYear(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    epochStart = daynumber(1, 1, epochYear, 0, 0, 0) + epochDay - 1;

    periodHr = 1440 / (satRevSiderealDay + firstDerivMeanMotion * (epochNow - epochStart));
    rangeA = 6028.9  * pow(periodHr, 2/3);

    apogee = rangeA * (1 + ecc);
    perigee = rangeA * (1 - ecc);
    semimajorAxis = (apogee + perigee) / 2;

    perigeePerturbation = (epochNow - epochStart) * 4.97 * (earthEquatorialRadius / semimajorAxis)^3.5 * 5 * pow(cos(toRad * inc), 2) / (1-ecc^2)^2;

    ascendingNodePerturbation = (epochNow - epochStart) * 9.95 * (earthEquatorialRadius / semimajorAxis)^3.5 * cos(toRad * inc) / (1-ecc^2)^2;

    argP = argP + perigeePerturbation;
    raan = raan - ascendingNodePerturbation;

    trueAnomaly = meanAnomaly + 360 * (satRevSiderealDay * (epochNow - epochStart) +
        0.5 * firstDerivMeanMotion * (epochNow - epochStart)^2);

    E = rev(toDeg * (
            toRad * trueAnomaly +
            ecc * sin(toRad * trueAnomaly) +
            0.5 * ecc^2 * sin(2 * toRad * trueAnomaly)
        ));

    X0 = semimajorAxis * cos(toRad * E - ecc);
    Y0 = semimajorAxis * sqrt(1 - ecc^2) * sin(toRad * E);


    Px = cos(toRad*argP)*cos(toRad*raan) -
        sin(toRad*argP)*sin(toRad*raan)*cos(toRad*inc);

    Py = cos(toRad*argP)*sin(toRad*raan) +
        sin(toRad*argP)*cos(toRad*raan)*cos(toRad*inc);

    Pz = sin(toRad*argP)*sin(toRad*inc);

    Qx = -sin(toRad*argP)*cos(toRad*raan) -
        cos(toRad*argP)*sin(toRad*raan)*sin(toRad*inc);

    Qy = -sin(toRad*argP)*sin(toRad*raan) +
        cos(toRad*argP)*cos(toRad*raan)*cos(toRad*inc);

    Qz = cos(toRad*argP)*sin(toRad*inc);


    satX = Px * X0 + Qx * Y0;
    satY = Py * X0 + Qy * Y0;
    satZ = Pz * X0 + Qz * Y0;

    return [satX, satY, satZ];
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