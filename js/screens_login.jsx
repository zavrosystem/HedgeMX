/* HedgeMX — Login (simple, con 2FA). Exporta a window. */
/* global React, HMX, Icon, useStore */
const { useState: lgUseState } = React;

function LoginScreen() {
  const { login } = useStore();
  const [email, setEmail] = lgUseState("tesoreria@bajio.mx");
  const [pass, setPass] = lgUseState("••••••••••");
  const [stage, setStage] = lgUseState("login");
  const [code, setCode] = lgUseState(["", "", "", "", "", ""]);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const m = HMX.market;

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = code.slice(); n[i] = v; setCode(n);
    if (v && i < 5) { const el = document.getElementById("otp" + (i + 1)); if (el) el.focus(); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aside">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark">H</div>
          <div className="brand-name" style={{ fontSize: 18 }}>Hedge<span>MX</span></div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: 420 }}>
            Cobertura cambiaria para tu PYME, sin letras chiquitas.
          </div>
          <p style={{ color: "var(--side-ink-2)", fontSize: 15, lineHeight: 1.6, maxWidth: 400, marginTop: 16 }}>
            Forward, futuros y opciones sobre divisas con cálculo de contratos, prima y costo en tiempo real.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
            {[["USD/MXN", m.pairs["USD/MXN"].spot.toFixed(2)],
              ["Banxico", m.tasaBanxico.toFixed(2) + "%"],
              ["Diferencial", "+" + m.diferencial.toFixed(2) + "%"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "var(--side-ink-2)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)", color: "#fff", marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: "var(--side-ink-2)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="lock" size={13} /> Acceso cifrado · 2FA obligatorio · Maqueta de demostración
        </div>
        <div style={{ position: "absolute", right: -120, bottom: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", opacity: .18 }} />
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {stage === "login" ? (
            <React.Fragment>
              <div className="eyebrow">Acceso empresarial</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "6px 0 4px" }}>Iniciar sesión</h2>
              <p className="muted-3" style={{ margin: "0 0 28px", fontSize: 14 }}>Bienvenido de vuelta a HedgeMX.</p>
              <div className="grid" style={{ gap: 16 }}>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                  {!valid && email && <span className="hint neg">Formato de correo inválido.</span>}
                </div>
                <div className="field">
                  <label>Contraseña</label>
                  <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                  <a className="hint" style={{ color: "var(--accent-ink)", alignSelf: "flex-end", cursor: "pointer", fontWeight: 600 }}>¿Olvidaste tu contraseña?</a>
                </div>
                <button className="btn btn-primary btn-lg" disabled={!valid} onClick={() => setStage("2fa")} style={{ width: "100%", marginTop: 4 }}>
                  Iniciar sesión <Icon name="arrowRight" size={16} />
                </button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <button className="btn btn-ghost" style={{ marginBottom: 22, padding: "7px 12px" }} onClick={() => setStage("login")}>
                <Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} /> Volver
              </button>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-wash)", color: "var(--accent-ink)", display: "grid", placeItems: "center", marginBottom: 16 }}>
                <Icon name="shield" size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Verificación en dos pasos</h2>
              <p className="muted-3" style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.5 }}>
                Ingresa el código de 6 dígitos enviado por SMS al ••• 4821 o generado en tu app TOTP.
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                {code.map((d, i) => (
                  <input key={i} id={"otp" + i} className="input mono" value={d} onChange={(e) => setDigit(i, e.target.value)} maxLength={1}
                         style={{ textAlign: "center", fontSize: 22, fontWeight: 600, padding: "12px 0" }} />
                ))}
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={login}>
                Verificar y entrar <Icon name="check" size={16} />
              </button>
              <p className="muted-3" style={{ fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
                Tras 3 intentos fallidos la cuenta se bloquea 15 min. Operaciones registradas ante la CNBV.
              </p>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
