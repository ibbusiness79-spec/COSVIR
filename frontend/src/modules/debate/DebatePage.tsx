import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../../shared/api/client";
import { AgentAnalysis } from "../../shared/types";
import { RiskBadge } from "../../shared/ui/RiskBadge";

export function DebatePage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["debate", id],
    queryFn: async () => (await api.get(`/decisions/${id}/debate`)).data,
    enabled: Boolean(id)
  });

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>{data.decision.title}</h3>
        <p>{data.decision.context}</p>
        {data.score && <RiskBadge score={data.score.globalRiskScore} />}
      </div>
      {data.analyses.map((a: AgentAnalysis) => (
        <div className="card" key={a.agentType}>
          <h4>{a.agentType.toUpperCase()}</h4>
          <p>{a.analysis}</p>
          <p>Recommendation: <strong>{a.recommendation}</strong></p>
          <p>Confidence: {a.confidence}</p>
          <ul>
            {a.risks.map((r) => (
              <li key={r.label}>{r.label} ({r.severity}) - {r.rationale}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
