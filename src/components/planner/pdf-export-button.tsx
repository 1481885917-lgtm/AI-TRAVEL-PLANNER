"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TravelPlan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type PdfExportButtonProps = {
  plan: TravelPlan;
};

export function PdfExportButton({ plan }: PdfExportButtonProps) {
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const lines = [
      `AI Travel Planner`,
      `${plan.input.origin} -> ${plan.input.destination}`,
      `Date: ${plan.input.departDate} to ${plan.input.returnDate}`,
      `Travelers: ${plan.input.travelers}`,
      `Budget: ${formatCurrency(plan.budget.total)} / ${formatCurrency(plan.input.totalBudget)}`,
      "",
      ...plan.days.flatMap((day) => [
        `Day ${day.day} ${day.date} ${day.city}`,
        `Morning: ${day.morning}`,
        `Afternoon: ${day.afternoon}`,
        `Evening: ${day.evening}`,
        `Budget: ${formatCurrency(day.estimatedBudget)}`,
        ""
      ]),
      "Notices:",
      ...plan.notices.map((item) => `- ${item}`)
    ];

    doc.setFont("helvetica");
    doc.setFontSize(11);
    doc.text(lines, 12, 16, { maxWidth: 184, lineHeightFactor: 1.45 });
    doc.save(`travel-plan-${plan.input.destination}.pdf`);
  }

  return (
    <Button type="button" variant="secondary" onClick={exportPdf}>
      <Download className="h-4 w-4" />
      导出 PDF
    </Button>
  );
}
