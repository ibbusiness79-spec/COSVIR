export function RiskBadge({ score }: { score: number }) {
  if (score >= 65) return <span className="badge badge-danger">Risque eleve ({score})</span>;
  if (score >= 35) return <span className="badge badge-warning">Risque modere ({score})</span>;
  return <span className="badge badge-ok">Risque faible ({score})</span>;
}
