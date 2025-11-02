import { GroupService } from './../groups/group.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { NotificationService } from 'src/notification/notification.service';
import { SizeService } from 'src/size/size.service';
import { BrandService } from 'src/brands/brand.service';
import { OriginService } from 'src/origin/origin.service';
import { MaterialService } from 'src/material/material.service';
import { ColorService } from 'src/colors/color.service';
import { CapacityService } from 'src/capacitys/capacity.service';
import { WarrantyService } from 'src/warrantys/warranty.service';
import { ProductModelService } from 'src/product-models/product-model.service';
import { ProcessorService } from 'src/processors/processor.service';
import { AgeRangeService } from 'src/age-ranges/age-range.service';
import { BreedService } from 'src/breeds/breed.service';
import { EngineCapacityService } from 'src/engine-capacities/engine-capacity.service';
import { GenderService } from 'src/genders/gender.service';
import { GraphicsCardService } from 'src/graphics-cards/graphics-card.service';
import { RamOptionService } from 'src/ram-options/ram-option.service';
import { StorageTypeService } from 'src/storage-types/storage-type.service';
import { ProductTypeService } from 'src/product-types/product-type.service';
import { Category } from 'src/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>, // === GIỮ LẠI CÁC REPO CHÍNH ===

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DealType)
    private readonly dealTypeRepo: Repository<DealType>,
    @InjectRepository(Condition)
    private readonly conditionRepo: Repository<Condition>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
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

    // === THÊM CÁC SERVICE CON ===
    private readonly sizeService: SizeService,
    private readonly brandService: BrandService,
    private readonly originService: OriginService,
    private readonly materialService: MaterialService,
    private readonly colorService: ColorService,
    private readonly capacityService: CapacityService,
    private readonly warrantyService: WarrantyService,
    private readonly productModelService: ProductModelService,
    private readonly processorService: ProcessorService,
    private readonly ramOptionService: RamOptionService,
    private readonly storageTypeService: StorageTypeService,
    private readonly graphicsCardService: GraphicsCardService,
    private readonly breedService: BreedService,
    private readonly ageRangeService: AgeRangeService,
    private readonly genderService: GenderService,
    private readonly engineCapacityService: EngineCapacityService,
    private readonly productTypeService: ProductTypeService,

    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  // 🧩 Thêm sản phẩm mới (tự động tạo sub_category nếu chưa tồn tại)
  async create(data: CreateProductDto, files?: Express.Multer.File[]) {
    // 1. Lấy các đối tượng (Entity) từ ID song song
    const [
      dealType,
      condition,
      postType,
      user,
      category,
      subCategory,
      productType,
      origin,
      material,
      size,
      brand,
      productModel,
      color,
      capacity,
      warranty,
      processor,
      ramOption,
      storageType,
      graphicsCard,
      breed,
      ageRange,
      gender,
      engineCapacity,
      category_change,
      sub_category_change,
    ] = await Promise.all([
      data.deal_type_id
        ? this.dealTypeRepo.findOneBy({ id: data.deal_type_id })
        : Promise.resolve(null),
      data.condition_id
        ? this.conditionRepo.findOneBy({ id: data.condition_id })
        : Promise.resolve(null),
      data.post_type_id
        ? this.postTypeRepo.findOneBy({ id: data.post_type_id })
        : Promise.resolve(null),
      data.user_id
        ? this.userRepo.findOneBy({ id: data.user_id })
        : Promise.resolve(null),
      data.category_id
        ? this.categoryRepo.findOneBy({ id: data.category_id })
        : Promise.resolve(null),
      data.sub_category_id
        ? this.subCategoryRepo.findOneBy({ id: data.sub_category_id })
        : Promise.resolve(null),

      // Dùng Service
      data.product_type_id
        ? this.productTypeService.findOne(data.product_type_id) // Dùng service
        : Promise.resolve(null),
      data.origin_id
        ? this.originService.findOne(data.origin_id)
        : Promise.resolve(null),
      data.material_id
        ? this.materialService.findOne(data.material_id)
        : Promise.resolve(null),
      data.size_id
        ? this.sizeService.findOne(data.size_id)
        : Promise.resolve(null),
      data.brand_id
        ? this.brandService.findOne(data.brand_id)
        : Promise.resolve(null),
      data.product_model_id
        ? this.productModelService.findOne(data.product_model_id)
        : Promise.resolve(null),
      data.color_id
        ? this.colorService.findOne(data.color_id)
        : Promise.resolve(null),
      data.capacity_id
        ? this.capacityService.findOne(data.capacity_id)
        : Promise.resolve(null),
      data.warranty_id
        ? this.warrantyService.findOne(data.warranty_id)
        : Promise.resolve(null),
      data.processor_id
        ? this.processorService.findOne(data.processor_id)
        : Promise.resolve(null),
      data.ram_option_id
        ? this.ramOptionService.findOne(data.ram_option_id)
        : Promise.resolve(null),
      data.storage_type_id
        ? this.storageTypeService.findOne(data.storage_type_id)
        : Promise.resolve(null),
      data.graphics_card_id
        ? this.graphicsCardService.findOne(data.graphics_card_id)
        : Promise.resolve(null),
      data.breed_id
        ? this.breedService.findOne(data.breed_id)
        : Promise.resolve(null),
      data.age_range_id
        ? this.ageRangeService.findOne(data.age_range_id)
        : Promise.resolve(null),
      data.gender_id
        ? this.genderService.findOne(data.gender_id)
        : Promise.resolve(null),
      data.engine_capacity_id
        ? this.engineCapacityService.findOne(data.engine_capacity_id)
        : Promise.resolve(null),

      data.category_change_id
        ? this.categoryRepo.findOneBy({ id: data.category_change_id })
        : Promise.resolve(null),
      data.sub_category_change_id
        ? this.subCategoryRepo.findOneBy({ id: data.sub_category_change_id })
        : Promise.resolve(null),
    ]);

    // 2. Kiểm tra các Entity bắt buộc
    if (!dealType)
      throw new NotFoundException(
        `Không tìm thấy dealType ID ${data.deal_type_id}`,
      );
    if (!postType)
      throw new NotFoundException(
        `Không tìm thấy postType ID ${data.post_type_id}`,
      );
    if (!user)
      throw new NotFoundException(`Không tìm thấy user ID ${data.user_id}`);
    if (!category)
      throw new NotFoundException(
        `Không tìm thấy category ID ${data.category_id}`,
      );
    if (!subCategory)
      throw new NotFoundException(
        `Không tìm thấy subCategory ID ${data.sub_category_id}`,
      );

    // 'condition' là tùy chọn (cho Thú cưng)
    if (data.condition_id && !condition) {
      throw new NotFoundException(
        `Không tìm thấy condition ID ${data.condition_id}`,
      );
    }

    // 3. Tạo sản phẩm
    const product = this.productRepo.create({
      // ===== BẮT ĐẦU CÁC TRƯỜNG TƯỜNG MINH (TỪ ...data) =====
      name: data.name,
      description: data.description,
      price: Number(data.price), // Sửa lỗi 'string' vs 'number'
      author: data.author || undefined,
      year: data.year || undefined,
      mileage: data.mileage || undefined, // ===== KẾT THÚC CÁC TRƯỜNG TƯỜNG MINH =====
      // Gán các Entity đã lấy (Dùng '|| undefined')
      user: user || undefined,
      dealType: dealType || undefined,
      condition: condition || undefined,
      postType: postType || undefined,
      category: category || undefined,
      subCategory: subCategory || undefined,
      productType: productType || undefined,
      origin: origin || undefined,
      material: material || undefined,
      size: size || undefined,
      brand: brand || undefined,
      productModel: productModel || undefined,
      color: color || undefined,
      capacity: capacity || undefined,
      warranty: warranty || undefined,
      processor: processor || undefined,
      ramOption: ramOption || undefined,
      storageType: storageType || undefined,
      graphicsCard: graphicsCard || undefined,
      breed: breed || undefined,
      ageRange: ageRange || undefined,
      gender: gender || undefined,
      engineCapacity: engineCapacity || undefined,
      category_change: category_change || undefined,
      sub_category_change: sub_category_change || undefined, // Các trường gán thủ công

      address_json: data.address_json ? JSON.parse(data.address_json) : {},
      is_approved: false,
      thumbnail_url: files && files.length > 0 ? files[0].path : null,
    });

    const savedProduct = await this.productRepo.save(product);

    // 4. Lưu ảnh
    if (files && files.length > 0) {
      const imagesToSave = files.map((file) =>
        this.imageRepo.create({
          product: { id: savedProduct.id },
          name: savedProduct.name,
          image_url: file.path,
        }),
      );
      await this.imageRepo.save(imagesToSave);
      this.logger.log(
        `🖼️ Đã lưu ${imagesToSave.length} ảnh cho sản phẩm ID=${savedProduct.id}`,
      );
    }

    // 5. Gửi thông báo
    if (savedProduct) {
      this.notificationService
        .notifyUserOfPostSuccess(savedProduct)
        .catch((err) =>
          this.logger.error(
            'Lỗi (từ service) notifyUserOfPostSuccess:',
            err.message,
          ),
        );
      this.notificationService
        .notifyAdminsOfNewPost(savedProduct)
        .catch((err) =>
          this.logger.error(
            'Lỗi (từ service) notifyAdminsOfNewPost:',
            err.message,
          ),
        );
    }

    // 6. Trả về sản phẩm đầy đủ (Query lại để lấy đủ relations)
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
        'origin',
        'material',
        'size',
        'brand',
        'color',
        'capacity',
        'warranty',
        'productModel',
        'processor',
        'ramOption',
        'storageType',
        'graphicsCard',
        'breed',
        'ageRange',
        'gender',
        'engineCapacity',
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
        'origin',
        'material',
        'size',
        'brand',
        'color',
        'capacity',
        'warranty',
        'productModel',
        'processor',
        'ramOption',
        'storageType',
        'graphicsCard',
        'breed',
        'ageRange',
        'gender',
        'engineCapacity',
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
        'origin',
        'material',
        'size',
        'brand',
        'color',
        'capacity',
        'warranty',
        'productModel',
        'processor',
        'ramOption',
        'storageType',
        'graphicsCard',
        'breed',
        'ageRange',
        'gender',
        'engineCapacity',
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
        'origin',
        'material',
        'size',
        'brand',
        'color',
        'capacity',
        'warranty',
        'productModel',
        'processor',
        'ramOption',
        'storageType',
        'graphicsCard',
        'breed',
        'ageRange',
        'gender',
        'engineCapacity',
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
        user_id: p.user?.id, // Sửa: Lấy từ p.user.id
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
        mileage: p.mileage ?? null, // Sửa: Dùng ??
        // ===== SỬA LỖI FORMAT (p.FIELD.id) TỪ ĐÂY =====

        postType: p.postType
          ? { id: p.postType.id, name: p.postType.name }
          : null,
        productType: p.productType
          ? { id: p.productType.id, name: p.productType.name }
          : null,
        origin: p.origin ? { id: p.origin.id, name: p.origin.name } : null,
        material: p.material
          ? { id: p.material.id, name: p.material.name } // Sửa: .id
          : null,
        size: p.size ? { id: p.size.id, name: p.size.name } : null, // Sửa: .id
        brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null, // Sửa: .id
        color: p.color ? { id: p.color.id, name: p.color.name } : null, // Sửa: .id
        capacity: p.capacity
          ? { id: p.capacity.id, name: p.capacity.name }
          : null, // Sửa: .id
        warranty: p.warranty
          ? { id: p.warranty.id, name: p.warranty.name }
          : null, // Sửa: .id
        productModel: p.productModel
          ? { id: p.productModel.id, name: p.productModel.name }
          : null, // Sửa: .id
        processor: p.processor
          ? { id: p.processor.id, name: p.processor.name }
          : null, // Sửa: .id
        ramOption: p.ramOption
          ? { id: p.ramOption.id, name: p.ramOption.name }
          : null, // Sửa: .id
        storageType: p.storageType
          ? { id: p.storageType.id, name: p.storageType.name }
          : null, // Sửa: .id
        graphicsCard: p.graphicsCard
          ? { id: p.graphicsCard.id, name: p.graphicsCard.name }
          : null, // Sửa: .id
        breed: p.breed ? { id: p.breed.id, name: p.breed.name } : null, // Sửa: .id
        ageRange: p.ageRange
          ? { id: p.ageRange.id, name: p.ageRange.name }
          : null, // Sửa: .id
        gender: p.gender ? { id: p.gender.id, name: p.gender.name } : null, // Sửa: .id
        engineCapacity: p.engineCapacity
          ? { id: p.engineCapacity.id, name: p.engineCapacity.name }
          : null, // Sửa: .id
        // ===== KẾT THÚC SỬA LỖI FORMAT =====

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
        'origin',
        'material',
        'size',
        'brand',
        'color',
        'capacity',
        'warranty',
        'productModel',
        'processor',
        'ramOption',
        'storageType',
        'graphicsCard',
        'engineCapacity',
      ],
    });

    if (!product) return null;

    return await this.formatProduct(product);
  }
}
