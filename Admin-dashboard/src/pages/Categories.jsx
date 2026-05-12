import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, Card, Typography, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import adminApi from '../api/adminApi';

const { Title } = Typography;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.categories);
    } catch { message.error('Không thể tải danh mục'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (values) => {
    try {
      await adminApi.addCategory(values);
      message.success('Thêm danh mục thành công');
      setModalOpen(false);
      form.resetFields();
      fetchCategories();
    } catch (err) {
      message.error(err?.message || 'Thêm thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      message.success('Đã xóa danh mục');
      fetchCategories();
    } catch { message.error('Xóa thất bại'); }
  };

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v) => <code style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '2px 8px', borderRadius: 4, fontSize: 13, border: '1px solid rgba(59,130,246,0.2)' }}>{v}</code> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '—' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Xóa danh mục này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
        >
          <Tooltip title="Xóa">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý danh mục</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 8 }}>
          Thêm danh mục
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Thêm danh mục mới"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Lập trình Web, Mobile, AI..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về danh mục..." />
          </Form.Item>
          <Form.Item name="icon" label="Icon (emoji hoặc URL)">
            <Input placeholder="VD: 💻 hoặc https://..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Thêm mới</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
