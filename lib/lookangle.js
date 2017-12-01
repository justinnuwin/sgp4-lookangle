/*
 * This is based on (straight copied-from) Jens T. Satre's Satellite Tracker
 * http://www.satellite-calculations.com/TLETracker/SatTracker.htm
 */

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

    El = toDeg * asin(rZ / range);
    Az = toDeg * atan(-rE / rS);

    if (rS > 0) { Az += 180 }
    if (Az < 0) { Az += 360 }

    return {
        "Elevation": El,
        "Azimuth": Az,
    }
}