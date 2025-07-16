
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface VendorCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  IsActive: boolean;
}

const AddVendorPage = () => {
  const navigate = useNavigate();
  const { userDetails, account_id } = useContext(UserDetailsContext);

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
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const buildPOUrl = (path: string) => account_id ? `${path}?account_id=${account_id}` : path;

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

  const categoryOptions = categories.map(cat => ({
    value: cat.CategoryID,
    label: cat.CategoryName
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendor({ ...vendor, [name]: value });
    setMissingFields(prev => prev.filter(f => f !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing: string[] = [];
    if (!vendor.name) missing.push('name');
    if (!vendor.categoryID) missing.push('categoryID');
    if (!vendor.contactNumber) missing.push('contactNumber');
    if (!vendor.email) missing.push('email');
    if (!vendor.contactPerson) missing.push('contactPerson');
    if (!vendor.address) missing.push('address');
    setMissingFields(missing);

    if (missing.length > 0) return;

    const businessID = userDetails?.BusinessID;
    if (!businessID) {
      setAlertDialog({ open: true, message: 'Business ID missing. Cannot add vendor.' });
      return;
    }

    try {
      const createContactURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/ST/AddBusinessContact`;
      const getTeamURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/Team/GetTeamContacts`;

      const teamRes = await axios.post(getTeamURL, {
        BusinessID: businessID.toString()
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const match = teamRes.data.find((t: any) => t.ContactID.toString() === account_id);
      const teamContactId = match?.TeamContactID;
      console.log("Team Contact ID:", teamContactId);
      if (!teamContactId) {
        setAlertDialog({ open: true, message: "TeamContactID not found for this account" });
        return;
      }

      const contactPayload = {
        BusinessID: businessID.toString(),
        FirstName: vendor.contactPerson,
        LastName: '',
        PhoneNo: vendor.contactNumber,
        CompanyName: vendor.name,
        EmailID: vendor.email,
        Notes: vendor.notes,
        TeamContactID: teamContactId.toString()
      };

      const contactRes = await axios.post(createContactURL, contactPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const newContactID = contactRes.data?.ContactID;
      console.log("New Contact ID:", newContactID);
      if (!newContactID) {
        setAlertDialog({ open: true, message: "ContactID not returned after creating contact" });
        return;
      }

      const vendorPayload = {
        ContactID: newContactID.toString(),
        Address: vendor.address,
        VendorType: vendor.categoryID,
        Status: 'Active',
        Notes: vendor.notes || ''
      };

      const addVendorURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`;
      await axios.post(addVendorURL, vendorPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      navigate('/vendors');
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);
      setAlertDialog({ open: true, message: 'Failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="back-button">
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
              <Label>Name<span className="text-red-500 ml-1">*</span></Label>
              <Input name="name" value={vendor.name} onChange={handleChange} className={missingFields.includes('name') ? 'border-red-500' : ''} autoComplete="off" />
            </div>

            <div>
              <Label>Vendor Category<span className="text-red-500 ml-1">*</span></Label>
              {error && <p className="text-red-600">{error}</p>}
              <Select
                options={categoryOptions}
                inputValue={inputValue}
                onInputChange={setInputValue}
                value={categoryOptions.find(opt => opt.value === Number(vendor.categoryID)) || null}
                onChange={(option) => {
                  setVendor(prev => ({ ...prev, categoryID: option?.value.toString() || '' }));
                  if (missingFields.includes('categoryID')) {
                    setMissingFields(prev => prev.filter(f => f !== 'categoryID'));
                  }
                }}
                placeholder="Type to search category..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <Label>Contact Number<span className="text-red-500 ml-1">*</span></Label>
              <Input name="contactNumber" type="text" inputMode="numeric" pattern="\d*" value={vendor.contactNumber} onChange={handleChange} className={missingFields.includes('contactNumber') ? 'border-red-500' : ''} autoComplete="off" />
            </div>
            <div>
              <Label>Email<span className="text-red-500 ml-1">*</span></Label>
              <Input name="email" type="email" value={vendor.email} onChange={handleChange} className={missingFields.includes('email') ? 'border-red-500' : ''} autoComplete="off" />
            </div>
            <div>
              <Label>Contact Person<span className="text-red-500 ml-1">*</span></Label>
              <Input name="contactPerson" value={vendor.contactPerson} onChange={handleChange} className={missingFields.includes('contactPerson') ? 'border-red-500' : ''} autoComplete="off" />
            </div>
            <div>
              <Label>Address<span className="text-red-500 ml-1">*</span></Label>
              <Textarea name="address" value={vendor.address} onChange={handleChange} className={missingFields.includes('address') ? 'border-red-500' : ''} autoComplete="off" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" value={vendor.notes} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate(buildPOUrl('/vendors'))}>Cancel</Button>
              <Button type="submit">Save Vendor</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <AlertDialog open={alertDialog.open} onOpenChange={open => setAlertDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notice</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ open: false, message: "" })}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddVendorPage;
