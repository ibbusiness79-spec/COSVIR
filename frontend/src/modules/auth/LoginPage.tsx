import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/api/client";
import { useAuthStore } from "./store";

export function LoginPage() {
  const [email, setEmail] = useState("founder@example.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = "/auth/login";
      const payload = { email, password };
      let response;
      try {
        response = await api.post(endpoint, payload);
      } catch {
        response = await api.post("/auth/register", payload);
      }

      setAuth(response.data.accessToken ?? response.data.token, response.data.refreshToken, response.data.user.email);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Authentication failed");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "80px auto" }}>
      <h3>Connexion</h3>
      <form onSubmit={handle} className="grid">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        <button type="submit">Entrer</button>
      </form>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
    </div>
  );
}
