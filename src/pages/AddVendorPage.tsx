import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import UserDetailsContext from '@/hooks/UserDetailsContext';
import { ChevronLeft } from "lucide-react";
import Select from 'react-select';

interface VendorCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  IsActive: boolean;
}

const AddVendorPage = () => {
  const navigate = useNavigate();
  const { userDetails } = useContext(UserDetailsContext);

  const [vendor, setVendor] = useState({
    name: '',
    categoryID: '',
    contactNumber: '',
    email: '',
    contactPerson: '',
    address: '',
    notes: '',
  });
const [inputValue, setInputValue] = useState('');
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const getVendorCategoriesURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/GetVendorCategories`;
        const res = await axios.post<VendorCategory[]>(
          getVendorCategoriesURL,
          { BusinessID: userDetails?.BusinessID?.toString() },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const activeCategories = res.data.filter(cat => cat.IsActive);
        setCategories(activeCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVendor({ ...vendor, [name]: value });
    setMissingFields((prev) => prev.filter((f) => f !== name));
  };
  const categoryOptions = categories?.map(cat => ({
  value: cat.CategoryID,
  label: cat.CategoryName,
})) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation
    const missing: string[] = [];
    if (!vendor.name) missing.push('name');
    if (!vendor.categoryID) missing.push('categoryID');
    if (!vendor.contactNumber) missing.push('contactNumber');
    if (!vendor.email) missing.push('email');
    if (!vendor.contactPerson) missing.push('contactPerson');
    if (!vendor.address) missing.push('address');
    setMissingFields(missing);

    if (missing.length > 0) {
      // Don't submit if fields are missing
      return;
    }

    const businessID = userDetails?.BusinessID;
    if (!businessID) {
      alert('Business ID missing. Cannot add vendor.');
      return;
    }

    const payload = {
      VendorName: vendor.name,
      CategoryID: vendor.categoryID,
      ContactNumber: vendor.contactNumber,
      EmailID: vendor.email,
      ContactPerson: vendor.contactPerson,
      Address: vendor.address,
      Notes: vendor.notes || "",
      BusinessID: businessID.toString()
    };

    try {
      const addVendorURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`;
      await axios.post(
        addVendorURL,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate('/vendors');
    } catch (err: any) {
      console.error('Error adding vendor:', err.response?.data || err.message);
      alert('Failed to add vendor: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="back-button ">
          <ChevronLeft onClick={() => navigate(-1)} className="rounded-circle" />
        </div>
        <h1 className="text-xl font-bold">Add Vendor</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <Label>
                Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                name="name"
                value={vendor.name}
                onChange={handleChange}
                className={missingFields.includes('name') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('name') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>
  Vendor Category<span className="text-red-500 ml-1">*</span>
</Label>

{error && <p className="text-red-600">{error}</p>}

<Select
  options={categoryOptions}
  inputValue={inputValue}
  onInputChange={(value) => setInputValue(value)}
  menuIsOpen={inputValue.length > 0} // Show dropdown only if input is typed
  value={categoryOptions.find(option => option.value === Number(vendor.categoryID)) || null}
  onChange={(selectedOption) => {
    setVendor(prev => ({
      ...prev,
      categoryID: selectedOption?.value?.toString() || ''
    }));
    if (missingFields.includes('categoryID')) {
      setMissingFields(prev => prev.filter(f => f !== 'categoryID'));
    }
  }}
  placeholder="Type to search category..."
  isClearable
  classNamePrefix="react-select"
  className="react-select-container"
/>

              {missingFields.includes('categoryID') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>
                Contact Number<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                name="contactNumber"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={vendor.contactNumber}
                onChange={handleChange}
                className={missingFields.includes('contactNumber') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('contactNumber') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>
                Email<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                name="email"
                type="email"
                value={vendor.email}
                onChange={handleChange}
                className={missingFields.includes('email') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('email') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>
                Contact Person<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                name="contactPerson"
                value={vendor.contactPerson}
                onChange={handleChange}
                className={missingFields.includes('contactPerson') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('contactPerson') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>
                Address<span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                name="address"
                value={vendor.address}
                onChange={handleChange}
                className={missingFields.includes('address') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('address') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                name="notes"
                value={vendor.notes}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                className="custom-cancel-button"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Vendor</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVendorPage;