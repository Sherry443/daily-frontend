import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './styles.css';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

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
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onKeyPress={handleKeyPress}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={handleKeyPress}
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </div>

        <div className="login-footer">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="link-button"
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
  const [showFilters, setShowFilters] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
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
      const response = await fetch(`${BACKEND_URL}/orders`);

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
      
      const response = await fetch(`${BACKEND_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
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
      delivered: 'status-delivered',
      in_progress: 'status-progress',
      cancelled: 'status-cancelled',
      rescheduled: 'status-rescheduled',
      pending: 'status-pending'
    };
    return colors[status] || 'status-pending';
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

  const getOrderDate = (order) => {
    if (order.created_at) {
      return new Date(order.created_at).toISOString().split('T')[0];
    }
    return '';
  };

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Orders Dashboard</h1>
          <div className="header-actions">
            <span className="user-welcome">
              Welcome, <strong>{user.name}</strong>
            </span>
            <span className="orders-count">
              {filteredOrders.length} orders
            </span>
            <div className="connection-status">
              <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {connected ? 'Live' : reconnectAttempts > 0 ? `Reconnecting (${reconnectAttempts})` : 'Offline'}
              </span>
            </div>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Filter Toggle */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setShowDateFilter(!showDateFilter)}
      >
        <span>📅</span> Date Filter
        <span className="toggle-icon">{showDateFilter ? '▲' : '▼'}</span>
      </button>

      {/* Date Filter Section */}
      <div className={`filter-section ${showDateFilter ? 'show' : ''}`}>
        <div className="filter-content">
          <span className="filter-label">Select Date:</span>
          
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <span className="date-separator">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>

          {(startDate || endDate) && (
            <button onClick={resetDateFilter} className="btn-clear-dates">
              ✕ Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Mobile Status Filter Toggle */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        <span>🔍</span> Status Filter
        <span className="toggle-icon">{showFilters ? '▲' : '▼'}</span>
      </button>

      {/* Status Filter Section */}
      <div className={`filter-section ${showFilters ? 'show' : ''}`}>
        <div className="filter-content">
          <span className="filter-label">Filter by Status:</span>
          
          <div className="status-filters">
            {['all', 'pending', 'in_progress', 'delivered', 'cancelled', 'rescheduled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`status-filter-btn ${filterStatus === status ? 'active' : ''} ${getStatusColor(status)}`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)} ({getCountByStatus(status)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Items</th>
              <th className="text-right">Total</th>
              <th className="text-center">Status</th>
              <th>Handled By</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  {filterStatus === 'all' && !startDate && !endDate 
                    ? 'No orders found' 
                    : 'No orders found for selected filters'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">{order.order_number}</td>
                  <td className="order-date">{getOrderDate(order)}</td>
                  <td>{order.customer_full_name}</td>
                  <td>{order.customer_phone}</td>
                  <td className="address-cell">{order.full_address}</td>
                  <td className="items-cell">
                    {order.line_items?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        {item.quantity}x {item.title}
                      </div>
                    ))}
                  </td>
                  <td className="text-right order-total">{order.total}</td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <div className="status-actions">
                        {['delivered', 'in_progress', 'cancelled', 'rescheduled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order._id, status)}
                            disabled={updatingOrder === order._id || order.status === status}
                            className={`status-action-btn ${order.status === status ? 'disabled' : ''}`}
                          >
                            {status === 'in_progress' ? 'In Progress' : 
                             status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="handled-cell">
                    {order.handled_by?.name ? (
                      <div>
                        <div className="handler-name">{order.handled_by.name}</div>
                        <div className="handler-date">
                          {new Date(order.handled_by.updated_at).toLocaleString('en-PK')}
                        </div>
                      </div>
                    ) : (
                      <span className="no-handler">—</span>
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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = { name: 'Demo User' }; // Simulated user
    setUser(savedUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading...</div>
      </div>
    );
  }

  return user ? (
    <Orders user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}