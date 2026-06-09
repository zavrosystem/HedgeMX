/* HedgeMX — Datos de mercado mock + motor de cálculo financiero
   Expuesto como window.HMX (sin dependencias). */
(function () {
  "use strict";

  // ---------- utilidades numéricas ----------
  function erf(x) {
    // Abramowitz & Stegun 7.1.26
    var t = 1 / (1 + 0.3275911 * Math.abs(x));
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  }
  function normCDF(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }

  // ---------- formato ----------
  function fmtMXN(v, dec) {
    if (dec == null) dec = 2;
    return "$" + Number(v).toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtUSD(v, dec) {
    if (dec == null) dec = 0;
    return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtRate(v, dec) { if (dec == null) dec = 4; return Number(v).toFixed(dec); }
  function fmtPct(v, dec) { if (dec == null) dec = 2; return Number(v).toFixed(dec) + "%"; }
  function fmtNum(v, dec) { if (dec == null) dec = 0; return Number(v).toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

  // ---------- series sintéticas (sparklines / históricos deterministas) ----------
  function seededRandom(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function genSeries(n, start, drift, vol, seed) {
    var rnd = seededRandom(seed || 7);
    var arr = [start], v = start;
    for (var i = 1; i < n; i++) {
      v = v + drift + (rnd() - 0.5) * vol;
      arr.push(v);
    }
    return arr;
  }

  // ---------- mercado ----------
  var market = {
    pairs: {
      "USD/MXN": { spot: 17.20, prev: 17.13, series: genSeries(30, 16.6, 0.022, 0.10, 11) },
      "EUR/MXN": { spot: 18.74, prev: 18.69, series: genSeries(30, 18.2, 0.020, 0.11, 23) },
      "GBP/MXN": { spot: 21.86, prev: 21.74, series: genSeries(30, 21.3, 0.024, 0.13, 31) },
      "CAD/MXN": { spot: 12.63, prev: 12.66, series: genSeries(30, 12.8, -0.008, 0.07, 41) }
    },
    tasaBanxico: 11.00,
    fedFunds: 5.25,
    inflMX: 4.42,
    inflUS: 3.10,
    volImpl: 12.0,      // vol implícita ATM 1M (%)
    volHist: 9.8,       // vol histórica 30d (%)
    volPercentil: 72,   // percentil 2y
    reservas: 221.4,    // miles de millones USD
    series: {
      banxico: genSeries(30, 11.25, -0.008, 0.0, 3),
      fed: genSeries(30, 5.33, -0.003, 0.0, 5),
      inflMX: genSeries(30, 4.7, -0.01, 0.03, 9),
      inflUS: genSeries(30, 3.3, -0.006, 0.02, 13),
      vol: genSeries(30, 11.2, 0.03, 0.20, 17),
      reservas: genSeries(30, 219, 0.08, 0.25, 19)
    }
  };
  market.diferencial = market.tasaBanxico - market.fedFunds;

  // histórico largo para pantalla de precios (sintético, ~260 días hábiles ≈ 1Y)
  function genHistory(pair, days) {
    var base = market.pairs[pair].spot;
    var seedMap = { "USD/MXN": 101, "EUR/MXN": 202, "GBP/MXN": 303 };
    var rnd = seededRandom(seedMap[pair] || 99);
    var arr = [];
    var v = base * 0.94;
    for (var i = 0; i < days; i++) {
      var drift = (base - v) * 0.004; // mean-revert hacia el spot
      v = v + drift + (rnd() - 0.5) * base * 0.011;
      arr.push(v);
    }
    arr[arr.length - 1] = base;
    return arr;
  }

  // ---------- motor de cálculo ----------
  // Forward por paridad de tasas de interés cubierta
  function forwardPrice(spot, rdPct, rfPct, days) {
    var rd = rdPct / 100, rf = rfPct / 100;
    return spot * (1 + rd * days / 360) / (1 + rf * days / 360);
  }

  // Garman-Kohlhagen (opción sobre divisa). r en %, sigma en %, T en años.
  function garmanKohlhagen(type, S, K, rdPct, rfPct, sigmaPct, T) {
    var rd = rdPct / 100, rf = rfPct / 100, sig = sigmaPct / 100;
    if (T <= 0 || sig <= 0) return Math.max(0, type === "put" ? K - S : S - K);
    var d1 = (Math.log(S / K) + (rd - rf + sig * sig / 2) * T) / (sig * Math.sqrt(T));
    var d2 = d1 - sig * Math.sqrt(T);
    var call = S * Math.exp(-rf * T) * normCDF(d1) - K * Math.exp(-rd * T) * normCDF(d2);
    var put = K * Math.exp(-rd * T) * normCDF(-d2) - S * Math.exp(-rf * T) * normCDF(-d1);
    var price = type === "put" ? put : call;
    var delta = type === "put" ? Math.exp(-rf * T) * (normCDF(d1) - 1) : Math.exp(-rf * T) * normCDF(d1);
    return { price: Math.max(0, price), delta: delta, d1: d1, d2: d2 };
  }

  // Tabla de strikes (cadena de opciones) alrededor del spot
  function optionChain(S, rdPct, rfPct, sigmaPct, T, strikes) {
    return strikes.map(function (K) {
      var c = garmanKohlhagen("call", S, K, rdPct, rfPct, sigmaPct, T);
      var p = garmanKohlhagen("put", S, K, rdPct, rfPct, sigmaPct, T);
      var mny = K < S * 0.99 ? "ITM" : K > S * 1.03 ? "Deep OTM" : K > S * 1.005 ? "OTM" : "ATM";
      return { strike: K, call: c.price, put: p.price, delta: c.delta, moneyness: mny };
    });
  }

  // Contratos de futuros (MEXDER): tamaño 10,000 USD
  function futuresContracts(amountUSD, contractSize, marginPerContract) {
    var contracts = Math.ceil(amountUSD / (contractSize || 10000));
    return {
      contracts: contracts,
      initialMargin: contracts * (marginPerContract || 8500),
      contractSize: contractSize || 10000,
      marginPerContract: marginPerContract || 8500
    };
  }

  // Escenarios pesimista / base / optimista para un forward
  function scenarios(spot, forward, nocionalUSD, shockPct) {
    if (shockPct == null) shockPct = 0.10;
    function row(label, tc) {
      var sinCobertura = tc * nocionalUSD;
      var conCobertura = forward * nocionalUSD;
      return { label: label, tc: tc, sinCobertura: sinCobertura, conCobertura: conCobertura, diff: conCobertura - sinCobertura };
    }
    return [
      row("Pesimista", spot * (1 + shockPct)),
      row("Base", spot),
      row("Optimista", spot * (1 - shockPct))
    ];
  }

  // Desglose de costos
  function costBreakdown(opts) {
    var nocionalUSD = opts.nocionalUSD;
    var forward = opts.forward;
    var spreadMXN = opts.spreadMXN != null ? opts.spreadMXN : 0.08;
    var comisionPct = opts.comisionPct != null ? opts.comisionPct : 0.10; // % del nocional
    var ivaPct = 16;
    var nocionalMXN = forward * nocionalUSD;
    var spreadTotal = spreadMXN * nocionalUSD;
    var comision = nocionalMXN * comisionPct / 100;
    var iva = comision * ivaPct / 100;
    var costoTotal = spreadTotal + comision + iva;
    var tcEfectivo = (nocionalMXN + comision + iva) / nocionalUSD + spreadMXN * 0; // spread ya en forward
    var tcEfectivoNeto = forward + (comision + iva) / nocionalUSD;
    return {
      nocionalUSD: nocionalUSD, forward: forward, nocionalMXN: nocionalMXN,
      spreadMXN: spreadMXN, spreadTotal: spreadTotal,
      comisionPct: comisionPct, comision: comision, iva: iva,
      costoTotal: costoTotal, tcEfectivoNeto: tcEfectivoNeto
    };
  }

  // ---------- contratos contratados (seed para Cuenta de margen) ----------
  function buildSeedContracts() {
    var m = market;
    var fwd = forwardPrice(17.20, 11.0, 5.25, 90);
    return [
      {
        id: "FWD-2024-004821",
        instrumento: "Forward", par: "USD/MXN", type: "compra",
        nocionalUSD: 150000, tcPactado: 17.44, tcSpotActual: 17.68,
        venceISO: "2025-03-15", venceLabel: "15 Mar 2025", diasRest: 47,
        estado: "activo",
        adjustes: null,
        spotPath: genHistory("USD/MXN", 60)
      },
      {
        id: "OPT-2024-004790", instrumento: "Call", par: "USD/MXN", type: "compra",
        nocionalUSD: 80000, tcPactado: 17.50, tcSpotActual: 17.68, prima: 0.28,
        venceISO: "2025-02-28", venceLabel: "28 Feb 2025", diasRest: 32,
        estado: "activo", adjustes: null, spotPath: genHistory("USD/MXN", 60)
      },
      {
        id: "FUT-2024-004702", instrumento: "Futuro", par: "USD/MXN", type: "compra",
        nocionalUSD: 100000, tcPactado: 17.42, tcSpotActual: 17.68,
        venceISO: "2025-04-10", venceLabel: "10 Abr 2025", diasRest: 73,
        estado: "riesgo", contratos: 10, margenInicial: 85000,
        adjustes: [
          { fecha: "15 Ene", spot: 17.25, mtm: 7500, ajuste: "Depósito recibido", estado: "ok" },
          { fecha: "22 Ene", spot: 17.10, mtm: -12000, ajuste: "Retiro disponible", estado: "ok" },
          { fecha: "28 Ene", spot: 17.68, mtm: 28500, ajuste: "Depósito requerido", estado: "warn" }
        ],
        spotPath: genHistory("USD/MXN", 60)
      }
    ];
  }

  function mtm(contract) {
    return (contract.tcSpotActual - contract.tcPactado) * contract.nocionalUSD;
  }

  // ---------- eventos de riesgo (calendario) ----------
  var events = [
    { fecha: "12 Jun", dia: "Jue", nombre: "Decisión FOMC (Fed)", impacto: "alto", prev: "5.25%", est: "5.25%", desc: "La Reserva Federal anuncia su tasa objetivo. Una postura más restrictiva tiende a fortalecer el USD frente al MXN." },
    { fecha: "13 Jun", dia: "Vie", nombre: "Inflación EUA (CPI)", impacto: "alto", prev: "3.4%", est: "3.1%", desc: "Dato clave de inflación. Sorpresas al alza presionan al alza las tasas de la Fed y al USD." },
    { fecha: "20 Jun", dia: "Vie", nombre: "Decisión Banxico", impacto: "alto", prev: "11.00%", est: "11.00%", desc: "Banxico fija la tasa de referencia. Un diferencial amplio con la Fed sostiene al peso vía carry." },
    { fecha: "24 Jun", dia: "Mar", nombre: "Inflación MX 1Q Jun", impacto: "medio", prev: "4.42%", est: "4.38%", desc: "Inflación quincenal del INEGI. Influye en las expectativas de recorte de Banxico." },
    { fecha: "27 Jun", dia: "Vie", nombre: "Balanza comercial MX", impacto: "bajo", prev: "+1.2 mmd", est: "+0.8 mmd", desc: "Saldo comercial. Un déficit amplio puede debilitar al peso en el margen." },
    { fecha: "05 Jul", dia: "Vie", nombre: "Nóminas no agrícolas (NFP)", impacto: "alto", prev: "272k", est: "185k", desc: "Empleo en EUA. Datos fuertes refuerzan al USD y suben la volatilidad del MXN." }
  ];


  // ---------- tabla comparativa por país (dashboard) ----------
  var countries = [
    { pais: "México", flag: "MX", divisa: "MXN", tc: null, tasa: 11.00, banco: "Banxico", inflacion: 4.42, series: market.series.banxico },
    { pais: "Estados Unidos", flag: "US", divisa: "USD", tc: market.pairs["USD/MXN"].spot, tcPrev: market.pairs["USD/MXN"].prev, tasa: 5.25, banco: "Fed", inflacion: 3.10, series: market.pairs["USD/MXN"].series },
    { pais: "Eurozona", flag: "EU", divisa: "EUR", tc: market.pairs["EUR/MXN"].spot, tcPrev: market.pairs["EUR/MXN"].prev, tasa: 4.25, banco: "BCE", inflacion: 2.60, series: market.pairs["EUR/MXN"].series },
    { pais: "Reino Unido", flag: "GB", divisa: "GBP", tc: market.pairs["GBP/MXN"].spot, tcPrev: market.pairs["GBP/MXN"].prev, tasa: 5.00, banco: "BoE", inflacion: 2.30, series: market.pairs["GBP/MXN"].series },
    { pais: "Canadá", flag: "CA", divisa: "CAD", tc: market.pairs["CAD/MXN"].spot, tcPrev: market.pairs["CAD/MXN"].prev, tasa: 4.75, banco: "BoC", inflacion: 2.90, series: market.pairs["CAD/MXN"].series }
  ];

  // ---------- cálculo central de una cotización ----------
  // q: { instrumento: "Forward"|"Futuro"|"Opción", tipoOpcion: "call"|"put", par, monto, dias, strike }
  function computeQuote(q) {
    var spot = market.pairs[q.par].spot;
    var T = q.dias / 365;
    var forward = forwardPrice(spot, market.tasaBanxico, market.fedFunds, q.dias);
    var r = { spot: spot, forward: forward, T: T, instrumento: q.instrumento };

    if (q.instrumento === "Forward") {
      r.pactado = forward;
      r.montoMXN = forward * q.monto;
      r.spread = 0.08;
      r.spreadTotal = r.spread * q.monto;
    } else if (q.instrumento === "Futuro") {
      var fut = futuresContracts(q.monto, 10000, 8500);
      r.contratos = fut.contratos != null ? fut.contratos : fut.contracts;
      r.margenInicial = fut.initialMargin;
      r.contractSize = 10000;
      r.futPrice = forward - 0.02;
      r.pactado = r.futPrice;
      r.ajusteDiario = r.contratos * 10000 * 0.10;
    } else { // Opción
      var type = q.tipoOpcion === "put" ? "put" : "call";
      r.tipoOpcion = type;
      var gk = garmanKohlhagen(type, spot, q.strike, market.tasaBanxico, market.fedFunds, market.volImpl, T);
      r.prima = gk.price;
      r.delta = gk.delta;
      r.primaTotal = gk.price * q.monto;
      r.primaPct = (gk.price / spot) * 100;
      r.strike = q.strike;
      r.pactado = q.strike;
      r.breakeven = type === "call" ? q.strike + gk.price : q.strike - gk.price;
    }
    return r;
  }

  // escenarios pesimista / base / optimista
  function computeScenarios(q, c) {
    var spot = c.spot;
    var defs = [["Pesimista", 0.10, "MXN se deprecia 10%"], ["Base", 0, "Sin cambio"], ["Optimista", -0.10, "MXN se aprecia 10%"]];
    var isCall = q.instrumento === "Opción" && c.tipoOpcion === "call";
    var isPut = q.instrumento === "Opción" && c.tipoOpcion === "put";
    return defs.map(function (def) {
      var tcT = spot * (1 + def[1]);
      var sinCob = tcT * q.monto, conCob;
      if (q.instrumento === "Forward" || q.instrumento === "Futuro") {
        conCob = c.pactado * q.monto;
      } else if (isCall) {
        conCob = Math.min(tcT, c.strike) * q.monto + c.primaTotal;
      } else { // put
        conCob = (2 * tcT - Math.max(tcT, c.strike)) * q.monto + c.primaTotal;
      }
      return { label: def[0], note: def[2], tcT: tcT, sinCob: sinCob, conCob: conCob, diff: sinCob - conCob };
    });
  }

  var defaultProfile = {
    razonSocial: "Manufacturas del Bajío S.A. de C.V.",
    rfc: "MBA210513KX9",
    sector: "Manufactura",
    empleados: "51-250",
    tipoOperacion: "importador",
    par: "USD/MXN",
    montoMensual: 50000,
    horizonte: 90,
    tolerancia: 2
  };

  window.HMX = {
    erf: erf, normCDF: normCDF,
    fmtMXN: fmtMXN, fmtUSD: fmtUSD, fmtRate: fmtRate, fmtPct: fmtPct, fmtNum: fmtNum,
    genSeries: genSeries, genHistory: genHistory, seededRandom: seededRandom,
    market: market,
    forwardPrice: forwardPrice, garmanKohlhagen: garmanKohlhagen, optionChain: optionChain,
    futuresContracts: futuresContracts, scenarios: scenarios, costBreakdown: costBreakdown,
    buildSeedContracts: buildSeedContracts, mtm: mtm,
    countries: countries, computeQuote: computeQuote, computeScenarios: computeScenarios,
    events: events, defaultProfile: defaultProfile
  };
})();
