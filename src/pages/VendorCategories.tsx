import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from "lucide-react";
import UserDetailsContext from '@/hooks/UserDetailsContext';
import { Edit, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface VendorCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  IsActive: boolean;
}

const VendorCategories: React.FC = () => {
  const { userDetails } = useContext(UserDetailsContext);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoryID, setSelectedCategoryID] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState({
    CategoryName: '',
    Description: '',
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const navigate = useNavigate();

  const fetchVendorCategories = async () => {
    setLoading(true);
    try {
      const payload = {
        BusinessID: userDetails?.BusinessID?.toString() || '',
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/GetVendorCategories`,
        payload
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching vendor categories:', error);
      alert('Failed to fetch vendor categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormCategory({ ...formCategory, [e.target.name]: e.target.value });
    setMissingFields((prev) => prev.filter((f) => f !== e.target.name));
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedCategoryID(null);
    setFormCategory({ CategoryName: '', Description: '' });
    setMissingFields([]);
  };

  const handleAddOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { CategoryName, Description } = formCategory;

    // Custom validation
    const missing: string[] = [];
    if (!CategoryName.trim()) missing.push('CategoryName');
    setMissingFields(missing);

    if (missing.length > 0) {
      return;
    }

    try {
      const payload = {
        CategoryName: CategoryName.trim(),
        Description: Description.trim(),
        BusinessID: userDetails?.BusinessID?.toString() || '',
      };

      if (isEditMode && selectedCategoryID !== null) {
        // Update
        await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/UpdateVendorCategory`,
          {
            ...payload,
            CategoryID: selectedCategoryID.toString(),
          }
        );
        alert('Category updated successfully');
      } else {
        // Add
        await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendorCategory`,
          payload
        );
        alert('Category added successfully');
      }

      handleDialogClose();
      fetchVendorCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save vendor category.');
    }
  };

  const handleEditCategory = (category: VendorCategory) => {
    setFormCategory({
      CategoryName: category.CategoryName,
      Description: category.Description,
    });
    setSelectedCategoryID(category.CategoryID);
    setIsEditMode(true);
    setIsDialogOpen(true);
    setMissingFields([]);
  };

  const handleDeleteCategory = async (categoryID: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setDeletingCategoryId(categoryID);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/DeleteVendorCategory`,
        { CategoryID: String(categoryID) }
      );

      if (res.data?.RetString === '1') {
        setCategories(prev => prev.filter(cat => cat.CategoryID !== categoryID));
        alert('Category deleted successfully.');
      } else {
        alert('Category is already in use. You can’t delete it.');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error?.response?.data || error.message);
      alert('Failed to delete category due to a server error.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  useEffect(() => {
    if (userDetails?.BusinessID) {
      fetchVendorCategories();
    }
    // eslint-disable-next-line
  }, [userDetails]);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="back-button">
            <ChevronLeft onClick={() => navigate(-1)} className="rounded-circle" />
          </div>
          <h1 className="text-2xl font-bold">Vendor Categories</h1>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>Add Category</Button>
      </div>

      {loading ? (
  <div className="text-center text-muted-foreground">Loading categories...</div>
) : categories.length === 0 ? (
  <div className="text-center text-muted-foreground">No vendor categories found</div>
) : (
  <div className="grid grid-cols-1 gap-4">
    {[...categories]
      .sort((a, b) => b.CategoryID - a.CategoryID) // 🔽 Sort descending by ID
      .map((category) => (
        <Card key={category.CategoryID}>
          <CardHeader>
            <CardTitle className="text-sm">ID: {category.CategoryID}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-3 gap-4 text-sm w-full">
              <div className="min-w-0 break-words text-black font-medium">
                {category.CategoryName}
              </div>
              <div className="min-w-0 break-words text-black font-medium">
                {category.Description || 'No description'}
              </div>
              <div
                className={`font-semibold ${
                  category.IsActive ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {category.IsActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <IconButton onClick={() => handleEditCategory(category)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteCategory(category.CategoryID)}>
              <Delete />
            </IconButton>
          </CardFooter>
        </Card>
      ))}
  </div>
)}


      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Vendor Category' : 'Add Vendor Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrUpdateCategory} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label htmlFor="CategoryName" className="text-sm font-medium text-gray-700">
                Category Name<span className="text-red-500">*</span>
              </label>
              <Input
                id="CategoryName"
                name="CategoryName"
                value={formCategory.CategoryName}
                onChange={handleChange}
                placeholder="Enter category name"
                className={missingFields.includes('CategoryName') ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {missingFields.includes('CategoryName') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="Description" className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="Description"
                name="Description"
                value={formCategory.Description}
                onChange={handleChange}
                placeholder="Enter description"
                autoComplete="off"
              />
            </div>

            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" className="custom-cancel-button" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCategories;