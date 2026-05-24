const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const componentMappings = {
  'Navbar/Navbar': 'layout/Navbar/Navbar',
  'Footer/Footer': 'layout/Footer/Footer',
  'Auth/AuthLayout': 'ui/Auth/AuthLayout',
  'Auth/AuthInput': 'ui/Auth/AuthInput',
  'Contact/Contact': 'ui/Contact/Contact',
  'CourseCard/CourseCard': 'ui/CourseCard/CourseCard',
  'CoursesSection/CoursesSection': 'ui/CoursesSection/CoursesSection',
  'EnrollModal/EnrollModal': 'ui/EnrollModal/EnrollModal',
  'Features/Features': 'ui/Features/Features',
  'FloatingContact/FloatingContact': 'ui/FloatingContact/FloatingContact',
  'Hero/Hero': 'ui/Hero/Hero',
  'ImageUploader/ImageUploader': 'ui/ImageUploader/ImageUploader',
  'Quiz/QuizTab': 'ui/Quiz/QuizTab',
  'Skeleton/CourseDetailSkeleton': 'common/Skeleton/CourseDetailSkeleton',
  'Skeleton/StatCardSkeleton': 'common/Skeleton/StatCardSkeleton',
  'Skeleton/CourseCardSkeleton': 'common/Skeleton/CourseCardSkeleton',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldPath, newPath] of Object.entries(componentMappings)) {
        // Match occurrences of e.g. '../../components/Navbar/Navbar'
        const regex = new RegExp(`components/${oldPath}`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `components/${newPath}`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
