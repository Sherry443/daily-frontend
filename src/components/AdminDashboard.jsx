import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function AdminDashboard({ user, onNavigateToOrders, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [startDate, endDate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${BACKEND_URL}/dashboard/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      alert('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCardClick = (status) => {
    setSelectedStatus(status);
    onNavigateToOrders(status);
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
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>No data available</div>
      </div>
    );
  }

  const statusCards = [
    { 
      key: 'pending', 
      label: 'Pending', 
      count: stats.stats.pending, 
      color: '#757575',
      icon: '⏳'
    },
    { 
      key: 'in_progress', 
      label: 'In Progress', 
      count: stats.stats.in_progress, 
      color: '#ff9800',
      icon: '🚚'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      count: stats.stats.delivered, 
      color: '#4caf50',
      icon: '✅'
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      count: stats.stats.cancelled, 
      color: '#f44336',
      icon: '❌'
    },
    { 
      key: 'rescheduled', 
      label: 'Rescheduled', 
      count: stats.stats.rescheduled, 
      color: '#9c27b0',
      icon: '📅'
    }
  ];

  const chartData = statusCards.map(card => ({
    name: card.label,
    value: card.count,
    color: card.color
  }));

  const pieColors = statusCards.map(card => card.color);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Orders
          </button>
          <h1 style={{ margin: 0, fontSize: '24px' }}>📊 Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, <strong>{user.name}</strong>
          </span>
        </div>
      </div>

      {/* Date Filter */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
            📅 Date Range:
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

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {statusCards.map((card) => (
          <div
            key={card.key}
            onClick={() => handleStatusCardClick(card.key)}
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `4px solid ${card.color}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: card.color }}>
              {card.count}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Click to view orders →
            </div>
          </div>
        ))}

        {/* Total Orders Card */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid #1976d2`
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            Total Orders
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976d2' }}>
            {stats.stats.total}
          </div>
        </div>

        {/* Revenue Card */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid #4caf50`
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            Total Revenue (Delivered)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50' }}>
            {stats.revenue.formatted}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Bar Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1976d2">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
            Order Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Handlers Section */}
      {stats.topHandlers && stats.topHandlers.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
            🏆 Top Performers
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {stats.topHandlers.map((handler, index) => (
              <div key={handler._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '6px',
                borderLeft: `4px solid ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#1976d2'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '15px' }}>
                    {handler.name || 'Unknown'}
                  </span>
                </div>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {handler.count} orders
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
            📋 Recent Orders
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} style={{
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <td style={{ padding: '12px', color: '#1976d2', fontWeight: '500' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {order.customer_full_name}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: 
                          order.status === 'delivered' ? '#4caf50' :
                          order.status === 'in_progress' ? '#ff9800' :
                          order.status === 'cancelled' ? '#f44336' :
                          order.status === 'rescheduled' ? '#9c27b0' :
                          '#757575'
                      }}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}