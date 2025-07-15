import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import UserDetailsContext from '@/hooks/UserDetailsContext';
import { Home, FileText, Settings, Briefcase, ShieldCheck, CheckSquare, Package, Database, Archive, Store } from 'lucide-react';
import { FaUserCircle } from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const userDetails = useContext(UserDetailsContext);
  const userRole = userDetails?.userDetails?.UserRole;
  const accountId = userDetails?.userDetails?.AccountID;

  const addAccountQuery = (path: string) =>
    accountId ? `${path}?account_id=${accountId}` : path;

  const allNavLinks = [
    { to: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { to: `/vendors`, label: 'Vendors', icon: <Store size={20} /> },
    { to: `/vendor-categories`, label: 'Service Types', icon: <Settings size={20} /> }
    // { to: '/vendors', label: 'Vendors', icon: <img src="/icon.png" alt="Vendors" className="w-5 h-5" /> }
    // { to: '/requisitions', label: 'Requisitions', icon: <FileText size={20} /> },
    // { to: '/approvals', label: 'Approvals', icon: <CheckSquare size={20} /> },
    // { to: '/inventory', label: 'Inventory', icon: <Database size={20} /> },
    // { to: '/assets', label: 'Assets', icon: <Archive size={20} /> },
  ];

  const limitedNavLinks = allNavLinks.filter(link =>
    ['/', '/requisitions', '/purchase-orders', '/inventory', '/assets'].includes(link.to)
  );

  const navLinks = userRole === "owner" ? allNavLinks : allNavLinks;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Sticky Container for both navbars */}
      <div className="position-sticky top-0" style={{ zIndex: 1030 }}>
        {/* Top Navbar - Enhanced Responsive */}
        <nav className="navbar navbar-expand-lg bg-light" style={{ 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div className="container-fluid px-2 px-sm-3 px-md-4 px-lg-5 py-2 py-sm-3">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center flex-grow-1">
                <div className="position-relative me-2 me-sm-3 me-md-4">
                  <img
                    src="/AurumiLogo.png"
                    alt="Aurumi Logo"
                    className="rounded-circle shadow-sm d-block"
                    style={{
                      width: 'clamp(28px, 4vw, 48px)',
                      height: 'clamp(28px, 4vw, 48px)',
                      border: '2px solid rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <div 
                    className="position-absolute top-0 start-0 rounded-circle"
                    style={{
                      width: 'clamp(28px, 4vw, 48px)',
                      height: 'clamp(28px, 4vw, 48px)',
                      background: 'rgba(0,0,0,0.05)',
                      animation: 'pulse 2s infinite'
                    }}
                  ></div>
                </div>
                <div className="d-none d-sm-block">
                  <h1 className="text-dark mb-0 fw-bold" style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.75rem)',
                    letterSpacing: '0.5px',
                    lineHeight: '1.2'
                  }}>
                    Vendors Management
                  </h1>
                  <p className="text-muted mb-0 d-none d-lg-block" style={{
                    fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)'
                  }}>
                    Streamline your vendor operations
                  </p>
                </div>
                {/* Mobile title - Enhanced */}
                <div className="d-block d-sm-none">
                  <h1 className="text-dark mb-0 fw-bold" style={{ 
                    fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
                    letterSpacing: '0.3px',
                    lineHeight: '1.1'
                  }}>
                    Vendor Management
                  </h1>
                </div>
              </div>
              
              {/* Right side content - Enhanced Responsive */}
              <div className="d-flex align-items-center ms-auto">
                {/* Mobile/Tablet user info */}
                <div className="d-block d-lg-none">
                  <div className="d-flex align-items-center gap-1 bg-primary text-white px-2 py-1 rounded-2" style={{
                    fontSize: 'clamp(0.7rem, 3vw, 0.85rem)'
                  }}>
                    <FaUserCircle className="flex-shrink-0" style={{ fontSize: '1rem' }} />
                    <span className="text-truncate" style={{ maxWidth: 'clamp(60px, 15vw, 100px)' }}>
                      {userDetails?.userDetails?.UserName}
                    </span>
                  </div>
                </div>
                
                {/* Desktop user info */}
                <div className="d-none d-lg-flex align-items-center">
                  <div className="d-flex align-items-center gap-2 bg-primary text-white px-4 py-2 rounded-3" style={{
                    fontSize: 'clamp(0.85rem, 1vw, 0.9rem)',
                    fontWeight: '500'
                  }}>
                    <FaUserCircle className="flex-shrink-0" style={{ fontSize: '1.1rem' }} />
                    <span className="text-truncate" style={{ maxWidth: '150px' }}>
                      {userDetails?.userDetails?.UserName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Horizontal Nav Links - Enhanced Responsive */}
        <div className="bg-white border-bottom" style={{ 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)' 
        }}>
          <div className="container-fluid px-2 px-sm-3 px-md-4 px-lg-5">
            {/* Desktop/Tablet Navigation - Enhanced */}
            <div className="d-none d-md-flex gap-2 gap-lg-3 py-3 justify-content-start overflow-auto">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={addAccountQuery(link.to)}
                  className={({ isActive }) =>
                    `text-decoration-none px-3 px-lg-4 py-3 rounded-3 transition-all flex-shrink-0 ${
                      isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-dark bg-light border-0 hover-lift'
                    }`
                  }
                  style={{ 
                    minWidth: 'clamp(90px, 8vw, 140px)',
                    maxWidth: 'clamp(120px, 12vw, 160px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('bg-primary')) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('bg-primary')) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <div className="mb-1" style={{ opacity: 0.8 }}>
                      {link.icon}
                    </div>
                    <span className="small fw-medium text-center" style={{
                      fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                    }}>
                      {link.label}
                    </span>
                  </div>
                </NavLink>
              ))}
            </div>

            {/* Mobile Navigation - Enhanced Horizontal Scroll */}
            <div className="d-md-none py-2">
              <div className="d-flex gap-2 overflow-auto pb-1" style={{ 
                scrollbarWidth: 'thin',
                msOverflowStyle: 'none',
                WebkitScrollbar: { display: 'none' }
              }}>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={addAccountQuery(link.to)}
                    className={({ isActive }) =>
                      `text-decoration-none px-2 px-sm-3 py-2 rounded-2 flex-shrink-0 ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-dark bg-light border'
                      }`
                    }
                    style={{ 
                      minWidth: 'clamp(70px, 15vw, 90px)',
                      fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)'
                    }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <div className="mb-1" style={{ opacity: 0.8 }}>
                        {React.cloneElement(link.icon, { 
                          size: window.innerWidth < 400 ? 14 : 16 
                        })}
                      </div>
                      <span className="small fw-medium text-center text-truncate" style={{ 
                        fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                        maxWidth: '100%'
                      }}>
                        {link.label}
                      </span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content - Enhanced Responsive */}
      <main className="flex-1 p-2 p-sm-3 p-md-4 p-lg-5" style={{ 
        background: '#f8f9fa',
        minHeight: 'calc(100vh - 140px)'
      }}>
        <div className="container-fluid p-0">
          {children}
        </div>
      </main>

      {/* Enhanced CSS for better responsiveness */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.1; }
          100% { opacity: 0.4; }
        }
        
        .hover-lift:hover {
          background-color: #e9ecef !important;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }

        /* Custom scrollbar for mobile nav */
        .overflow-auto::-webkit-scrollbar {
          height: 2px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        /* Enhanced mobile styles */
        @media (max-width: 375px) {
          .container-fluid {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .gap-2 {
            gap: 0.25rem !important;
          }
        }

        @media (min-width: 376px) and (max-width: 576px) {
          .container-fluid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        /* Tablet specific styles */
        @media (min-width: 577px) and (max-width: 768px) {
          .container-fluid {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }

        /* Large tablet styles */
        @media (min-width: 769px) and (max-width: 992px) {
          .container-fluid {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
        }

        /* Desktop styles */
        @media (min-width: 993px) {
          .container-fluid {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
        }

        /* Ensure text doesn't wrap in nav items */
        .text-center {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Enhanced hover effects for larger screens */
        @media (min-width: 768px) {
          .hover-lift:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
        }

        /* Improved focus states for accessibility */
        .nav-link:focus,
        .navbar-brand:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }

        /* Better mobile touch targets */
        @media (max-width: 767px) {
          .nav-link {
            min-height: 44px;
            display: flex;
            align-items: center;
          }
        }

        /* Smooth transitions for responsive changes */
        * {
          transition: padding 0.3s ease, margin 0.3s ease, font-size 0.3s ease;
        }

        /* Print styles */
        @media print {
          .navbar,
          .nav {
            display: none !important;
          }
          
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;