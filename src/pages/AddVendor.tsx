import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserDetailsContext from "@/hooks/UserDetailsContext";

const AddVendor = () => {
  const [formData, setFormData] = useState({
    ContactID: "",
    Address: "",
    VendorType: "",
    Status: "Active",
    Notes: "",
  });

  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const userDetails = useContext(UserDetailsContext);
  const [categories, setCategories] = useState<any[]>([]);

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

        if (contactList.length > 0) {
          const sorted = [...contactList].sort((a, b) => Number(b.ContactID) - Number(a.ContactID));
const latest = sorted[0];

          setFormData((prev) => ({
            ...prev,
            ContactID: latest.ContactID,
          }));
          setSelectedContact(latest);
        }

        console.log("Fetched contacts:", contactList);
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
  }, [userDetails]);

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
        VendorType: formData.VendorType?.toString() || "",
        Status: formData.Status?.toString() || "",
        Notes: formData.Notes?.toString() || "",
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`,
        payload
      );

      setMessage("Vendor added successfully!");
      setFormData({
        ContactID: "",
        Address: "",
        VendorType: "",
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
                <span className="font-medium">BusinessName:</span> {selectedContact.BusinessName}
              </div>
              <div>
                <span className="font-medium">Contact:</span>{" "}
                {selectedContact.FirstName} {selectedContact.LastName}
              </div>
              {/* <div>
                <span className="font-medium">Email:</span> {selectedContact.Email || "—"}
              </div> */}
              <div>
                <span className="font-medium">Phone:</span> {selectedContact.MobileNo}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Contact</label>
            <select
              name="ContactID"
              value={formData.ContactID}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Select Contact</option>
              {contacts.map((contact) => (
                <option key={contact.ContactID} value={contact.ContactID}>
                  {contact.FirstName} {contact.LastName}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type *</label>
            <select
              name="VendorType"
              value={formData.VendorType}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Select service type </option>
              {categories.map((category) => (
                <option key={category.CategoryID} value={category.CategoryName}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
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
            ← Back
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
            >
              {loading ? "Submitting..." : "Complete Registration"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/vendors")}
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
