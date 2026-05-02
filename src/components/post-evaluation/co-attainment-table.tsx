import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import type { COAttainmentRow } from "./utils";
import type { WorkflowStatusKey } from "@/lib/design-tokens";

function attainmentToWorkflow(status: COAttainmentRow["status"]): WorkflowStatusKey {
  if (status === "met") return "complete";
  if (status === "at-risk") return "in-progress";
  return "overdue";
}

function attainmentLabel(status: COAttainmentRow["status"]) {
  if (status === "met") return "Met";
  if (status === "at-risk") return "At Risk";
  return "Not Met";
}

interface Props {
  rows: COAttainmentRow[];
}

export function COAttainmentTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No course outcome data available.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>CO</TableHead>
          <TableHead>Criterion</TableHead>
          <TableHead>Attainment</TableHead>
          <TableHead className="w-32">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.criterionId}>
            <TableCell className="font-medium text-foreground">
              {row.co}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.criterionName}
            </TableCell>
            <TableCell>
              <Progress value={row.attainedPct} className="gap-2">
                <ProgressLabel className="text-xs text-foreground">
                  {row.attainedPct}%
                </ProgressLabel>
                <ProgressValue className="text-xs" />
              </Progress>
            </TableCell>
            <TableCell>
              <StatusBadge status={attainmentToWorkflow(row.status)}>
                {attainmentLabel(row.status)}
              </StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
