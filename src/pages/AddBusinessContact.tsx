import React, { useState, useEffect } from "react";
import axios from "axios";
import UserDetailsContext from "@/hooks/UserDetailsContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const AddBusinessContact = () => {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    PhoneNo: "",
    CompanyName: "",
    EmailID: "",
    Notes: "",
    TeamContactID: "",
    BusinessID: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const userDetails= useContext(UserDetailsContext);
console.log("userDetails", userDetails);
const navigate = useNavigate();
  const handleClick = () => {
    if (!loading) {
      navigate("/add-vendor");
    }
  };
  

  // Autofill values from userDetails
  useEffect(() => {
    if (userDetails?.userDetails?.BusinessID || userDetails?.userDetails?.TeamContactID) {
      setFormData((prev) => ({
        ...prev,
        BusinessID: userDetails.userDetails.BusinessID || "",
        TeamContactID: userDetails.userDetails.TeamContactID || "",
      }));
    }
  }, [userDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);
//   setMessage("");

//   try {
//     const payload = {
//       BusinessID: formData.BusinessID?.toString() || "",
//       FirstName: formData.FirstName?.toString() || "",
//       LastName: formData.LastName?.toString() || "",
//       PhoneNo: formData.PhoneNo?.toString() || "",
//       CompanyName: formData.CompanyName?.toString() || "",
//       EmailID: formData.EmailID?.toString() || "",
//       Notes: formData.Notes?.toString() || "",
//       TeamContactID: formData.TeamContactID?.toString() || "",
//     };

//     console.log("Submitting payload:", payload);

//     const response = await axios.post(
//       `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/ST/AddBusinessContact`,
//       payload
//     );

//     setMessage("Business contact added successfully!");
//     setFormData({
//       FirstName: "",
//       LastName: "",
//       PhoneNo: "",
//       CompanyName: "",
//       EmailID: "",
//       Notes: "",
//       TeamContactID: userDetails.userDetails.TeamContactID || "",
//       BusinessID: userDetails.userDetails.BusinessID || "",
//     });
//      navigate("/add-vendor-form");
//   } catch (error: any) {
//     console.error("Error adding contact:", error);
//     setMessage(
//       error?.response?.data?.message || "Error adding contact. Please check the fields."
//     );
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const payload = {
      BusinessID: formData.BusinessID?.toString() || "",
      FirstName: formData.FirstName?.toString() || "",
      LastName: formData.LastName?.toString() || "",
      PhoneNo: formData.PhoneNo?.toString() || "",
      CompanyName: formData.CompanyName?.toString() || "",
      EmailID: formData.EmailID?.toString() || "",
      Notes: formData.Notes?.toString() || "",
      TeamContactID: formData.TeamContactID?.toString() || "",
    };

    console.log("Submitting payload:", payload);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/ST/AddBusinessContact`,
      payload
    );

    setMessage("Business contact added successfully!");

    // ❌ Remove this to keep form data intact
    // setFormData({ ... });

    // ✅ Navigate to vendor form
    navigate("/add-vendor-form",{ state: { contactId: response.data.ContactID } });
  } catch (error: any) {
    console.error("Error adding contact:", error);
    setMessage(
      error?.response?.data?.message || "Error adding contact. Please check the fields."
    );
  } finally {
    setLoading(false);
  }
};



  return (


   <div className="fixed inset-0  bg-opacity-40 mt-20 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
    <h2 className="text-2xl font-semibold mb-1">Add Contact Information</h2>
    <p className="text-sm text-gray-500 mb-6">Step 1 of 2: Basic contact details</p>

    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Row 1: First Name + Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            required
            placeholder="Enter first name"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            required
            placeholder="Enter last name"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Row 2: Phone Number + Company Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <input
            type="tel"
            name="PhoneNo"
            value={formData.PhoneNo}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business Name *</label>
          <input
            type="text"
            name="CompanyName"
            value={formData.CompanyName}
            onChange={handleChange}
            required
            placeholder="Enter company name"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Row 3: Email Address + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email Address *</label>
          <input
            type="email"
            name="EmailID"
            value={formData.EmailID}
            onChange={handleChange}
            required
            placeholder="Enter email address"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
            placeholder="Add any notes here"
            className="w-full border border-gray-300 px-3 py-2 rounded h-12 resize-none"
          />
        </div>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="BusinessID" value={formData.BusinessID} />
      <input type="hidden" name="TeamContactID" value={formData.TeamContactID} />

      {/* Footer Buttons */}
      <div className="flex justify-between mt-4">
          <button
          type="button"
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-100 transition custom-cancel-button"
          onClick={() => navigate('/vendors')}
        >
          Cancel
        </button>
      <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Next: Vendor Details"}
        </button>
        
        
      
      </div>

      {message && (
        <div className="text-sm text-center text-gray-700 mt-2">
          {message}
        </div>
      )}
    </form>
  </div>
</div>



   
  );
};

export default AddBusinessContact;
