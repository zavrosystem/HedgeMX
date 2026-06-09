/* HedgeMX — App root (6 ventanas): routing, shell, tweaks. */
/* global React, ReactDOM, useStore, StoreProvider, Sidebar, Topbar,
   LoginScreen, DashboardScreen, InstrumentsScreen, MarketScreen, CostsScreen, TrackingScreen,
   useTweaks, TweaksPanel, TweakSection, TweakRadio */
const { useEffect: appUseEffect } = React;

const SCREENS = {
  login: LoginScreen, dashboard: DashboardScreen, instruments: InstrumentsScreen,
  market: MarketScreen, costs: CostsScreen, tracking: TrackingScreen
};
const FULLSCREEN = { login: true };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "azul",
  "density": "comoda"
}/*EDITMODE-END*/;

function Shell() {
  const { route } = useStore();
  const Screen = SCREENS[route.name] || DashboardScreen;
  if (FULLSCREEN[route.name]) return <Screen />;
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content"><Screen /></div>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  appUseEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.density = t.density;
  }, [t.theme, t.density]);

  return (
    <StoreProvider>
      <Shell />
      <TweaksPanel>
        <TweakSection label="Dirección visual" />
        <TweakRadio label="Tema" value={t.theme} options={["azul", "verde", "violeta"]} onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="Densidad" />
        <TweakRadio label="Espaciado" value={t.density} options={["comoda", "compacta"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
