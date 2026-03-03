import PDFDocument from "pdfkit";

export class PdfService {
  async renderExecutiveSummary(payload: {
    title: string;
    summary: string;
    recommendation: string;
    globalRiskScore: number;
    criticalZones: Array<{ zoneType: string; severity: number }>;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    doc.fontSize(20).text("Comite Strategique Virtuel", { align: "left" });
    doc.moveDown();
    doc.fontSize(14).text(`Decision: ${payload.title}`);
    doc.text(`Recommendation finale: ${payload.recommendation}`);
    doc.text(`Global Risk Score: ${payload.globalRiskScore}/100`);
    doc.moveDown();
    doc.fontSize(12).text("Synthese executive");
    doc.fontSize(10).text(payload.summary);
    doc.moveDown();
    doc.fontSize(12).text("Zones critiques");
    payload.criticalZones.forEach((zone) => {
      doc.fontSize(10).text(`- ${zone.zoneType} (severity ${zone.severity})`);
    });

    doc.end();

    return await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
}
