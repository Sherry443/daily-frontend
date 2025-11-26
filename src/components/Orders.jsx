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

    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Professional Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '20px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              letterSpacing: '-0.5px',
              marginBottom: '4px'
            }}>
              Orders Dashboard
            </h1>
            <div style={{ 
              fontSize: '13px', 
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: connected ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 0 2px rgba(${connected ? '16, 185, 129' : '239, 68, 68'}, 0.2)`
                }}></div>
                <span>{connected ? 'Live' : 'Offline'}</span>
              </div>
              <div>•</div>
              <div>{filteredOrders.length} Orders</div>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              border: showFilters ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '10px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Date Filter */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '10px',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Date Range
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={resetDateFilter}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear Date Filter
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '10px',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Status Filter
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['all', 'pending', 'in_progress', 'delivered', 'cancelled', 'rescheduled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: filterStatus === status ? getStatusColor(status) : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: filterStatus === status ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: filterStatus === status ? '0 4px 6px rgba(0, 0, 0, 0.3)' : 'none'
                  }}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)} <span style={{ opacity: 0.7 }}>({getCountByStatus(status)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div style={{ padding: '16px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Package size={56} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'rgba(255, 255, 255, 0.5)' }} />
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>No orders found</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', marginTop: '8px' }}>
              Try adjusting your filters
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                marginBottom: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Order Header */}
              <div
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                style={{
                  padding: '18px',
                  cursor: 'pointer',
                  borderBottom: expandedOrder === order._id ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: '#3b82f6', 
                      marginBottom: '6px',
                      letterSpacing: '-0.3px'
                    }}>
                      {order.order_number}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Clock size={12} />
                      {getOrderDate(order)}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 14px',
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <User size={16} color="rgba(255, 255, 255, 0.7)" />
                    <span style={{ fontSize: '15px', color: 'white', fontWeight: '600' }}>
                      {order.customer_full_name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={16} color="rgba(255, 255, 255, 0.7)" />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {order.customer_phone}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '700', 
                    color: '#10b981',
                    letterSpacing: '-0.5px'
                  }}>
                    {order.total}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#3b82f6', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {expandedOrder === order._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedOrder === order._id ? 'Less' : 'More'}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div style={{ padding: '18px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  {/* Address */}
                  <div style={{ 
                    marginBottom: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <MapPin size={16} color="#3b82f6" />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Delivery Address
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                      {order.full_address}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ 
                    marginBottom: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Package size={16} color="#3b82f6" />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Order Items
                      </span>
                    </div>
                    <div>
                      {order.line_items?.map((item, idx) => (
                        <div key={idx} style={{ 
                          fontSize: '14px', 
                          color: 'rgba(255, 255, 255, 0.8)',
                          padding: '8px 0',
                          borderBottom: idx < order.line_items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{item.title}</span>
                          <span style={{ fontWeight: '600', color: 'white' }}>×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Handled By */}
                  {order.handled_by?.name && (
                    <div style={{ 
                      marginBottom: '18px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Handled By
                      </div>
                      <div style={{ fontSize: '15px', color: 'white', fontWeight: '600', marginBottom: '4px' }}>
                        {order.handled_by.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {new Date(order.handled_by.updated_at).toLocaleString('en-PK')}
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Update Status
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['in_progress', 'delivered', 'cancelled', 'rescheduled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order._id, status)}
                          disabled={updatingOrder === order._id || order.status === status}
                          style={{
                            padding: '14px',
                            fontSize: '13px',
                            backgroundColor: order.status === status ? 'rgba(255, 255, 255, 0.1)' : getStatusColor(status),
                            color: 'white',
                            border: order.status === status ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                            borderRadius: '10px',
                            cursor: updatingOrder === order._id || order.status === status ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            opacity: order.status === status ? 0.5 : 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            boxShadow: order.status === status ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Logout Button */}
      <div style={{ 
        padding: '16px',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, #0f172a 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Logout
        </button>
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