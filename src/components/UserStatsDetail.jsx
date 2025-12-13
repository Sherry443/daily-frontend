import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ArrowLeft, Clock, Truck, CheckCircle, XCircle, Calendar, TrendingUp, User } from 'lucide-react';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function UserStatsDetail({ userId, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeframe, setTimeframe] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    fetchUserStats();
  }, [userId, startDate, endDate, timeframe]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('timeframe', timeframe);

      const response = await fetch(`${BACKEND_URL}/dashboard/user-detailed-stats/${userId}?${params}`, {
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
      console.error('Error fetching user stats:', error);
      alert('Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
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
        <div style={{ color: '#BCB9AC', fontSize: '18px' }}>Loading user statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249',
        gap: '20px'
      }}>
        <div style={{ color: '#BCB9AC', fontSize: '18px' }}>No data available</div>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#BCB9AC',
            color: '#123249',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusCards = [
    { 
      key: 'pending', 
      label: 'Pending', 
      count: stats.summary.pending, 
      color: '#BCB9AC',
      Icon: Clock
    },
    { 
      key: 'in_progress', 
      label: 'In Progress', 
      count: stats.summary.in_progress, 
      color: '#ff9800',
      Icon: Truck
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      count: stats.summary.delivered, 
      color: '#4caf50',
      Icon: CheckCircle
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      count: stats.summary.cancelled, 
      color: '#f44336',
      Icon: XCircle
    },
    { 
      key: 'rescheduled', 
      label: 'Rescheduled', 
      count: stats.summary.rescheduled, 
      color: '#9c27b0',
      Icon: Calendar
    }
  ];

  const chartData = stats.dailyBreakdown?.map(day => ({
    date: new Date(day._id).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
    Pending: day.pending || 0,
    'In Progress': day.in_progress || 0,
    Delivered: day.delivered || 0,
    Cancelled: day.cancelled || 0,
    Rescheduled: day.rescheduled || 0,
    Total: day.total || 0
  })) || [];

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#123249',
      minHeight: '100vh'
    }}>
      {/* Back Button and Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(188, 185, 172, 0.2)',
            color: '#BCB9AC',
            border: '1px solid rgba(188, 185, 172, 0.3)',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            marginBottom: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.3)';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px',
          backgroundColor: 'rgba(188, 185, 172, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)'
        }}>
          <User size={32} color="#BCB9AC" strokeWidth={1.5} />
          <div>
            <h2 style={{ margin: 0, color: '#BCB9AC', fontSize: '24px' }}>
              {stats.userName || 'User Statistics'}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#BCB9AC', fontSize: '14px', opacity: 0.7 }}>
              Performance Overview
            </p>
          </div>
        </div>
      </div>

      {/* Date Filter and Timeframe Selector */}
      <div style={{
        padding: '16px',
        marginBottom: '20px',
        backgroundColor: 'rgba(188, 185, 172, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(188, 185, 172, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>
            Date Range:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '6px 28px',
                border: '1px solid rgba(188, 185, 172, 0.3)',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#BCB9AC',
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                outline: 'none',
                minHeight: '35px'
              }}
            />
            <span style={{ color: '#BCB9AC', opacity: 0.7 }}>TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '6px 28px',
                border: '1px solid rgba(188, 185, 172, 0.3)',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#BCB9AC',
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                outline: 'none',
                minHeight: '35px'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={resetDateFilter}
              style={{
                padding: '8px 20px',
                backgroundColor: '#BCB9AC',
                color: '#123249',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                minHeight: '35px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4d1c4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#BCB9AC';
              }}
            >
              Clear Dates
            </button>
          )}
        </div>

        {/* Timeframe Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#BCB9AC' }}>
            View:
          </span>
          {['daily', 'weekly', 'monthly'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '8px 20px',
                backgroundColor: timeframe === tf ? '#BCB9AC' : 'transparent',
                color: timeframe === tf ? '#123249' : '#BCB9AC',
                border: `1px solid ${timeframe === tf ? '#BCB9AC' : 'rgba(188, 185, 172, 0.3)'}`,
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (timeframe !== tf) {
                  e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (timeframe !== tf) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {statusCards.map((card) => {
          const IconComponent = card.Icon;
          return (
            <div
              key={card.key}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${card.color}`,
                backgroundColor: 'rgba(18, 50, 73, 0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'rgba(18, 50, 73, 0.5)';
              }}
            >
              <IconComponent size={36} color={card.color} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '13px', color: '#BCB9AC', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>
                {card.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>
                {card.count}
              </div>
            </div>
          );
        })}

        {/* Total Card */}
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #BCB9AC',
            backgroundColor: 'rgba(18, 50, 73, 0.5)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = 'rgba(18, 50, 73, 0.5)';
          }}
        >
          <TrendingUp size={36} color="#BCB9AC" strokeWidth={1.5} style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '13px', color: '#BCB9AC', marginBottom: '6px', fontWeight: '500', opacity: 0.8 }}>
            Total Orders
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#BCB9AC' }}>
            {stats.summary.total}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          backgroundColor: 'rgba(18, 50, 73, 0.3)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#BCB9AC' }}>
            Orders Over Time ({timeframe})
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(188, 185, 172, 0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="#BCB9AC"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#BCB9AC" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#123249', 
                  border: '1px solid rgba(188, 185, 172, 0.3)',
                  borderRadius: '8px',
                  color: '#BCB9AC'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Pending" stroke="#BCB9AC" strokeWidth={2} />
              <Line type="monotone" dataKey="In Progress" stroke="#ff9800" strokeWidth={2} />
              <Line type="monotone" dataKey="Delivered" stroke="#4caf50" strokeWidth={2} />
              <Line type="monotone" dataKey="Cancelled" stroke="#f44336" strokeWidth={2} />
              <Line type="monotone" dataKey="Rescheduled" stroke="#9c27b0" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart for Status Distribution */}
      {chartData.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          backgroundColor: 'rgba(18, 50, 73, 0.3)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#BCB9AC' }}>
            Daily Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(188, 185, 172, 0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="#BCB9AC"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#BCB9AC" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#123249', 
                  border: '1px solid rgba(188, 185, 172, 0.3)',
                  borderRadius: '8px',
                  color: '#BCB9AC'
                }}
              />
              <Legend />
              <Bar dataKey="Pending" fill="#BCB9AC" />
              <Bar dataKey="In Progress" fill="#ff9800" />
              <Bar dataKey="Delivered" fill="#4caf50" />
              <Bar dataKey="Cancelled" fill="#f44336" />
              <Bar dataKey="Rescheduled" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders Table */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(188, 185, 172, 0.2)',
          backgroundColor: 'rgba(18, 50, 73, 0.3)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#BCB9AC' }}>
            Recent Orders
          </h3>
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
                    borderBottom: '1px solid rgba(188, 185, 172, 0.1)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(188, 185, 172, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
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