import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import UserOrdersList from './UserOrdersList';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

export default function UserProfileDashboard({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  
  const [endDate, setEndDate] = useState('');
  const [view, setView] = useState('overview'); // overview, orders

  useEffect(() => {
    fetchUserStats();
  }, [startDate, endDate]);
  

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${BACKEND_URL}/dashboard/user-stats?${params}`, {
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
      alert('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading your dashboard...</div>
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

  // Prepare chart data
  const chartData = statusCards.map(card => ({
    name: card.label,
    value: card.count,
    color: card.color
  }));

  // Prepare timeline data (orders by date)
  const timelineData = stats.ordersByDate.map(item => ({
    date: item._id,
    Pending: item.pending,
    'In Progress': item.in_progress,
    Delivered: item.delivered,
    Cancelled: item.cancelled,
    Rescheduled: item.rescheduled
  })).reverse(); // Show oldest to newest

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>


      {/* View Toggle */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setView('overview')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'overview' ? '#1976d2' : '#f0f0f0',
            color: view === 'overview' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setView('orders')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'orders' ? '#1976d2' : '#f0f0f0',
            color: view === 'orders' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📦 Orders List
        </button>
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

      {view === 'overview' ? (
        <>
          {/* Status Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {statusCards.map((card) => (
              <div
                key={card.key}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${card.color}`
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: card.color }}>
                  {card.count}
                </div>
              </div>
            ))}

            {/* Total Card */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid #1976d2`
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
                Total Handled
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976d2' }}>
                {stats.stats.total}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Orders List View */
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Handled Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    No orders found for the selected date range
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} style={{
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <td style={{ padding: '12px 16px', color: '#1976d2', fontWeight: '500' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {order.customer_full_name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {order.customer_phone}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
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
        </div>
        
      )}
          <UserOrdersList />
    </div>

  );
}