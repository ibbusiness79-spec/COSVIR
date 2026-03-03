import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../shared/api/client";
import { Decision } from "../../shared/types";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["decisions"],
    queryFn: async () => (await api.get<Decision[]>("/decisions")).data
  });

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="grid">
      {data?.map((d) => (
        <div key={d.id} className="card">
          <h3>{d.title}</h3>
          <p>{d.categoryType} | {d.riskLevel} | {d.horizon}</p>
          <p>Status: {d.status}</p>
          <div className="row">
            <Link to={`/decisions/${d.id}/debate`}><button>Debat</button></Link>
            <Link to={`/decisions/${d.id}/summary`}><button className="secondary">Synthese</button></Link>
          </div>
        </div>
      ))}
      {data?.length === 0 && <div className="card">Aucune decision.</div>}
    </div>
  );
}
