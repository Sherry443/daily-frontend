const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const buttonStyle = (isActive, color = '#BCB9AC') => ({
  padding: isMobile ? '10px 20px' : '12px 28px',
  minHeight: '50px',
  backgroundColor: isActive ? color : 'transparent',
  color: isActive ? '#123249' : '#123249',
  border: isActive ? 'none' : '2px solid rgba(18, 50, 73, 0.3)',
  borderRadius: '50px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: isMobile ? '12px' : '13px',
  transition: 'all 0.3s ease',
  whiteSpace: 'nowrap',
  boxShadow: isActive ? '0 4px 12px rgba(188, 185, 172, 0.4)' : 'none',
});

return (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    padding: isMobile ? '12px' : '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  }}>

    {/* Filters and Search Section - Side by Side */}
    <div style={{
      backgroundColor: 'white',
      padding: isMobile ? '16px' : '20px 24px',
      marginBottom: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* Date Filter Row */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>
            📅 Select Date:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                minWidth: isMobile ? '130px' : '150px'
              }}
            />
            <span style={{ color: '#123249', fontWeight: '600' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '2px solid rgba(18, 50, 73, 0.2)',
                borderRadius: '25px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                minWidth: isMobile ? '130px' : '150px'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={resetDateFilter}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Handler Row */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#123249' }}>
            🔍 Handler:
          </span>
          <input
            type="text"
            placeholder="Search by handler name..."
            value={searchHandledBy}
            onChange={(e) => setSearchHandledBy(e.target.value)}
            style={{
              padding: '10px 20px',
              border: '2px solid rgba(18, 50, 73, 0.2)',
              borderRadius: '25px',
              fontSize: '13px',
              fontFamily: 'Arial, sans-serif',
              flex: isMobile ? '1 1 100%' : '1 1 300px',
              maxWidth: isMobile ? '100%' : '400px'
            }}
          />
          {searchHandledBy && (
            <button
              onClick={() => setSearchHandledBy('')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Buttons - Mobile: 2 per row, Desktop: all in one row */}
      <div>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#123249',
          display: 'block',
          marginBottom: '12px'
        }}>
          📊 Filter by Status:
        </span>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, auto))',
          gap: '10px',
          alignItems: 'center'
        }}>
          {['all', 'pending', 'in_progress', 'delivered', 'cancelled', 'rescheduled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={buttonStyle(
                filterStatus === status,
                filterStatus === status ? getStatusColor(status) : '#BCB9AC'
              )}
              onMouseEnter={(e) => {
                if (filterStatus !== status) {
                  e.target.style.backgroundColor = 'rgba(188, 185, 172, 0.2)';
                  e.target.style.borderColor = '#BCB9AC';
                }
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== status) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(18, 50, 73, 0.3)';
                }
              }}
            >
              {status === 'all' ? '📦 All' : getStatusLabel(status)} ({getCountByStatus(status)})
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Table */}
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
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
            <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Handled By</th>
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
                <td style={{ padding: '12px 16px', color: '#123249', fontWeight: '600' }}>
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
                      {['delivered', 'in_progress', 'cancelled', 'rescheduled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order._id, status)}
                          disabled={updatingOrder === order._id || order.status === status}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            backgroundColor: order.status === status ? '#BCB9AC' : '#f0f0f0',
                            color: order.status === status ? '#123249' : '#666',
                            border: order.status === status ? 'none' : '1px solid #ddd',
                            borderRadius: '20px',
                            cursor: updatingOrder === order._id || order.status === status ? 'not-allowed' : 'pointer',
                            opacity: order.status === status ? 0.6 : 1,
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
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
                      <div style={{ fontWeight: '600', color: '#123249' }}>{order.handled_by.name}</div>
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
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
      }
      
      tr:hover {
        background-color: rgba(188, 185, 172, 0.1) !important;
      }
    `}</style>
  </div>
);