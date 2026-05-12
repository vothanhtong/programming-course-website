import { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Select, Card, Typography, message,
  Button, Space, Tooltip, Popconfirm, Modal, Form, Input,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import adminApi from '../api/adminApi';

const { Title } = Typography;
const { Option } = Select;

const statusMap = {
  pending:  { label: 'Chờ thanh toán', color: 'orange' },
  paid:     { label: 'Đã thanh toán',  color: 'green'  },
  failed:   { label: 'Thất bại',       color: 'red'    },
  refunded: { label: 'Hoàn tiền',      color: 'purple' },
};

const Enrollments = () => {
  const [enrollments, setEnrollments]   = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Edit modal
  const [editOpen, setEditOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [editForm]                = Form.useForm();

  const fetchEnrollments = useCallback(async (p = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.getEnrollments({ page: p, perPage: 15, status });
      setEnrollments(res.enrollments);
      setTotal(res.total);
    } catch { message.error('Không thể tải danh sách đăng ký'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchEnrollments(); }, []);

  // ── Cập nhật trạng thái nhanh từ dropdown ──
  const handleStatusChange = async (id, paymentStatus) => {
    try {
      await adminApi.updateEnrollment(id, { paymentStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchEnrollments(page);
    } catch { message.error('Cập nhật thất bại'); }
  };

  // ── Mở modal sửa ──
  const openEdit = (record) => {
    setEditing(record);
    editForm.setFieldsValue({
      studentName:   record.studentName,
      studentEmail:  record.studentEmail,
      studentPhone:  record.studentPhone,
      paymentStatus: record.paymentStatus,
      note:          record.note,
    });
    setEditOpen(true);
  };

  const handleEdit = async (values) => {
    try {
      await adminApi.updateEnrollment(editing._id, { paymentStatus: values.paymentStatus });
      message.success('Cập nhật thành công');
      setEditOpen(false);
      fetchEnrollments(page);
    } catch (err) { message.error(err?.message || 'Cập nhật thất bại'); }
  };

  // ── Xóa ──
  const handleDelete = async (id) => {
    try {
      // Gọi API xóa enrollment (cần thêm vào adminApi nếu chưa có)
      await adminApi.deleteEnrollment(id);
      message.success('Đã xóa đăng ký');
      fetchEnrollments(page);
    } catch (err) { message.error(err?.message || 'Xóa thất bại'); }
  };

  const columns = [
    {
      title: 'Học viên',
      key: 'student',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.studentName}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.studentEmail}</div>
          {r.studentPhone && <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.studentPhone}</div>}
        </div>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseId',
      key: 'course',
      render: (course) => <span style={{ fontWeight: 500 }}>{course?.title || '—'}</span>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => v === 0 ? <Tag color="green">Miễn phí</Tag> : `${v.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          style={{ width: 160 }}
          onChange={(val) => handleStatusChange(record._id, val)}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>
              <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đăng ký này?"
            description="Hành động này không thể hoàn tác."
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
        <Title level={4} style={{ margin: 0 }}>Quản lý đăng ký</Title>
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 200 }}
          onChange={(val) => { setStatusFilter(val); setPage(1); fetchEnrollments(1, val); }}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.label}</Option>
          ))}
        </Select>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={enrollments}
          rowKey="_id"
          loading={loading}
          pagination={{
            total,
            pageSize: 15,
            current: page,
            onChange: (p) => { setPage(p); fetchEnrollments(p); },
            showTotal: (t) => `Tổng ${t} đăng ký`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* ── Modal chỉnh sửa ── */}
      <Modal
        title="Chỉnh sửa đăng ký"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item label="Học viên">
            <Input value={editing?.studentName} disabled />
          </Form.Item>
          <Form.Item label="Email">
            <Input value={editing?.studentEmail} disabled />
          </Form.Item>
          <Form.Item label="Khóa học">
            <Input value={editing?.courseId?.title} disabled />
          </Form.Item>
          <Form.Item name="paymentStatus" label="Trạng thái thanh toán" rules={[{ required: true }]}>
            <Select>
              {Object.entries(statusMap).map(([key, val]) => (
                <Option key={key} value={key}>
                  <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Enrollments;
