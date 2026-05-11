import React from 'react';

const testimonials = [
  { name: 'Nguyễn Minh Tuấn', role: 'Frontend Developer tại Tiki',       avatar: 'T', rating: 5, comment: 'Sau 6 tháng học tại đây, tôi đã có được công việc Frontend Developer với mức lương 15 triệu/tháng. Khóa học React rất thực tế và bám sát yêu cầu thị trường.', color: '#3b82f6' },
  { name: 'Trần Thị Lan',     role: 'Backend Developer tại VNG',          avatar: 'L', rating: 5, comment: 'Giảng viên rất nhiệt tình và có kinh nghiệm thực tế. Tôi đặc biệt thích cách giải thích các khái niệm phức tạp một cách đơn giản và dễ hiểu.',                   color: '#10b981' },
  { name: 'Lê Văn Hùng',      role: 'Fullstack Developer Freelance',      avatar: 'H', rating: 5, comment: 'Từ một người không biết gì về lập trình, sau 1 năm học tôi đã có thể nhận dự án freelance và kiếm thêm thu nhập đáng kể.',                                        color: '#C9A84C' },
  { name: 'Phạm Thu Hà',      role: 'Mobile Developer tại Shopee',        avatar: 'H', rating: 5, comment: 'Khóa học React Native rất chất lượng. Dự án cuối khóa giúp tôi có portfolio ấn tượng để apply vào Shopee. Cảm ơn thầy Thanh Tòng rất nhiều!',                    color: '#ec4899' },
  { name: 'Đỗ Quang Vinh',    role: 'DevOps Engineer tại FPT',            avatar: 'V', rating: 5, comment: 'Cộng đồng học viên rất tích cực và hỗ trợ nhau. Mỗi khi gặp khó khăn đều có người giải đáp nhanh chóng. Đây là điểm mạnh nhất của khóa học.',                    color: '#8b5cf6' },
  { name: 'Nguyễn Thị Mai',   role: 'Data Analyst tại Grab',              avatar: 'M', rating: 5, comment: 'Khóa học Python và Data Science rất bài bản. Tôi đã áp dụng được ngay vào công việc thực tế và được sếp khen ngợi về kỹ năng phân tích dữ liệu.',               color: '#06b6d4' },
];

const Testimonials: React.FC = () => (
  <section className="section" id="testimonials"
    style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)' }}>
    <div className="container">
      <div className="glow-line mb-16 opacity-40" />

      <div className="text-center mb-14">
        <span className="tag tag-green mb-4">💬 Học viên nói gì</span>
        <h2 className="section-title">Hàng nghìn học viên đã thành công</h2>
        <p className="section-subtitle">Câu chuyện thành công từ những học viên đã thay đổi sự nghiệp với chúng tôi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i}
            className="p-7 rounded-2xl flex flex-col transition-all duration-300 group"
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(59,130,246,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.border = `1px solid ${t.color}35`;
              el.style.boxShadow = `0 8px 32px ${t.color}18`;
              el.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.border = '1px solid rgba(59,130,246,0.1)';
              el.style.boxShadow = 'none';
              el.style.transform = 'translateY(0)';
            }}>

            {/* Quote icon */}
            <div className="text-3xl mb-3 opacity-30" style={{ color: t.color }}>"</div>

            {/* Stars */}
            <div className="flex gap-0.5 text-base mb-4" style={{ color: '#fbbf24' }}>
              {[...Array(t.rating)].map((_, j) => <span key={j}>★</span>)}
            </div>

            <p className="text-sm leading-relaxed mb-6 flex-1 italic" style={{ color: '#64748b' }}>
              "{t.comment}"
            </p>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, boxShadow: `0 0 12px ${t.color}40` }}>
                {t.avatar}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#f1f5f9' }}>{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
