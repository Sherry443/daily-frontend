import { useState, useEffect } from 'react';

import Login from './components/Login';
import Orders from './components/Orders';
import ProductsPage from './components/ProductsPage';
import AdminDashboard from './components/AdminDashboard';
import UserProfileDashboard from './components/UserProfileDashboard';
import LogisticsChatbot from './components/LogisticsChatbot';
import UserStatsDetail from './components/UserStatsDetail';

export default function IntegratedApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('orders'); 
  const [ordersFilterStatus, setOrdersFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // If admin, show admin dashboard by default
      if (userData.isAdmin) {
        setCurrentView('admin_dashboard');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Set default view based on role
    if (userData.isAdmin) {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('orders');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('orders');
  };

  const navigateToOrders = (status = 'all') => {
    setOrdersFilterStatus(status);
    setCurrentView('orders');
  };
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setCurrentView('user_stats_detail');
  };

  const navigateToProducts = () => setCurrentView('products');
  const navigateToAdminDashboard = () => setCurrentView('admin_dashboard');
  const navigateToProfileDashboard = () => setCurrentView('profile_dashboard');
  const navigateToRoutes = () => setCurrentView('routes');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const NavigationMenu = () => {
    const isAdmin = user?.isAdmin === true;
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
        if (window.innerWidth > 768) {
          setMenuOpen(false);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const buttonStyle = (isActive) => ({
      padding: isMobile ? '10px 24px' : '12px 32px',
      minHeight: '50px',
      backgroundColor: isActive ? '#BCB9AC' : 'transparent',
      color: isActive ? '#123249' : 'white',
      border: isActive ? 'none' : '2px solid rgba(188, 185, 172, 0.5)',
      borderRadius: '50px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: isMobile ? '13px' : '14px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      boxShadow: isActive ? '0 4px 12px rgba(188, 185, 172, 0.3)' : 'none',
    });

    const hoverEffect = (e, isActive) => {
      if (!isActive) {
        e.target.style.backgroundColor = 'rgba(188, 185, 172, 0.2)';
        e.target.style.borderColor = '#BCB9AC';
      }
    };

    const leaveEffect = (e, isActive) => {
      if (!isActive) {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.borderColor = 'rgba(188, 185, 172, 0.5)';
      }
    };

    const handleMenuItemClick = (action) => {
      action();
      setMenuOpen(false);
    };

    return (
      <>
        <div style={{
          backgroundColor: '#123249',
          padding: isMobile ? '12px 16px' : '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Mobile Layout */}
          {isMobile ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '40px',
                  height: '40px'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '2px',
                  backgroundColor: '#BCB9AC',
                  transition: 'all 0.3s ease',
                  transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
                }}></div>
                <div style={{
                  width: '28px',
                  height: '2px',
                  backgroundColor: '#BCB9AC',
                  transition: 'all 0.3s ease',
                  opacity: menuOpen ? 0 : 1
                }}></div>
                <div style={{
                  width: '28px',
                  height: '2px',
                  backgroundColor: '#BCB9AC',
                  transition: 'all 0.3s ease',
                  transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
                }}></div>
              </button>

              <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                {user.name}
                {isAdmin && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '10px', 
                    backgroundColor: '#BCB9AC', 
                    color: '#123249',
                    padding: '3px 8px', 
                    borderRadius: '50px',
                    fontWeight: 'bold'
                  }}>
                    Admin
                  </span>
                )}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            /* Desktop Layout */
            <>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center', 
                flex: 1
              }}>
                <button
                  onClick={() => navigateToOrders('all')}
                  onMouseEnter={(e) => hoverEffect(e, currentView === 'orders')}
                  onMouseLeave={(e) => leaveEffect(e, currentView === 'orders')}
                  style={buttonStyle(currentView === 'orders')}
                >
                  Orders
                </button>

                <button
                  onClick={navigateToProducts}
                  onMouseEnter={(e) => hoverEffect(e, currentView === 'products')}
                  onMouseLeave={(e) => leaveEffect(e, currentView === 'products')}
                  style={buttonStyle(currentView === 'products')}
                >
                  Products
                </button>

                {isAdmin && (
                  <button
                    onClick={navigateToAdminDashboard}
                    onMouseEnter={(e) => hoverEffect(e, currentView === 'admin_dashboard')}
                    onMouseLeave={(e) => leaveEffect(e, currentView === 'admin_dashboard')}
                    style={buttonStyle(currentView === 'admin_dashboard')}
                  >
                    Dashboard
                  </button>
                )}

                <button
                  onClick={navigateToProfileDashboard}
                  onMouseEnter={(e) => hoverEffect(e, currentView === 'profile_dashboard')}
                  onMouseLeave={(e) => leaveEffect(e, currentView === 'profile_dashboard')}
                  style={buttonStyle(currentView === 'profile_dashboard')}
                >
                  My Profile
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>
                  Welcome, <strong>{user.name}</strong>
                  {isAdmin && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '11px', 
                      backgroundColor: '#BCB9AC', 
                      color: '#123249',
                      padding: '4px 10px', 
                      borderRadius: '50px',
                      fontWeight: 'bold'
                    }}>
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c62828';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f44336';
                    e.target.style.transform = 'scale(1)';
                  }}
                  style={{
                    padding: '12px 28px',
                    minHeight: '50px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobile && menuOpen && (
          <div style={{
            backgroundColor: '#123249',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            position: 'sticky',
            top: '64px',
            zIndex: 99,
            borderTop: '1px solid rgba(188, 185, 172, 0.3)'
          }}>
            <button
              onClick={() => handleMenuItemClick(() => navigateToOrders('all'))}
              onMouseEnter={(e) => hoverEffect(e, currentView === 'orders')}
              onMouseLeave={(e) => leaveEffect(e, currentView === 'orders')}
              style={buttonStyle(currentView === 'orders')}
            >
              Orders
            </button>

            <button
              onClick={() => handleMenuItemClick(navigateToProducts)}
              onMouseEnter={(e) => hoverEffect(e, currentView === 'products')}
              onMouseLeave={(e) => leaveEffect(e, currentView === 'products')}
              style={buttonStyle(currentView === 'products')}
            >
              Products
            </button>

            {isAdmin && (
              <button
                onClick={() => handleMenuItemClick(navigateToAdminDashboard)}
                onMouseEnter={(e) => hoverEffect(e, currentView === 'admin_dashboard')}
                onMouseLeave={(e) => leaveEffect(e, currentView === 'admin_dashboard')}
                style={buttonStyle(currentView === 'admin_dashboard')}
              >
                Dashboard
              </button>
            )}

            <button
              onClick={() => handleMenuItemClick(navigateToProfileDashboard)}
              onMouseEnter={(e) => hoverEffect(e, currentView === 'profile_dashboard')}
              onMouseLeave={(e) => leaveEffect(e, currentView === 'profile_dashboard')}
              style={buttonStyle(currentView === 'profile_dashboard')}
            >
              My Profile
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <NavigationMenu />

      {/* All users (including admin) can access all views */}
      {currentView === 'orders' && (
        <Orders user={user} initialFilterStatus={ordersFilterStatus} />
      )}

      {currentView === 'products' && (
        <ProductsPage user={user} onBack={() => navigateToOrders('all')} />
      )}

{currentView === 'admin_dashboard' && (
  <AdminDashboard 
    user={user} 
    onNavigateToOrders={navigateToOrders} 
    onUserClick={handleUserClick}  // 👈 Ye add karo
  />
)}

      {currentView === 'profile_dashboard' && (
        <UserProfileDashboard user={user} onBack={() => navigateToOrders('all')} />
      )}
    </div>
  );
}