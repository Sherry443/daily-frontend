import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import UserOrdersList from './UserOrdersList';

const BACKEND_URL = 'https://daily-backend-wt0j.onrender.com';

// Thin line icons as SVG components
const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

export default function UserProfileDashboard({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [view, setView] = useState('overview');

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249',
        color: '#BCB9AC'
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
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#123249',
        color: '#BCB9AC'
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
      icon: <ClockIcon />
    },
    { 
      key: 'in_progress', 
      label: 'In Progress', 
      count: stats.stats.in_progress, 
      color: '#ff9800',
      icon: <TruckIcon />
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      count: stats.stats.delivered, 
      color: '#4caf50',
      icon: <CheckIcon />
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      count: stats.stats.cancelled, 
      color: '#f44336',
      icon: <XIcon />
    },
    { 
      key: 'rescheduled', 
      label: 'Rescheduled', 
      count: stats.stats.rescheduled, 
      color: '#9c27b0',
      icon: <CalendarIcon />
    }
  ];

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
        borderRadius: '12px',
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
                padding: '12px 16px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                minHeight: '50px'
              }}
            />
            <span style={{ color: '#BCB9AC', fontWeight: '600' }}>TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #BCB9AC',
                borderRadius: '50px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'white',
                outline: 'none',
                minHeight: '50px'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={resetDateFilter}
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
              Clear Dates
            </button>
          )}
        </div>
      </div>

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
              padding: '28px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${card.color}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ color: card.color, marginBottom: '12px' }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: card.color }}>
              {card.count}
            </div>
          </div>
        ))}

        {/* Total Card */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '28px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid #BCB9AC`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ color: '#BCB9AC', marginBottom: '12px' }}>
            <ChartIcon />
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            Total Handled
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#BCB9AC' }}>
            {stats.stats.total}
          </div>
        </div>
      </div>

      <UserOrdersList />
    </div>
  );
}