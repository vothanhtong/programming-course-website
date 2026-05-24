import CategoryModel from '../models/course.models/category.model';
import CourseModel from '../models/course.models/course.model';

const makeSlug = (title: string): string =>
  title.toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export const categoryService = {
  async getCategoryList() {
    const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return { categories };
  },

  async adminGetCategories() {
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    return { categories };
  },

  async adminAddCategory(data: any) {
    const slug = makeSlug(data.name);
    const category = await CategoryModel.create({
      name: data.name,
      slug,
      description: data.description,
      icon: data.icon
    });
    return category;
  },

  async adminDeleteCategory(id: string) {
    const courseCount = await CourseModel.countDocuments({ category: id });
    if (courseCount > 0) {
      const err: any = new Error(`Không thể xóa: có ${courseCount} khóa học đang dùng danh mục này`);
      err.status = 400;
      throw err;
    }

    await CategoryModel.findByIdAndDelete(id);
  }
};
