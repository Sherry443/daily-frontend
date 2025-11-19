import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Login Component
function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const body = isRegistering 
        ? formData 
        : { email: formData.email, password: formData.password };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div>
          {isRegistering && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Orders Component
function Orders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    newSocket.on('new_order', (newOrder) => {
      console.log('🔔 NEW ORDER:', newOrder);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      playNotificationSound();
    });

    newSocket.on('order_updated', (updatedOrder) => {
      console.log('🔄 ORDER UPDATED:', updatedOrder);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        onLogout();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      } else if (response.status === 401) {
        onLogout();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Sound play failed:', e));
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: '#4caf50',
      in_progress: '#ff9800',
      cancelled: '#f44336',
      rescheduled: '#9c27b0',
      pending: '#757575'
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: 'Delivered',
      in_progress: 'In Progress',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
      pending: 'Pending'
    };
    return labels[status] || status;
  };

  // Filter orders based on selected status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    rescheduled: orders.filter(o => o.status === 'rescheduled').length,
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Orders</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, <strong>{user.name}</strong>
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {filteredOrders.length} orders
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: socket?.connected ? '#4caf50' : '#ccc'
            }}></span>
            <span style={{ fontSize: '13px', color: '#666' }}>
              {socket?.connected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
            Filter by Status:
          </span>
          
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'all' ? '#1976d2' : '#f0f0f0',
              color: filterStatus === 'all' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            All ({orderCounts.all})
          </button>

          <button
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'pending' ? '#757575' : '#f0f0f0',
              color: filterStatus === 'pending' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Pending ({orderCounts.pending})
          </button>

          <button
            onClick={() => setFilterStatus('in_progress')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'in_progress' ? '#ff9800' : '#f0f0f0',
              color: filterStatus === 'in_progress' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            In Progress ({orderCounts.in_progress})
          </button>

          <button
            onClick={() => setFilterStatus('delivered')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'delivered' ? '#4caf50' : '#f0f0f0',
              color: filterStatus === 'delivered' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Delivered ({orderCounts.delivered})
          </button>

          <button
            onClick={() => setFilterStatus('cancelled')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'cancelled' ? '#f44336' : '#f0f0f0',
              color: filterStatus === 'cancelled' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Cancelled ({orderCounts.cancelled})
          </button>

          <button
            onClick={() => setFilterStatus('rescheduled')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === 'rescheduled' ? '#9c27b0' : '#f0f0f0',
              color: filterStatus === 'rescheduled' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Rescheduled ({orderCounts.rescheduled})
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '1200px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Address</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Items</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Handled By</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  {filterStatus === 'all' ? 'No orders found' : `No ${getStatusLabel(filterStatus).toLowerCase()} orders`}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} style={{
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{ padding: '12px 16px', color: '#1976d2', fontWeight: '500' }}>
                    {order.order_number}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {order.customer_full_name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {order.customer_phone}
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '250px', fontSize: '13px' }}>
                    {order.full_address}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {order.line_items?.map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.title}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                    {order.total}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        marginBottom: '8px'
                      }}>
                        {getStatusLabel(order.status)}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {['delivered', 'in_progress', 'cancelled', 'rescheduled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order._id, status)}
                            disabled={updatingOrder === order._id || order.status === status}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              backgroundColor: order.status === status ? '#ddd' : '#f0f0f0',
                              border: '1px solid #ddd',
                              borderRadius: '3px',
                              cursor: updatingOrder === order._id || order.status === status ? 'not-allowed' : 'pointer',
                              opacity: order.status === status ? 0.6 : 1
                            }}
                          >
                            {status === 'in_progress' ? 'In Progress' : 
                             status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {order.handled_by?.name ? (
                      <div>
                        <div style={{ fontWeight: '500' }}>{order.handled_by.name}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {new Date(order.handled_by.updated_at).toLocaleString('en-PK')}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

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

  return user ? (
    <Orders user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}