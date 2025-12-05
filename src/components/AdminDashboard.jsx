import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Truck, CheckCircle, XCircle, Calendar, Package, DollarSign, Award, FileText } from 'lucide-react';

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
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249'
      }}>
        <div style={{ color: '#BCB9AC', fontSize: '18px' }}>Loading dashboard...</div>
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
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249'
      }}>
        <div style={{ color: '#BCB9AC', fontSize: '18px' }}>No data available</div>
      </div>
    );
  }

  const statusCards = [
    { 
      key: 'pending', 
      label: 'Pending', 
      count: stats.stats.pending, 
      color: '#BCB9AC',
      Icon: Clock
    },
    { 
      key: 'in_progress', 
      label: 'In Progress', 
      count: stats.stats.in_progress, 
      color: '#ff9800',
      Icon: Truck
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      count: stats.stats.delivered, 
      color: '#4caf50',
      Icon: CheckCircle
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      count: stats.stats.cancelled, 
      color: '#f44336',
      Icon: XCircle
    },
    { 
      key: 'rescheduled', 
      label: 'Rescheduled', 
      count: stats.stats.rescheduled, 
      color: '#9c27b0',
      Icon: Calendar
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
      backgroundColor: '#123249',
      minHeight: '100vh'
    }}>

      {/* Date Filter */}
      <div style={{
        backgroundColor: 'rgba(188, 185, 172, 0.1)',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '50px',
        border: '1px solid rgba(188, 185, 172, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>
            Date Range:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid rgba(188, 185, 172, 0.3)',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                color: '#BCB9AC',
                outline: 'none',
                minHeight: '50px'
              }}
            />
            <span style={{ color: '#BCB9AC', opacity: 0.7 }}>TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid rgba(188, 185, 172, 0.3)',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                color: '#BCB9AC',
                outline: 'none',
                minHeight: '50px'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={resetDateFilter}
              style={{
                padding: '12px 24px',
                backgroundColor: '#BCB9AC',
                color: '#123249',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                minHeight: '50px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4d1c4';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#BCB9AC';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Clear Dates
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
        {statusCards.map((card) => {
          const IconComponent = card.Icon;
          return (
            <div
              key={card.key}
              onClick={() => handleStatusCardClick(card.key)}
              style={{
                backgroundColor: 'rgba(188, 185, 172, 0.1)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(188, 185, 172, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.15)';
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(188, 185, 172, 0.2)';
              }}
            >
              <IconComponent size={48} color={card.color} strokeWidth={1.5} style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#BCB9AC', marginBottom: '8px', fontWeight: '500', opacity: 0.8 }}>
                {card.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: card.color }}>
                {card.count}
              </div>
              <div style={{ fontSize: '12px', color: '#BCB9AC', marginTop: '8px', opacity: 0.6 }}>
                Click to view orders
              </div>
            </div>
          );
        })}

        {/* Total Orders Card */}
        <div
          style={{
            backgroundColor: 'rgba(188, 185, 172, 0.1)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(188, 185, 172, 0.2)'
          }}
        >
          <Package size={48} color="#BCB9AC" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', color: '#BCB9AC', marginBottom: '8px', fontWeight: '500', opacity: 0.8 }}>
            Total Orders
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#BCB9AC' }}>
            {stats.stats.total}
          </div>
        </div>

        {/* Revenue Card */}
        <div
          style={{
            backgroundColor: 'rgba(188, 185, 172, 0.1)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(188, 185, 172, 0.2)'
          }}
        >
          <DollarSign size={48} color="#4caf50" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', color: '#BCB9AC', marginBottom: '8px', fontWeight: '500', opacity: 0.8 }}>
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
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#BCB9AC' }}>
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(188, 185, 172, 0.2)" />
              <XAxis dataKey="name" stroke="#BCB9AC" />
              <YAxis stroke="#BCB9AC" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#123249', 
                  border: '1px solid rgba(188, 185, 172, 0.3)',
                  borderRadius: '8px',
                  color: '#BCB9AC'
                }}
              />
              <Bar dataKey="value" fill="#BCB9AC">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#BCB9AC' }}>
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
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#123249', 
                  border: '1px solid rgba(188, 185, 172, 0.3)',
                  borderRadius: '8px',
                  color: '#BCB9AC'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Handlers Section */}
      {stats.topHandlers && stats.topHandlers.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={24} color="#BCB9AC" strokeWidth={1.5} />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#BCB9AC' }}>
              Top Performers
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {stats.topHandlers.map((handler, index) => (
              <div key={handler._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                borderRadius: '50px',
                border: `1px solid ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(188, 185, 172, 0.3)'}`,
                minHeight: '60px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#BCB9AC',
                    minWidth: '24px'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '15px', color: '#BCB9AC' }}>
                    {handler.name || 'Unknown'}
                  </span>
                </div>
                <div style={{
                  padding: '8px 20px',
                  backgroundColor: '#BCB9AC',
                  color: '#123249',
                  borderRadius: '50px',
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
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={24} color="#BCB9AC" strokeWidth={1.5} />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#BCB9AC' }}>
              Recent Orders
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'rgba(18, 50, 73, 0.5)',
                  borderBottom: '2px solid rgba(188, 185, 172, 0.2)'
                }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#BCB9AC' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#BCB9AC' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} style={{
                    borderBottom: '1px solid rgba(188, 185, 172, 0.1)'
                  }}>
                    <td style={{ padding: '12px', color: '#BCB9AC', fontWeight: '500' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '12px', color: '#BCB9AC' }}>
                      {order.customer_full_name}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#BCB9AC' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#123249',
                        backgroundColor: 
                          order.status === 'delivered' ? '#4caf50' :
                          order.status === 'in_progress' ? '#ff9800' :
                          order.status === 'cancelled' ? '#f44336' :
                          order.status === 'rescheduled' ? '#9c27b0' :
                          '#BCB9AC'
                      }}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#BCB9AC', opacity: 0.8 }}>
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