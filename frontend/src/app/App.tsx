import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "../shared/api/client";
import { useAuthStore } from "../modules/auth/store";
import { LoginPage } from "../modules/auth/LoginPage";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { DecisionFormPage } from "../modules/decisions/DecisionFormPage";
import { DebatePage } from "../modules/debate/DebatePage";
import { SummaryPage } from "../modules/summary/SummaryPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function Header() {
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="row" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Comite Strategique Virtuel</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/decisions/new">Nouvelle decision</Link>
      </div>
      <div className="row" style={{ alignItems: "center" }}>
        <span>{email}</span>
        <button
          className="secondary"
          onClick={async () => {
            const refreshToken = localStorage.getItem("cosvir_refresh_token");
            if (refreshToken) {
              try {
                await api.post("/auth/logout", { refreshToken });
              } catch {
                // ignore network/logout errors
              }
            }
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/decisions/new" element={<DecisionFormPage />} />
                  <Route path="/decisions/:id/debate" element={<DebatePage />} />
                  <Route path="/decisions/:id/summary" element={<SummaryPage />} />
                </Routes>
              </>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}
