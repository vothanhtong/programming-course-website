import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Space, Card, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import adminApi from '../api/adminApi';

const { Option } = Select;

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await adminApi.getCourses();
      setCourses(res.courses || []);
    } catch (err) {
      message.error('Lỗi khi tải danh sách khóa học');
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getQuizzes();
      setQuizzes(res.quizzes || []);
    } catch (err) {
      message.error('Lỗi khi tải danh sách bài trắc nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingQuiz(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        courseId: record.courseId,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ passingScore: 80, isPublished: false, questions: [{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }] });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteQuiz(id);
      message.success('Xóa bài trắc nghiệm thành công');
      fetchQuizzes();
    } catch (err) {
      message.error('Lỗi khi xóa bài trắc nghiệm');
    }
  };

  const onFinish = async (values) => {
    try {
      if (editingQuiz) {
        await adminApi.updateQuiz(editingQuiz._id, values);
        message.success('Cập nhật thành công');
      } else {
        await adminApi.addQuiz(values);
        message.success('Tạo bài trắc nghiệm thành công');
      }
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    { title: 'Tên bài kiểm tra', dataIndex: 'title', key: 'title' },
    { 
      title: 'Khóa học', 
      key: 'courseId',
      render: (_, record) => {
        const course = courses.find(c => c._id === record.courseId);
        return course ? course.title : 'N/A';
      }
    },
    { 
      title: 'Số câu hỏi', 
      key: 'questions',
      render: (_, record) => record.questions?.length || 0
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isPublished', 
      key: 'isPublished',
      render: (isPub) => isPub ? <Tag color="success">Công khai</Tag> : <Tag color="default">Nháp</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} type="text" style={{ color: '#3b82f6' }} />
          <Popconfirm title="Bạn có chắc chắn xóa?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Quản lý Bài trắc nghiệm</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Tạo Bài kiểm tra
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#0f172a', borderRadius: 12 }}>
        <Table 
          columns={columns} 
          dataSource={quizzes} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingQuiz ? 'Sửa bài trắc nghiệm' : 'Tạo bài trắc nghiệm mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Tên bài kiểm tra" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="courseId" label="Khóa học" rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}>
            <Select placeholder="Chọn khóa học">
              {courses.map(c => (
                <Option key={c._id} value={c._id}>{c.title}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item name="passingScore" label="Điểm đỗ (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="isPublished" label="Trạng thái xuất bản" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <h3>Danh sách Câu hỏi</h3>
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card key={key} size="small" style={{ marginBottom: 16, background: '#1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4>Câu hỏi {index + 1}</h4>
                      {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />}
                    </div>
                    
                    <Form.Item {...restField} name={[name, 'questionText']} rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}>
                      <Input placeholder="Nội dung câu hỏi" />
                    </Form.Item>

                    <Form.List name={[name, 'options']}>
                      {(optFields, { add: addOpt, remove: rmOpt }) => (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {optFields.map((optField, i) => (
                            <Form.Item key={optField.key} {...optField} rules={[{ required: true, message: 'Nhập lựa chọn' }]} style={{ marginBottom: 8 }}>
                              <Input addonBefore={`Lựa chọn ${i + 1}`} />
                            </Form.Item>
                          ))}
                        </div>
                      )}
                    </Form.List>

                    <Form.Item {...restField} name={[name, 'correctOptionIndex']} label="Đáp án đúng (chỉ số 0, 1, 2...)" rules={[{ required: true }]}>
                      <InputNumber min={0} max={3} />
                    </Form.Item>
                    
                    <Form.Item {...restField} name={[name, 'explanation']} label="Giải thích đáp án (Tùy chọn)">
                      <Input.TextArea rows={1} />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })} block icon={<PlusOutlined />}>
                    Thêm câu hỏi
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingQuiz ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Quizzes;
