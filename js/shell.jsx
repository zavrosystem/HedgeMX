/* HedgeMX — Shell: Sidebar, Topbar, Modal (simplificado). Exporta a window. */
/* global React, HMX, Icon, useStore */
const { useState: shUseState, useEffect: shUseEffect } = React;

const NAV = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "instruments", icon: "layers", label: "Instrumentos" },
  { id: "market", icon: "trending", label: "Mercado" },
  { id: "costs", icon: "calculator", label: "Costos" },
  { id: "tracking", icon: "shield", label: "Seguimiento" }
];

function Sidebar() {
  const { route, navigate, contracts } = useStore();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">H</div>
        <div className="brand-name">Hedge<span>MX</span></div>
      </div>
      <div className="nav-label">Cobertura cambiaria</div>
      {NAV.map((it) => (
        <div key={it.id} className={"nav-item" + (route.name === it.id ? " active" : "")} onClick={() => navigate(it.id)}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
          {it.id === "tracking" && contracts.some((c) => c.estado === "riesgo") &&
            <span className="dot" style={{ background: "var(--warn)" }} />}
        </div>
      ))}
      <div className="side-foot">
        <div className="exposure-card" onClick={() => navigate("tracking")} style={{ cursor: "pointer" }}>
          <div className="lbl">Exposición cubierta</div>
          <div className="val">{HMX.fmtUSD(contracts.reduce((s, c) => s + c.nocionalUSD, 0))}</div>
          <div className="sub">{contracts.length} posiciones activas</div>
        </div>
        <div className="nav-item" style={{ marginTop: 6 }} onClick={() => navigate("login")}>
          <Icon name="logout" size={18} /><span>Cerrar sesión</span>
        </div>
      </div>
    </aside>
  );
}

const TITLES = {
  dashboard: "Indicadores económicos",
  instruments: "Instrumentos de cobertura",
  market: "Precios del subyacente",
  costs: "Comisiones y costos",
  tracking: "Seguimiento de la cobertura"
};

function Topbar() {
  const { route, navigate } = useStore();
  const title = TITLES[route.name] || "";
  const [spot, setSpot] = shUseState(HMX.market.pairs["USD/MXN"].spot);
  const [pulse, setPulse] = shUseState(false);
  const prev = HMX.market.pairs["USD/MXN"].prev;
  const chg = spot - prev;

  const refresh = () => {
    setPulse(true);
    setSpot((s) => +(s + (Math.random() - 0.45) * 0.03).toFixed(4));
    setTimeout(() => setPulse(false), 500);
  };
  shUseEffect(() => {
    const t = setInterval(() => setSpot((s) => +(s + (Math.random() - 0.5) * 0.012).toFixed(4)), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div style={{ flex: 1 }} />
      <div className="ticker" title="Banxico FIX · simulado">
        <span className="pair">USD/MXN</span>
        <span className="px">{spot.toFixed(4)}</span>
        <span className={chg >= 0 ? "pos" : "neg"} style={{ display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 600, fontFamily: "var(--mono)" }}>
          <Icon name={chg >= 0 ? "arrowUp" : "arrowDown"} size={12} />{Math.abs(chg).toFixed(3)}
        </span>
      </div>
      <button className="icon-btn" onClick={refresh} title="Actualizar"
              style={{ transform: pulse ? "rotate(180deg)" : "none", transition: "transform .5s" }}>
        <Icon name="refresh" size={17} />
      </button>
      <div className="avatar" onClick={() => navigate("dashboard")} title="Manufacturas del Bajío">MB</div>
    </header>
  );
}

function Modal({ title, sub, onClose, children, maxWidth }) {
  shUseEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={maxWidth ? { maxWidth } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>{title}</div>
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, Modal });
