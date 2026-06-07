import React from "react";
import About from "./routes/About";
import Home from "./routes/Home";
import Play from "./routes/Play";
import Privacy from "./routes/Privacy";

export type RouteName = "/" | "/play" | "/about" | "/privacy";

function normalizePath(path: string): RouteName {
  if (path === "/play" || path === "/about" || path === "/privacy") return path;
  return "/";
}

export function navigate(path: RouteName): void {
  window.history.pushState({}, "", `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Nav() {
  return (
    <nav className="nav" aria-label="Primary navigation">
      <button type="button" onClick={() => navigate("/")} className="wordmark">
        StableOrNot
      </button>
      <div className="nav-links">
        <button type="button" onClick={() => navigate("/play")}>
          Play
        </button>
        <button type="button" onClick={() => navigate("/about")}>
          About
        </button>
        <button type="button" onClick={() => navigate("/privacy")}>
          Privacy
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const [route, setRoute] = React.useState<RouteName>(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const path = window.location.pathname.replace(base, "") || "/";
    return normalizePath(path);
  });

  React.useEffect(() => {
    const updateRoute = () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const path = window.location.pathname.replace(base, "") || "/";
      setRoute(normalizePath(path));
    };
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  return (
    <div className="app">
      <Nav />
      {route === "/" && <Home />}
      {route === "/play" && <Play />}
      {route === "/about" && <About />}
      {route === "/privacy" && <Privacy />}
    </div>
  );
}
