import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function UserOrdersList() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
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
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Filters */}
      <div style={{
        backgroundColor: 'rgba(188, 185, 172, 0.1)',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(188, 185, 172, 0.2)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>Status:</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{
                padding: '12px 16px',
                minHeight: '50px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
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
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{
                padding: '12px 16px',
                minHeight: '50px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{
                padding: '12px 16px',
                minHeight: '50px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>

          {/* Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '12px 16px',
                minHeight: '50px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
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
              padding: '14px 28px',
              minHeight: '50px',
              backgroundColor: '#BCB9AC',
              color: '#123249',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 185, 172, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Loading orders...
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#123249',
                borderBottom: '2px solid #BCB9AC'
              }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Order ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Phone</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#BCB9AC' }}>Total</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#BCB9AC' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Handled Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{
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
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <td style={{ padding: '16px', color: '#123249', fontWeight: '600' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '16px', color: '#333' }}>
                      {order.customer_full_name}
                    </td>
                    <td style={{ padding: '16px', color: '#333' }}>
                      {order.customer_phone}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#123249' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: getStatusColor(order.status),
                        display: 'inline-block'
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
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
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          marginTop: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '14px', color: '#BCB9AC', fontWeight: '500' }}>
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} orders
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '14px 28px',
                minHeight: '50px',
                backgroundColor: page === 1 ? 'rgba(188, 185, 172, 0.3)' : '#BCB9AC',
                color: page === 1 ? '#666' : '#123249',
                border: 'none',
                borderRadius: '50px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 185, 172, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              ← Previous
            </button>
            
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#BCB9AC'
            }}>
              Page <strong style={{ fontSize: '16px' }}>{pagination.page}</strong> of <strong style={{ fontSize: '16px' }}>{pagination.totalPages}</strong>
            </span>
            
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              style={{
                padding: '14px 28px',
                minHeight: '50px',
                backgroundColor: page === pagination.totalPages ? 'rgba(188, 185, 172, 0.3)' : '#BCB9AC',
                color: page === pagination.totalPages ? '#666' : '#123249',
                border: 'none',
                borderRadius: '50px',
                cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (page !== pagination.totalPages) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(188, 185, 172, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== pagination.totalPages) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}