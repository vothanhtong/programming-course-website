import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, message as antdMsg, Spin, Tooltip } from 'antd';
import {
  MailOutlined, DeleteOutlined, EyeOutlined, PhoneOutlined,
  UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import adminApi from '../api/adminApi';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [perPage]               = useState(20);
  const [filter, setFilter]     = useState('all'); // all | unread | read
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [viewModal, setViewModal]     = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = { page, perPage };
      if (filter === 'unread') params.isRead = 'false';
      if (filter === 'read')   params.isRead = 'true';
      const res = await adminApi.getMessages(params);
      setMessages(res.messages || []);
      setTotal(res.total || 0);
    } catch (err) {
      antdMsg.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, filter]);

  const handleView = async (record) => {
    setSelectedMsg(record);
    setViewModal(true);
    // Đánh dấu đã đọc nếu chưa đọc
    if (!record.isRead) {
      try {
        await adminApi.markMessageRead(record._id);
        fetchMessages(); // Refresh để cập nhật trạng thái
      } catch (err) {
        console.error('Không thể đánh dấu đã đọc:', err);
      }
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa tin nhắn này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminApi.deleteMessage(id);
          antdMsg.success('Đã xóa tin nhắn');
          fetchMessages();
        } catch (err) {
          antdMsg.error('Không thể xóa tin nhắn');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Trạng thái',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 110,
      render: (isRead) => (
        <Tag
          icon={isRead ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={isRead ? 'success' : 'warning'}
        >
          {isRead ? 'Đã đọc' : 'Chưa đọc'}
        </Tag>
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#60a5fa' }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined style={{ color: '#34d399' }} />
          <a href={`mailto:${email}`} style={{ color: '#60a5fa' }}>{email}</a>
        </div>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => phone ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneOutlined style={{ color: '#fbbf24' }} />
          <a href={`tel:${phone}`} style={{ color: '#60a5fa' }}>{phone}</a>
        </div>
      ) : <span style={{ color: '#64748b' }}>—</span>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ color: '#94a3b8' }}>
            {text.length > 60 ? text.substring(0, 60) + '...' : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            Tin nhắn tư vấn
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>
            Quản lý tin nhắn từ khách hàng
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            Tất cả
          </Button>
          <Button
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => { setFilter('unread'); setPage(1); }}
          >
            Chưa đọc
          </Button>
          <Button
            type={filter === 'read' ? 'primary' : 'default'}
            onClick={() => { setFilter('read'); setPage(1); }}
          >
            Đã đọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={messages}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: perPage,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (t) => `Tổng ${t} tin nhắn`,
        }}
        scroll={{ x: 1200 }}
        rowClassName={(record) => !record.isRead ? 'unread-row' : ''}
      />

      {/* View Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MailOutlined style={{ fontSize: 20, color: '#60a5fa' }} />
            <span>Chi tiết tin nhắn</span>
          </div>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Đóng
          </Button>,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setViewModal(false);
              handleDelete(selectedMsg._id);
            }}
          >
            Xóa
          </Button>,
        ]}
        width={600}
      >
        {selectedMsg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Tên khách hàng</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>
                {selectedMsg.name}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Email</div>
              <a href={`mailto:${selectedMsg.email}`} style={{ fontSize: 15, color: '#60a5fa' }}>
                {selectedMsg.email}
              </a>
            </div>
            {selectedMsg.phone && (
              <div>
                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Điện thoại</div>
                <a href={`tel:${selectedMsg.phone}`} style={{ fontSize: 15, color: '#60a5fa' }}>
                  {selectedMsg.phone}
                </a>
              </div>
            )}
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Nội dung</div>
              <div style={{
                padding: 16,
                background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 8,
                color: '#cbd5e1',
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {selectedMsg.message}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Thời gian gửi</div>
              <div style={{ fontSize: 15, color: '#94a3b8' }}>
                {new Date(selectedMsg.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Trạng thái</div>
              <Tag
                icon={selectedMsg.isRead ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                color={selectedMsg.isRead ? 'success' : 'warning'}
              >
                {selectedMsg.isRead ? 'Đã đọc' : 'Chưa đọc'}
              </Tag>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .unread-row {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        .unread-row:hover {
          background: rgba(59, 130, 246, 0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default Messages;
