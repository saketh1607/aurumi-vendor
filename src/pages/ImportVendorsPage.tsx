import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UserDetailsContext from '@/hooks/UserDetailsContext';
import { ChevronLeft, Download, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlertDialog } from "@/contexts/AlertDialogContext";

interface VendorImportData {
  'Vendor Name': string;
  'Category Name': string;
  'Contact Number': string;
  'Email': string;
  'Contact Person': string;
  'Address': string;
  'Notes'?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface VendorCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  IsActive: boolean;
}

const ImportVendorsPage = () => {
  const navigate = useNavigate();
  const { userDetails, account_id } = useContext(UserDetailsContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlertDialog();
  
  const [importData, setImportData] = useState<VendorImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'ready' | 'importing' | 'success' | 'error'>('idle');
  const [importResults, setImportResults] = useState<Array<{success: boolean, vendor: string, message?: string}>>([]);

  const buildPOUrl = (path: string) => account_id ? `${path}?account_id=${account_id}` : path;

  // Sample data for download template
  const sampleData = [
    {
      'Vendor Name': 'ABC Electronics Ltd',
      'Category Name': 'Electronics',
      'Contact Number': '9876543210',
      'Email': 'contact@abcelectronics.com',
      'Contact Person': 'John Smith',
      'Address': '123 Business Park, Electronic City, Bangalore - 560100',
      'Notes': 'Preferred supplier for electronic components'
    },
    {
      'Vendor Name': 'Global Office Supplies',
      'Category Name': 'Office Supplies',
      'Contact Number': '9123456789',
      'Email': 'sales@globaloffice.com',
      'Contact Person': 'Sarah Johnson',
      'Address': '456 Commerce Street, Business District, Mumbai - 400001',
      'Notes': 'Quick delivery for office essentials'
    }
  ];

  const fetchCategories = async () => {
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
    }
  };

  const downloadSampleFile = () => {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors Sample');
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Vendor Name
      { wch: 20 }, // Category Name
      { wch: 15 }, // Contact Number
      { wch: 30 }, // Email
      { wch: 20 }, // Contact Person
      { wch: 50 }, // Address
      { wch: 40 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;
    
    XLSX.writeFile(workbook, 'vendor_import_template.xlsx');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateData = (data: VendorImportData[]) => {
    const errors: ValidationError[] = [];
    const requiredFields = ['Vendor Name', 'Category Name', 'Contact Number', 'Email', 'Contact Person', 'Address'];
    
    data.forEach((row, index) => {
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field as keyof VendorImportData] || row[field as keyof VendorImportData].toString().trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          });
        }
      });

      // Email validation
      if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
        errors.push({
          row: index + 1,
          field: 'Email',
          message: 'Invalid email format'
        });
      }

      // Phone validation (basic)
      if (row['Contact Number'] && !/^\d{10,15}$/.test(row['Contact Number'].replace(/\D/g, ''))) {
        errors.push({
          row: index + 1,
          field: 'Contact Number',
          message: 'Contact number should be 10-15 digits'
        });
      }
    });

    return errors;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('validating');
    setValidationErrors([]);
    setImportData([]);
    setImportResults([]);

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      await showAlert('Please select a valid Excel file (.xlsx or .xls)');
      setImportStatus('idle');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as VendorImportData[];
        
        // Validate required columns
        const requiredColumns = [
          'Vendor Name',
          'Category Name', 
          'Contact Number',
          'Email',
          'Contact Person',
          'Address'
        ];
        
        if (jsonData.length === 0) {
          await showAlert('The Excel file is empty. Please add vendor data and try again.');
          setImportStatus('idle');
          return;
        }
        
        const firstRow = jsonData[0] as any;
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          await showAlert(`Missing required columns: ${missingColumns.join(', ')}\n\nPlease download the sample template to see the correct format.`);
          setImportStatus('idle');
          return;
        }

        // Fetch categories if not already loaded
        if (categories.length === 0) {
          await fetchCategories();
        }

        setImportData(jsonData);
        
        // Validate data
        const errors = validateData(jsonData);
        setValidationErrors(errors);
        
        if (errors.length === 0) {
          setImportStatus('ready');
        } else {
          setImportStatus('error');
        }
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        await showAlert('Error reading the Excel file. Please make sure it\'s a valid Excel file.');
        setImportStatus('idle');
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) return;
    
    setImportStatus('importing');
    setIsProcessing(true);
    setImportResults([]);
    
    try {
      const businessID = userDetails?.BusinessID;
      if (!businessID) {
        throw new Error('Business ID missing. Cannot add vendor.');
      }

      // Get team contact ID first (same as in single vendor add)
      const getTeamURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/Team/GetTeamContacts`;
      const teamRes = await axios.post(getTeamURL, {
        BusinessID: businessID.toString()
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const match = teamRes.data.find((t: any) => t.ContactID.toString() === account_id);
      const teamContactId = match?.TeamContactID;
      if (!teamContactId) {
        throw new Error("TeamContactID not found for this account");
      }

      const results = [];
      for (const vendor of importData) {
        try {
          // Find category ID
          const category = categories.find(cat => 
            cat.CategoryName.toLowerCase() === vendor['Category Name'].toLowerCase()
          );
          
          if (!category) {
            throw new Error(`Category "${vendor['Category Name']}" not found`);
          }

          // First create the business contact
          const createContactURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/ST/AddBusinessContact`;
          const contactPayload = {
            BusinessID: businessID.toString(),
            FirstName: vendor['Contact Person'],
            LastName: '',
            PhoneNo: vendor['Contact Number'],
            CompanyName: vendor['Vendor Name'],
            EmailID: vendor.Email,
            Notes: vendor.Notes || '',
            TeamContactID: teamContactId.toString()
          };

          const contactRes = await axios.post(createContactURL, contactPayload, {
            headers: { 'Content-Type': 'application/json' }
          });

          const newContactID = contactRes.data?.ContactID;
          if (!newContactID) {
            throw new Error("ContactID not returned after creating contact");
          }

          // Then create the vendor
          const vendorPayload = {
            ContactID: newContactID.toString(),
            Address: vendor.Address,
            VendorType: category.CategoryID.toString(),
            Status: 'Active',
            Notes: vendor.Notes || ''
          };

          const addVendorURL = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}/purchases/AddVendor`;
          await axios.post(addVendorURL, vendorPayload, {
            headers: { 'Content-Type': 'application/json' }
          });

          results.push({
            success: true,
            vendor: vendor['Vendor Name'],
            message: 'Successfully imported'
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message;
          results.push({
            success: false,
            vendor: vendor['Vendor Name'],
            message: errorMessage
          });
          console.error(`Error importing vendor ${vendor['Vendor Name']}:`, errorMessage);
        }
      }

      setImportResults(results);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === importData.length) {
        setImportStatus('success');
        setTimeout(() => {
          navigate(buildPOUrl('/vendors'));
        }, 2000);
      } else {
        setImportStatus('error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Import error:', errorMessage);
      setImportResults([{
        success: false,
        vendor: 'All vendors',
        message: errorMessage
      }]);
      setImportStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="back-button mr-3">
          <ChevronLeft 
            onClick={() => navigate(-1)} 
            className="cursor-pointer hover:bg-gray-100 rounded-full p-1"
            size={24}
          />
        </div>
        <h1 className="text-2xl font-bold">Import Vendors from Excel</h1>
      </div>

      {/* Instructions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-blue-500" size={20} />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p>Follow these steps to import vendors from an Excel file:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Download the sample Excel template to see the required format</li>
              <li>Fill in your vendor data following the same column structure</li>
              <li>Upload your Excel file using the button below</li>
              <li>Review any validation errors and fix them in your Excel file</li>
              <li>Click "Import Vendors" to complete the process</li>
            </ol>
            <div className="mt-4">
              <Button
                onClick={downloadSampleFile}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download Sample Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <Button
              onClick={handleFileSelect}
              variant="outline"
              className="flex items-center gap-2"
              disabled={importStatus === 'validating' || importStatus === 'importing'}
            >
              <Upload size={16} />
              {importStatus === 'validating' ? 'Processing...' : 'Choose Excel File'}
            </Button>

            {importStatus === 'validating' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Validating your data, please wait...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {importData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationErrors.length === 0 ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Total Rows: {importData.length}</span>
                <span className="text-sm font-medium text-green-600">
                  Valid: {importData.length - validationErrors.length}
                </span>
                <span className="text-sm font-medium text-red-600">
                  Errors: {validationErrors.length}
                </span>
              </div>

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Validation Errors:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        <strong>Row {error.row}:</strong> {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importStatus === 'ready' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All data is valid and ready for import!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResults.every(r => r.success) ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Total Rows: {importResults.length}</span>
                <span className="text-sm font-medium text-green-600">
                  Success: {importResults.filter(r => r.success).length}
                </span>
                <span className="text-sm font-medium text-red-600">
                  Failed: {importResults.filter(r => !r.success).length}
                </span>
              </div>

              {importResults.some(r => !r.success) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Failed Imports:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {importResults.filter(r => !r.success).map((result, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        <strong>{result.vendor}:</strong> {result.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Actions */}
      {importData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => navigate(buildPOUrl('/vendors'))}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={validationErrors.length > 0 || isProcessing || importStatus !== 'ready'}
                className="flex items-center gap-2"
              >
                {isProcessing ? 'Importing...' : 'Import Vendors'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {importStatus === 'success' && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vendors imported successfully! Redirecting to vendors page...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImportVendorsPage;