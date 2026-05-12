import React from 'react';

interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
  glow: string;
}

const features: Feature[] = [
  { icon: '🎯', title: 'Học theo lộ trình rõ ràng',       desc: 'Mỗi khóa học được thiết kế theo lộ trình từ cơ bản đến nâng cao, giúp bạn tiến bộ từng bước một cách có hệ thống.',                    color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  { icon: '💻', title: 'Thực hành ngay trên trình duyệt', desc: 'Không cần cài đặt phức tạp. Viết code và chạy thử ngay trên trình duyệt với môi trường thực hành tích hợp.',                              color: '#06b6d4', glow: 'rgba(6,182,212,0.2)' },
  { icon: '👨‍🏫', title: 'Giảng viên thực chiến',           desc: 'Học từ các kỹ sư phần mềm đang làm việc tại các công ty công nghệ hàng đầu như VNG, Tiki, Shopee...',                                    color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
  { icon: '🏆', title: 'Chứng chỉ được công nhận',         desc: 'Nhận chứng chỉ hoàn thành khóa học được nhiều doanh nghiệp công nhận, tăng cơ hội việc làm của bạn.',                                     color: '#C9A84C', glow: 'rgba(201,168,76,0.2)' },
  { icon: '💬', title: 'Cộng đồng hỗ trợ 24/7',           desc: 'Tham gia cộng đồng hơn 10,000 học viên. Đặt câu hỏi và nhận giải đáp từ giảng viên và học viên khác.',                                    color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
  { icon: '📱', title: 'Học mọi lúc, mọi nơi',            desc: 'Truy cập khóa học trên mọi thiết bị - máy tính, điện thoại, máy tính bảng. Học theo tốc độ của riêng bạn.',                               color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
];

const Features: React.FC = () => (
  <section className="section" id="about"
    style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)' }}>
    <div className="container">
      {/* Glow line top */}
      <div className="glow-line mb-16 opacity-50" />

      <div className="text-center mb-14">
        <span className="tag tag-orange mb-4">✨ Tại sao chọn chúng tôi</span>
        <h2 className="section-title">Học lập trình hiệu quả hơn</h2>
        <p className="section-subtitle">Chúng tôi không chỉ dạy code, chúng tôi đào tạo lập trình viên thực thụ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i}
            className="p-8 rounded-2xl transition-all duration-300 group cursor-default"
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(59,130,246,0.12)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.border = `1px solid ${f.color}40`;
              el.style.boxShadow = `0 8px 32px ${f.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`;
              el.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.border = '1px solid rgba(59,130,246,0.12)';
              el.style.boxShadow = 'none';
              el.style.transform = 'translateY(0)';
            }}>
            {/* Icon with glow */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{ background: `${f.glow}`, border: `1px solid ${f.color}30` }}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold mb-2.5" style={{ color: '#f1f5f9' }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</p>

            {/* Bottom accent line */}
            <div className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500"
              style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
