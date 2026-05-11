import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber,
  Select, Switch, Typography, Popconfirm, message, Card, Row, Col, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import adminApi from '../api/adminApi';
import ImageUploader from '../components/ImageUploader/ImageUploader';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const levelMap = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
const levelColor = { beginner: 'green', intermediate: 'blue', advanced: 'red' };

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [page, setPage] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState(''); // state riêng cho ảnh
  const [form] = Form.useForm();

  const fetchCourses = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getCourses({ page: p, perPage: 10 });
      setCourses(res.courses);
      setTotal(res.total);
    } catch { message.error('Không thể tải danh sách khóa học'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.categories);
    } catch {}
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingCourse(null);
    setThumbnailUrl('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setThumbnailUrl(course.thumbnail || '');
    form.setFieldsValue({
      ...course,
      category: course.category?._id || course.category,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values, thumbnail: thumbnailUrl };
      if (editingCourse) {
        await adminApi.updateCourse(editingCourse._id, payload);
        message.success('Cập nhật khóa học thành công');
      } else {
        await adminApi.addCourse(payload);
        message.success('Thêm khóa học thành công');
      }
      setModalOpen(false);
      fetchCourses(page);
    } catch (err) {
      message.error(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCourse(id);
      message.success('Đã xóa khóa học');
      fetchCourses(page);
    } catch { message.error('Xóa thất bại'); }
  };

  const columns = [
    {
      title: 'Khóa học',
      key: 'title',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            overflow: 'hidden', background: 'rgba(59,130,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {record.thumbnail
              ? <img src={record.thumbnail} alt={record.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 20 }}>📚</span>}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat?.name || '—'}</Tag>,
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color={levelColor[level]}>{levelMap[level]}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <div>
          {record.isFree ? (
            <Tag color="green">Miễn phí</Tag>
          ) : (
            <div>
              {record.salePrice !== null && record.salePrice !== undefined ? (
                <>
                  <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                    {record.salePrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span style={{ textDecoration: 'line-through', color: '#8c8c8c', marginLeft: 6, fontSize: 12 }}>
                    {price.toLocaleString('vi-VN')}đ
                  </span>
                </>
              ) : (
                <span style={{ fontWeight: 600 }}>{price.toLocaleString('vi-VN')}đ</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đăng ký',
      dataIndex: 'enrollmentCount',
      key: 'enrollmentCount',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Đã xuất bản' : 'Nháp'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa khóa học này?"
            description="Tất cả bài học và đánh giá liên quan cũng sẽ bị xóa."
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
        <Title level={4} style={{ margin: 0 }}>Quản lý khóa học</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ borderRadius: 8 }}>
          Thêm khóa học
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="_id"
          loading={loading}
          pagination={{
            total,
            pageSize: 10,
            current: page,
            onChange: (p) => { setPage(p); fetchCourses(p); },
            showTotal: (t) => `Tổng ${t} khóa học`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="Tên khóa học" rules={[{ required: true }]}>
                <Input placeholder="VD: Lập trình React từ cơ bản đến nâng cao" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                <Select placeholder="Chọn danh mục">
                  {categories.map((c) => (
                    <Option key={c._id} value={c._id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="shortDescription" label="Mô tả ngắn">
            <Input placeholder="Mô tả ngắn hiển thị trên card khóa học" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={4} placeholder="Nội dung chi tiết về khóa học..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="level" label="Cấp độ" initialValue="beginner">
                <Select>
                  <Option value="beginner">Cơ bản</Option>
                  <Option value="intermediate">Trung cấp</Option>
                  <Option value="advanced">Nâng cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]} initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salePrice" label="Giá khuyến mãi">
                <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ảnh thumbnail">
                <ImageUploader
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  shape="square"
                  size={140}
                  placeholder="Chọn ảnh thumbnail"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="previewVideo" label="Video giới thiệu (URL)">
                <Input placeholder="https://youtube.com/..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isPublished" label="Xuất bản" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFree" label="Miễn phí" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingCourse ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;
