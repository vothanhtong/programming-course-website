import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Popconfirm, Card, Typography, message, Rate, Tooltip } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import adminApi from '../api/adminApi';

const { Title } = Typography;

const Reviews = () => {
  const [reviews, setReviews]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState('false'); // 'false' = chờ duyệt

  const fetchReviews = useCallback(async (approved = filter, p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews({ approved, page: p, perPage: 15 });
      setReviews(res.reviews);
      setTotal(res.total || 0);
    } catch { message.error('Không thể tải đánh giá'); }
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      await adminApi.approveReview(id);
      message.success('Đã duyệt đánh giá');
      fetchReviews(filter, page);
    } catch { message.error('Duyệt thất bại'); }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteReview(id);
      message.success('Đã xóa đánh giá');
      fetchReviews(filter, page);
    } catch { message.error('Xóa thất bại'); }
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
    fetchReviews(val, 1);
  };

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseId',
      key: 'course',
      render: (c) => c?.title || '—',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      // Dùng value thay defaultValue để luôn hiển thị đúng
      render: (v) => <Rate disabled value={v} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      render: (v) => v || <span style={{ color: '#bfbfbf' }}>Không có nhận xét</span>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {!record.isApproved && (
            <Tooltip title="Duyệt">
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={() => handleApprove(record._id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xóa đánh giá này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý đánh giá</Title>
        <Space>
          <Button
            type={filter === 'false' ? 'primary' : 'default'}
            onClick={() => handleFilterChange('false')}
          >
            Chờ duyệt
          </Button>
          <Button
            type={filter === 'true' ? 'primary' : 'default'}
            onClick={() => handleFilterChange('true')}
          >
            Đã duyệt
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="_id"
          loading={loading}
          pagination={{
            total,
            pageSize: 15,
            current: page,
            onChange: (p) => { setPage(p); fetchReviews(filter, p); },
            showTotal: (t) => `Tổng ${t} đánh giá`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default Reviews;
