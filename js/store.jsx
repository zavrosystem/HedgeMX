/* HedgeMX — Store global (simplificado, 6 ventanas). Exporta a window. */
/* global React, HMX */
const { createContext: _cc, useContext: _uc, useState: _us, useCallback: _ucb, useMemo: _um } = React;

const StoreCtx = _cc(null);

function StoreProvider({ children }) {
  const [route, setRoute] = _us({ name: "login", params: {} });
  const [contracts, setContracts] = _us(() => HMX.buildSeedContracts());
  const [selectedContractId, setSelectedContractId] = _us("FWD-2024-004821");

  // Cotización compartida entre Instrumentos → Mercado → Costos → Seguimiento
  const [quote, setQuoteState] = _us({
    instrumento: "Forward",      // Forward | Futuro | Opción
    tipoOpcion: "call",          // call | put (solo Opción)
    par: "USD/MXN",
    monto: 150000,
    dias: 90,
    strike: 17.50
  });

  const navigate = _ucb((name, params = {}) => {
    setRoute({ name, params });
    const c = document.querySelector(".content");
    if (c) c.scrollTop = 0;
  }, []);

  const setQuote = _ucb((patch) => setQuoteState((q) => ({ ...q, ...patch })), []);

  const login = _ucb(() => navigate("dashboard"), [navigate]);

  const addContract = _ucb((c) => {
    setContracts((list) => [c, ...list]);
    setSelectedContractId(c.id);
  }, []);

  const value = {
    route, navigate,
    login, logout: () => navigate("login"),
    contracts, addContract, setContracts,
    selectedContractId, setSelectedContractId,
    quote, setQuote
  };
  return React.createElement(StoreCtx.Provider, { value }, children);
}

function useStore() { return _uc(StoreCtx); }

Object.assign(window, { StoreProvider, useStore, StoreCtx });
