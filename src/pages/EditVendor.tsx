import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import UserDetailsContext from "@/hooks/UserDetailsContext";

const EditVendor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userDetails = useContext(UserDetailsContext);
  const serviceTypeRef = useRef<HTMLDivElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('account_id');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [vendorTypeSearchTerm, setVendorTypeSearchTerm] = useState("");
    const [showVendorTypeSuggestions, setShowVendorTypeSuggestions] = useState(false);
  const buildPOUrl = (path: string) =>
  accountId ? `${path}?account_id=${accountId}` : path;

  const [formData, setFormData] = useState({
    ContactID: "",
    Address: "",
    VendorType: "",
    CategoryID: "", // <-- Add this line
    Status: "Active",
    Notes: "",
  });

  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<any[]>([]); // hardcoded list

  // Get vendor from location.state
  const vendor = location.state?.vendor;

  useEffect(() => {
    const fetchContacts = async () => {
      const businessID = userDetails?.userDetails?.BusinessID?.toString();
      if (!businessID || !vendor) return;

      try {
        const payload = { BusinessID: businessID };
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/Contacts/GetBusinessContacts`,
          payload
        );

        const contactsData = Array.isArray(response.data) ? response.data : [];
        setContacts(contactsData);

        const matchedContact = contactsData.find(
          (c) => c.ContactID === vendor.VendorContactID
        );
        setSelectedContact(matchedContact || null);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    if (vendor) {
      setFormData({
        ContactID: vendor.VendorContactID || "",
        Address: vendor.Address || "",
        VendorType: vendor.VendorType || "",
        Status: vendor.Status || "Active",
        Notes: vendor.Notes || "",
      });
    }

    fetchContacts();
  }, [vendor, userDetails]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        serviceTypeRef.current &&
        !serviceTypeRef.current.contains(event.target as Node)
      ) {
        // logic if needed
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        VendorID: formData.VendorID?.toString() || "",
        Address: formData.Address?.toString() || "",
        VendorType: formData.VendorType?.toString() || "",
        Status: formData.Status?.toString() || "",
        Notes: formData.Notes?.toString() || "",
        ContactID: formData.ContactID?.toString() || "",
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/UpdateVendor`,
        payload
      );

      setMessage("Vendor updated successfully!");
      navigate("/vendors");
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      setMessage(error?.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) {
    return (
      <div className="text-center p-8 text-red-600 font-semibold">
        No vendor data provided.
      </div>
    );
  }
  console.log("abc", formData);
  console.log("VendorType in formData:", formData.VendorType);
  // console.log("userDetails bbb:", userDetails);
  const API_BASE = import.meta.env.VITE_API_URL + import.meta.env.VITE_PORTNO;

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
      const data =
        Array.isArray(json) || json.categories || json.data
          ? json
          : json.categories || json.data || [];
      setCategories(data);
      console.log("Fetched categories:", data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchCategories();
    }
  }, [userDetails]);

  const normalizedVendorType = (formData.VendorType || "")
    .trim()
    .toLowerCase();
  const allCategories =
    categories.includes(formData.VendorType) && formData.VendorType
      ? categories
      : formData.VendorType
      ? [formData.VendorType, ...categories]
      : categories;
const accountID = userDetails?.userDetails?.AccountID || "";
 const filteredVendorTypes = categories.filter(category =>
    category.CategoryName.toLowerCase().includes(vendorTypeSearchTerm.toLowerCase())
  );
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Vendor</h2>
      <p className="text-sm text-gray-600 mb-6">
        Modify vendor details and click update.
      </p>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        {selectedContact && (
          <div className="bg-gray-100 border rounded-lg p-6 mb-2">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-700">
              <div>
                <span className="font-semibold">BusinessName:</span>{" "}
                {selectedContact.BusinessName}
              </div>
              <div>
                <span className="font-semibold">Contact:</span>{" "}
                {selectedContact.FirstName} {selectedContact.LastName}
              </div>
              <div>
                <span className="font-semibold">Email:</span>{" "}
                {selectedContact.EmailID || "—"}
              </div>
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedContact.MobileNo}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="relative" ref={serviceTypeRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
      <input
        type="text"
        value={vendorTypeSearchTerm}
        onChange={(e) => {
          setVendorTypeSearchTerm(e.target.value);
          setShowVendorTypeSuggestions(true);
        }}
        onFocus={() => setShowVendorTypeSuggestions(true)}
        placeholder="Type to search vendor type"
        className="w-full border px-3 py-2 rounded text-sm"
        required
      />

      {showVendorTypeSuggestions && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
          {filteredVendorTypes.length > 0 ? (
            filteredVendorTypes.map((category) => (
              <li
                key={category.CategoryID}
                onClick={() => {
                  setFormData({
                    ...formData,
                    VendorType: category.CategoryName,
                    CategoryID: category.CategoryID, // <-- Save CategoryID
                  });
                  setVendorTypeSearchTerm(category.CategoryName);
                  setShowVendorTypeSuggestions(false);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
              >
                {category.CategoryName}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No vendor types found</li>
          )}
        </ul>
      )}
    </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
            rows={4}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            
            onClick={() => navigate(`/vendors/${accountID ? `?account_id=${accountID}` : ''}`)}
            className=" custom-cancel-button px-4 py-2 text-sm rounded border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="custom-appbar text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
          >
            {loading ? "Submitting..." : "Update Vendor"}
          </button>
        </div>

        {message && (
          <div className="text-sm text-center text-gray-700 mt-3">{message}</div>
        )}
      </form>
    </div>
  );
};

export default EditVendor;
