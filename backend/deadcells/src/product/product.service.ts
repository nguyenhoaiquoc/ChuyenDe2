import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { ProductImage } from 'src/entities/product-image.entity';
import { DealType } from 'src/entities/deal-type.entity';
import { Condition } from 'src/entities/condition.entity';
import { SubCategory } from 'src/entities/sub-category.entity'; // Thêm import SubCategory
import { FashionCategory } from 'src/entities/categories/fashion-category.entity';
import { GameCategory } from 'src/entities/categories/game-category.entity';
import { AcademicCategory } from 'src/entities/categories/academic-category.entity';
import { AnimalCategory } from 'src/entities/categories/animal-category.entity';
import { ElectronicCategory } from 'src/entities/categories/electronic-category.entity';
import { HouseCategory } from 'src/entities/categories/house-category.entity';
import { VehicleCategory } from 'src/entities/categories/vehicle-category.entity';
import { DataSource } from 'typeorm';
import { PostType } from 'src/entities/post-type.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ProductService {
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(DealType)
    private readonly dealTypeRepo: Repository<DealType>,

    @InjectRepository(Condition)
    private readonly conditionRepo: Repository<Condition>,

    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(PostType)
    private readonly postTypeRepo: Repository<PostType>,

    @InjectRepository(FashionCategory)
    private readonly fashionRepo: Repository<FashionCategory>,

    @InjectRepository(GameCategory)
    private readonly gameRepo: Repository<GameCategory>,

    @InjectRepository(AcademicCategory)
    private readonly academicRepo: Repository<AcademicCategory>,

    @InjectRepository(AnimalCategory)
    private readonly animalRepo: Repository<AnimalCategory>,

    @InjectRepository(ElectronicCategory)
    private readonly electronicRepo: Repository<ElectronicCategory>,

    @InjectRepository(HouseCategory)
    private readonly houseRepo: Repository<HouseCategory>,

    @InjectRepository(VehicleCategory)
    private readonly vehicleRepo: Repository<VehicleCategory>,

    private readonly dataSource: DataSource,
  ) { }

  // 🧩 Thêm sản phẩm mới (tự động tạo sub_category nếu chưa tồn tại)
  async create(data: any, files?: Express.Multer.File[]) {
    const dealType = await this.dealTypeRepo.findOne({
      where: { id: Number(data.deal_type_id) },
    });
    if (!dealType) {
      throw new NotFoundException(`Không tìm thấy dealType với ID ${data.deal_type_id}`);
    }

    const condition = await this.conditionRepo.findOne({
      where: { id: Number(data.condition_id) },
    });
    if (!condition) {
      throw new NotFoundException(`Không tìm thấy condition với ID ${data.condition_id}`);
    }

    const postType = await this.postTypeRepo.findOne({
      where: { id: Number(data.post_type_id) },
    });
    if (!postType) {
      throw new NotFoundException(`Không tìm thấy postType với ID ${data.post_type_id}`);
    }

    let subCategoryId: number | null = null;

    if (data.category_id && data.sub_category && data.sub_category.name) {
      const existingSub = await this.subCategoryRepo.findOne({
        where: {
          name: data.sub_category.name,
          parent_category_id: data.category_id,
        },
      });

      if (existingSub) {
        subCategoryId = existingSub.id;
      } else {
        let sourceTable: string | null = null;
        switch (data.category_id) {
          case 1: sourceTable = 'fashion_categories'; break;
          case 2: sourceTable = 'game_categories'; break;
          case 3: sourceTable = 'academic_categories'; break;
          case 4: sourceTable = 'animal_categories'; break;
          case 5: sourceTable = 'electronic_categories'; break;
          case 6: sourceTable = 'house_categories'; break;
          case 7: sourceTable = 'vehicle_categories'; break;
        }

        const newSub = this.subCategoryRepo.create({
          name: data.sub_category.name,
          parent_category_id: data.category_id,
          source_table: sourceTable || undefined,
          source_id: null,
        });
        const savedSub = await this.subCategoryRepo.save(newSub);
        subCategoryId = savedSub.id;
      }
    } else if (data.sub_category_id) {
      subCategoryId = data.sub_category_id;
    }

    const product = this.productRepo.create({
      name: data.name,
      description: data.description || '',
      price: data.price || 0,
      user_id: data.user_id,
      post_type_id: data.post_type_id || 1,
      category_id: data.category_id || null,
      sub_category_id: subCategoryId,
      categoryChange_id: data.categoryChange_id || null,
      subCategoryChange_id: data.subCategoryChange_id || null,
      address_json: data.address_json || {},
      is_approved: false,
      thumbnail_url: files && files.length > 0 ? files[0].path : null,
      dealType: dealType,
      condition: condition,
      postType: postType,
      product_type_id: data.product_type_id ? Number(data.product_type_id) : null,
    });

    const savedProduct = await this.productRepo.save(product);

    if (files && files.length > 0) {
      const imagesToSave = files.map((file) =>
        this.imageRepo.create({
          product: { id: savedProduct.id },
          name: savedProduct.name,
          image_url: file.path,
        }),
      );

      await this.imageRepo.save(imagesToSave);
      console.log(`🖼️ Đã lưu ${imagesToSave.length} ảnh cho sản phẩm ID=${savedProduct.id}`);
    }

    const fullProduct = await this.productRepo.findOne({
      where: { id: savedProduct.id },
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'categoryChange',
        'subCategoryChange',
        'postType',
        'productType',
      ],
    });

    if (!fullProduct) throw new Error('Không tìm thấy sản phẩm sau khi lưu.');

    const categoryName = fullProduct.category?.name || null;
    const subCategoryName = fullProduct.subCategory?.name || null;
    const sourceDetail = fullProduct.subCategory
      ? await this.getSourceDetail(fullProduct.subCategory)
      : null;

    return {
      id: fullProduct.id,
      image: fullProduct.thumbnail_url || null,
      name: fullProduct.name || 'Không có tên',
      price: fullProduct.price.toLocaleString('vi-VN'),
      location: this.formatAddress(fullProduct.address_json),
      created_at: fullProduct.created_at,
      tag:
        categoryName && subCategoryName
          ? `${categoryName} - ${subCategoryName}`
          : categoryName ||
          subCategoryName ||
          fullProduct.dealType?.name ||
          'Không có danh mục',
      category: categoryName,
      subCategory: {
        id: fullProduct.subCategory?.id || null,
        name: subCategoryName,
        source_table: fullProduct.subCategory?.source_table || null,
        source_detail: sourceDetail,
      },
      condition: fullProduct.condition
        ? { id: fullProduct.condition.id, name: fullProduct.condition.name } // Sửa lại thành object
        : null,
      // SỬA: Trả về object { id, name }
      postType: fullProduct.postType
        ? { id: fullProduct.postType.id, name: fullProduct.postType.name } // <<< ĐÃ SỬA
        : null,
      // SỬA: Trả về object { id, name }
      productType: fullProduct.productType
        ? { id: fullProduct.productType.id, name: fullProduct.productType.name } // <<< ĐÃ SỬA
        : null,
      imageCount: fullProduct.images?.length || 0,
      isFavorite: false,
    };
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return await this.productRepo.find({
      where: [
        { category: { id: categoryId }, status_id: 1 },
        { categoryChange: { id: categoryId }, status_id: 1 },
      ],
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'categoryChange',
        'subCategoryChange',
        'postType',
        'productType',
      ],
      order: { created_at: 'DESC' },
    });
  }

  // 🧩 Lấy toàn bộ sản phẩm (cho Postman, trả full dữ liệu chi tiết)
  async getAllProducts(): Promise<any[]> {
    const products = await this.productRepo.find({
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'categoryChange',
        'subCategoryChange',
        'postType',
        'productType',
      ],
      order: { created_at: 'DESC' },
    });

    return this.formatProducts(products);
  }

  // Format dữ liệu cho client (React Native)
  async findAllFormatted(): Promise<any[]> {
    const products = await this.productRepo.find({
      where: { status_id: 1 },
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'categoryChange',
        'subCategoryChange',
        'postType',
        'productType',
      ],
      order: { created_at: 'DESC' },
    });

    return products.map((p) => {
      const categoryName = p.category?.name || null;
      const subCategoryName = p.subCategory?.name || null;
      const sourceDetail = p.subCategory
        ? p.subCategory.source_table || null
        : null;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        thumbnail_url: p.images?.[0]?.image_url || null,
        phone: p.user?.phone || null,
        user_id: p.user_id,
        user: p.user ? {
          id: p.user.id,
          name: p.user.fullName,
          email: p.user.email,
          phone: p.user.phone,
        } : null,
        post_type_id: p.post_type_id,
        postType: p.postType
          ? { id: p.postType.id, name: p.postType.name } // <<< THÊM VÀO ĐÂY
          : null,
        deal_type_id: p.deal_type_id,
        category_id: p.category_id,
        sub_category_id: p.sub_category_id,
        categoryChange_id: p.categoryChange_id,
        subCategoryChange_id: p.subCategoryChange_id,
        status_id: p.status_id,
        visibility_type: p.visibility_type,
        group_id: p.group_id,
        is_approved: p.is_approved,
        address_json: p.address_json,

        productType: p.productType
          ? { id: p.productType.id, name: p.productType.name }
          : null,
        // quan hệ chi tiết
        dealType: p.dealType
          ? { id: p.dealType.id, name: p.dealType.name }
          : null,
        condition: p.condition
          ? { id: p.condition.id, name: p.condition.name }
          : null,
        category: p.category
          ? {
            id: p.category.id,
            name: p.category.name,
            image: p.category.image,
            hot: p.category.hot,
          }
          : null,
        subCategory: p.subCategory
          ? {
            id: p.subCategory.id,
            name: p.subCategory.name,
            parent_category_id: p.subCategory.parent_category_id,
            source_table: p.subCategory.source_table,
            source_id: p.subCategory.source_id,
          }
          : null,
        categoryChange: p.categoryChange
          ? {
            id: p.categoryChange.id,
            name: p.categoryChange.name,
            image: p.categoryChange.image,
          }
          : null,
        subCategoryChange: p.subCategoryChange
          ? {
            id: p.subCategoryChange.id,
            name: p.subCategoryChange.name,
            parent_category_id: p.subCategoryChange.parent_category_id,
            source_table: p.subCategoryChange.source_table,
            source_id: p.subCategoryChange.source_id,
          }
          : null,

        images:
          p.images?.map((img) => ({
            id: img.id,
            product_id: img.product_id,
            name: img.name,
            image_url: img.image_url,
            created_at: img.created_at,
          })) || [],
        imageCount: p.images?.length || 0,
        isFavorite: false,
        location: this.formatAddress(p.address_json),
        tag:
          categoryName && subCategoryName
            ? `${categoryName} - ${subCategoryName}`
            : categoryName ||
            subCategoryName ||
            p.dealType?.name ||
            'Không có danh mục',
        created_at: p.created_at,
        updated_at: p.updated_at,

      };
    });
  }

  async formatProducts(products: Product[]): Promise<any[]> {
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      thumbnail_url: p.images?.[0]?.image_url || null,
      user_id: p.user_id,
      user: p.user ? {
        id: p.user.id,
        name: p.user.fullName,
        email: p.user.email,
        phone: p.user.phone,
      } : null,
      deal_type_id: p.deal_type_id,
      category_id: p.category_id,
      sub_category_id: p.sub_category_id,
      categoryChange_id: p.categoryChange_id,
      subCategoryChange_id: p.subCategoryChange_id,
      is_approved: p.is_approved,
      address_json: p.address_json,
      created_at: p.created_at,
      updated_at: p.updated_at,
      postType: p.postType
        ? { id: p.postType.id, name: p.postType.name } // <<< THÊM VÀO ĐÂY
        : null,
      dealType: p.dealType
        ? { id: p.dealType.id, name: p.dealType.name }
        : null,
      condition: p.condition
        ? { id: p.condition.id, name: p.condition.name }
        : null,
      category: p.category
        ? {
          id: p.category.id,
          name: p.category.name,
          image: p.category.image,
          hot: p.category.hot,
        }
        : null,
      subCategory: p.subCategory
        ? {
          id: p.subCategory.id,
          name: p.subCategory.name,
          parent_category_id: p.subCategory.parent_category_id,
          source_table: p.subCategory.source_table,
          source_id: p.subCategory.source_id,
        }
        : null,
      categoryChange: p.categoryChange
        ? {
          id: p.categoryChange.id,
          name: p.categoryChange.name,
          image: p.categoryChange.image,
        }
        : null,
      subCategoryChange: p.subCategoryChange
        ? {
          id: p.subCategoryChange.id,
          name: p.subCategoryChange.name,
          parent_category_id: p.subCategoryChange.parent_category_id,
          source_table: p.subCategoryChange.source_table,
          source_id: p.subCategoryChange.source_id,
        }
        : null,
      images: p.images
        ? p.images.map((img) => ({
          id: img.id,
          product_id: img.product_id,
          name: img.name,
          image_url: img.image_url,
          created_at: img.created_at,
        }))
        : [],
    }));
  }

  // 🔧 Format địa chỉ
  private formatAddress(addressJson: any): string {
    try {
      const addr =
        typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
      if (addr.full) return addr.full; // ✅ Ưu tiên trường "full"
      const parts = [addr.ward, addr.district, addr.province].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Không rõ địa chỉ';
    } catch {
      return 'Không rõ địa chỉ';
    }
  }

  async getSourceDetail(subCategory: SubCategory): Promise<any> {
    if (!subCategory.source_table || !subCategory.source_id) {
      return null; // ✅ nếu thiếu thông tin thì bỏ qua
    }

    switch (subCategory.source_table) {
      case 'fashion_categories':
        return await this.fashionRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'game_categories':
        return await this.gameRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'academic_categories':
        return await this.academicRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'animal_categories':
        return await this.animalRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'electronic_categories':
        return await this.electronicRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'house_categories':
        return await this.houseRepo.findOne({
          where: { id: subCategory.source_id },
        });
      case 'vehicle_categories':
        return await this.vehicleRepo.findOne({
          where: { id: subCategory.source_id },
        });
      default:
        return null;
    }
  }
}

