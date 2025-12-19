import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function UserOrdersList() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  
  // Filters
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    fetchOrders();
  }, [status, startDate, endDate, sort, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      
      // Pakistan timezone ke liye dates convert karein
      if (startDate) {
        const pkStartDate = new Date(startDate + 'T00:00:00+05:00');
        params.append('startDate', pkStartDate.toISOString());
      }
      if (endDate) {
        const pkEndDate = new Date(endDate + 'T23:59:59+05:00');
        params.append('endDate', pkEndDate.toISOString());
      }
      
      params.append('sort', sort);
      params.append('limit', limit);
      params.append('skip', (page - 1) * limit);

      const response = await fetch(`${BACKEND_URL}/user/my-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setStats(data.stats);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const resetFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setSort('desc');
    setPage(1);
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

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>Status:</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{
                padding: '10px 20px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{
                padding: '10px 14px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{
                padding: '10px 14px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>

          {/* Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '10px 20px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            style={{
              padding: '10px 20px',
              backgroundColor: '#BCB9AC',
              color: '#123249',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(188, 185, 172, 0.3)'
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Loading orders...
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1200px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#123249',
                color: 'white',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Address</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Items</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600' }}>Total</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Handled Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    No orders found for the selected filters
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} style={{
                    borderBottom: '1px solid #e9ecef',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '12px 16px', color: '#123249', fontWeight: '600' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '—'}
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
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#123249' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          borderRadius: '25px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                          marginBottom: '8px'
                        }}>
                          {getStatusLabel(order.status)}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['delivered', 'in_progress', 'cancelled', 'rescheduled'].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => updateOrderStatus(order._id, statusOption)}
                              disabled={updatingOrder === order._id || order.status === statusOption}
                              style={{
                                padding: '6px 12px',
                                fontSize: '11px',
                                backgroundColor: order.status === statusOption ? '#BCB9AC' : '#f0f0f0',
                                color: order.status === statusOption ? '#123249' : '#666',
                                border: order.status === statusOption ? 'none' : '1px solid #ddd',
                                borderRadius: '20px',
                                cursor: updatingOrder === order._id || order.status === statusOption ? 'not-allowed' : 'pointer',
                                opacity: order.status === statusOption ? 0.6 : 1,
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {statusOption === 'in_progress' ? 'In Progress' : 
                               statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {order.handled_by?.updated_at 
                        ? new Date(order.handled_by.updated_at).toLocaleString('en-PK')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          marginTop: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} orders
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '10px 20px',
                backgroundColor: page === 1 ? '#e0e0e0' : '#BCB9AC',
                color: page === 1 ? '#999' : '#123249',
                border: 'none',
                borderRadius: '25px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              ← Previous
            </button>
            
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#123249'
            }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              style={{
                padding: '10px 20px',
                backgroundColor: page === pagination.totalPages ? '#e0e0e0' : '#BCB9AC',
                color: page === pagination.totalPages ? '#999' : '#123249',
                border: 'none',
                borderRadius: '25px',
                cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <style>{`
        tr:hover {
          background-color: rgba(188, 185, 172, 0.1) !important;
        }
        
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(188, 185, 172, 0.4);
        }
      `}</style>
    </div>
  );
}