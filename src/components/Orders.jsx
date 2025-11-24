import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

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
    <div className="font-sans bg-gray-100 min-h-screen p-4">

      {/* ==== HEADER BAR ==== */}
      <div className="bg-white p-4 mb-4 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Orders Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* LIVE indicator */}
          <div className="flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full ${
                connected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></span>
            <span className="text-xs text-gray-600 font-medium">
              {connected
                ? "Live"
                : reconnectAttempts > 0
                ? `Reconnecting (${reconnectAttempts})`
                : "Offline"}
            </span>
          </div>

          {/* Profile Circle */}
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow">
            {user.name.charAt(0)}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 shadow hover:bg-red-600"
          >
            <FiLogOut /> Logout
          </button>

          {/* Filter Button (Mobile) */}
          <button
            className="lg:hidden bg-gray-200 p-2 rounded-full"
            onClick={() => setShowFilters(true)}
          >
            <FiFilter size={18} />
          </button>
        </div>
      </div>

      {/* ==== FILTER DRAWER (Mobile) ==== */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowFilters(false)}></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl p-5 z-40 transform transition-transform duration-300 
          ${showFilters ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={() => setShowFilters(false)}>
            <FiX size={22} />
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-2">Select Date</h3>

          <div className="flex flex-col gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            />

            {(startDate || endDate) && (
              <button
                onClick={resetDateFilter}
                className="bg-yellow-500 text-white p-2 rounded-lg text-sm"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Order Status</h3>
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "in_progress", "delivered", "cancelled", "rescheduled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getStatusLabel(status)} ({getCountByStatus(status)})
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ==== DESKTOP FILTERS (Visible Only on Large Screens) ==== */}
      <div className="hidden lg:block bg-white p-4 mb-4 rounded-xl shadow-md">

        {/* Date Filter */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-medium text-sm">Select Date:</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded-lg text-sm" />

          <span>to</span>

          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded-lg text-sm" />

          {(startDate || endDate) && (
            <button onClick={resetDateFilter} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
              Clear
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "pending", "in_progress", "delivered", "cancelled", "rescheduled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {getStatusLabel(status)} ({getCountByStatus(status)})
              </button>
            )
          )}
        </div>
      </div>

      {/* ==== ORDERS LIST ==== */}
      <div className="lg:block hidden">
        {/* Desktop Table */}
        <div className="bg-white rounded-xl overflow-auto shadow-md">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Order ID</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Customer</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Address</th>
                <th className="p-4 text-left font-semibold">Items</th>
                <th className="p-4 text-right font-semibold">Total</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Handled By</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="p-4 text-blue-600 font-medium">{order.order_number}</td>
                    <td className="p-4">{getOrderDate(order)}</td>
                    <td className="p-4">{order.customer_full_name}</td>
                    <td className="p-4">{order.customer_phone}</td>
                    <td className="p-4 max-w-xs">{order.full_address}</td>
                    <td className="p-4 text-sm">
                      {order.line_items?.map((item, idx) => (
                        <div key={idx}>{item.quantity}x {item.title}</div>
                      ))}
                    </td>
                    <td className="p-4 text-right font-bold">Rs {order.total}</td>
                    <td className="p-4 text-center">
                      <span
                        className="px-3 py-1 text-white rounded text-sm"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>

                    <td className="p-4 text-sm">
                      {order.handled_by?.name ? (
                        <>
                          <div className="font-medium">{order.handled_by.name}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(order.handled_by.updated_at).toLocaleString("en-PK")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==== MOBILE ORDER CARDS ==== */}
      <div className="lg:hidden">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 p-10">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-xl shadow-md mb-4"
            >
              <div className="flex justify-between items-center">
                <p className="text-blue-600 font-semibold">{order.order_number}</p>
                <span
                  className="px-3 py-1 text-white text-xs rounded-lg"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1">{getOrderDate(order)}</p>

              <div className="mt-3 text-sm">
                <p><strong>{order.customer_full_name}</strong></p>
                <p>{order.customer_phone}</p>
                <p className="text-gray-600">{order.full_address}</p>
              </div>

              <div className="mt-3 text-sm">
                {order.line_items?.map((item, idx) => (
                  <div key={idx}>
                    {item.quantity}x {item.title}
                  </div>
                ))}
              </div>

              <div className="mt-4 font-bold text-right text-lg">
                Rs {order.total}
              </div>

              {/* Status Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["delivered", "in_progress", "cancelled", "rescheduled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(order._id, status)}
                    disabled={updatingOrder === order._id || order.status === status}
                    className={`px-3 py-1 rounded text-xs border ${
                      order.status === status
                        ? "bg-gray-300 text-gray-600"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
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