import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download } from "lucide-react";

type ExportFormat = "pdf" | "csv" | "xlsx";

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport }) => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">Export as</span>
      <Select value={format} onValueChange={val => setFormat(val as ExportFormat)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="custom-outline-select-item" value="pdf">PDF</SelectItem>
          <SelectItem className="custom-outline-select-item" value="csv">CSV</SelectItem>
          <SelectItem className="custom-outline-select-item" value="xlsx">XLSX</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={() => onExport(format)}
        className="custom-csv-button"
        variant="outline"
        type="button"
      >
        <Download size={16} /> Export
      </Button>
    </div>
  );
};

export default ExportDropdown;