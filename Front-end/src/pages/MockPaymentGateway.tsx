import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

const MockPaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (!t) {
      alert('Token không hợp lệ!');
      navigate('/');
    } else {
      setToken(t);
    }
  }, [location, navigate]);

  const handlePayment = async (status: 'success' | 'failed') => {
    if (!token) return;
    try {
      setLoading(true);
      await api.post('/apis/payment/mock-ipn', { token, status });
      navigate(`/payment-result?status=${status}`);
    } catch (error) {
      alert('Đã xảy ra lỗi khi gọi webhook giả lập!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">MOCK GATEWAY</h2>
          <p className="mt-2 text-sm text-gray-500">
            Đây là màn hình giả lập cổng thanh toán VNPay/Momo.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 mt-8 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">Vui lòng chọn trạng thái giả lập:</p>
          <div className="space-y-4 mt-6">
            <button
              onClick={() => handlePayment('success')}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : '✅ Giao dịch THÀNH CÔNG'}
            </button>
            <button
              onClick={() => handlePayment('failed')}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : '❌ Giao dịch THẤT BẠI / HỦY'}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-center text-gray-400 mt-4">
          Trong môi trường thật, đây sẽ là màn hình quét mã QR của VNPay.
        </p>
      </div>
    </div>
  );
};

export default MockPaymentGateway;
