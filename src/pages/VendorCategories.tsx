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
  // ... (keep all existing state and logic unchanged) ...

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
          className="ml-auto bg-blue-600 hover:bg-blue-700"
        >
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-4">No vendor categories found</h3>
          <p className="text-gray-500 mb-6">Create your first category to organize your vendors</p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg"
          >
            Create Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...categories]
            .sort((a, b) => b.CategoryID - a.CategoryID)
            .map((category) => (
              <Card 
                key={category.CategoryID} 
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {category.CategoryName}
                      </CardTitle>
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                          ID: {category.CategoryID}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 mt-2">
                  <p className="text-gray-600 text-sm min-h-[60px]">
                    {category.Description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-0 mt-auto">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category.CategoryID)}
                    disabled={deletingCategoryId === category.CategoryID}
                  >
                    {deletingCategoryId === category.CategoryID ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-xl mt-12 mb-8">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Vendor Category' : 'Add Vendor Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditMode 
                ? 'Update the details of this vendor category' 
                : 'Add a new vendor category to organize your vendors'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddOrUpdateCategory} className="space-y-6">
            <div className="space-y-3">
              <label 
                htmlFor="CategoryName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="CategoryName"
                name="CategoryName"
                value={formCategory.CategoryName}
                onChange={handleChange}
                placeholder="e.g. Plumbing, IT Services"
                className={`text-base py-3 px-4 ${missingFields.includes('CategoryName') ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="off"
                autoFocus
              />
              {missingFields.includes('CategoryName') && (
                <p className="text-sm text-red-600 mt-1">
                  Category name is required
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <label 
                htmlFor="Description" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <Textarea
                id="Description"
                name="Description"
                value={formCategory.Description}
                onChange={handleChange}
                placeholder="Describe this category (optional)"
                className="text-base py-3 px-4 min-h-[120px]"
                autoComplete="off"
              />
            </div>
            
            <DialogFooter className="gap-3 sm:gap-4 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDialogClose}
                className="w-full sm:w-auto px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700"
              >
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
