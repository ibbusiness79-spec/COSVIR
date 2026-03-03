import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../../shared/api/client";
import { RiskBadge } from "../../shared/ui/RiskBadge";

export function SummaryPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["summary", id],
    queryFn: async () => (await api.get(`/decisions/${id}/executive-summary`)).data,
    enabled: Boolean(id)
  });

  const exportPdf = async () => {
    const response = await api.post(`/decisions/${id}/export/pdf`, {}, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="grid">
      <div className="card">
        <h3>Synthese executive</h3>
        <p>{data.decision.title}</p>
        <p>{data.executiveSummary}</p>
        <p>Recommendation: <strong>{data.recommendation}</strong></p>
        <RiskBadge score={data.score.globalRiskScore} />
        <button style={{ marginTop: 12 }} onClick={exportPdf}>Exporter PDF</button>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4>Zones critiques</h4>
          <ul>
            {data.criticalZones.map((z: any, idx: number) => (
              <li key={`${z.zoneType}-${idx}`}>{z.zoneType} ({z.severity})</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4>Scenarios</h4>
          <ul>
            {data.scenarios.map((s: any, idx: number) => (
              <li key={`${s.scenarioType}-${idx}`}>
                <strong>{s.scenarioType}</strong>: risque {s.riskDelta} - {s.expectedOutcome}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
