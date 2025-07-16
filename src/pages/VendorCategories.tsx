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
  DialogTitle,
  DialogOverlay
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Edit, Trash2, Plus, Building2 } from "lucide-react";
import UserDetailsContext from '@/hooks/UserDetailsContext';
import { useAlertDialog } from "@/contexts/AlertDialogContext";

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
  const { showAlert, showConfirm } = useAlertDialog();

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
      await showAlert('Failed to fetch vendor categories.');
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
        await showAlert('Category updated successfully');
      } else {
        // Add
        await axios.post(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendorCategory`,
          payload
        );
        await showAlert('Category added successfully');
      }

      handleDialogClose();
      fetchVendorCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      await showAlert('Failed to save vendor category.');
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
    if (!(await showConfirm('Are you sure you want to delete this category?'))) return;
    setDeletingCategoryId(categoryID);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/DeleteVendorCategory`,
        { CategoryID: String(categoryID) }
      );

      if (res.data?.RetString === '1') {
        setCategories(prev => prev.filter(cat => cat.CategoryID !== categoryID));
        await showAlert('Category deleted successfully.');
      } else {
        await showAlert("Category is already in use. You can't delete it.");
      }
    } catch (error: any) {
      console.error('Error deleting category:', error?.response?.data || error.message);
      await showAlert('Failed to delete category due to a server error.');
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Categories</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your vendor categories efficiently</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendor categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first vendor category</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...categories]
              .sort((a, b) => b.CategoryID - a.CategoryID)
              .map((category) => (
                <Card key={category.CategoryID} className="bg-white shadow-md hover:shadow-lg transition-all duration-200 border-0 rounded-xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                          ID: {category.CategoryID}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {category.CategoryName}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 min-h-[3rem]">
                          {category.Description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.CategoryID)}
                        disabled={deletingCategoryId === category.CategoryID}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingCategoryId === category.CategoryID ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Modern Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md w-full max-w-[95vw] mx-auto bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Edit Category
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add New Category
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
            </div>
            
            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleAddOrUpdateCategory} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label htmlFor="CategoryName" className="block text-sm font-semibold text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="CategoryName"
                    name="CategoryName"
                    value={formCategory.CategoryName}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      missingFields.includes('CategoryName') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    autoComplete="off"
                  />
                  {missingFields.includes('CategoryName') && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      Category name is required
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="Description" className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <Textarea
                    id="Description"
                    name="Description"
                    value={formCategory.Description}
                    onChange={handleChange}
                    placeholder="Enter description (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 resize-none"
                    rows={4}
                    autoComplete="off"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDialogClose}
                    className="flex-1 sm:flex-none sm:min-w-[120px] px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 sm:flex-none sm:min-w-[120px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isEditMode ? 'Update Category' : 'Add Category'}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendorCategories;
