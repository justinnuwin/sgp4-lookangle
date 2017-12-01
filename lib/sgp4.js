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