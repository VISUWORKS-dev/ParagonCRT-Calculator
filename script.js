let MR_Sph, MR_Cyl, K1, K2, ACD, AL, dK, ALCR, mK, WTW, LP,
    PS, AR_Sph, AR_Cyl, Ecc, fEcc, age, AR_SE, MR_NoAstig,
    MR_SE, CCT, predOAD, predBC, predRZD1;



function logisticFunction(x) {
    return 1 / (1 + Math.exp(-x));
}

function cutoff(value) {
    const interval = 25;
    const share = Math.floor(value / interval);
    const rest = value % interval;
    let result;
    if (rest < interval / 2) {
      result = share * interval;
    } else {
      result = (share + 1) * interval;
    }
    return result;
}

function calculateBCSag(BC, d) {
    const BCSag = (BC - Math.sqrt(BC ** 2 - (d / 2) ** 2)) * 1000;
    return BCSag;
}

function predictResults() {
    getInputValues();
    calculateCommonVariables();
    predictToric();
    predictOAD();
    predictBC();
    predictRZD1();
    predictRZD2();
    predictLZA();
    predictLS();
    calculateLS();
}

function getInputValues() {
    MR_Sph = parseFloat(document.getElementById('MR_Sph').value);
    MR_Cyl = parseFloat(document.getElementById('MR_Cyl').value);
    K1 = parseFloat(document.getElementById('K1').value);
    K2 = parseFloat(document.getElementById('K2').value);
    ACD = parseFloat(document.getElementById('ACD').value);
    AL = parseFloat(document.getElementById('AL').value);
    WTW = parseFloat(document.getElementById('WTW').value);
    CCT = parseFloat(document.getElementById('CCT').value);
    PS = parseFloat(document.getElementById('PS').value);
    AR_Sph = parseFloat(document.getElementById('AR_Sph').value);
    AR_Cyl = parseFloat(document.getElementById('AR_Cyl').value);
    Ecc = parseFloat(document.getElementById('Ecc').value);
    fEcc = parseFloat(document.getElementById('fEcc').value);
    age = parseFloat(document.getElementById('age').value);
}

function calculateCommonVariables() {
    dK = Math.abs(K1 - K2);
    mK = (K1 + K2) / 2;
    ALCR = AL / (337.5 / mK);
    AR_SE = (AR_Sph + AR_Cyl) / 2;
    MR_SE = (MR_Sph + MR_Cyl) / 2;
    MR_NoAstig = MR_Cyl === 0 ? 1 : 0;

    S = AR_SE / (1 - (0.014 * AR_SE));
    numerator = AL * (S + mK) - (1000 * 1.336);
    denominator1 = AL - ACD - 2.564
    denominator2 = (((ACD + 2.564) / (1000 * 1.336)) * (S + mK)) - 1;
    LP = numerator / (denominator1 * denominator2);
}


function predictToric() {

    if (MR_Cyl > 0) {
        alert("Please enter a negative value for MR_Cyl");
        return;
    }

    // Calculate Toric score using the logistic regression model
    const score = -13.921 + (MR_Cyl * -4.561) + (dK * 1.896) + (ACD * 0.464) + (ALCR * 1.913);

    // Convert the score to a probability using the logistic function
    const probability = logisticFunction(score);
    const label = probability >= 0.5 ? "CRT DA(toric) recommended" : "CRT(spherical) available";

    // Display the result on the page
    document.getElementById('toricResult').textContent = `Toric: ${label}`;
    // document.getElementById('toricResult').textContent = `Toric: ${label} (Probability: ${(probability * 100).toFixed(2)}%)`;
}
  
function predictOAD() {

    // Calculate OAD score using Ridge classifier model
    const OADScore = -17.441 + (K1 * -0.055) + (WTW * 1.477) + (AL * -0.075) + (CCT * 0.001) + (ACD * 0.68) + (ALCR * -0.053) + (LP * 0.028);

    // Determine if the result is 10.5mm or 11.0mm using the Ridge classifier formula
    const result = OADScore > 0 ? '11.0' : '10.5';
    predOAD = result;

    document.getElementById('oadResult').textContent = `OAD: ${result}`;
}
  
function predictBC() {

    const result = (100.367 + (AL * 1.490) + (LP * 0.369) + (K1 * -1.476) + (MR_Sph * -1.526)) / 10;
    predBC = result;
    document.getElementById('bcResult').textContent = `BC: ${result.toFixed(1)}`;
}
  
function predictRZD1() {

    const result = 0 + (MR_Sph * -5.629) + (K1 * 8.227) + (AL * 2.112) + (CCT * 0.025) +
                   (ACD * 4.406) + (PS * 0.435) + (ALCR * 16.979) + (LP * 1.212);
    const rounded = cutoff(result)
    predRZD1 = rounded
    document.getElementById('rzd1Result').textContent = `RZD1: ${rounded.toFixed(0)}`;
}

function predictRZD2() {

    const result = 0.536 + (K2 * 9.665) + (ALCR * 1.048) + (MR_Cyl * -19.220) + (AL * 3.445) +
                   (AR_SE * -6.140) + (MR_NoAstig * 4.747) + (Ecc * -6.451) + (age * 0.160);
    const rounded = cutoff(result);
    document.getElementById('rzd2Result').textContent = `RZD2: ${rounded.toFixed(0)}`;
}

function predictLZA() {

    const result = 8.329 + (MR_Sph * 0.028) + (K1 * 0.515) + (fEcc * -0.994) + (predOAD * 0.293);
    document.getElementById('lzaResult').textContent = `LZA: ${result.toFixed(0)}`;
}

function predictLS() {

    const result = 176.920 + (MR_Sph * 3.673) + (K1 * 17.473) + (K2 * 3.742) + (MR_SE * 2.738) + (ACD * 0.000);
    document.getElementById('lsResult').textContent = `LensSag@8mm: ${result.toFixed(0)}`;
}

function calculateLS() {

    const result = calculateBCSag(predBC, 6) + predRZD1;
    document.getElementById('lsCalc').textContent = `LensSag@8mm: ${result.toFixed(0)} (the sag. of calculated BC + calculated RZD1)`;
}

document.querySelector("form").addEventListener("submit", function(event) {
  event.preventDefault();
  predictResults();
});