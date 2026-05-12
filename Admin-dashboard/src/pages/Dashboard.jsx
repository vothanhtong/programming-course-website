import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  BookOutlined, TeamOutlined, DollarOutlined, StarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import adminApi from '../api/adminApi';

// ── Dark theme tokens ──────────────────────────────────────
const card = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: 16,
  backdropFilter: 'blur(12px)',
};

const statCards = [
  {
    key: 'totalCourses',
    title: 'Tổng khóa học',
    icon: <BookOutlined style={{ fontSize: 26 }} />,
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.2)',
    border: 'rgba(59,130,246,0.3)',
    format: false,
  },
  {
    key: 'totalEnrollments',
    title: 'Lượt đăng ký',
    icon: <TeamOutlined style={{ fontSize: 26 }} />,
    color: '#34d399',
    glow: 'rgba(16,185,129,0.2)',
    border: 'rgba(16,185,129,0.3)',
    format: false,
  },
  {
    key: 'totalRevenue',
    title: 'Doanh thu (VNĐ)',
    icon: <DollarOutlined style={{ fontSize: 26 }} />,
    color: '#fbbf24',
    glow: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.3)',
    format: true,
  },
  {
    key: 'unreadMessages',
    title: 'Tin nhắn chưa đọc',
    icon: <StarOutlined style={{ fontSize: 26 }} />,
    color: '#f472b6',
    glow: 'rgba(236,72,153,0.2)',
    border: 'rgba(236,72,153,0.3)',
    format: false,
  },
];

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)',
      border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: 10,
      padding: '10px 16px',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#60a5fa', fontSize: 18, fontWeight: 700, margin: 0 }}>
        {payload[0].value} đăng ký
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [chart, setChart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getEnrollmentsByMonth().catch(() => ({ data: [] })),
    ])
      .then(([s, c]) => {
        setStats(s);
        setChart(c.data || []);
      })
      .catch(() => setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <Spin size="large" />
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center', color: '#f87171' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p>{error}</p>
        <button
          onClick={() => { setError(''); setLoading(true); }}
          style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.4)', background: 'transparent', color: '#60a5fa', cursor: 'pointer' }}
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
          Tổng quan
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>
          Xin chào! Đây là tổng quan hoạt động của hệ thống.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {statCards.map((c) => (
          <div
            key={c.key}
            style={{
              ...card,
              padding: '22px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = c.border;
              e.currentTarget.style.boxShadow = `0 0 24px ${c.glow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: c.glow,
              border: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: c.color,
            }}>
              {c.icon}
            </div>
            {/* Text */}
            <div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500, marginBottom: 4 }}>
                {c.title}
              </div>
              <div style={{
                fontSize: 30,
                fontWeight: 800,
                color: c.color,
                lineHeight: 1,
                letterSpacing: '-0.5px',
              }}>
                {c.format
                  ? (stats?.[c.key] || 0).toLocaleString('vi-VN')
                  : (stats?.[c.key] ?? 0).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Bar chart */}
        <div style={{ ...card, padding: '24px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                Đăng ký theo tháng
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>12 tháng gần nhất</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa', fontSize: 13, fontWeight: 600,
            }}>
              <RiseOutlined /> Tổng: {chart.reduce((s, d) => s + d.count, 0)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chart} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
              <Bar
                dataKey="count"
                fill="url(#barGrad)"
                radius={[6, 6, 0, 0]}
                name="Đăng ký"
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div style={{ ...card, padding: '24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 20px' }}>
            Thống kê nhanh
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Khóa học đang hoạt động', value: stats?.totalCourses || 0,      color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
              { label: 'Tổng lượt đăng ký',       value: stats?.totalEnrollments || 0,  color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Đánh giá chờ duyệt',      value: stats?.pendingReviews || 0,    color: '#f472b6', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
              { label: 'Doanh thu (VNĐ)',          value: (stats?.totalRevenue || 0).toLocaleString('vi-VN'), color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', isStr: true },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: item.isStr ? 13 : 20,
                  fontWeight: 700,
                  color: item.color,
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
