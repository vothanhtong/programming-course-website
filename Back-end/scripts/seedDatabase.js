/**
 * Script khởi tạo database mới cho High Sky | Sky Growth
 * Chạy: node scripts/seedDatabase.js
 *
 * Sẽ tạo:
 *  - 1 tài khoản admin
 *  - 6 danh mục khóa học
 *  - 9 khóa học mẫu
 *  - Bài học mẫu cho mỗi khóa
 *  - Đánh giá mẫu
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const AdminModel    = require('../src/models/account.models/admin.model');
const CategoryModel = require('../src/models/course.models/category.model');
const CourseModel   = require('../src/models/course.models/course.model');
const LessonModel   = require('../src/models/course.models/lesson.model');
const ReviewModel   = require('../src/models/course.models/review.model');

const MONGO_URL = process.env.MONGO_URL;

// ─── DATA ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Lập trình Web',    slug: 'lap-trinh-web',    icon: '🌐', description: 'HTML, CSS, JavaScript, React, Node.js...' },
  { name: 'Mobile App',       slug: 'mobile-app',       icon: '📱', description: 'React Native, Flutter, iOS, Android...' },
  { name: 'Data Science',     slug: 'data-science',     icon: '📊', description: 'Python, Machine Learning, AI, Big Data...' },
  { name: 'DevOps & Cloud',   slug: 'devops-cloud',     icon: '☁️',  description: 'Docker, Kubernetes, AWS, CI/CD...' },
  { name: 'UI/UX Design',     slug: 'ui-ux-design',     icon: '🎨', description: 'Figma, Adobe XD, Prototyping...' },
  { name: 'Cơ sở dữ liệu',   slug: 'co-so-du-lieu',    icon: '🗄️',  description: 'SQL, MongoDB, Redis, PostgreSQL...' },
];

const buildCourses = (catMap) => [
  {
    title: 'React JS từ cơ bản đến nâng cao',
    slug: 'react-js-co-ban-den-nang-cao',
    shortDescription: 'Làm chủ React 18, Hooks, Redux Toolkit và xây dựng ứng dụng thực tế',
    description: 'Khóa học React JS toàn diện nhất, từ JSX, Component, Props, State đến Hooks nâng cao, Redux Toolkit, React Query và deploy production.',
    price: 1299000,
    salePrice: 799000,
    category: catMap['lap-trinh-web'],
    instructor: { name: 'Nguyễn Văn Tuấn', bio: 'Senior Frontend Engineer tại Tiki, 7 năm kinh nghiệm React' },
    level: 'intermediate',
    requirements: ['Biết HTML/CSS cơ bản', 'Biết JavaScript ES6+'],
    outcomes: ['Xây dựng SPA hoàn chỉnh', 'Sử dụng Redux Toolkit', 'Deploy lên Vercel/Netlify'],
    tags: ['react', 'javascript', 'frontend', 'hooks'],
    totalDuration: 1800,
    isFeatured: true,
    isPublished: true,
    rating: 4.9,
    ratingCount: 312,
    enrollmentCount: 1240,
  },
  {
    title: 'Node.js & Express - Backend thực chiến',
    slug: 'nodejs-express-backend-thuc-chien',
    shortDescription: 'Xây dựng REST API, xác thực JWT, kết nối MongoDB và deploy lên cloud',
    description: 'Học Node.js từ cơ bản, xây dựng REST API với Express, xác thực JWT, upload file, gửi email, kết nối MongoDB và deploy lên Heroku/Railway.',
    price: 1199000,
    salePrice: 699000,
    category: catMap['lap-trinh-web'],
    instructor: { name: 'Trần Minh Khoa', bio: 'Backend Lead tại VNG, chuyên gia Node.js & Microservices' },
    level: 'intermediate',
    requirements: ['Biết JavaScript cơ bản', 'Hiểu HTTP/REST API'],
    outcomes: ['Xây dựng REST API hoàn chỉnh', 'Xác thực & phân quyền', 'Deploy production'],
    tags: ['nodejs', 'express', 'backend', 'mongodb', 'api'],
    totalDuration: 1500,
    isFeatured: true,
    isPublished: true,
    rating: 4.8,
    ratingCount: 256,
    enrollmentCount: 980,
  },
  {
    title: 'React Native - Lập trình App iOS & Android',
    slug: 'react-native-lap-trinh-app',
    shortDescription: 'Xây dựng ứng dụng di động đa nền tảng với React Native và Expo',
    description: 'Từ cài đặt môi trường đến publish app lên App Store và Google Play. Học Navigation, State Management, Camera, Maps, Push Notification...',
    price: 1499000,
    salePrice: 899000,
    category: catMap['mobile-app'],
    instructor: { name: 'Lê Thị Hương', bio: 'Mobile Developer tại Shopee, 5 năm React Native' },
    level: 'intermediate',
    requirements: ['Biết React JS cơ bản', 'Biết JavaScript ES6+'],
    outcomes: ['Xây dựng app iOS & Android', 'Publish lên Store', 'Tích hợp API thực tế'],
    tags: ['react-native', 'mobile', 'ios', 'android', 'expo'],
    totalDuration: 2100,
    isFeatured: true,
    isPublished: true,
    rating: 4.7,
    ratingCount: 189,
    enrollmentCount: 756,
  },
  {
    title: 'Python cho Data Science & Machine Learning',
    slug: 'python-data-science-machine-learning',
    shortDescription: 'Phân tích dữ liệu, trực quan hóa và xây dựng mô hình ML với Python',
    description: 'Học Python từ cơ bản, NumPy, Pandas, Matplotlib, Scikit-learn. Xây dựng các mô hình Machine Learning thực tế và deploy API.',
    price: 1599000,
    salePrice: 999000,
    category: catMap['data-science'],
    instructor: { name: 'Phạm Quốc Hùng', bio: 'Data Scientist tại Grab, PhD Toán ứng dụng' },
    level: 'beginner',
    requirements: ['Không cần kinh nghiệm lập trình', 'Biết toán cơ bản'],
    outcomes: ['Phân tích dữ liệu với Pandas', 'Xây dựng mô hình ML', 'Trực quan hóa dữ liệu'],
    tags: ['python', 'data-science', 'machine-learning', 'ai'],
    totalDuration: 2400,
    isFeatured: true,
    isPublished: true,
    rating: 4.9,
    ratingCount: 421,
    enrollmentCount: 1680,
  },
  {
    title: 'Docker & Kubernetes cho Developer',
    slug: 'docker-kubernetes-cho-developer',
    shortDescription: 'Container hóa ứng dụng, orchestration và CI/CD pipeline thực tế',
    description: 'Học Docker từ cơ bản, viết Dockerfile, Docker Compose, triển khai Kubernetes cluster, thiết lập CI/CD với GitHub Actions.',
    price: 1399000,
    salePrice: 849000,
    category: catMap['devops-cloud'],
    instructor: { name: 'Đỗ Văn Nam', bio: 'DevOps Engineer tại FPT Software, AWS Certified' },
    level: 'advanced',
    requirements: ['Biết Linux cơ bản', 'Đã có kinh nghiệm lập trình'],
    outcomes: ['Container hóa ứng dụng', 'Deploy Kubernetes', 'Thiết lập CI/CD'],
    tags: ['docker', 'kubernetes', 'devops', 'cicd', 'aws'],
    totalDuration: 1800,
    isFeatured: false,
    isPublished: true,
    rating: 4.8,
    ratingCount: 143,
    enrollmentCount: 572,
  },
  {
    title: 'UI/UX Design với Figma - Từ 0 đến Pro',
    slug: 'ui-ux-design-figma',
    shortDescription: 'Thiết kế giao diện đẹp, trải nghiệm người dùng tốt với Figma',
    description: 'Học nguyên lý thiết kế UI/UX, sử dụng Figma thành thạo, tạo prototype, design system và handoff cho developer.',
    price: 999000,
    salePrice: 599000,
    category: catMap['ui-ux-design'],
    instructor: { name: 'Nguyễn Thị Mai', bio: 'Senior UI/UX Designer tại Zalo, 6 năm kinh nghiệm' },
    level: 'beginner',
    requirements: ['Không cần kinh nghiệm thiết kế', 'Có máy tính'],
    outcomes: ['Thiết kế UI chuyên nghiệp', 'Tạo prototype tương tác', 'Xây dựng Design System'],
    tags: ['figma', 'ui', 'ux', 'design', 'prototype'],
    totalDuration: 1200,
    isFeatured: false,
    isPublished: true,
    rating: 4.7,
    ratingCount: 234,
    enrollmentCount: 934,
  },
  {
    title: 'HTML & CSS - Nền tảng lập trình Web',
    slug: 'html-css-nen-tang-lap-trinh-web',
    shortDescription: 'Khóa học miễn phí dành cho người mới bắt đầu học lập trình web',
    description: 'Học HTML5, CSS3 từ cơ bản nhất. Flexbox, Grid, Responsive Design, Animation. Xây dựng 5 dự án thực tế.',
    price: 0,
    salePrice: null,
    category: catMap['lap-trinh-web'],
    instructor: { name: 'Nguyễn Văn Tuấn', bio: 'Senior Frontend Engineer tại Tiki' },
    level: 'beginner',
    requirements: ['Không cần kinh nghiệm'],
    outcomes: ['Xây dựng website tĩnh', 'Responsive Design', 'CSS Animation'],
    tags: ['html', 'css', 'web', 'beginner', 'free'],
    totalDuration: 900,
    isFeatured: false,
    isPublished: true,
    isFree: true,
    rating: 4.8,
    ratingCount: 892,
    enrollmentCount: 4560,
  },
  {
    title: 'SQL & PostgreSQL - Cơ sở dữ liệu quan hệ',
    slug: 'sql-postgresql-co-so-du-lieu',
    shortDescription: 'Thành thạo SQL, thiết kế database và tối ưu query với PostgreSQL',
    description: 'Học SQL từ SELECT cơ bản đến JOIN phức tạp, stored procedure, index, transaction và tối ưu hiệu năng database.',
    price: 899000,
    salePrice: 549000,
    category: catMap['co-so-du-lieu'],
    instructor: { name: 'Vũ Đức Thắng', bio: 'Database Administrator tại Vietcombank, 10 năm kinh nghiệm' },
    level: 'beginner',
    requirements: ['Không cần kinh nghiệm lập trình'],
    outcomes: ['Viết SQL thành thạo', 'Thiết kế database', 'Tối ưu query'],
    tags: ['sql', 'postgresql', 'database', 'backend'],
    totalDuration: 1200,
    isFeatured: false,
    isPublished: true,
    rating: 4.6,
    ratingCount: 178,
    enrollmentCount: 712,
  },
  {
    title: 'JavaScript ES6+ - Nâng cao kỹ năng JS',
    slug: 'javascript-es6-nang-cao',
    shortDescription: 'Nắm vững JavaScript hiện đại: Async/Await, Closure, Prototype, Design Patterns',
    description: 'Đi sâu vào JavaScript: ES6+, Closure, Prototype chain, Event Loop, Async/Await, Promise, Design Patterns và các kỹ thuật tối ưu.',
    price: 799000,
    salePrice: 499000,
    category: catMap['lap-trinh-web'],
    instructor: { name: 'Trần Minh Khoa', bio: 'Backend Lead tại VNG' },
    level: 'intermediate',
    requirements: ['Biết JavaScript cơ bản', 'Đã làm qua 1 dự án nhỏ'],
    outcomes: ['Hiểu sâu JavaScript', 'Viết code sạch hơn', 'Debug hiệu quả'],
    tags: ['javascript', 'es6', 'async', 'frontend'],
    totalDuration: 1080,
    isFeatured: false,
    isPublished: true,
    rating: 4.8,
    ratingCount: 267,
    enrollmentCount: 1068,
  },
];

const buildLessons = (courseId, courseTitle) => [
  { courseId, title: `Giới thiệu khóa học ${courseTitle}`, order: 1, duration: 10, isFree: true, isPublished: true, description: 'Tổng quan nội dung và lộ trình học' },
  { courseId, title: 'Cài đặt môi trường phát triển', order: 2, duration: 15, isFree: true, isPublished: true, description: 'Hướng dẫn cài đặt các công cụ cần thiết' },
  { courseId, title: 'Bài 1: Khái niệm cơ bản', order: 3, duration: 25, isFree: false, isPublished: true },
  { courseId, title: 'Bài 2: Thực hành cơ bản', order: 4, duration: 30, isFree: false, isPublished: true },
  { courseId, title: 'Bài 3: Nâng cao', order: 5, duration: 35, isFree: false, isPublished: true },
  { courseId, title: 'Bài 4: Dự án thực tế', order: 6, duration: 45, isFree: false, isPublished: true },
  { courseId, title: 'Bài 5: Tổng kết & Q&A', order: 7, duration: 20, isFree: false, isPublished: true },
];

const REVIEWS = [
  { studentName: 'Nguyễn Minh Tuấn', rating: 5, comment: 'Khóa học rất hay, giảng viên nhiệt tình. Tôi đã tìm được việc sau 3 tháng học!', isApproved: true },
  { studentName: 'Trần Thị Lan',      rating: 5, comment: 'Nội dung thực chiến, sát với yêu cầu thực tế của doanh nghiệp. Rất đáng tiền!', isApproved: true },
  { studentName: 'Lê Văn Hùng',       rating: 4, comment: 'Học xong có thể làm được ngay. Chỉ mong có thêm bài tập thực hành.', isApproved: true },
  { studentName: 'Phạm Thu Hà',       rating: 5, comment: 'Giảng viên giải thích rất dễ hiểu. Cộng đồng hỗ trợ nhiệt tình.', isApproved: true },
  { studentName: 'Đỗ Quang Vinh',     rating: 5, comment: 'Đây là khóa học tốt nhất tôi từng học. Xứng đáng 5 sao!', isApproved: true },
];

// ─── SEED ────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    console.log('\n🔌 Đang kết nối MongoDB Atlas...');
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log('✅ Kết nối thành công!\n');

    // Xóa dữ liệu cũ
    console.log('🗑️  Xóa dữ liệu cũ...');
    await Promise.all([
      AdminModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      CourseModel.deleteMany({}),
      LessonModel.deleteMany({}),
      ReviewModel.deleteMany({}),
    ]);
    console.log('✅ Đã xóa dữ liệu cũ\n');

    // 1. Tạo Admin
    console.log('👤 Tạo tài khoản admin...');
    const hashedPwd = await bcrypt.hash('Admin@123', 10);
    await AdminModel.create({
      userName: 'admin',
      password: hashedPwd,
      email: 'admin@highsky.vn',
      fullName: 'High Sky Admin',
      phone: '0912345678',
    });
    console.log('   ✅ admin / Admin@123\n');

    // 2. Tạo Categories
    console.log('📂 Tạo danh mục khóa học...');
    const createdCats = await CategoryModel.insertMany(CATEGORIES);
    const catMap = {};
    createdCats.forEach((c) => { catMap[c.slug] = c._id; });
    console.log(`   ✅ ${createdCats.length} danh mục\n`);

    // 3. Tạo Courses
    console.log('📚 Tạo khóa học...');
    const coursesData = buildCourses(catMap);
    const createdCourses = await CourseModel.insertMany(coursesData);
    console.log(`   ✅ ${createdCourses.length} khóa học\n`);

    // 4. Tạo Lessons cho mỗi khóa học
    console.log('📖 Tạo bài học...');
    let totalLessons = 0;
    for (const course of createdCourses) {
      const lessons = buildLessons(course._id, course.title);
      await LessonModel.insertMany(lessons);
      await CourseModel.updateOne({ _id: course._id }, { totalLessons: lessons.length });
      totalLessons += lessons.length;
    }
    console.log(`   ✅ ${totalLessons} bài học\n`);

    // 5. Tạo Reviews cho 3 khóa đầu
    console.log('⭐ Tạo đánh giá mẫu...');
    let totalReviews = 0;
    for (let i = 0; i < Math.min(3, createdCourses.length); i++) {
      const reviewsToInsert = REVIEWS.map((r) => ({ ...r, courseId: createdCourses[i]._id }));
      await ReviewModel.insertMany(reviewsToInsert);
      totalReviews += reviewsToInsert.length;
    }
    console.log(`   ✅ ${totalReviews} đánh giá\n`);

    // ─── Tổng kết ───────────────────────────────────────────────────────────
    console.log('═'.repeat(50));
    console.log('🎉 SEED DATABASE THÀNH CÔNG!');
    console.log('═'.repeat(50));
    console.log(`📊 Database: highsky_db`);
    console.log(`👤 Admin:    admin / Admin@123`);
    console.log(`📂 Danh mục: ${createdCats.length}`);
    console.log(`📚 Khóa học: ${createdCourses.length}`);
    console.log(`📖 Bài học:  ${totalLessons}`);
    console.log(`⭐ Đánh giá: ${totalReviews}`);
    console.log('═'.repeat(50));
    console.log('\n⚠️  Nhớ đổi mật khẩu admin sau khi đăng nhập lần đầu!\n');

  } catch (err) {
    console.error('\n❌ Lỗi:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('connect')) {
      console.error('   → Kiểm tra lại connection string trong .env');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
