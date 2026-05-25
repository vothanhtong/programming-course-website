import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import courseApi from '../../../api/courseApi';
import api from '../../../api/axiosClient';
import { useAuthStore } from '../../../store/useAuthStore';
import type { Course, EnrollFormData } from '../../../types';

interface Props { open: boolean; onClose: () => void; course: Course; }

const initialForm: EnrollFormData = {
  courseId: '', studentName: '', studentEmail: '',
  studentPhone: '', paymentMethod: 'bank_transfer', note: '',
};

const EnrollModal: React.FC<Props> = ({ open, onClose, course }) => {
  const { student  } = useAuthStore();
  const [form, setForm]       = useState<EnrollFormData>({ ...initialForm, courseId: course._id });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  // Tự điền thông tin từ tài khoản đã đăng nhập
  useEffect(() => {
    if (open && student) {
      setForm(f => ({
        ...f,
        courseId:     course._id,
        studentName:  student.fullName  || f.studentName,
        studentEmail: student.email     || f.studentEmail,
        studentPhone: student.phone     || f.studentPhone,
      }));
    } else if (open) {
      setForm({ ...initialForm, courseId: course._id });
    }
  }, [open, student, course._id]);

  if (!open) return null;

  const price = course.salePrice != null ? course.salePrice : course.price;
  const isLoggedIn = !!student;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim()) return setError('Vui lòng nhập họ tên');
    if (!form.studentEmail.trim()) return setError('Vui lòng nhập email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail)) return setError('Email không hợp lệ');
    setLoading(true);
    try {
      const res = await courseApi.enroll(form);
      
      // Nếu có phí, khởi tạo phiên thanh toán giả lập và redirect
      if (!course.isFree && res.enrollmentId) {
        const payRes = await api.post('/apis/payment/create-url', { enrollmentId: res.enrollmentId }) as any;
        if (payRes && payRes.paymentUrl) {
          window.location.href = payRes.paymentUrl;
          return; // Dừng lại chờ chuyển trang
        }
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại, vui lòng thử lại');
      setLoading(false); 
    }
  };

  const handleClose = () => {
    // Reset all state to initial values
    setSuccess(false);
    setError('');
    setLoading(false);
    setForm({ ...initialForm, courseId: course._id });
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-5"
      style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}>
      <div className="w-[95%] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain relative rounded-2xl"
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(59,130,246,0.25)',
          boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center transition-all z-10 text-sm"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#64748b', border: '1px solid rgba(59,130,246,0.2)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.2)'; (e.currentTarget as HTMLElement).style.color = '#60a5fa'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}>
          ✕
        </button>

        {success ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#f1f5f9' }}>Đăng ký thành công!</h3>
            <p className="mb-2" style={{ color: '#64748b' }}>
              Cảm ơn bạn đã đăng ký <strong style={{ color: '#60a5fa' }}>{course.title}</strong>.
            </p>
            {course.isFree ? (
              <p className="mb-6" style={{ color: '#34d399' }}>
                Khóa học đã được thêm vào tài khoản của bạn!
              </p>
            ) : (
              <p className="mb-6" style={{ color: '#64748b' }}>
                Chúng tôi sẽ liên hệ xác nhận thanh toán trong vòng 24 giờ.
              </p>
            )}
            <button className="btn btn-primary" onClick={handleClose}>Đóng</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Đăng ký khóa học</h2>
              <p className="text-sm mb-3" style={{ color: '#64748b' }}>{course.title}</p>
              <div className="flex items-baseline gap-2.5">
                {course.isFree ? (
                  <span className="text-2xl font-extrabold" style={{ color: '#34d399' }}>Miễn phí</span>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold" style={{ color: '#60a5fa' }}>
                      {price.toLocaleString('vi-VN')}đ
                    </span>
                    {course.salePrice != null && (
                      <span className="text-sm line-through" style={{ color: '#334155' }}>
                        {course.price.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </>
                )}
              </div>
              {/* Badge đã đăng nhập */}
              {isLoggedIn && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                  ✓ Đã đăng nhập — thông tin được điền tự động
                </div>
              )}
            </div>

            {/* Form */}
            <form className="px-8 py-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="form-label">Họ và tên <span style={{ color: '#f87171' }}>*</span></label>
                <input className="form-input" type="text" name="studentName"
                  value={form.studentName} onChange={handleChange} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="form-label">Email <span style={{ color: '#f87171' }}>*</span></label>
                <input
                  className="form-input" type="email" name="studentEmail"
                  value={form.studentEmail} onChange={handleChange}
                  placeholder="email@example.com"
                  // Nếu đã đăng nhập → lock email để đảm bảo match với tài khoản
                  readOnly={isLoggedIn}
                  style={isLoggedIn ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                />
                {isLoggedIn && (
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>
                    Email tài khoản — không thể thay đổi để đảm bảo khóa học được cấp đúng
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" type="tel" name="studentPhone"
                  value={form.studentPhone} onChange={handleChange} placeholder="0912 345 678" />
              </div>
              {!course.isFree && (
                <div>
                  <label className="form-label">Phương thức thanh toán</label>
                  <select className="form-input" name="paymentMethod"
                    value={form.paymentMethod} onChange={handleChange}>
                    <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                    <option value="momo">Ví MoMo</option>
                    <option value="vnpay">VNPay</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Ghi chú</label>
                <textarea className="form-input resize-y" name="note"
                  value={form.note} onChange={handleChange}
                  placeholder="Câu hỏi hoặc yêu cầu đặc biệt..." rows={3} />
              </div>

              {error && (
                <div className="px-4 py-2.5 rounded-lg text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EnrollModal;
