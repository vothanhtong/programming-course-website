import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentResult = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const status = params.get('status');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isSuccess ? (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          ) : (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h2>
        <p className="text-gray-500 mb-8">
          {isSuccess 
            ? 'Cảm ơn bạn đã đăng ký khóa học. Tài khoản của bạn đã được kích hoạt thành công.' 
            : 'Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử lại sau.'}
        </p>

        {isSuccess ? (
          <Link
            to="/profile"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Vào học ngay
          </Link>
        ) : (
          <Link
            to="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
