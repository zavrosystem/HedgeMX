/* HedgeMX — Instrumentos (catálogo + calculadora fusionados). Exporta a window. */
/* global React, HMX, Icon, useStore, Modal */
const { useState: inUseState, useMemo: inUseMemo } = React;

const INSTRUMENTOS = [
  { id: "Forward", icon: "scale", tag: "Compromiso · sin prima",
    desc: "Acuerdas hoy el tipo de cambio para una fecha futura. No pagas nada hoy, pero es un compromiso obligatorio. Ideal para flujos fijos y predecibles." },
  { id: "Futuro", icon: "layers", tag: "Bolsa · MEXDER",
    desc: "Contrato estandarizado que se negocia en bolsa. Depositas un margen inicial y la posición se ajusta diariamente (mark-to-market). Líquido y ágil." },
  { id: "Opción", icon: "shield", tag: "Derecho · con prima",
    desc: "Compras el derecho —no la obligación— de cambiar divisas a un precio fijo. Pagas una prima, pero si el mercado te favorece, puedes no ejercerla." }
];

function InstrumentsScreen() {
  const { quote, setQuote, navigate } = useStore();
  const [showScen, setShowScen] = inUseState(false);
  const q = quote;
  const c = inUseMemo(() => HMX.computeQuote(q), [q.instrumento, q.tipoOpcion, q.par, q.monto, q.dias, q.strike]);
  const scen = inUseMemo(() => HMX.computeScenarios(q, c), [q.instrumento, q.tipoOpcion, q.par, q.monto, q.dias, q.strike]);
  const isOpt = q.instrumento === "Opción";
  const spot = c.spot;
  const quickDays = [30, 60, 90, 180];

  return (
    <div className="content-inner fade-in">
      {/* Selector de instrumento: 3 tarjetas */}
      <div className="eyebrow" style={{ marginBottom: 10 }}>1 · Elige el instrumento</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        {INSTRUMENTOS.map((ins) => {
          const sel = q.instrumento === ins.id;
          return (
            <div key={ins.id} className="card" onClick={() => setQuote({ instrumento: ins.id })}
                 style={{ cursor: "pointer", padding: "var(--card-pad)", borderColor: sel ? "var(--accent)" : "var(--border)", borderWidth: sel ? 1.5 : 1, background: sel ? "var(--accent-wash)" : "var(--surface)", transition: "all .14s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: sel ? "var(--accent)" : "var(--surface-2)", color: sel ? "#fff" : "var(--ink-2)", display: "grid", placeItems: "center", transition: "all .14s" }}>
                  <Icon name={ins.icon} size={20} />
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid " + (sel ? "var(--accent)" : "var(--ink-3)"), display: "grid", placeItems: "center" }}>
                  {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />}
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{ins.id}</div>
              <span className="chip" style={{ margin: "6px 0 8px", background: sel ? "var(--accent-wash-2)" : "var(--surface-2)", border: "none" }}>{ins.tag}</span>
              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{ins.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Calculadora */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card">
          <div className="card-head"><div className="card-title">2 · Datos de tu cobertura</div></div>
          <div className="card-pad" style={{ display: "grid", gap: 18 }}>
            {isOpt && (
              <div className="field">
                <label>Posición (tipo de opción)</label>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[["call", "Call", "Derecho a COMPRAR USD", "Te cubre si el MXN se debilita (importador)"],
                    ["put", "Put", "Derecho a VENDER USD", "Te cubre si el MXN se fortalece (exportador)"]].map(([v, t, d, sub]) => {
                    const on = q.tipoOpcion === v;
                    return (
                      <div key={v} onClick={() => setQuote({ tipoOpcion: v })}
                           style={{ cursor: "pointer", padding: 13, borderRadius: "var(--r-ctrl)", border: "1.5px solid " + (on ? "var(--accent)" : "var(--border)"), background: on ? "var(--accent-wash)" : "var(--surface)" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div>
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>{d}</div>
                        <div className="muted-3" style={{ fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="row" style={{ gap: 16 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Par de divisas</label>
                <select className="select" value={q.par} onChange={(e) => setQuote({ par: e.target.value })}>
                  {["USD/MXN", "EUR/MXN", "GBP/MXN", "CAD/MXN"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Plazo de cobertura</label>
                <div className="segmented" style={{ width: "100%" }}>
                  {quickDays.map((d) => (
                    <button key={d} className={q.dias === d ? "active" : ""} style={{ flex: 1 }} onClick={() => setQuote({ dias: d })}>{d}d</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field">
              <label>¿Cuánto quieres cubrir?</label>
              <div className="input-group">
                <span className="addon">$</span>
                <input value={q.monto} onChange={(e) => setQuote({ monto: +e.target.value || 0 })} />
                <span className="addon right">{q.par.slice(0, 3)}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                {[50000, 150000, 300000, 500000].map((v) => (
                  <button key={v} className={"chip" + (q.monto === v ? " chip-accent" : "")} style={{ cursor: "pointer", border: "none" }} onClick={() => setQuote({ monto: v })}>{HMX.fmtUSD(v)}</button>
                ))}
              </div>
            </div>

            {isOpt && (
              <div className="field">
                <label>Precio de ejercicio (strike) · {q.strike.toFixed(2)} MXN/USD</label>
                <input type="range" min={(spot - 1).toFixed(2)} max={(spot + 1.5).toFixed(2)} step={0.05} value={q.strike} onChange={(e) => setQuote({ strike: +e.target.value })} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)" }}>
                  <span>Más protección</span><span>Spot {spot.toFixed(2)}</span><span>Más barato</span>
                </div>
              </div>
            )}

            <button className="btn btn-ghost" onClick={() => setShowScen(true)}>
              <Icon name="trending" size={16} /> Simular escenarios
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-head" style={{ background: "var(--surface-2)" }}>
            <div className="card-title">3 · Tu cobertura calculada</div>
            <span className="chip chip-accent">{q.instrumento}{isOpt ? " · " + q.tipoOpcion.toUpperCase() : ""}</span>
          </div>
          <div className="card-pad">
            {q.instrumento === "Forward" && <ForwardOut c={c} q={q} />}
            {q.instrumento === "Futuro" && <FuturoOut c={c} q={q} />}
            {isOpt && <OpcionOut c={c} q={q} />}
          </div>
          <div className="card-pad" style={{ borderTop: "1px solid var(--hairline)", display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => navigate("market")}><Icon name="trending" size={15} /> Ver mercado</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("costs")}>Ver comisiones <Icon name="arrowRight" size={15} /></button>
          </div>
        </div>
      </div>

      {showScen && (
        <Modal title="Simulación de escenarios" sub={`${q.instrumento} ${q.par} · ${HMX.fmtUSD(q.monto)} USD · ${q.dias} días`} onClose={() => setShowScen(false)} maxWidth={720}>
          <table className="data">
            <thead><tr><th>Escenario</th><th className="num">TC al vencimiento</th><th className="num">Sin cobertura</th><th className="num">Con cobertura</th><th className="num">Diferencia</th></tr></thead>
            <tbody>
              {scen.map((s) => (
                <tr key={s.label}>
                  <td><div style={{ fontWeight: 700 }}>{s.label}</div><div className="muted-3" style={{ fontSize: 11.5 }}>{s.note}</div></td>
                  <td className="num">{HMX.fmtMXN(s.tcT, 2)}</td>
                  <td className="num">{HMX.fmtMXN(s.sinCob, 0)}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{HMX.fmtMXN(s.conCob, 0)}</td>
                  <td className="num"><span className={s.diff >= 0 ? "pos" : "neg"} style={{ fontWeight: 700 }}>{s.diff >= 0 ? "+" : "−"}{HMX.fmtMXN(Math.abs(s.diff), 0)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card card-pad" style={{ marginTop: 16, background: "var(--accent-wash)", boxShadow: "none", border: "none", display: "flex", gap: 12 }}>
            <Icon name="info" size={17} style={{ color: "var(--accent-ink)", flex: "0 0 auto", marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--accent-ink)" }}>
              En el escenario <strong>pesimista</strong> la cobertura te ahorra <strong>{HMX.fmtMXN(Math.abs(scen[0].diff), 0)}</strong>. El costo de oportunidad en el escenario optimista es el precio de tu certeza.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function OutLine({ label, value, big, color, sub, mono = true }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: big ? "14px 0" : "11px 0", borderBottom: "1px solid var(--hairline)" }}>
      <div>
        <div className="muted" style={{ fontSize: big ? 13 : 12.5, fontWeight: big ? 600 : 500 }}>{label}</div>
        {sub && <div className="muted-3" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: mono ? "var(--mono)" : "var(--sans)", fontWeight: 700, fontSize: big ? 22 : 14.5, color: color || "var(--ink)", textAlign: "right" }}>{value}</div>
    </div>
  );
}

function ForwardOut({ c, q }) {
  return (
    <React.Fragment>
      <OutLine label="Tipo de cambio forward pactado" value={c.forward.toFixed(4)} big color="var(--accent-ink)" sub="MXN/USD" />
      <OutLine label="Monto en MXN al vencimiento" value={HMX.fmtMXN(c.montoMXN, 0)} sub={HMX.fmtUSD(q.monto) + " USD × " + c.forward.toFixed(4)} />
      <OutLine label="Prima a pagar hoy" value="$0" color="var(--pos)" sub="Solo el spread del banco" />
      <OutLine label="Spread aplicado" value={"+" + c.spread.toFixed(2) + " MXN"} sub={"Costo estimado " + HMX.fmtMXN(c.spreadTotal, 0)} />
      <div style={{ paddingTop: 14, display: "flex", gap: 8 }}>
        <span className="chip chip-pos">Sin prima hoy</span>
        <span className="chip chip-warn">Compromiso obligatorio</span>
      </div>
    </React.Fragment>
  );
}
function FuturoOut({ c, q }) {
  return (
    <React.Fragment>
      <OutLine label="Contratos necesarios" value={c.contratos + " contratos"} big color="var(--accent-ink)" sub={HMX.fmtUSD(q.monto) + " ÷ 10,000 USD por contrato"} />
      <OutLine label="Precio del futuro (MEXDER)" value={c.futPrice.toFixed(4)} sub="MXN/USD" />
      <OutLine label="Margen inicial requerido" value={HMX.fmtMXN(c.margenInicial, 0)} color="var(--warn)" sub="Se recupera al vencimiento" />
      <OutLine label="Ajuste diario por $0.10 de movimiento" value={"±" + HMX.fmtMXN(c.ajusteDiario, 0)} sub="Mark-to-market diario" />
      <div style={{ paddingTop: 14, display: "flex", gap: 8 }}>
        <span className="chip chip-accent">Liquidez de bolsa</span>
        <span className="chip chip-warn">Llamadas al margen</span>
      </div>
    </React.Fragment>
  );
}
function OpcionOut({ c, q }) {
  const isCall = c.tipoOpcion === "call";
  return (
    <React.Fragment>
      <OutLine label="Prima total a pagar hoy" value={HMX.fmtMXN(c.primaTotal, 0)} big color="var(--accent-ink)" sub={"$" + c.prima.toFixed(2) + "/USD × " + HMX.fmtUSD(q.monto) + " USD"} />
      <OutLine label="Prima como % del nocional" value={c.primaPct.toFixed(2) + "%"} />
      <OutLine label="Break-even" value={c.breakeven.toFixed(4)} sub={"Strike " + (isCall ? "+" : "−") + " prima · MXN/USD"} />
      <OutLine label={isCall ? "Precio máximo de compra" : "Precio mínimo de venta"} value={c.strike.toFixed(2)} sub="Strike · MXN/USD" />
      <OutLine label="Delta" value={c.delta.toFixed(3)} />
      <div style={{ paddingTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="chip chip-pos">{isCall ? "Ganas si MXN se aprecia" : "Ganas si MXN se deprecia"}</span>
        <span className="chip">Derecho, no obligación</span>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { InstrumentsScreen });
