/* HedgeMX — Mercado: precios del subyacente. Exporta a window. */
/* global React, HMX, Icon, useStore, BandChart */
const { useState: mkUseState, useMemo: mkUseMemo } = React;

const HORIZ = [["1M", 22], ["3M", 66], ["6M", 132], ["1Y", 260]];

function MarketScreen() {
  const { quote, setQuote, navigate } = useStore();
  const m = HMX.market;
  const [pair, setPair] = mkUseState(quote.par || "USD/MXN");
  const [hi, setHi] = mkUseState(2);
  const days = HORIZ[hi][1];

  const full = mkUseMemo(() => HMX.genHistory(pair, 260), [pair]);
  const data = full.slice(full.length - days);
  const spot = m.pairs[pair].spot;
  const fwd = HMX.forwardPrice(spot, m.tasaBanxico, m.fedFunds, 90);
  const strikes = mkUseMemo(() => {
    const base = Math.round(spot * 5) / 5;
    return [base - 0.5, base - 0.2, base, base + 0.3, base + 0.8, base + 1.3].map((k) => +k.toFixed(2));
  }, [spot]);
  const chain = HMX.optionChain(spot, m.tasaBanxico, m.fedFunds, m.volImpl, 90 / 365, strikes);
  const markers = [{ i: Math.floor(days * 0.32) }, { i: Math.floor(days * 0.68) }];

  const pickStrike = (k) => { setQuote({ instrumento: "Opción", tipoOpcion: "call", par: pair, strike: k }); navigate("instruments"); };

  return (
    <div className="content-inner fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2.1fr) minmax(0,1fr)", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card">
          <div className="card-head" style={{ flexWrap: "wrap", gap: 12 }}>
            <div className="segmented">
              {["USD/MXN", "EUR/MXN", "GBP/MXN"].map((p) => (
                <button key={p} className={pair === p ? "active" : ""} onClick={() => setPair(p)}>{p}</button>
              ))}
            </div>
            <div className="segmented">
              {HORIZ.map(([l], i) => (
                <button key={l} className={hi === i ? "active" : ""} onClick={() => setHi(i)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="card-pad">
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
              <span className="stat-value" style={{ fontSize: 28 }}>{spot.toFixed(4)}</span>
              <span className="muted-3" style={{ fontSize: 13 }}>{pair} spot · Banxico FIX</span>
            </div>
            <BandChart data={data} forward={fwd} markers={markers} color="var(--accent)" />
            <div style={{ display: "flex", gap: 18, marginTop: 8, flexWrap: "wrap", fontSize: 11.5, color: "var(--ink-3)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "var(--accent)", display: "inline-block" }} /> Spot histórico</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, background: "var(--accent)", opacity: .12, display: "inline-block" }} /> Banda ±1σ / ±2σ</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 0, borderTop: "1.5px dashed var(--ink)", display: "inline-block" }} /> Forward 90d</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="sem medio" style={{ marginTop: 0 }} /> Evento de mercado</span>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gap: "var(--gap)" }}>
          <div className="card card-pad" style={{ background: "var(--side)", color: "#fff", border: "none" }}>
            <div className="eyebrow" style={{ color: "var(--side-ink-2)" }}>Riesgo de la empresa</div>
            <div style={{ fontSize: 17, fontWeight: 700, margin: "8px 0 6px" }}>Importador · paga en USD</div>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--side-ink)", margin: 0 }}>
              Tu riesgo es que el <strong style={{ color: "#fff" }}>MXN se deprecie</strong> (USD/MXN suba): pagarías más pesos por los mismos dólares. La banda ±2σ muestra el rango probable de movimiento en el horizonte.
            </p>
          </div>
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 14 }}>Volatilidad</div>
            {[["Histórica 30 días", m.volHist.toFixed(1) + "%", "var(--ink)"],
              ["Implícita actual", m.volImpl.toFixed(1) + "%", "var(--accent-ink)"]].map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span className="muted" style={{ fontSize: 13 }}>{k}</span>
                <span className="mono" style={{ fontWeight: 700, color: col }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span className="muted-3">Percentil (2 años)</span>
                <span className="mono" style={{ fontWeight: 700 }}>P{m.volPercentil}</span>
              </div>
              <div className="progress"><div style={{ width: m.volPercentil + "%", background: "var(--warn)" }} /></div>
              <p className="muted-3" style={{ fontSize: 11.5, margin: "8px 0 0", lineHeight: 1.5 }}>
                Volatilidad en el percentil {m.volPercentil} → mercado relativamente <strong>caro</strong> para comprar opciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "var(--gap)" }}>
        <div className="card-head">
          <div>
            <div className="card-title">Precios de opciones por strike · {pair}</div>
            <div className="card-sub">Vencimiento 90 días · clic en una fila para cotizar ese strike</div>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr><th>Strike (MXN/USD)</th><th className="num">Prima Call</th><th className="num">Prima Put</th><th className="num">Delta</th><th>Moneyness</th><th></th></tr>
          </thead>
          <tbody>
            {chain.map((r) => (
              <tr key={r.strike} className="clickable" onClick={() => pickStrike(r.strike)}>
                <td className="num" style={{ fontWeight: 700 }}>{r.strike.toFixed(2)}</td>
                <td className="num">${r.call.toFixed(2)}</td>
                <td className="num">${r.put.toFixed(2)}</td>
                <td className="num">{r.delta.toFixed(2)}</td>
                <td><span className={"chip " + (r.moneyness === "ITM" ? "chip-pos" : r.moneyness === "ATM" ? "chip-accent" : "")} style={{ padding: "2px 8px" }}>{r.moneyness}</span></td>
                <td className="num"><Icon name="arrowRight" size={15} style={{ color: "var(--ink-3)" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { MarketScreen });
