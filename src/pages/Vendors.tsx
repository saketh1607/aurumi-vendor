import React, { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import UserDetailsContext from "@/hooks/UserDetailsContext";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { Edit, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import axios from "axios";
import { Mail, Phone,MapPin, StickyNote } from 'lucide-react';
  import { useParams } from "react-router-dom";
  import AddBusinessContact from "./AddBusinessContact";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";
import { Download, Upload, Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust import path as needed
import ExportDropdown from './ExportDropdown';

import { CSVLink } from "react-csv";
interface Vendor {
  VendorID: number;
  Name: string;
  CategoryID: string;
  VendorCategory: string;
  ContactNumber: string;
  Email: string;
  ContactPerson: string;
  Address: string;
  Notes: string;
}

interface Category {
  CategoryID: string;
  CategoryName: string;
   Description: string;
  IsActive: boolean;
}

interface VendorCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  IsActive: boolean;
}
interface ImportXLSXButtonProps {
  onFileImport: (data: any[]) => void;
  className?: string;
}

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState<number | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const navigate = useNavigate();
  const { users } = useAppContext();
  const userDetails = useContext(UserDetailsContext);
  const { hasFeature, isLoading: featureFlagsLoading } = useFeatureFlags();
  const [searchQuery, setSearchQuery] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('account_id');
  const buildPOUrl = (path: string) =>
  accountId ? `${path}?account_id=${accountId}` : path;

  
  console.log("User Details 123:", userDetails);


const { id: VendorID } = useParams();


  const API_BASE = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}`;
  // const API_BASE ="https://api.shoptalk.in:8443";

  // Fetch vendors
  // const fetchVendors = async () => {
  //    const BusinessId=userDetails?.userDetails.BusinessID;
  //   if (!userDetails) return;
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await fetch(`${API_BASE}/purchases/GetVendorsList`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         accept: "application/json",
  //       },
  //       body: JSON.stringify({
  //         BusinessID: String(BusinessId),
  //       }),
  //     });

  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //     const json = await res.json();
  //     const data: Vendor[] = Array.isArray(json) ? json : json.vendors || json.data || [];
  //     setVendors(data);
  //     console.log("Fetched vendors 123:", data);
  //   } catch (err: any) {
  //     setError( "Failed to fetch vendors");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchVendors = async () => {
    const businessID = userDetails?.userDetails?.BusinessID;
    console.log("Business ID:", businessID);
    if (!businessID) return;
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(`${API_BASE}/purchases/GetVendorsList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          BusinessID: String(businessID),
        }),
      });
  
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
      const json = await res.json();
      const data: Vendor[] = Array.isArray(json) ? json : json.vendors || json.data || [];
      setVendors(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };
  

    // const fetchVendorCategories = async () => {
    //   setLoading(true);
    //   try {
    //     const payload = {
    //       BusinessID: userDetails?.userDetails?.BusinessID?.toString() || '',
    //     };
    //     const response = await axios.post(
    //       `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/GetVendorCategories`,
    //       payload
    //     );
    //     setCategories(response.data || []);
    //     console.log("Fetched vendor categories:", response.data);
    //   } catch (error) {
    //     console.error('Error fetching vendor categories:', error);
    //     alert('Failed to fetch vendor categories.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    //   useEffect(() => {
    //     if (userDetails) {
    //       fetchVendorCategories();
    //     }
    //     // eslint-disable-next-line
    //   }, [userDetails]);
    

      const filteredVendors = vendors.filter(vendor =>
  vendor.Name.toLowerCase().includes(searchQuery.toLowerCase())
);

      

  // Fetch categories
  const fetchCategories = async () => {
    if (!userDetails) return;
    try {
      const res = await fetch(`${API_BASE}/purchases/GetVendorCategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          BusinessID: String(userDetails?.userDetails?.BusinessID),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      const data: Category[] = Array.isArray(json) ? json : json.categories || json.data || [];
      setCategories(data);
      console.log("Fetched categories:", data);
    } catch (err) {
      console.error("Error fetching categories");
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchVendors();
      fetchCategories();
    }
  }, [userDetails]);

  const handleDeleteVendor = async (vendorID: number) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    setDeletingVendorId(vendorID);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/DeleteVendor`,
        { VendorID: String(vendorID) }
      );

      if (res.data?.RetString === '1') {
        alert("Vendor deleted successfully.");
        fetchVendors();
      } else {
        alert("Vendor is already in use. You can't delete it.");
      }
    } catch (error: any) {
      console.error("Error deleting vendor:", error?.response?.data || error.message);
      alert("Failed to delete vendor due to a server error.");
    } finally {
      setDeletingVendorId(null);
    }
  };

  // Open edit dialog with all fields always defined as strings
  const openEditDialog = (vendor: Vendor) => {
    // Map VendorCategory (name) to CategoryID
    const foundCategory = categories.find(
      (cat) => cat.CategoryName === vendor.VendorCategory
    );
    setEditingVendor({
      VendorID: vendor.VendorID,
      Name: vendor.Name ?? "",
      CategoryID: foundCategory ? foundCategory.CategoryID : (vendor.CategoryID ?? ""),
      VendorCategory: vendor.VendorCategory ?? "", // This is the name
      ContactNumber: vendor.ContactNumber ?? "",
      Email: vendor.Email ?? "",
      ContactPerson: vendor.ContactPerson ?? "",
      Address: vendor.Address ?? "",
      Notes: vendor.Notes ?? "",
    });
    setMissingFields([]);
  };

  const closeEditDialog = () => {
    setEditingVendor(null);
    setMissingFields([]);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editingVendor) return;
    const { name, value } = e.target;
    setEditingVendor({
      ...editingVendor,
      [name]: value,
    });
    setMissingFields((prev) => prev.filter((f) => f !== name));
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!editingVendor || !userDetails?.userDetails.BusinessID) return;

  // Custom validation for required fields
  const missing: string[] = [];
  if (!editingVendor.Name) missing.push("Name");
  if (!editingVendor.CategoryID) missing.push("CategoryID");
  if (!editingVendor.ContactNumber) missing.push("ContactNumber");
  if (!editingVendor.Email) missing.push("Email");
  if (!editingVendor.ContactPerson) missing.push("ContactPerson");
  if (!editingVendor.Address) missing.push("Address");
  setMissingFields(missing);

  if (missing.length > 0) {
    alert("Please fill all required fields: " + missing.join(", "));
    return;
  }

  setUpdateLoading(true);

  const payload = {
    VendorID: editingVendor.VendorID.toString(),
    VendorName: editingVendor.Name,
     CategoryID: editingVendor.CategoryID.toString(),
    ContactNumber: editingVendor.ContactNumber,
    EmailID: editingVendor.Email,
    ContactPerson: editingVendor.ContactPerson,
    Address: editingVendor.Address,
    Notes: editingVendor.Notes,
    BusinessID: userDetails.userDetails.BusinessID.toString(),
  };

  // Debug log
  console.log('Update payload:', payload);

  try {
    const res = await fetch(`${API_BASE}/purchases/UpdateVendor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = null;
    if (res.status !== 204) {
      try {
        data = await res.json();
      } catch {}
    }

    if (!res.ok) {
      throw new Error((data && data.message) || `Failed to update vendor: ${res.statusText}`);
    }

    alert("Vendor updated successfully.");
    closeEditDialog();
    fetchVendors();
  } catch (err: any) {
    alert("Error updating vendor: " + (err.message || "Unknown error"));
  } finally {
    setUpdateLoading(false);
  }
};
  // Find the current category name for autofill
  const getCategoryNameById = (categoryId: string) => {
    const found = categories.find((cat) => cat.CategoryID === categoryId);
    return found ? found.CategoryName : "";
  };

  const handleExport = (type: "csv" | "pdf" | "xlsx") => {
    if (!vendors || vendors.length === 0) return;
  
    // Prepare export data (remove Category and Contact Person, use correct API fields)
    const exportData = vendors.map(vendor => ({
      "Vendor ID": vendor.VendorID,
      "Vendor Name": vendor.Name,
      "Contact Number": vendor.MobileNo || vendor.ContactNumber || "",
      "Email": vendor.EmailId || vendor.Email || "",
      "Address": vendor.Address,
      "Notes": vendor.Notes,
      "Status": vendor.Status,
      "Service Type": vendor.VendorType,
    }));
  
    if (type === "csv" || type === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vendors");
      XLSX.writeFile(wb, `vendors.${type === "csv" ? "csv" : "xlsx"}`);
    } else if (type === "pdf") {
      if (!exportData.length) {
        alert("No data to export.");
        return;
      }
       const doc = new jsPDF();
  doc.text("Vendors", 14, 16); 
  autoTable(doc, {
    startY: 22,
    head: [Object.keys(exportData[0])],
    body: exportData.map(obj => Object.values(obj)),
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
      doc.save("vendors.pdf");
    }
    setShowExportDropdown(false);
  };
  

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Vendors</h1>
         
   


        </div>
        <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center justify-between">
  {/* Export controls - now in its own clearly grouped section */}
  <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 rounded-lg">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
      Export as
    </span>
    <Select value={format} onValueChange={(val) => setFormat(val as "pdf" | "csv" | "xlsx")}>
      <SelectTrigger className="w-[100px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pdf" className="text-sm">PDF</SelectItem>
        <SelectItem value="csv" className="text-sm">CSV</SelectItem>
        <SelectItem value="xlsx" className="text-sm">XLSX</SelectItem>
      </SelectContent>
    </Select>
    <Button
      onClick={() => handleExport(format)}
      variant="outline"
      size="sm"
      className="h-9 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <Download className="w-4 h-4 mr-2" />
      <span className="sr-only xs:not-sr-only">Export</span>
    </Button>
  </div>

  {/* Action buttons - better visual hierarchy */}
  <div className="flex flex-wrap gap-2">
    <Button
      onClick={() => navigate("/import-vendor")}
      variant="outline"
      size="sm"
      className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <Upload className="w-4 h-4 mr-2" />
      <span>Import</span>
    </Button>

    {hasFeature("Add_Vendor") && (
      <Button
        onClick={() => navigate("/add-vendor-form")}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>New Vendor</span>
      </Button>
    )}

    <Button
      onClick={() => navigate("/add-vendor")}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Plus className="w-4 h-4 mr-2" />
      <span>Add Vendor</span>
    </Button>
  </div>
</div>
      </div>

      {/* Search Bar */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search vendor by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 w-full py-2 border border-gray-300 rounded-md"
        />
      </div>
  
      {/* Loading & error */}
      {loading && <div className="text-center text-muted-foreground mt-8">Loading vendors...</div>}


      {/* Vendors list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && filteredVendors.length === 0 && (
          <div className="text-center text-muted-foreground mt-8"></div>
        )}

        {[...filteredVendors]
          .sort((a, b) => b.VendorID - a.VendorID)
          .map((vendor) => (
            <Card key={vendor.VendorID} className="hover:shadow-md transition">
              <CardContent className="p-4 space-y-2">
                <div className="text-2xl">
                  <strong>{vendor.Name}</strong>
                  
                </div>
    <div className="relative w-full">
      {vendor.Status && (
        <div
          className={`absolute top-0 right-0 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
            vendor.Status.toLowerCase() === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {vendor.Status}
        </div>
      )}
    </div>


                {/* <div className="text-sm">
                  <strong>ID: </strong>
                  {vendor.VendorID}
                </div> */}


                 <div className="min-w-0 break-words">
    
    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
      {vendor.VendorType}
    </span>
  </div>
         <div className="flex flex-col gap-2 text-sm w-full">
    {/* <div className="min-w-0 break-words">
      {vendor.VendorContactID}
    </div> */}
    <div className="flex items-center gap-2 min-w-0 break-words">
        <Phone className="w-4 h-4 text-gray-600" />
        {vendor.MobileNo}
    </div>
<div className="flex items-center gap-2 min-w-0 break-words">
  <Mail className="w-4 h-4 text-gray-600" />
  <span>{vendor.EmailId}</span>
</div>

<div className="flex items-center gap-2 min-w-0 break-words">
        <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
        <span>{vendor.Address}</span>
    </div>
    <div className="flex items-center gap-2 break-words">
  <StickyNote className="w-4 h-4 text-gray-600 shrink-0" />
  <span>{vendor.Notes || "N/A"}</span>
</div>


  </div>

                <div className="flex space-x-2 mt-2">
      <div>
        <button
          className="border border-gray-300 text-black font-semibold px-10 py-1 rounded-md text-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vendors/edit/${vendor.VendorID}`, { state: { vendor } });
          }}
        >
          Edit
        </button>
      </div>
      <div className="flex justify-end flex-1">
        <button
         onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVendor(vendor.VendorID);
                }}
          className="border border-red-500 text-red-600 px-4 py-1 rounded-md min-w-[70px] text-center"
        
        >
          Delete
        </button>
      </div>
    </div>
              </CardContent>
            </Card>
          ))}
      </div>



      {/* Edit Dialog - mobile responsive */}
      {editingVendor && (
        <div
          className="z-[9999] fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto"
          onClick={closeEditDialog}
        >
          <div
            className="bg-white rounded-md p-4 sm:p-6 w-full max-w-lg max-h-full overflow-auto shadow-lg sm:mx-auto sm:my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "280px" }}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={closeEditDialog}
              aria-label="Close edit vendor dialog"
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <h2 className="text-xl font-semibold mb-4">Edit Vendor</h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="Name" className="block font-medium mb-1">
                  Vendor Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="Name"
                  name="Name"
                  value={editingVendor.Name}
                  onChange={handleInputChange}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("Name") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                />
                {missingFields.includes("Name") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="CategoryID" className="block font-medium mb-1">
                  Category<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="CategoryID"
                  name="CategoryID"
                  value={editingVendor.CategoryID}
                  onChange={handleInputChange}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("CategoryID") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                >
                  <option value="">
                    {editingVendor.CategoryID
                      ? getCategoryNameById(editingVendor.CategoryID) || "Select Category"
                      : "Select Category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </select>
                {missingFields.includes("CategoryID") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="ContactNumber" className="block font-medium mb-1">
                  Contact Number<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  id="ContactNumber"
                  name="ContactNumber"
                  value={editingVendor.ContactNumber}
                  onChange={handleInputChange}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("ContactNumber") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                />
                {missingFields.includes("ContactNumber") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="Email" className="block font-medium mb-1">
                  Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  id="Email"
                  name="Email"
                  value={editingVendor.Email}
                  onChange={handleInputChange}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("Email") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                />
                {missingFields.includes("Email") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="ContactPerson" className="block font-medium mb-1">
                  Contact Person<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="ContactPerson"
                  name="ContactPerson"
                  value={editingVendor.ContactPerson}
                  onChange={handleInputChange}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("ContactPerson") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                />
                {missingFields.includes("ContactPerson") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="Address" className="block font-medium mb-1">
                  Address<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="Address"
                  name="Address"
                  value={editingVendor.Address}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${missingFields.includes("Address") ? "border-red-500" : "border-gray-300"}`}
                  autoComplete="off"
                />
                {missingFields.includes("Address") && (
                  <span className="text-xs text-red-500">This field is required.</span>
                )}
              </div>

              <div>
                <label htmlFor="Notes" className="block font-medium mb-1">
                  Notes
                </label>
                <textarea
                  id="Notes"
                  name="Notes"
                  value={editingVendor.Notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-between space-x-2">
                <Button type="button" variant="outline" className="custom-cancel-button" onClick={closeEditDialog} disabled={updateLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? "Updating..." : "Update Vendor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;