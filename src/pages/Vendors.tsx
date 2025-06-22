import React, { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import UserDetailsContext from "@/hooks/UserDetailsContext";
import { Edit, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import axios from "axios";

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
  const navigate = useNavigate();
  const { users } = useAppContext();
  const userDetails = useContext(UserDetailsContext);
  console.log("User Details 123:", userDetails);

  const API_BASE = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}`;

  // Fetch vendors
  const fetchVendors = async () => {
    if (!userDetails?.userDetails.BusinessID) return;
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
          BusinessID: String(userDetails?.userDetails.BusinessID),
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

  // Fetch categories
  const fetchCategories = async () => {
    if (!userDetails?.userDetails.BusinessID) return;
    try {
      const res = await fetch(`${API_BASE}/purchases/GetVendorCategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          BusinessID: String(userDetails?.userDetails.BusinessID),
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      const data: Category[] = Array.isArray(json) ? json : json.categories || json.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    if (userDetails?.userDetails.BusinessID) {
      fetchVendors();
      fetchCategories();
    }
  }, [userDetails?.userDetails.BusinessID]);

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
      VendorCategory: vendor.VendorCategory ?? "",
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

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          {/* <div className="back-button "> */}
            {/* <ChevronLeft onClick={() => navigate(-1)} className="rounded-circle" /> */}
          {/* </div> */}
          <h1 className="text-2xl font-bold">Manage Vendors</h1>
        </div>
        <div className="flex gap-3">
      {userDetails?.userDetails?.UserRole === 'owner' && (
  <Button onClick={() => navigate("/add-vendor")}>
    Add Vendor
  </Button>
)}
          <Button onClick={() => navigate("/vendor-categories")}>Manage Categories</Button>
        </div>
      </div>

      {/* Loading & error */}
      {loading && <div className="text-center text-muted-foreground mt-8">Loading vendors...</div>}
      {error && <div className="text-center text-red-600 mt-8">{error}</div>}

      {/* Vendors list */}
    <div className="space-y-4">
  {!loading && vendors.length === 0 && (
    <div className="text-center text-muted-foreground mt-8">No vendors found.</div>
  )}

  {[...vendors]
    .sort((a, b) => b.VendorID - a.VendorID) // 🔽 Descending sort
    .map((vendor) => (
      <Card key={vendor.VendorID} className="hover:shadow-md transition">
        <CardContent className="p-4 space-y-2">
          <div className="text-sm">
            <strong>Name: </strong>
            {vendor.Name}
          </div>
          <div className="text-sm">
            <strong>ID: </strong>
            {vendor.VendorID}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm w-full">
            <div className="min-w-0 break-words">
              <strong>Category: </strong>{vendor.VendorCategory}
            </div>
            <div className="min-w-0 break-words">
              <strong>ContactPerson: </strong>{vendor.ContactPerson}
            </div>
            <div className="min-w-0 break-words">
              <strong>ContactNumber: </strong>{vendor.ContactNumber}
            </div>
            <div className="min-w-0 break-words">
              <strong>Email: </strong>{vendor.Email}
            </div>
          </div>

          <div className="w-full">
            <strong>Address: </strong>{vendor.Address}
          </div>
          <div className="w-full">
            <strong>Notes: </strong>{vendor.Notes || "N/A"}
          </div>

          <div className="flex justify-end space-x-2">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(vendor);
              }}
            >
              <Edit className="w-4 h-4" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteVendor(vendor.VendorID);
              }}
            >
              <Delete className="w-4 h-4" />
            </IconButton>
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