import { GroupService } from './../groups/group.service';
import { Injectable, NotFoundException  } from '@nestjs/common';
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
import { ProductType } from 'src/entities/product_types.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ProductService {
  logger: any;
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,

    @InjectRepository(ProductType)
    private readonly productTypeRepo: Repository<ProductType>,

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

    private readonly groupService: GroupService,

    private readonly dataSource: DataSource,

    private readonly notificationService: NotificationService,
  ) {}

  // 🧩 Thêm sản phẩm mới (tự động tạo sub_category nếu chưa tồn tại)
  async create(data: any, files?: Express.Multer.File[]) {
    const dealType = await this.dealTypeRepo.findOne({
      where: { id: data.deal_type_id },
    });
    if (!dealType) {
      throw new NotFoundException(
        `Không tìm thấy dealType với ID ${data.deal_type_id}`,
      );
    }

    const condition = await this.conditionRepo.findOne({
      where: { id: data.condition_id },
    });
    if (!condition) {
      throw new NotFoundException(
        `Không tìm thấy condition với ID ${data.condition_id}`,
      );
    }

    const postType = await this.postTypeRepo.findOne({
      where: { id: data.post_type_id },
    });
    if (!postType) {
      throw new NotFoundException(
        `Không tìm thấy postType với ID ${data.post_type_id}`,
      );
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
          case 1:
            sourceTable = 'fashion_categories';
            break;
          case 2:
            sourceTable = 'game_categories';
            break;
          case 3:
            sourceTable = 'academic_categories';
            break;
          case 4:
            sourceTable = 'animal_categories';
            break;
          case 5:
            sourceTable = 'electronic_categories';
            break;
          case 6:
            sourceTable = 'house_categories';
            break;
          case 7:
            sourceTable = 'vehicle_categories';
            break;
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

    let user: User | null = null;
    if (data.user_id) {
      user = await this.userRepo.findOne({
        where: { id: data.user_id },
      });
      if (!user) {
        console.warn(`⚠️ User với ID ${data.user_id} không tồn tại, gán null`);
      }
    }
    const product = this.productRepo.create({
      name: data.name,
      description: data.description || '',
      price: data.price || 0,
      user: user || null,
      post_type_id: data.post_type_id || 1,
      category_id: data.category_id || null,
      sub_category_id: subCategoryId,
      category_change_id: data.category_change_id || null,
      sub_category_change_id: data.sub_category_change_id || null,
      address_json: data.address_json ? JSON.parse(data.address_json) : {},
      is_approved: false,
      thumbnail_url: files && files.length > 0 ? files[0].path : null,
      dealType: dealType,
      condition: condition,
      postType: postType,
      product_type_id: data.product_type_id,
      author: data.author,
      year: data.year,
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
      console.log(
        `🖼️ Đã lưu ${imagesToSave.length} ảnh cho sản phẩm ID=${savedProduct.id}`,
      );

      if (savedProduct) {
      // 1. Gửi cho chính người đăng
      this.notificationService.notifyUserOfPostSuccess(savedProduct)
        .catch(err => this.logger.error('Lỗi (từ service) notifyUserOfPostSuccess:', err.message));
        
      // 2. Gửi cho Admin ("tui")
      this.notificationService.notifyAdminsOfNewPost(savedProduct)
        .catch(err => this.logger.error('Lỗi (từ service) notifyAdminsOfNewPost:', err.message));
      }
      return savedProduct;
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
        'category_change',
        'sub_category_change',
        'postType',
        'productType',
      ],
    });

    if (!fullProduct) throw new Error('Không tìm thấy sản phẩm sau khi lưu.');

    return this.formatProduct(fullProduct);
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const products = await this.productRepo.find({
      where: [{ category_id: categoryId, status_id: 1 }],
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'category_change',
        'sub_category_change',
        'postType',
        'productType',
      ],

      order: { created_at: 'DESC' },
    });
    return this.formatProducts(products);
  }

  //  Lấy toàn bộ sản phẩm (cho Postman, trả full dữ liệu chi tiết)
  async getAllProducts(): Promise<any[]> {
    const products = await this.productRepo.find({
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'category_change',
        'sub_category_change',
        'postType',
        'productType',
      ],
      order: { created_at: 'DESC' },
    });

    return this.formatProducts(products);
  }

  // Format dữ liệu cho client (React Native)
  async findAllFormatted(userId?: number): Promise<any[]> {
    const products = await this.productRepo.find({
      where: { status_id: 1 },
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'category_change',
        'sub_category_change',
        'postType',
        'productType',
      ],
      order: { created_at: 'DESC' },
    });

    const visibleProducts: Product[] = [];

    for (const p of products) {
      const vis = Number(p.visibility_type);

      if (vis === 0 || p.visibility_type == null) {
        visibleProducts.push(p);
      } else if (vis === 1 && userId) {
        const isMember = await this.groupService.isMember(p.group_id, userId);
        if (isMember) visibleProducts.push(p);
      }
    }

    console.log('✅ userId:', userId);
    console.log('✅ products count:', products.length);
    console.log('✅ visibleProducts count:', visibleProducts.length);
    for (const p of products) {
      console.log(`🧱 Product ${p.id}: visibility_type =`, p.visibility_type);
    }

    return this.formatProducts(visibleProducts);
  }

  // Format danh sách sản phẩm
  async formatProducts(products: Product[]): Promise<any[]> {
    return products.map((p) => {
      const categoryName = p.category?.name || null;
      const subCategoryName = p.subCategory?.name || null;
      const tag =
        categoryName && subCategoryName
          ? `${categoryName} - ${subCategoryName}`
          : categoryName ||
            subCategoryName ||
            p.dealType?.name ||
            'Không có danh mục';

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        thumbnail_url: p.images?.[0]?.image_url || null,
        phone: p.user?.phone || null,
        user_id: p.user_id,
        user: p.user
          ? {
              id: p.user.id,
              name: p.user.fullName,
              email: p.user.email,
              phone: p.user.phone,
            }
          : null,
        author_name: p.user?.fullName || 'Người bán',
        author: p.author || null,
        year: p.year || null,

        // Loại bài đăng, tình trạng, loại sản phẩm, loại giao dịch
        postType: p.postType
          ? { id: p.postType.id, name: p.postType.name }
          : null,
        productType: p.productType
          ? { id: p.productType.id, name: p.productType.name }
          : null,
        dealType: p.dealType
          ? { id: p.dealType.id, name: p.dealType.name }
          : null,
        condition: p.condition
          ? { id: p.condition.id, name: p.condition.name }
          : null,

        // Danh mục chính và phụ
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

        // Danh mục đổi (nếu có)
        category_change: p.category_change
          ? {
              id: p.category_change.id,
              name: p.category_change.name,
              image: p.category_change.image,
            }
          : null,
        sub_category_change: p.sub_category_change
          ? {
              id: p.sub_category_change.id,
              name: p.sub_category_change.name,
              parent_category_id: p.sub_category_change.parent_category_id,
              source_table: p.sub_category_change.source_table,
              source_id: p.sub_category_change.source_id,
            }
          : null,

        // Ảnh sản phẩm
        images:
          p.images?.map((img) => ({
            id: img.id,
            product_id: img.product_id,
            name: img.name,
            image_url: img.image_url,
            created_at: img.created_at,
          })) || [],
        imageCount: p.images?.length || 0,

        // Thông tin trạng thái
        deal_type_id: p.deal_type_id,
        category_id: p.category_id,
        sub_category_id: p.sub_category_id,
        category_change_id: p.category_change_id,
        sub_category_change_id: p.sub_category_change_id,
        status_id: p.status_id,
        visibility_type: p.visibility_type,
        group_id: p.group_id,
        is_approved: p.is_approved,

        // Thông tin phụ
        address_json: p.address_json,
        location: this.formatAddress(p.address_json),
        tag: tag,
        created_at: p.created_at,
        updated_at: p.updated_at,
        isFavorite: false,
      };
    });
  }

  // Format 1 sản phẩm đơn lẻ
  async formatProduct(p: Product): Promise<any> {
    const [result] = await this.formatProducts([p]);
    return result;
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
  async findById(id: number): Promise<any> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'images',
        'user',
        'dealType',
        'condition',
        'category',
        'subCategory',
        'category_change',
        'sub_category_change',
        'postType',
        'productType',
      ],
    });

    if (!product) return null;

    return await this.formatProduct(product);
  }
}
