
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import UserDetailsContext from "./hooks/UserDetailsContext";
import { UserDetailsProvider } from "./hooks/UserDetailsContext";
import "./index.css"
import VendorCategories from "./pages/VendorCategories";
import AddVendorPage from "./pages/AddVendorPage";
import Vendors from "./pages/Vendors";
import AddBusinessContact from "./pages/AddBusinessContact";
import AddVendor from "./pages/AddVendor";
import EditVendor from "./pages/EditVendor";
import ExportDropdown from "./pages/ExportDropdown";
import ImportVendorsPage from "./pages/ImportVendorsPage";
import { AlertDialogProvider } from "./contexts/AlertDialogContext";
const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AlertDialogProvider>
          <BrowserRouter>
          <UserDetailsProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
              
                <Route path="*" element={<NotFound />} />
              
                  <Route path="/vendors" element={<Vendors/>} />
                <Route path="/add-vendor" element={<AddVendorPage />} />
                <Route path="/import-vendor" element={<ImportVendorsPage />} />
                <Route path="/vendor-categories" element={<VendorCategories />} />
                <Route path="/add-business-contact" element={<AddBusinessContact />} />
                <Route path="/add-vendor-form" element={<AddVendor />} />
                <Route path="/vendors/edit/:id" element={<EditVendor />} />
                <Route path="/export-dropdown" element={<ExportDropdown onExport={(format) => console.log(`Exporting as ${format}`)} />} />
              
              </Routes>
            </Layout>
            </UserDetailsProvider>
          </BrowserRouter>
        </AlertDialogProvider>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
