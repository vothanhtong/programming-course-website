import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Tag, Modal, message as antdMsg, Tooltip, Input } from 'antd';
import {
  MailOutlined, DeleteOutlined, EyeOutlined, PhoneOutlined,
  UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  SendOutlined, MessageOutlined,
} from '@ant-design/icons';
import adminApi from '../api/adminApi';

const { TextArea } = Input;

// ── Chat bubble component ─────────────────────────────────
const ChatBubble = ({ isAdmin, text, time, name }) => (
  <div style={{
    display: 'flex',
    flexDirection: isAdmin ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  }}>
    {/* Avatar */}
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: '#fff',
      background: isAdmin
        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    }}>
      {isAdmin ? 'A' : (name?.[0] || 'U').toUpperCase()}
    </div>

    {/* Bubble */}
    <div style={{ maxWidth: '70%' }}>
      <div style={{
        fontSize: 11, color: '#64748b', marginBottom: 4,
        textAlign: isAdmin ? 'right' : 'left',
      }}>
        {isAdmin ? 'Admin' : name}
      </div>
      <div style={{
        padding: '10px 14px',
        borderRadius: isAdmin ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background: isAdmin
          ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(29,78,216,0.2))'
          : 'rgba(30,41,59,0.8)',
        border: isAdmin
          ? '1px solid rgba(59,130,246,0.35)'
          : '1px solid rgba(148,163,184,0.15)',
        color: '#e2e8f0',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
      <div style={{
        fontSize: 11, color: '#475569', marginTop: 4,
        textAlign: isAdmin ? 'right' : 'left',
      }}>
        {time ? new Date(time).toLocaleString('vi-VN') : ''}
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────
const Messages = () => {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [perPage]                 = useState(20);
  const [filter, setFilter]       = useState('all');
  const [chatModal, setChatModal] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying]   = useState(false);
  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = { page, perPage };
      if (filter === 'unread') params.isRead = 'false';
      if (filter === 'read')   params.isRead = 'true';
      const res = await adminApi.getMessages(params);
      setMessages(res.messages || []);
      setTotal(res.total || 0);
    } catch {
      antdMsg.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [page, filter]);

  // Scroll to bottom khi mở chat
  useEffect(() => {
    if (chatModal) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [chatModal, selectedMsg]);

  const handleOpenChat = async (record) => {
    setSelectedMsg(record);
    setReplyText(record.adminReply || '');
    setChatModal(true);
    if (!record.isRead) {
      try {
        await adminApi.markMessageRead(record._id);
        fetchMessages();
      } catch {}
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await adminApi.replyMessage(selectedMsg._id, replyText.trim());
      antdMsg.success('Đã gửi trả lời');
      setSelectedMsg(res.data);
      setReplyText('');
      fetchMessages();
    } catch (err) {
      antdMsg.error(err?.message || 'Không thể gửi trả lời');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa tin nhắn này?',
      okText: 'Xóa', cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminApi.deleteMessage(id);
          antdMsg.success('Đã xóa tin nhắn');
          setChatModal(false);
          fetchMessages();
        } catch {
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
      width: 120,
      align: 'center',
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
      width: 160,
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#60a5fa', flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined style={{ color: '#34d399', flexShrink: 0 }} />
          <Tooltip title={email}>
            <a href={`mailto:${email}`} style={{ color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </a>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      align: 'center',
      render: (phone) => phone ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PhoneOutlined style={{ color: '#fbbf24', flexShrink: 0 }} />
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
            {text.length > 50 ? text.substring(0, 50) + '...' : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Trả lời',
      dataIndex: 'adminReply',
      key: 'adminReply',
      width: 100,
      align: 'center',
      render: (reply) => reply
        ? <Tag color="blue" icon={<MessageOutlined />}>Đã reply</Tag>
        : <Tag color="default">Chưa reply</Tag>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      align: 'center',
      render: (date) => (
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {new Date(date).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenChat(record)}
          >
            Chat
          </Button>
          <Button
            danger size="small"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            Tin nhắn tư vấn
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>
            Quản lý tin nhắn từ khách hàng
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'all',    label: 'Tất cả' },
            { key: 'unread', label: 'Chưa đọc' },
            { key: 'read',   label: 'Đã đọc' },
          ].map(f => (
            <Button
              key={f.key}
              type={filter === f.key ? 'primary' : 'default'}
              onClick={() => { setFilter(f.key); setPage(1); }}
            >
              {f.label}
            </Button>
          ))}
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
        scroll={{ x: 1100 }}
        rowClassName={(record) => !record.isRead ? 'unread-row' : ''}
      />

      {/* Chat Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              {selectedMsg?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                {selectedMsg?.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {selectedMsg?.email}
                {selectedMsg?.phone ? ` · ${selectedMsg.phone}` : ''}
              </div>
            </div>
          </div>
        }
        open={chatModal}
        onCancel={() => { setChatModal(false); setReplyText(''); }}
        footer={null}
        width={600}
        styles={{
          body: { padding: 0 },
          content: {
            background: '#0f172a',
            border: '1px solid rgba(59,130,246,0.2)',
          },
          header: {
            background: '#0f172a',
            borderBottom: '1px solid rgba(59,130,246,0.15)',
            padding: '16px 20px',
          },
        }}
      >
        {selectedMsg && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>

            {/* Chat area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 20px 8px',
              background: 'rgba(2,8,23,0.4)',
            }}>
              {/* Tin nhắn của user */}
              <ChatBubble
                isAdmin={false}
                text={selectedMsg.message}
                time={selectedMsg.createdAt}
                name={selectedMsg.name}
              />

              {/* Reply của admin (nếu có) */}
              {selectedMsg.adminReply && (
                <ChatBubble
                  isAdmin={true}
                  text={selectedMsg.adminReply}
                  time={selectedMsg.repliedAt}
                  name="Admin"
                />
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }} />

            {/* Reply input */}
            <div style={{ padding: '14px 16px', background: '#0f172a' }}>
              {selectedMsg.adminReply && (
                <div style={{
                  fontSize: 12, color: '#fbbf24', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <MessageOutlined />
                  Đã trả lời lúc {new Date(selectedMsg.repliedAt).toLocaleString('vi-VN')} — bạn có thể gửi lại để cập nhật
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <TextArea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung trả lời..."
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(30,41,59,0.8)',
                    border: '1px solid rgba(59,130,246,0.25)',
                    color: '#e2e8f0',
                    borderRadius: 10,
                    resize: 'none',
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={replying}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  style={{ height: 'auto', padding: '8px 16px', borderRadius: 10 }}
                >
                  Gửi
                </Button>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                Ctrl + Enter để gửi nhanh
              </div>
            </div>

            {/* Footer actions */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(59,130,246,0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#0f172a',
            }}>
              <Button
                danger size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(selectedMsg._id)}
              >
                Xóa tin nhắn
              </Button>
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
