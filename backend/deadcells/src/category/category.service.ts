import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { SubCategory } from 'src/entities/sub-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,
  ) { }

  // Lấy danh mục
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  // Thêm danh mục
  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepo.create(data);
    return await this.categoryRepo.save(category)
  }

  // Tìm kiếm danh mục
  async searchByName(name: string): Promise<Category[]> {
    return await this.categoryRepo
      .createQueryBuilder("category")
      .where("category.name LIKE :name", { name: `%${name}%` })
      .getMany();
  }

  // 🧩 Lấy danh mục cha và danh mục con
  async findAllWithChildren(): Promise<any[]> {
    const categories = await this.categoryRepo.find();
    const subCategories = await this.subCategoryRepo.find();

    const grouped = subCategories.reduce((acc, sub) => {
      const parentId = sub.parent_category_id;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(sub);
      return acc;
    }, {} as Record<number, SubCategory[]>);

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      hot: cat.hot,
      children: grouped[cat.id] || [],
    }));
  }
}
