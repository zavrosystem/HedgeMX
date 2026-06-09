/* HedgeMX — Costos + Seguimiento (trazabilidad). Exporta a window. */
/* global React, HMX, Icon, useStore, DualAxisChart */
const { useState: tkUseState } = React;
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/* ============================ COSTOS ============================ */
function CostsScreen() {
  const { quote, navigate, addContract } = useStore();
  const m = HMX.market;
  const q = quote;
  const c = HMX.computeQuote(q);
  const isOpt = q.instrumento === "Opción";
  const isFut = q.instrumento === "Futuro";
  const forward = c.forward;
  const cost = HMX.costBreakdown({ nocionalUSD: q.monto, forward, spreadMXN: 0.08, comisionPct: 0.10 });

  // costo inicial según instrumento
  const costoInicial = isOpt ? c.primaTotal : isFut ? c.margenInicial : 0;

  const primaOpt = HMX.garmanKohlhagen("call", c.spot, Math.round(c.spot * 1.017 * 100) / 100, m.tasaBanxico, m.fedFunds, m.volImpl, q.dias / 365).price * q.monto;
  const fut = HMX.futuresContracts(q.monto, 10000, 8500);
  const comparativo = [
    ["Forward", "$0", HMX.fmtMXN(cost.costoTotal, 0) + " (spread)", "Ninguna", q.instrumento === "Forward"],
    ["Opción", HMX.fmtMXN(primaOpt, 0), HMX.fmtMXN(primaOpt * 1.19, 0), "Alta", isOpt],
    ["Futuro", HMX.fmtMXN(fut.initialMargin, 0), "Variable", "Media", isFut]
  ];

  const confirmar = () => {
    const d = new Date(); d.setDate(d.getDate() + q.dias);
    const pactado = c.pactado || c.forward;
    const id = (isFut ? "FUT" : isOpt ? "OPT" : "FWD") + "-2026-00" + Math.floor(4800 + Math.random() * 199);
    addContract({
      id, instrumento: q.instrumento, par: q.par, type: "compra",
      nocionalUSD: q.monto, tcPactado: +pactado.toFixed(2), tcSpotActual: +(c.spot + 0.24).toFixed(2),
      venceISO: d.toISOString().slice(0, 10),
      venceLabel: d.getDate() + " " + MESES[d.getMonth()] + " " + d.getFullYear(),
      diasRest: q.dias, estado: "activo",
      prima: isOpt ? c.prima : undefined,
      contratos: isFut ? c.contratos : undefined,
      margenInicial: isFut ? c.margenInicial : undefined,
      adjustes: isFut ? [{ fecha: MESES[d.getMonth()] + " 01", spot: +c.spot.toFixed(2), mtm: 0, ajuste: "Margen inicial depositado", estado: "ok" }] : null,
      spotPath: HMX.genHistory(q.par, 60)
    });
    navigate("tracking");
  };

  return (
    <div className="content-inner fade-in" style={{ maxWidth: 980 }}>
      <button className="btn btn-ghost" style={{ marginBottom: 16, padding: "7px 12px" }} onClick={() => navigate("instruments")}>
        <Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} /> Volver a instrumentos
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <div><div className="card-title">Resumen de costos</div><div className="card-sub">{q.instrumento}{isOpt ? " " + q.tipoOpcion.toUpperCase() : ""} {q.par} · {q.dias} días</div></div>
            <Icon name="doc" size={18} style={{ color: "var(--ink-3)" }} />
          </div>
          <div className="card-pad receipt">
            <div className="line"><span className="lbl">Monto nocional</span><span>{HMX.fmtUSD(q.monto)} USD</span></div>
            <div className="line"><span className="lbl">{isOpt ? "Strike" : "Tipo de cambio"} {isOpt ? "" : "forward"}</span><span>{(c.pactado || forward).toFixed(4)} MXN/USD</span></div>
            <div className="divider" style={{ margin: "8px 0" }} />
            {isOpt && <div className="line"><span className="lbl">Prima de la opción</span><span>{HMX.fmtMXN(c.primaTotal, 0)}</span></div>}
            {isFut && <div className="line"><span className="lbl">Margen inicial (recuperable)</span><span>{HMX.fmtMXN(c.margenInicial, 0)}</span></div>}
            <div className="line"><span className="lbl">Spread de plataforma · $0.08/USD</span><span>{HMX.fmtMXN(cost.spreadTotal, 0)}</span></div>
            <div className="line"><span className="lbl">Comisión de administración · 0.10%</span><span>{HMX.fmtMXN(cost.comision, 2)}</span></div>
            <div className="line"><span className="lbl">IVA (16%)</span><span>{HMX.fmtMXN(cost.iva, 2)}</span></div>
            <div className="line total"><span>COSTO TOTAL DE OPERACIÓN</span><span>{HMX.fmtMXN(cost.costoTotal + (isOpt ? c.primaTotal : 0), 2)}</span></div>
            <div className="line" style={{ marginTop: 10, background: "var(--accent-wash)", borderRadius: 8, padding: "12px 14px" }}>
              <span style={{ color: "var(--accent-ink)", fontWeight: 600 }}>Tipo de cambio efectivo neto</span>
              <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>{cost.tcEfectivoNeto.toFixed(4)} MXN/USD</span>
            </div>
          </div>
          <div className="card-pad" style={{ borderTop: "1px solid var(--hairline)" }}>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={confirmar}>
              <Icon name="check" size={16} /> Confirmar y contratar cobertura
            </button>
            <p className="muted-3" style={{ fontSize: 11.5, textAlign: "center", margin: "10px 0 0" }}>
              <Icon name="lock" size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> Operación cifrada y registrada ante la CNBV.
            </p>
          </div>
        </div>

        <div className="grid" style={{ gap: "var(--gap)" }}>
          <div className="card">
            <div className="card-head"><div className="card-title">Comparativo entre instrumentos</div></div>
            <table className="data">
              <thead><tr><th>Instrumento</th><th className="num">Costo inicial</th><th className="num">Costo total</th><th>Flexibilidad</th></tr></thead>
              <tbody>
                {comparativo.map((r) => (
                  <tr key={r[0]} style={r[4] ? { background: "var(--accent-wash)" } : null}>
                    <td style={{ fontWeight: 700 }}>{r[0]}{r[4] && <span className="chip chip-accent" style={{ marginLeft: 8, padding: "1px 7px" }}>elegido</span>}</td>
                    <td className="num">{r[1]}</td><td className="num">{r[2]}</td><td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card card-pad" style={{ display: "flex", gap: 12, background: "var(--surface-2)", boxShadow: "none" }}>
            <Icon name="info" size={17} style={{ color: "var(--ink-3)", flex: "0 0 auto", marginTop: 1 }} />
            <p className="muted" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55 }}>
              El <strong>margen del futuro no es un costo</strong>: se recupera al vencimiento. El costo real son las llamadas al margen por movimientos adversos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SEGUIMIENTO ============================ */
function EstadoBadge({ estado }) {
  const map = { activo: ["chip-pos", "Activo", "var(--pos)"], riesgo: ["chip-warn", "En riesgo de margin call", "var(--warn)"], vencido: ["chip-neg", "Vencido", "var(--neg)"] };
  const [cls, txt, col] = map[estado] || map.activo;
  return <span className={"chip " + cls}><span style={{ width: 7, height: 7, borderRadius: 4, background: col }} /> {txt}</span>;
}

function TrackingScreen() {
  const { contracts, selectedContractId, setSelectedContractId, navigate } = useStore();
  const [canal, setCanal] = tkUseState("email");
  const c = contracts.find((x) => x.id === selectedContractId) || contracts[0];
  const mtmActual = HMX.mtm(c);
  const isFut = c.instrumento === "Futuro";
  const mtmPath = c.spotPath.map((s) => (s - c.tcPactado) * c.nocionalUSD);
  const favorable = mtmActual >= 0;

  return (
    <div className="content-inner fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <select className="select" value={c.id} onChange={(e) => setSelectedContractId(e.target.value)} style={{ width: "auto", fontWeight: 600, fontFamily: "var(--mono)", paddingRight: 36 }}>
            {contracts.map((ct) => <option key={ct.id} value={ct.id}>{ct.id} · {ct.instrumento} {ct.par}</option>)}
          </select>
          <EstadoBadge estado={c.estado} />
        </div>
        <button className="btn btn-subtle" onClick={() => navigate("instruments")}><Icon name="plus" size={15} /> Nueva cobertura</button>
      </div>

      {c.estado === "riesgo" && (
        <div className="card" style={{ background: "var(--neg-wash)", border: "1px solid var(--neg)", padding: "14px 18px", marginBottom: "var(--gap)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--neg)", color: "#fff", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name="alert" size={18} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--neg)" }}>Margin call: deposita {HMX.fmtMXN(15000, 0)} antes de las 2:00 PM</div>
            <div className="muted" style={{ fontSize: 13 }}>El MTM negativo superó el margen de mantenimiento. De lo contrario tu posición podría ser liquidada.</div>
          </div>
          <button className="btn btn-primary">Depositar ahora</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "var(--gap)", alignItems: "start" }}>
        <div className="grid" style={{ gap: "var(--gap)" }}>
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Posición actual</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[["Instrumento", c.instrumento + " " + c.par, false],
                ["Monto nocional", HMX.fmtUSD(c.nocionalUSD) + " USD", true],
                [isFut ? "Precio del futuro" : "TC pactado", c.tcPactado.toFixed(2) + " MXN/USD", true],
                ["TC spot actual", c.tcSpotActual.toFixed(2) + " MXN/USD", true],
                ["Vencimiento", c.venceLabel, false],
                ["Días restantes", c.diasRest + " días", false]].map(([k, v, mono]) => (
                <div key={k}>
                  <div className="stat-label">{k}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, fontFamily: mono ? "var(--mono)" : "var(--sans)" }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: "18px 0 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div className="stat-label">MTM (Mark to Market)</div>
                <div className={"stat-value lg " + (favorable ? "pos" : "neg")} style={{ marginTop: 4 }}>
                  {favorable ? "+" : "−"}{HMX.fmtMXN(Math.abs(mtmActual), 0)}
                  <Icon name={favorable ? "arrowUp" : "arrowDown"} size={20} style={{ display: "inline", marginLeft: 6, verticalAlign: "-2px" }} />
                </div>
              </div>
              <div className="card card-pad" style={{ flex: 1, maxWidth: 320, boxShadow: "none", background: favorable ? "var(--pos-wash)" : "var(--neg-wash)", border: "none" }}>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: favorable ? "var(--pos)" : "var(--neg)" }}>
                  {favorable ? "La cobertura vale más porque el MXN se depreció, confirmando que fue acertada." : "El mercado se movió a favor sin cobertura; el MTM refleja el costo de oportunidad."}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div><div className="card-title">Trazabilidad de la cobertura</div><div className="card-sub">Spot vs. valor MTM · últimos 60 días</div></div>
              <div style={{ display: "flex", gap: 14, fontSize: 11.5 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}><span style={{ width: 14, height: 2, background: "var(--accent)", display: "inline-block" }} /> Spot</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}><span style={{ width: 14, height: 2, background: favorable ? "var(--pos)" : "var(--neg)", display: "inline-block" }} /> MTM</span>
              </div>
            </div>
            <div className="card-pad">
              <DualAxisChart spot={c.spotPath} mtm={mtmPath} pactado={c.tcPactado} />
              <div style={{ display: "flex", gap: 18, marginTop: 4, fontSize: 11.5, color: "var(--ink-3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, background: "var(--pos)", opacity: .16, display: "inline-block" }} /> Zona favorable a la cobertura</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 0, borderTop: "1.5px dashed var(--ink)", display: "inline-block" }} /> TC pactado</span>
              </div>
            </div>
          </div>

          {isFut && c.adjustes && (
            <div className="card">
              <div className="card-head"><div className="card-title">Historial de ajustes · margin calls</div></div>
              <table className="data">
                <thead><tr><th>Fecha</th><th className="num">TC spot</th><th className="num">MTM diario</th><th>Ajuste requerido</th><th>Estado</th></tr></thead>
                <tbody>
                  {c.adjustes.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.fecha}</td>
                      <td className="num">{a.spot.toFixed(2)}</td>
                      <td className="num"><span className={a.mtm >= 0 ? "pos" : "neg"} style={{ fontWeight: 600 }}>{a.mtm >= 0 ? "+" : "−"}{HMX.fmtMXN(Math.abs(a.mtm), 0)}</span></td>
                      <td>{a.ajuste}</td>
                      <td>{a.estado === "warn" ? <span className="chip chip-warn"><Icon name="alert" size={12} /> Requerido</span> : <span className="chip chip-pos"><Icon name="check" size={12} /> OK</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid" style={{ gap: "var(--gap)" }}>
          <div className="card">
            <div className="card-head"><div className="card-title">Alertas configurables</div></div>
            <div className="card-pad" style={{ display: "grid", gap: 4 }}>
              {[["Notificar si TC spot supera $18.50", true], ["Notificar si MTM cae bajo −$25,000", true], ["Notificar 5 días antes del vencimiento", false]].map(([label, on0], idx) => (
                <AlertToggle key={idx} label={label} initial={on0} />
              ))}
              <div style={{ paddingTop: 14 }}>
                <div className="stat-label" style={{ marginBottom: 8 }}>Canal de notificación</div>
                <div className="segmented" style={{ width: "100%" }}>
                  {[["email", "Email"], ["sms", "SMS"], ["push", "Push"]].map(([v, l]) => (
                    <button key={v} className={canal === v ? "active" : ""} style={{ flex: 1 }} onClick={() => setCanal(v)}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="card-title" style={{ fontSize: 13, marginBottom: 12 }}>Cuenta de margen</div>
            {[["Margen depositado", isFut ? HMX.fmtMXN(c.margenInicial || 85000, 0) : "—"],
              ["Margen de mantenimiento", isFut ? HMX.fmtMXN(63750, 0) : "—"],
              ["Disponible para retiro", isFut ? HMX.fmtMXN(21250, 0) : "—"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
                <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 14 }}><Icon name="download" size={15} /> Estado de cuenta (PDF)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertToggle({ label, initial }) {
  const [on, setOn] = tkUseState(initial);
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--hairline)", cursor: "pointer" }} onClick={() => setOn(!on)}>
      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{label}</span>
      <div style={{ width: 38, height: 22, borderRadius: 11, flex: "0 0 auto", background: on ? "var(--accent)" : "var(--hairline)", position: "relative", transition: "background .16s" }}>
        <div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-sm)", transition: "left .16s" }} />
      </div>
    </label>
  );
}

Object.assign(window, { CostsScreen, TrackingScreen });
