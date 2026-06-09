/* HedgeMX — Iconos + gráficos SVG (data-driven). Exporta a window. */
/* global React */
const { createElement: h } = React;

/* ============================ ICONOS ============================ */
/* Set de iconos de línea, geométricos y simples. stroke=currentColor. */
function Icon({ name, size = 18, stroke = 1.6, style, ...rest }) {
  const paths = {
    dashboard: "M3 13h7V3H3v10zm0 8h7v-6H3v6zm11 0h7V11h-7v10zm0-18v6h7V3h-7z",
    layers: "M12 3 2 8l10 5 10-5-10-5zM2 16l10 5 10-5M2 12l10 5 10-5",
    trending: "M3 17l6-6 4 4 7-7M21 8v5h-5",
    calculator: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 11h2M11 11h2M14 11h2M8 14h2M11 14h2M14 14v3M8 17h2M11 17h2",
    shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6",
    bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 21a2 2 0 0 0 4 0",
    refresh: "M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
    arrowUp: "M12 19V5M5 12l7-7 7 7",
    arrowDown: "M12 5v14M5 12l7 7 7-7",
    arrowRight: "M5 12h14M13 6l6 6-6 6",
    chevR: "M9 6l6 6-6 6",
    chevD: "M6 9l6 6 6-6",
    check: "M5 12l5 5L20 6",
    checkCircle: "M22 11.5V12a10 10 0 1 1-5.9-9.1M22 4 12 14.1l-3-3",
    lock: "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
    alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    doc: "M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4zM14 3v4h4M9 13h6M9 17h6",
    download: "M12 3v12M7 11l5 5 5-5M5 21h14",
    calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    logout: "M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    plus: "M12 5v14M5 12h14",
    sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5M14 4v4M6 10v4M11 16v4",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
    info: "M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
    scale: "M12 3v18M5 7l-3 6h6l-3-6zM19 7l-3 6h6l-3-6zM7 21h10M5 7l7-2 7 2",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
    fingerprint: "M12 11a2 2 0 0 1 2 2c0 3-1 4-1 6M8 14c0-4 1-6 4-6s4 2 4 5M5 12a7 7 0 0 1 14 0v2M12 18v2M9 20c.5-1 1-2 1-4",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    building: "M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 21V9h4a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2"
  };
  const d = paths[name] || paths.info;
  return h("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    style: { flex: "0 0 auto", display: "block", ...style }, ...rest
  }, d.split("M").filter(Boolean).map((seg, i) => h("path", { key: i, d: "M" + seg })));
}

/* ============================ HELPERS DE ESCALA ============================ */
function extent(arr) {
  let mn = Infinity, mx = -Infinity;
  for (const v of arr) { if (v < mn) mn = v; if (v > mx) mx = v; }
  return [mn, mx];
}
function buildPath(values, w, h0, pad, mn, mx) {
  const n = values.length;
  const span = (mx - mn) || 1;
  return values.map((v, i) => {
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const y = h0 - pad - ((v - mn) / span) * (h0 - pad * 2);
    return (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
  }).join(" ");
}

/* ============================ SPARKLINE ============================ */
function Sparkline({ data, w = 96, h: hh = 30, color = "#1f6feb", fill = true, strokeW = 1.6 }) {
  const [mn, mx] = extent(data);
  const pad = 3;
  const line = buildPath(data, w, hh, pad, mn, mx);
  const area = line + ` L ${w - pad} ${hh - pad} L ${pad} ${hh - pad} Z`;
  const gid = "spg" + Math.random().toString(36).slice(2, 8);
  return h("svg", { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, style: { display: "block", overflow: "visible" } },
    fill && h("defs", null, h("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 },
      h("stop", { offset: "0%", stopColor: color, stopOpacity: 0.18 }),
      h("stop", { offset: "100%", stopColor: color, stopOpacity: 0 }))),
    fill && h("path", { d: area, fill: `url(#${gid})`, stroke: "none" }),
    h("path", { d: line, fill: "none", stroke: color, strokeWidth: strokeW, strokeLinecap: "round", strokeLinejoin: "round" })
  );
}

/* ============================ LINE CHART CON BANDAS σ ============================ */
function BandChart({ data, w = 760, h: hh = 320, color = "#1f6feb", forward = null,
                     markers = [], showBands = true, yLabelFmt = (v) => v.toFixed(2) }) {
  const padL = 52, padR = 16, padT = 16, padB = 28;
  const n = data.length;
  // media y desviación estándar de la serie
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  let [mn, mx] = extent(data);
  mn = Math.min(mn, mean - 2.4 * sd, forward || Infinity);
  mx = Math.max(mx, mean + 2.4 * sd, forward || -Infinity);
  const span = (mx - mn) || 1;
  const X = (i) => padL + (i / (n - 1)) * (w - padL - padR);
  const Y = (v) => padT + (1 - (v - mn) / span) * (hh - padT - padB);
  const line = data.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  function band(k) {
    const top = Y(mean + k * sd), bot = Y(mean - k * sd);
    return h("rect", { x: padL, y: top, width: w - padL - padR, height: Math.max(0, bot - top),
      fill: color, opacity: k === 1 ? 0.10 : 0.05 });
  }
  const ticks = 5;
  const gridY = Array.from({ length: ticks }, (_, i) => mn + (span * i) / (ticks - 1));
  return h("svg", { width: "100%", viewBox: `0 0 ${w} ${hh}`, style: { display: "block" } },
    // grid horizontal + labels
    gridY.map((gv, i) => h("g", { key: "g" + i },
      h("line", { x1: padL, x2: w - padR, y1: Y(gv), y2: Y(gv), stroke: "var(--hairline)", strokeWidth: 1 }),
      h("text", { x: padL - 8, y: Y(gv) + 3, textAnchor: "end", fontSize: 10, fill: "var(--ink-3)",
        style: { fontFamily: "var(--mono)" } }, yLabelFmt(gv)))),
    showBands && h("g", null, band(2), band(1)),
    showBands && h("line", { x1: padL, x2: w - padR, y1: Y(mean), y2: Y(mean), stroke: color, opacity: 0.35, strokeWidth: 1, strokeDasharray: "1 3" }),
    // forward line
    forward != null && h("g", null,
      h("line", { x1: padL, x2: w - padR, y1: Y(forward), y2: Y(forward), stroke: "var(--ink)", strokeWidth: 1.2, strokeDasharray: "5 4", opacity: 0.6 }),
      h("rect", { x: w - padR - 88, y: Y(forward) - 18, width: 88, height: 15, rx: 3, fill: "var(--ink)" }),
      h("text", { x: w - padR - 44, y: Y(forward) - 7, textAnchor: "middle", fontSize: 9.5, fill: "#fff", style: { fontFamily: "var(--mono)" } }, "Fwd " + forward.toFixed(2))),
    // event markers
    markers.map((m, i) => h("g", { key: "m" + i },
      h("line", { x1: X(m.i), x2: X(m.i), y1: padT, y2: hh - padB, stroke: "var(--ink-3)", strokeWidth: 1, strokeDasharray: "2 3", opacity: 0.5 }),
      h("circle", { cx: X(m.i), cy: padT + 4, r: 3, fill: "var(--ink-2)" }))),
    h("path", { d: line, fill: "none", stroke: color, strokeWidth: 2, strokeLinejoin: "round" }),
    h("circle", { cx: X(n - 1), cy: Y(data[n - 1]), r: 3.5, fill: color, stroke: "#fff", strokeWidth: 1.5 })
  );
}

/* ============================ DOBLE EJE: SPOT + MTM ============================ */
function DualAxisChart({ spot, mtm, w = 720, h: hh = 280, pactado = null }) {
  const padL = 48, padR = 52, padT = 16, padB = 24;
  const n = spot.length;
  let [smn, smx] = extent(pactado != null ? spot.concat([pactado]) : spot);
  const spadv = (smx - smn) * 0.12 || 0.1; smn -= spadv; smx += spadv;
  let [mmn, mmx] = extent(mtm.concat([0]));
  const mpadv = (mmx - mmn) * 0.15 || 1; mmn -= mpadv; mmx += mpadv;
  const X = (i) => padL + (i / (n - 1)) * (w - padL - padR);
  const Ys = (v) => padT + (1 - (v - smn) / (smx - smn)) * (hh - padT - padB);
  const Ym = (v) => padT + (1 - (v - mmn) / (mmx - mmn)) * (hh - padT - padB);
  const spotLine = spot.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Ys(v).toFixed(1)).join(" ");
  // MTM como segmentos coloreados (verde positivo, rojo negativo) — área respecto a 0
  const zeroY = Ym(0);
  const mtmArea = mtm.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Ym(v).toFixed(1)).join(" ")
    + ` L ${X(n - 1)} ${zeroY} L ${X(0)} ${zeroY} Z`;
  const mtmLine = mtm.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Ym(v).toFixed(1)).join(" ");
  const last = mtm[n - 1];
  const mtmColor = last >= 0 ? "var(--pos)" : "var(--neg)";
  return h("svg", { width: "100%", viewBox: `0 0 ${w} ${hh}`, style: { display: "block" } },
    h("defs", null, h("linearGradient", { id: "mtmg", x1: 0, y1: 0, x2: 0, y2: 1 },
      h("stop", { offset: "0%", stopColor: mtmColor, stopOpacity: 0.16 }),
      h("stop", { offset: "100%", stopColor: mtmColor, stopOpacity: 0 }))),
    h("line", { x1: padL, x2: w - padR, y1: zeroY, y2: zeroY, stroke: "var(--hairline)", strokeWidth: 1 }),
    pactado != null && h("g", null,
      h("line", { x1: padL, x2: w - padR, y1: Ys(pactado), y2: Ys(pactado), stroke: "var(--ink)", strokeWidth: 1, strokeDasharray: "5 4", opacity: 0.5 }),
      h("text", { x: padL + 4, y: Ys(pactado) - 5, fontSize: 9.5, fill: "var(--ink-2)", style: { fontFamily: "var(--mono)" } }, "Pactado " + pactado.toFixed(2))),
    h("path", { d: mtmArea, fill: "url(#mtmg)" }),
    h("path", { d: mtmLine, fill: "none", stroke: mtmColor, strokeWidth: 1.8 }),
    h("path", { d: spotLine, fill: "none", stroke: "var(--accent)", strokeWidth: 2 }),
    h("circle", { cx: X(n - 1), cy: Ys(spot[n - 1]), r: 3.5, fill: "var(--accent)", stroke: "#fff", strokeWidth: 1.5 }),
    // axis labels
    h("text", { x: padL, y: hh - 6, fontSize: 9.5, fill: "var(--accent)", style: { fontFamily: "var(--mono)" } }, "Spot"),
    h("text", { x: w - padR, y: hh - 6, textAnchor: "end", fontSize: 9.5, fill: mtmColor, style: { fontFamily: "var(--mono)" } }, "MTM")
  );
}

/* ============================ RISK GAUGE (tolerancia 1–5) ============================ */
function RiskMeter({ value = 3, w = 220 }) {
  const segs = 5;
  return h("div", { style: { display: "flex", gap: 4, width: w } },
    Array.from({ length: segs }, (_, i) => {
      const active = i < value;
      const t = i / (segs - 1);
      const col = `oklch(0.62 0.16 ${150 - t * 130})`; // verde→ámbar→rojo
      return h("div", { key: i, style: {
        flex: 1, height: 8, borderRadius: 4,
        background: active ? col : "var(--hairline)", transition: "background .2s" } });
    })
  );
}

/* ============================ DONUT (composición / progreso) ============================ */
function Donut({ value, total, color = "var(--accent)", size = 64, sw = 8, label }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / total));
  return h("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    h("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--hairline)", strokeWidth: sw }),
    h("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: color, strokeWidth: sw,
      strokeDasharray: `${c * frac} ${c}`, strokeLinecap: "round",
      transform: `rotate(-90 ${size / 2} ${size / 2})` }),
    label && h("text", { x: size / 2, y: size / 2 + 4, textAnchor: "middle", fontSize: 13, fontWeight: 600, fill: "var(--ink)", style: { fontFamily: "var(--mono)" } }, label)
  );
}

Object.assign(window, { Icon, Sparkline, BandChart, DualAxisChart, RiskMeter, Donut });
