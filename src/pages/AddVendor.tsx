import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import UserDetailsContext from "@/hooks/UserDetailsContext";
import { useRef } from "react";
import Papa from "papaparse";
import { useAlertDialog } from "@/contexts/AlertDialogContext";

const AddVendor = () => {
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
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = useContext(UserDetailsContext);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vendorTypeSearchTerm, setVendorTypeSearchTerm] = useState("");
  const [showVendorTypeSuggestions, setShowVendorTypeSuggestions] = useState(false);
  const serviceTypeRef = useRef<HTMLDivElement>(null);
  const accountId = userDetails?.userDetails?.AccountID || "";
  const { showAlert } = useAlertDialog();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        serviceTypeRef.current &&
        !serviceTypeRef.current.contains(event.target as Node)
      ) {
        setShowVendorTypeSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredContacts = contacts.filter(contact =>
    `${contact.FirstName} ${contact.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendorTypes = categories.filter(category =>
    category.CategoryName.toLowerCase().includes(vendorTypeSearchTerm.toLowerCase())
  );
  // Fetch business contacts and categories
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const payload = {
          BusinessID: userDetails?.userDetails?.BusinessID?.toString() || "",
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/Contacts/GetBusinessContacts`,
          payload
        );

        const contactList = Array.isArray(response.data) ? response.data : [];
        setContacts(contactList);

        // Only set latest contact if no contact is passed from navigation
        if (
          contactList.length > 0 &&
          !location.state?.contact
        ) {
          const sorted = [...contactList].sort((a, b) => Number(b.ContactID) - Number(a.ContactID));
          const latest = sorted[0];

          setFormData((prev) => ({
            ...prev,
            ContactID: latest.ContactID,
          }));
          setSelectedContact(latest);
        }
      } catch (error) {
        console.error("Error fetching business contacts:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const payload = {
          BusinessID: userDetails?.userDetails?.BusinessID?.toString() || "",
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/GetVendorCategories`,
          payload
        );

        setCategories(Array.isArray(response.data) ? response.data : []);
        console.log("Fetched categories:", response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (userDetails?.userDetails?.BusinessID) {
      fetchContacts();
      fetchCategories();
    }
  }, [userDetails, location.state]);

  useEffect(() => {
    if (location.state?.contact) {
      setSelectedContact(location.state.contact);
      setFormData((prev) => ({
        ...prev,
        ContactID: location.state.contact.ContactID,
      }));
      setSearchTerm(`${location.state.contact.FirstName} ${location.state.contact.LastName}`);
    }
  }, [location.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "ContactID") {
      const contact = contacts.find((c) => c.ContactID?.toString() === value);
      setSelectedContact(contact || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ContactID: formData.ContactID?.toString() || "",
        Address: formData.Address?.toString() || "",
        VendorType: formData.CategoryID?.toString() || "", // <-- Pass CategoryID here
        Status: formData.Status?.toString() || "",
        Notes: formData.Notes?.toString() || "",
      };

      console.log("Submitting payload:", payload); // <-- Add this line

      await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`,
        payload
      );

      setMessage("Vendor added successfully!");
      setFormData({
        ContactID: "",
        Address: "",
        VendorType: "",
        CategoryID: "", // <-- Add this line
        Status: "Active",
        Notes: "",
      });
      setSelectedContact(null);
      navigate("/vendors");
    } catch (error: any) {
      console.error("Error adding vendor:", error);
      setMessage(
        error?.response?.data?.message || "Failed to add vendor. Please check the fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        for (const row of rows) {
          // Map CSV columns to API fields
          const payload = {
            Name: row["Vendor Name"] || "",
            MobileNo: row["Contact Number"] || "",
            EmailId: row["Email"] || "",
            Address: row["Address"] || "",
            Notes: row["Notes"] || "",
            Status: row["Status"] || "",
            VendorType: row["Service Type"] || "",
            // Add other required fields if needed
          };
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`,
              payload
            );
          } catch (error) {
            console.error("Failed to import vendor:", payload, error);
          }
        }
        await showAlert("CSV import completed!");
      },
      error: (err) => {
        await showAlert("Failed to parse CSV: " + err.message);
      }
    });
  };

  const accountID = userDetails?.userDetails?.AccountID || "";
  console.log("abc",filteredVendorTypes);
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Vendor Details</h2>
      <p className="text-sm text-gray-600 mb-6">Step 2 of 2: Vendor-specific information</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Contact Info Display */}
        {selectedContact && (
          <div className="bg-gray-100 border rounded-lg p-6 mb-2">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-700">
              <div>
                <span className="font-semibold">BusinessName:</span> {selectedContact.BusinessName}
              </div>
              <div>
                <span className="font-semibold">Contact:</span>{" "}
                {selectedContact.FirstName} {selectedContact.LastName}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {selectedContact.EmailID || "—"}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {selectedContact.MobileNo}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
        {/* <div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Select Contact</label>
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setShowSuggestions(true);
    }}
    onFocus={() => setShowSuggestions(true)}
    placeholder="Type to search contacts"
    className="w-full border px-3 py-2 rounded text-sm"
  />
  
  {showSuggestions && (
    <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
      {filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <li
            key={contact.ContactID}
            onClick={() => {
              setFormData({ ...formData, ContactID: contact.ContactID });
              setSearchTerm(`${contact.FirstName} ${contact.LastName}`);
              setShowSuggestions(false);
            }}
            className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
          >
            {contact.FirstName} {contact.LastName}
          </li>
        ))
      ) : (
        <li className="px-3 py-2 text-sm text-gray-500">No contacts found</li>
      )}
    </ul>
  )}
</div> */}


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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              name="Address"
              placeholder="Address"
              value={formData.Address}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="Notes"
            placeholder="Additional notes about this vendor..."
            value={formData.Notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
            rows={4}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded border text-gray-600 hover:bg-gray-100"
           onClick={() => navigate("/add-business-contact")}
          >
             Back
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="custom-appbar text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
            >
              {loading ? "Submitting..." : "Complete Registration"}
            </button>
            <button
              type="button"
                 onClick={() => navigate(`/vendors/${accountId ? `?account_id=${accountId}` : ''}`)}
              className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 custom-cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>

        {message && (
          <div className="text-sm text-center text-gray-700 mt-3">{message}</div>
        )}
      </form>
    </div>
  );
};

export default AddVendor;
