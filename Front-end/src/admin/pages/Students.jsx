import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, Select,
  Popconfirm, Typography, message, Card, Tooltip, Drawer,
  Descriptions, Badge, Divider, Switch,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  KeyOutlined, BookOutlined, EyeOutlined,
} from '@ant-design/icons';
import adminApi from '../api/adminApi';
import ImageUploader from '../../components/ui/ImageUploader/ImageUploader';

const { Title, Text } = Typography;
const { Option } = Select;

const Students = () => {
  const [students, setStudents]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen]     = useState(false);
  const [pwOpen, setPwOpen]         = useState(false);
  const [grantOpen, setGrantOpen]   = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selected, setSelected]     = useState(null);
  const [courses, setCourses]       = useState([]);
  const [avatarUrl, setAvatarUrl]   = useState(''); // state riêng cho avatar

  const [createForm] = Form.useForm();
  const [editForm]   = Form.useForm();
  const [pwForm]     = Form.useForm();
  const [grantForm]  = Form.useForm();

  // ── Fetch ──────────────────────────────────────────────
  const fetchStudents = useCallback(async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await adminApi.getStudents({ page: p, perPage: 15, search: q });
      setStudents(res.students);
      setTotal(res.total);
      setPage(p);
    } catch { message.error('Không thể tải danh sách học viên'); }
    finally { setLoading(false); }
  }, [search]);

  const fetchCourses = async () => {
    try {
      const res = await adminApi.getCourses({ perPage: 100 });
      setCourses(res.courses || []);
    } catch {}
  };

  useEffect(() => { fetchStudents(1, ''); fetchCourses(); }, []);

  // ── Search debounce ────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchStudents(1, search), 400);
    return () => clearTimeout(t);
  }, [search, fetchStudents]);

  // ── Create student ─────────────────────────────────────
  const handleCreate = async (values) => {
    try {
      const res = await adminApi.createStudent({ ...values, sendEmail: values.sendEmail ?? true });
      message.success('Tạo tài khoản thành công!');
      if (res.tempPassword) {
        Modal.success({
          title: 'Tài khoản đã tạo',
          content: (
            <div>
              <p>Email: <strong>{values.email}</strong></p>
              <p>Mật khẩu tạm: <strong style={{ color: '#1677ff' }}>{res.tempPassword}</strong></p>
              <p style={{ color: '#888', fontSize: 12 }}>Đã gửi email thông báo cho học viên.</p>
            </div>
          ),
        });
      }
      setCreateOpen(false);
      createForm.resetFields();
      fetchStudents(1);
    } catch (err) { message.error(err?.message || 'Tạo thất bại'); }
  };

  // ── Edit student ───────────────────────────────────────
  const openEdit = (student) => {
    setSelected(student);
    setAvatarUrl(student.avatar || '');
    editForm.setFieldsValue({
      fullName:   student.fullName,
      phone:      student.phone,
      bio:        student.bio,
      isVerified: student.isVerified,
    });
    setEditOpen(true);
  };

  const handleEdit = async (values) => {
    try {
      await adminApi.updateStudent(selected._id, { ...values, avatar: avatarUrl });
      message.success('Cập nhật thành công');
      setEditOpen(false);
      fetchStudents(page);
    } catch (err) { message.error(err?.message || 'Cập nhật thất bại'); }
  };

  // ── Reset password ─────────────────────────────────────
  const openResetPw = (student) => {
    setSelected(student);
    pwForm.resetFields();
    setPwOpen(true);
  };

  const handleResetPw = async (values) => {
    try {
      const res = await adminApi.resetStudentPassword(selected._id, {
        newPassword: values.newPassword || undefined,
        sendEmail: values.sendEmail ?? true,
      });
      message.success('Đặt lại mật khẩu thành công');
      if (res.tempPassword || values.newPassword) {
        Modal.info({
          title: 'Mật khẩu mới',
          content: (
            <div>
              <p>Học viên: <strong>{selected.fullName}</strong></p>
              <p>Mật khẩu mới: <strong style={{ color: '#1677ff' }}>{res.tempPassword || values.newPassword}</strong></p>
            </div>
          ),
        });
      }
      setPwOpen(false);
      pwForm.resetFields();
    } catch (err) {
      message.error(err?.message || 'Đặt lại mật khẩu thất bại');
    }
  };

  const handleGrant = async (values) => {
    try {
      await adminApi.grantCourses(selected._id, { courseIds: values.courseIds });
      message.success('Đã cấp khóa học');
      setGrantOpen(false);
      grantForm.resetFields();
      if (detailOpen) {
        const res = await adminApi.getStudentDetail(selected._id);
        setSelected(res.student);
      }
    } catch (err) {
      message.error(err?.message || 'Cấp khóa học thất bại');
    }
  };

  // ── Delete student ─────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await adminApi.deleteStudent(id);
      message.success('Đã xóa học viên');
      fetchStudents(page);
    } catch (err) { message.error(err?.message || 'Xóa thất bại'); }
  };

  // ── Table Columns ──────────────────────────────────────
  const columns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_, r) => (
        <Space>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, overflow: 'hidden',
          }}>
            {r.avatar ? <img src={r.avatar} alt={r.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.fullName?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', render: t => t || '—' },
    {
      title: 'Khóa học', key: 'courses',
      render: (_, r) => <Tag color="blue">{r.enrolledCourses?.length || 0} khóa</Tag>,
    },
    {
      title: 'Trạng thái', key: 'status',
      render: (_, r) => (
        <Tag color={r.isVerified ? 'success' : 'warning'}>
          {r.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác', key: 'action', align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />} size="small"
              onClick={async () => {
                try {
                  const res = await adminApi.getStudentDetail(record._id);
                  setSelected(res.student);
                  setDetailOpen(true);
                } catch { message.error('Không thể tải thông tin'); }
              }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />} size="small"
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Cấp khóa học">
            <Button
              icon={<BookOutlined />} size="small"
              onClick={() => { setSelected(record); setGrantOpen(true); }}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              icon={<KeyOutlined />} size="small"
              onClick={() => { setSelected(record); setPwOpen(true); }}
            />
          </Tooltip>
          <Popconfirm title="Xóa học viên này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} size="small" danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý học viên</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateOpen(true); }}>
          Tạo tài khoản
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </Card>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          loading={loading}
          pagination={{
            total, pageSize: 15, current: page,
            onChange: p => setPage(p),
            showTotal: t => `Tổng ${t} học viên`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal title="Tạo tài khoản học viên" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} width="100%" style={{ maxWidth: 560, top: 20 }} destroyOnClose>
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0912 345 678" />
          </Form.Item>
          <Form.Item name="courseIds" label="Cấp khóa học ngay (tuỳ chọn)">
            <Select mode="multiple" placeholder="Chọn khóa học..." optionFilterProp="children" allowClear>
              {courses.map(c => <Option key={c._id} value={c._id}>{c.title}</Option>)}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Tạo tài khoản</Button>
          </div>
        </Form>
      </Modal>

      <Modal title="Chỉnh sửa học viên" open={editOpen} onCancel={() => setEditOpen(false)} footer={null} width="100%" style={{ maxWidth: 520, top: 20 }} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item label="Ảnh đại diện">
            <ImageUploader
              value={avatarUrl}
              onChange={setAvatarUrl}
              shape="circle"
              size={90}
            />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="Giới thiệu">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isVerified" label="Đã xác thực" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </div>
        </Form>
      </Modal>

      <Modal title="Đặt lại mật khẩu" open={pwOpen} onCancel={() => setPwOpen(false)} footer={null} width="100%" style={{ maxWidth: 520, top: 20 }} destroyOnClose>
        <Form form={pwForm} layout="vertical" onFinish={handleResetPw} style={{ marginTop: 16 }}>
          <p style={{ color: '#888', marginBottom: 16 }}>
            Học viên: <strong>{selected?.fullName}</strong> ({selected?.email})
          </p>
          <Form.Item name="newPassword" label="Mật khẩu mới (để trống = tự động tạo)">
            <Input.Password placeholder="Để trống để tạo ngẫu nhiên" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setPwOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" danger>Đặt lại</Button>
          </div>
        </Form>
      </Modal>

      <Modal title="Cấp khóa học" open={grantOpen} onCancel={() => setGrantOpen(false)} footer={null} width="100%" style={{ maxWidth: 520, top: 20 }} destroyOnClose>
        <Form form={grantForm} layout="vertical" onFinish={handleGrant} style={{ marginTop: 16 }}>
          <p style={{ color: '#888', marginBottom: 16 }}>
            Cấp khóa học cho: <strong>{selected?.fullName}</strong>
          </p>
          <Form.Item name="courseIds" label="Chọn khóa học" rules={[{ required: true, message: 'Chọn ít nhất 1 khóa học' }]}>
            <Select mode="multiple" placeholder="Chọn khóa học..." optionFilterProp="children" style={{ width: '100%' }}>
              {courses.map(c => <Option key={c._id} value={c._id}>{c.title}</Option>)}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setGrantOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Cấp khóa học</Button>
          </div>
        </Form>
      </Modal>

      {/* ── Drawer: Chi tiết học viên ── */}
      <Drawer
        title="Chi tiết học viên"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={Math.min(480, window.innerWidth - 32)}
      >
        {selected && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 28, overflow: 'hidden',
              }}>
                {selected.avatar
                  ? <img src={selected.avatar} alt={selected.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : selected.fullName?.[0]}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.fullName}</div>
              <div style={{ color: '#8c8c8c', fontSize: 13 }}>{selected.email}</div>
              <Badge
                style={{ marginTop: 8 }}
                status={selected.isVerified ? 'success' : 'warning'}
                text={selected.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              />
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Số điện thoại">{selected.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Giới thiệu">{selected.bio || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(selected.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
            </Descriptions>

            <Divider>Khóa học đã đăng ký ({selected.enrolledCourses?.length || 0})</Divider>
            {selected.enrolledCourses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.enrolledCourses.map(c => (
                  <div key={c._id || c} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: '#f5f5f5', borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 13 }}>{c.title || c}</Text>
                    <Popconfirm
                      title="Thu hồi khóa học này?"
                      onConfirm={async () => {
                        try {
                          await adminApi.revokeStudentCourse(selected._id, c._id || c);
                          message.success('Đã thu hồi');
                          const res = await adminApi.getStudentDetail(selected._id);
                          setSelected(res.student);
                        } catch { message.error('Thất bại'); }
                      }}
                      okText="Thu hồi" cancelText="Hủy" okButtonProps={{ danger: true }}
                    >
                      <Button size="small" danger>Thu hồi</Button>
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">Chưa có khóa học nào</Text>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Students;
