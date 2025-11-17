import { BadRequestException, Injectable } from '@nestjs/common';
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
  ) {}

  // Lấy danh mục
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  // Thêm danh mục
  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepo.create(data);
    return await this.categoryRepo.save(category);
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    await this.categoryRepo.update(id, data);
    const updated = await this.categoryRepo.findOne({ where: { id } });
    if (!updated) {
      throw new BadRequestException('Danh mục không tồn tại');
    }
    return updated;
  }

  // Tìm kiếm danh mục
  async searchByName(name: string): Promise<Category[]> {
    return await this.categoryRepo
      .createQueryBuilder('category')
      .where('category.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }

  // 🧩 Lấy danh mục cha và danh mục con
  async findAllWithChildren(): Promise<any[]> {
    const categories = await this.categoryRepo.find();
    const subCategories = await this.subCategoryRepo.find();

    // Tạo map: key là parent_category_id (có thể null), value là mảng sub
    const subMap = new Map<string | number | null, SubCategory[]>();

    subCategories.forEach((sub) => {
      const parentId = sub.parent_category_id ?? null;
      if (!subMap.has(parentId)) {
        subMap.set(parentId, []);
      }
      subMap.get(parentId)!.push(sub);
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      productCount: cat.products?.length || 0,
      children: (subMap.get(cat.id) || []).map((sub) => ({
        ...sub,
        productCount: sub.products?.length || 0,
      })),
    }));
  }

  async remove(id: number): Promise<any> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new BadRequestException('Danh mục không tồn tại');
    }

    // XÓA TRONG DATABASE (CASCADE sẽ tự xóa con + sản phẩm)
    const result = await this.categoryRepo.delete(id);

    return {
      deletedCategoryId: id,
      affected: result.affected,
    };
  }
}
