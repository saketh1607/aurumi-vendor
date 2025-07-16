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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Loader2 } from 'lucide-react';
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
  }, [userDetails]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Categories</h1>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="ml-auto"
        >
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-gray-500 text-lg">No vendor categories found</p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="mt-4"
          >
            Create Your First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...categories]
            .sort((a, b) => b.CategoryID - a.CategoryID)
            .map((category) => (
              <Card key={category.CategoryID} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {category.CategoryName}
                    </CardTitle>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {category.CategoryID}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {category.Description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.CategoryID)}
                    disabled={deletingCategoryId === category.CategoryID}
                  >
                    {deletingCategoryId === category.CategoryID ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Vendor Category' : 'Add Vendor Category'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the details of this vendor category' 
                : 'Add a new vendor category to organize your vendors'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddOrUpdateCategory} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="CategoryName" className="block text-sm font-medium text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="CategoryName"
                name="CategoryName"
                value={formCategory.CategoryName}
                onChange={handleChange}
                placeholder="e.g. Office Supplies, IT Services"
                className={`w-full ${missingFields.includes('CategoryName') ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {missingFields.includes('CategoryName') && (
                <p className="text-sm text-red-600">
                  Category name is required
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="Description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="Description"
                name="Description"
                value={formCategory.Description}
                onChange={handleChange}
                placeholder="Optional description for this category"
                className="w-full min-h-[100px]"
                autoComplete="off"
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCategories;
