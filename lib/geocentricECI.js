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