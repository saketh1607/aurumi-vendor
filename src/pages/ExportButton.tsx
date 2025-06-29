import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExportButtonProps {
  tableData: Record<string, any>[];
  fileName?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ tableData, fileName = "export" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    if (!tableData || tableData.length === 0) return;

    if (type === "excel" || type === "csv") {
      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      if (type === "excel") {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else {
        XLSX.writeFile(wb, `${fileName}.csv`);
      }
    } else if (type === "pdf") {
      const doc = new jsPDF();
      const columns = Object.keys(tableData[0]);
      // @ts-ignore
      doc.autoTable({
        head: [columns],
        body: tableData.map(row => columns.map(col => row[col])),
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
      doc.save(`${fileName}.pdf`);
    }
    setShowDropdown(false);
  };

  // Close dropdown if clicked outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown((prev) => !prev)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        type="button"
      >
        Export
      </button>
      {showDropdown && (
        <ul className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-50">
          <li
            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            onClick={() => handleExport("excel")}
          >
            Excel
          </li>
          <li
            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            onClick={() => handleExport("csv")}
          >
            CSV
          </li>
          <li
            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            onClick={() => handleExport("pdf")}
          >
            PDF
          </li>
        </ul>
      )}
    </div>
  );
};

export default ExportButton;