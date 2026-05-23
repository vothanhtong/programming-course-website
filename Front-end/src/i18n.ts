import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

// Lấy ngôn ngữ đã lưu hoặc dùng mặc định
const savedLanguage = localStorage.getItem('i18nextLng') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      vi: { translation: viTranslation },
    },
    lng: savedLanguage, // Ngôn ngữ khởi tạo
    fallbackLng: 'vi',  // Ngôn ngữ dự phòng nếu không tìm thấy key
    interpolation: {
      escapeValue: false, // React đã tự động escape HTML
    },
  });

export default i18n;
