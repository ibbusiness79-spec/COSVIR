import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/api/client";

export function DecisionFormPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [categoryType, setCategoryType] = useState("expansion");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [horizon, setHorizon] = useState("12m");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await api.post("/decisions", { title, context, categoryType, riskLevel, horizon });
    await api.post(`/decisions/${response.data.id}/analyze`);
    navigate(`/decisions/${response.data.id}/summary`);
  };

  return (
    <div className="card">
      <h3>Nouvelle decision strategique</h3>
      <form className="grid" onSubmit={onSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la decision" required />
        <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Contexte detaille" rows={8} required />
        <div className="row">
          <select value={categoryType} onChange={(e) => setCategoryType(e.target.value)}>
            <option value="expansion">Expansion</option>
            <option value="pricing">Pricing</option>
            <option value="product">Product</option>
            <option value="hiring">Hiring</option>
            <option value="partnership">Partnership</option>
          </select>
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
            <option value="3m">3m</option>
            <option value="6m">6m</option>
            <option value="12m">12m</option>
            <option value="24m">24m</option>
            <option value="36m">36m</option>
          </select>
        </div>
        <button type="submit">Soumettre et analyser</button>
      </form>
    </div>
  );
}
