import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'https://daily-backend-r2zx.onrender.com';

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

function Orders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server. Socket ID:', newSocket.id);
      setConnected(true);
      setReconnectAttempts(0);
      newSocket.emit('get_orders');
    });

    newSocket.on('connected', (data) => {
      console.log('📡 Welcome message:', data.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server. Reason:', reason);
      setConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setReconnectAttempts(0);
      newSocket.emit('get_orders');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('orders_list', (ordersData) => {
      console.log('📦 Received orders list:', ordersData.length);
      setOrders(ordersData);
      setLoading(false);
    });

    newSocket.on('new_order', (newOrder) => {
      console.log('🔔 NEW ORDER received:', newOrder.order_number);
      setOrders(prevOrders => {
        const exists = prevOrders.some(o => o._id === newOrder._id);
        if (exists) {
          console.log('⚠️ Order already in list, skipping');
          return prevOrders;
        }
        return [newOrder, ...prevOrders];
      });
      playNotificationSound();
      showNotification('New Order!', `Order ${newOrder.order_number} from ${newOrder.customer_full_name}`);
    });

    newSocket.on('order_updated', (updatedOrder) => {
      console.log('🔄 ORDER UPDATED:', updatedOrder.order_number);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    fetchOrders();

    return () => {
      console.log('🔌 Cleaning up socket connection');
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
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuFz/LTgjMGHm7A7+OZURU');
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'order-notification',
        requireInteraction: false,
      });
    }
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

  // Extract date from order
  const getOrderDate = (order) => {
    if (order.created_at) {
      return new Date(order.created_at).toISOString().split('T')[0];
    }
    return '';
  };

  // Filter orders based on status and date range
  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    
    let dateMatch = true;
    if (startDate || endDate) {
      const orderDate = getOrderDate(order);
      if (startDate && endDate) {
        dateMatch = orderDate >= startDate && orderDate <= endDate;
      } else if (startDate) {
        dateMatch = orderDate >= startDate;
      } else if (endDate) {
        dateMatch = orderDate <= endDate;
      }
    }
    
    return statusMatch && dateMatch;
  });

  // Count orders by status (considering date filter)
  const getCountByStatus = (status) => {
    return orders.filter(o => {
      const statusMatch = status === 'all' || o.status === status;
      
      let dateMatch = true;
      if (startDate || endDate) {
        const orderDate = getOrderDate(o);
        if (startDate && endDate) {
          dateMatch = orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          dateMatch = orderDate >= startDate;
        } else if (endDate) {
          dateMatch = orderDate <= endDate;
        }
      }
      
      return statusMatch && dateMatch;
    }).length;
  };

  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
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
        <h1 style={{ margin: 0, fontSize: '24px' }}>Orders Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, <strong>{user.name}</strong>
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {filteredOrders.length} orders
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: connected ? '#4caf50' : '#f44336',
              animation: connected ? 'pulse 2s infinite' : 'none'
            }}></span>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
              {connected ? 'Live' : reconnectAttempts > 0 ? `Reconnecting (${reconnectAttempts})` : 'Offline'}
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
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Date Filter Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
           Select Date:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}
            />
            <span style={{ color: '#999' }}>TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={resetDateFilter}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              ✕ Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Section */}
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
          
          {['all', 'pending', 'in_progress', 'delivered', 'cancelled', 'rescheduled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                backgroundColor: filterStatus === status ? getStatusColor(status) : '#f0f0f0',
                color: filterStatus === status ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)} ({getCountByStatus(status)})
            </button>
          ))}
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
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Customer</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Address</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Items</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Handled By</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '16px'
                }}>
                  {filterStatus === 'all' && !startDate && !endDate 
                    ? 'No orders found' 
                    : `No orders found for selected filters`}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} style={{
                  borderBottom: '1px solid #e9ecef',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={{ padding: '12px 16px', color: '#1976d2', fontWeight: '500' }}>
                    {order.order_number}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {getOrderDate(order)}
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
                      <div key={idx} style={{ padding: '2px 0' }}>
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
                              opacity: order.status === status ? 0.6 : 1,
                              fontWeight: '500'
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

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