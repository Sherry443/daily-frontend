import { useState, useEffect } from 'react';

import Login from './components/Login';
import Orders from './components/Orders';
import ProductsPage from './components/ProductsPage';
import AdminDashboard from './components/AdminDashboard';
import UserProfileDashboard from './components/UserProfileDashboard';
import LogisticsChatbot from './components/LogisticsChatbot';

export default function IntegratedApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('orders'); 
  const [ordersFilterStatus, setOrdersFilterStatus] = useState('all');

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

    return (
      <div style={{
        backgroundColor: '#1976d2',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* Orders - For all users */}
          <button
            onClick={() => navigateToOrders('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'orders' ? 'white' : 'transparent',
              color: currentView === 'orders' ? '#1976d2' : 'white',
              border: currentView === 'orders' ? 'none' : '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📦 Orders
          </button>

          {/* Products - For all users */}
          <button
            onClick={navigateToProducts}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'products' ? 'white' : 'transparent',
              color: currentView === 'products' ? '#1976d2' : 'white',
              border: currentView === 'products' ? 'none' : '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🏪 Products
          </button>

          {/* Admin Dashboard - ONLY for Admin */}
          {isAdmin && (
            <button
              onClick={navigateToAdminDashboard}
              style={{
                padding: '8px 16px',
                backgroundColor: currentView === 'admin_dashboard' ? 'white' : 'transparent',
                color: currentView === 'admin_dashboard' ? '#1976d2' : 'white',
                border: currentView === 'admin_dashboard' ? 'none' : '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📊 Dashboard
            </button>
          )}

          {/* User Profile - For all users */}
          <button
            onClick={navigateToProfileDashboard}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'profile_dashboard' ? 'white' : 'transparent',
              color: currentView === 'profile_dashboard' ? '#1976d2' : 'white',
              border: currentView === 'profile_dashboard' ? 'none' : '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            👤 My Profile
          </button>

          {/* Routes - For all users */}
          {/* <button
            onClick={navigateToRoutes}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'routes' ? 'white' : 'transparent',
              color: currentView === 'routes' ? '#1976d2' : 'white',
              border: currentView === 'routes' ? 'none' : '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🚚 Routes
          </button> */}

        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white' }}>
            Welcome, <strong>{user.name}</strong>
            {isAdmin && (
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                backgroundColor: '#4caf50', 
                padding: '2px 8px', 
                borderRadius: '4px',
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
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>
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
        <AdminDashboard user={user} onNavigateToOrders={navigateToOrders} />
      )}

      {currentView === 'profile_dashboard' && (
        <UserProfileDashboard user={user} onBack={() => navigateToOrders('all')} />
      )}
{/* 
      {currentView === 'routes' && (
        <LogisticsChatbot user={user} onBack={() => navigateToOrders('all')} />
      )} */}
    </div>
  );
}