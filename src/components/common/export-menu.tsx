import { Download, FileSpreadsheet, FileText, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCsv, exportExcel, exportPdf } from "@/lib/export";

interface ExportMenuProps {
  filename: string;
  title: string;
  columns: string[];
  rows: (string | number)[][];
  disabled?: boolean;
}

export function ExportMenu({ filename, title, columns, rows, disabled }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportExcel(filename, columns, rows)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPdf(title, columns, rows)}>
          <FileText className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportCsv(filename, columns, rows)}>
          <Table2 className="mr-2 h-4 w-4" /> CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
