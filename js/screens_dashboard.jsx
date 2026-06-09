/* HedgeMX — Dashboard simple: tabla por país. Exporta a window. */
/* global React, HMX, Icon, useStore, Sparkline */

function Flag({ code }) {
  const colors = { MX: ["#006847", "#ce1126"], US: ["#3c3b6e", "#b22234"], EU: ["#003399", "#ffcc00"], GB: ["#012169", "#c8102e"], CA: ["#d52b1e", "#fff"] };
  const [a, b] = colors[code] || ["#888", "#bbb"];
  return (
    <span style={{ width: 22, height: 16, borderRadius: 3, overflow: "hidden", display: "inline-flex", flex: "0 0 auto", border: "1px solid var(--hairline)" }}>
      <span style={{ flex: 1, background: a }} /><span style={{ flex: 1, background: b }} />
    </span>
  );
}

function DashboardScreen() {
  const { navigate } = useStore();
  const m = HMX.market;
  const C = HMX.countries;

  const stats = [
    ["Tipo de cambio USD/MXN", m.pairs["USD/MXN"].spot.toFixed(4), "Banxico FIX", m.pairs["USD/MXN"].spot - m.pairs["USD/MXN"].prev],
    ["Diferencial Banxico − Fed", "+" + m.diferencial.toFixed(2) + "%", "Determina el costo del forward", null],
    ["Volatilidad implícita MXN", m.volImpl.toFixed(1) + "%", "ATM 1 mes · P" + m.volPercentil + " (2 años)", null]
  ];

  return (
    <div className="content-inner fade-in">
      {/* Stats destacados */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        {stats.map(([label, val, sub, chg]) => (
          <div key={label} className="card card-pad">
            <div className="stat-label">{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
              <span className="stat-value">{val}</span>
              {chg != null && (
                <span className={"chip " + (chg >= 0 ? "chip-pos" : "chip-neg")} style={{ padding: "2px 7px" }}>
                  <Icon name={chg >= 0 ? "arrowUp" : "arrowDown"} size={11} />{Math.abs(chg).toFixed(3)}
                </span>
              )}
            </div>
            <div className="muted-3" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabla comparativa por país */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Indicadores económicos por país</div>
            <div className="card-sub">Tipo de cambio, tasa de referencia e inflación — la base para decidir tu cobertura</div>
          </div>
          <span className="chip"><span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--pos)" }} /> En vivo</span>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>País</th>
              <th className="num">Tipo de cambio (vs MXN)</th>
              <th>Tendencia 30d</th>
              <th className="num">Tasa de interés</th>
              <th>Banco central</th>
              <th className="num">Inflación anual</th>
            </tr>
          </thead>
          <tbody>
            {C.map((c) => {
              const chg = c.tc != null && c.tcPrev != null ? c.tc - c.tcPrev : null;
              return (
                <tr key={c.pais}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Flag code={c.flag} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.pais}</div>
                        <div className="muted-3" style={{ fontSize: 11.5, fontFamily: "var(--mono)" }}>{c.divisa}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">
                    {c.tc == null ? <span className="muted-3">— moneda base</span> : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>{c.tc.toFixed(4)}</span>
                        {chg != null && <span className={chg >= 0 ? "neg" : "pos"} style={{ fontSize: 11.5 }}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(3)}</span>}
                      </div>
                    )}
                  </td>
                  <td>{c.tc == null ? <span className="muted-3">—</span> : <Sparkline data={c.series} w={84} h={26} color={chg >= 0 ? "var(--neg)" : "var(--pos)"} />}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{c.tasa.toFixed(2)}%</td>
                  <td><span className="muted">{c.banco}</span></td>
                  <td className="num">
                    <span className="chip" style={{ background: c.inflacion > 4 ? "var(--warn-wash)" : "var(--surface-2)", color: c.inflacion > 4 ? "var(--warn)" : "var(--ink-2)", border: "none" }}>
                      {c.inflacion.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="card-pad" style={{ borderTop: "1px solid var(--hairline)", display: "flex", gap: 12, alignItems: "center", background: "var(--surface-2)" }}>
          <Icon name="info" size={17} style={{ color: "var(--accent)", flex: "0 0 auto" }} />
          <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            El <strong>diferencial de tasas</strong> entre México y cada país encarece o abarata su divisa a futuro. Con Banxico en {m.tasaBanxico.toFixed(2)}% y la Fed en {m.fedFunds.toFixed(2)}%, el peso cotiza <strong>más caro a futuro</strong> frente al dólar (forward &gt; spot).
          </p>
        </div>
      </div>

      {/* Acción */}
      <div className="card card-pad" style={{ marginTop: "var(--gap)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "linear-gradient(135deg, var(--accent-wash), var(--surface))", border: "1px solid var(--accent-wash-2)" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>¿Listo para cubrir tu exposición?</div>
          <p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>Elige un instrumento, ingresa tu monto y calcula contratos, prima y costo al instante.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("instruments")}>Ir a instrumentos <Icon name="arrowRight" size={16} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
