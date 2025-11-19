import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import AddressPicker from "../../components/AddressPicker";
import axios from "axios";
import { Alert } from "react-native";
import { path } from "../../config";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");
const PostFormScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  interface Category {
    id: string;
    name: string;
    image: string;
  }
  interface SubCategory {
    id: string;
    name: string;
  }
  const { category, subCategory } = route.params || {};

  const [title, setTitle] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);

  // 1. Lấy thông tin User từ bộ nhớ máy (AsyncStorage)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const userName = await AsyncStorage.getItem("userName");

        console.log("🔍 Kiểm tra AsyncStorage - userId:", userId);

        if (userId) {
          setUser({ id: Number(userId), name: userName || "User" });
        } else {
          console.log(
            "⚠️ Không tìm thấy userId trong bộ nhớ. Vui lòng đăng nhập lại."
          );
        }
      } catch (e) {
        console.error("Lỗi lấy user:", e);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch các nhóm mà user đã tham gia (Chạy khi user thay đổi)
  useEffect(() => {
    const fetchGroups = async () => {
      // Chỉ chạy khi đã có User ID
      if (!user?.id) return;

      console.log("============== GỌI API GROUP ==============");
      console.log("👤 User ID:", user.id);

      try {
        // Gọi API kèm params userId
        const res = await axios.get(`${path}/groups/my-public-joined`, {
          params: { userId: user.id },
        });

        console.log("✅ Kết quả:", res.data);

        if (Array.isArray(res.data)) {
          setGroups(res.data);
          setSelectedGroupId(null); // Reset về mặc định "Toàn trường"
        } else {
          setGroups([]);
        }
      } catch (err: any) {
        console.error("❌ Lỗi tải nhóm:", err.message);
      }
    };

    fetchGroups();
  }, [user]);

  const [conditionId, setConditionId] = useState<number | null>(null);
  const [productTypeId, setProductTypeId] = useState<number | null>(null);
  const [dealTypeId, setDealTypeId] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // STATE ĐANG TẢI
  const [isLoading, setIsLoading] = useState(false);

  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditions, setConditions] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(
    null
  );

  const handleSelectCondition = (id: number) => {
    setSelectedConditionId(id);
    setConditionId(id);
    setShowConditionModal(false);
  };

  const [postTypeId, setPostTypeId] = useState<number | null>(null);
  const [showPostTypeModal, setShowPostTypeModal] = useState(false);
  const [postTypes, setPostTypes] = useState<{ id: number; name: string }[]>(
    []
  );

  const handleSelectPostType = (id: number) => {
    setPostTypeId(id);
    setShowPostTypeModal(false);
  };

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [productTypes, setProductTypes] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<
    number | null
  >(null);

  const handleSelectProductType = (id: number) => {
    setSelectedProductTypeId(id);
    setProductTypeId(id);
    setShowTypeModal(false);
  };

  // State cho Xuất xứ
  const [originId, setOriginId] = useState<number | null>(null);
  const [origins, setOrigins] = useState<{ id: number; name: string }[]>([]);
  const [selectedOriginId, setSelectedOriginId] = useState<number | null>(null);
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const handleSelectOrigin = (id: number) => {
    setSelectedOriginId(id);
    setOriginId(id);
    setShowOriginModal(false);
  };

  // State cho Chất liệu
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  const handleSelectMaterial = (id: number) => {
    setSelectedMaterialId(id);
    setMaterialId(id);
    setShowMaterialModal(false);
  };

  // State cho Kích cỡ
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const handleSelectSize = (id: number) => {
    setSelectedSizeId(id);
    setSizeId(id);
    setShowSizeModal(false);
  };

  // State cho Hãng
  const [brandId, setBrandId] = useState<number | null>(null);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  // State cho Dòng
  const [productModelId, setProductModelId] = useState<number | null>(null);
  const [productModels, setProductModels] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedProductModelId, setSelectedProductModelId] = useState<
    number | null
  >(null);
  const [showProductModelModal, setShowProductModelModal] = useState(false);
  const [showProductModelDropdown, setShowProductModelDropdown] =
    useState(false);

  // State cho Màu sắc
  const [colorId, setColorId] = useState<number | null>(null);
  const [colors, setColors] = useState<{ id: number; name: string }[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // State cho Dung lượng
  const [capacityId, setCapacityId] = useState<number | null>(null);
  const [capacities, setCapacities] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCapacityId, setSelectedCapacityId] = useState<number | null>(
    null
  );
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);

  // State cho Bảo hành
  const [warrantyId, setWarrantyId] = useState<number | null>(null);
  const [warranties, setWarranties] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<number | null>(
    null
  );
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showWarrantyDropdown, setShowWarrantyDropdown] = useState(false);

  // State cho Bộ vi xử lý
  const [processorId, setProcessorId] = useState<number | null>(null);
  const [processors, setProcessors] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedProcessorId, setSelectedProcessorId] = useState<number | null>(
    null
  );
  const [showProcessorModal, setShowProcessorModal] = useState(false);
  const [showProcessorDropdown, setShowProcessorDropdown] = useState(false);

  // State cho RAM
  const [ramOptionId, setRamOptionId] = useState<number | null>(null);
  const [ramOptions, setRamOptions] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedRamOptionId, setSelectedRamOptionId] = useState<number | null>(
    null
  );
  const [showRamOptionModal, setShowRamOptionModal] = useState(false);
  const [showRamOptionDropdown, setShowRamOptionDropdown] = useState(false);

  // State cho Loại ổ cứng
  const [storageTypeId, setStorageTypeId] = useState<number | null>(null);
  const [storageTypes, setStorageTypes] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedStorageTypeId, setSelectedStorageTypeId] = useState<
    number | null
  >(null);
  const [showStorageTypeModal, setShowStorageTypeModal] = useState(false);
  const [showStorageTypeDropdown, setShowStorageTypeDropdown] = useState(false);

  // State cho Card màn hình
  const [graphicsCardId, setGraphicsCardId] = useState<number | null>(null);
  const [graphicsCards, setGraphicsCards] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedGraphicsCardId, setSelectedGraphicsCardId] = useState<
    number | null
  >(null);
  const [showGraphicsCardModal, setShowGraphicsCardModal] = useState(false);
  const [showGraphicsCardDropdown, setShowGraphicsCardDropdown] =
    useState(false);

  // State cho Giống (Thú cưng)
  const [breedId, setBreedId] = useState<number | null>(null);
  const [breeds, setBreeds] = useState<{ id: number; name: string }[]>([]);
  const [selectedBreedId, setSelectedBreedId] = useState<number | null>(null);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  // State cho Độ tuổi (Thú cưng)
  const [ageRangeId, setAgeRangeId] = useState<number | null>(null);
  const [ageRanges, setAgeRanges] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedAgeRangeId, setSelectedAgeRangeId] = useState<number | null>(
    null
  );
  const [showAgeRangeModal, setShowAgeRangeModal] = useState(false);
  const [showAgeRangeDropdown, setShowAgeRangeDropdown] = useState(false);

  // State cho Giới tính (Thú cưng)
  const [genderId, setGenderId] = useState<number | null>(null);
  const [genders, setGenders] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // State cho Dung tích xe (Xe máy)
  const [engineCapacityId, setEngineCapacityId] = useState<number | null>(null);
  const [engineCapacities, setEngineCapacities] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedEngineCapacityId, setSelectedEngineCapacityId] = useState<
    number | null
  >(null);
  const [showEngineCapacityModal, setShowEngineCapacityModal] = useState(false);
  const [showEngineCapacityDropdown, setShowEngineCapacityDropdown] =
    useState(false);

  // State cho Số km đã đi (Xe cộ)
  const [mileage, setMileage] = useState("");
  const [showMileageInput, setShowMileageInput] = useState(false);

  // STATE CHO NHÓM/KHOA
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Hàm xử lý chọn nhóm
  const handleSelectGroup = (id: number | null) => {
    setSelectedGroupId(id);
    setShowGroupModal(false);
  };

  // Fetch các nhóm mà user đã tham gia
  useEffect(() => {
    if (user?.id) {
      // Gọi endpoint chỉ lấy nhóm PUBLIC đã tham gia
      axios
        .get(`${path}/groups/my-public-joined`)
        .then((res) => {
          setGroups(res.data);
        })
        .catch((err) => console.log("Lỗi tải nhóm:", err));
    }
  }, [user]);

  // Loaders
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [isLoadingCapacities, setIsLoadingCapacities] = useState(false);
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);

  const [isLoadingProcessors, setIsLoadingProcessors] = useState(false);
  const [isLoadingRamOptions, setIsLoadingRamOptions] = useState(false);
  const [isLoadingStorageTypes, setIsLoadingStorageTypes] = useState(false);
  const [isLoadingGraphicsCards, setIsLoadingGraphicsCards] = useState(false);

  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
  const [isLoadingAgeRanges, setIsLoadingAgeRanges] = useState(false);
  const [isLoadingGenders, setIsLoadingGenders] = useState(false);

  const [isLoadingEngineCapacities, setIsLoadingEngineCapacities] =
    useState(false);

  const [exchangeCategory, setExchangeCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [exchangeSubCategory, setExchangeSubCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [dealTypes, setDealTypes] = useState<{ id: number; name: string }[]>(
    []
  );
  const [showDealTypeModal, setShowDealTypeModal] = useState(false);

  // === CÁC HÀM HANDLE SELECT ===

  const handleSelectDealType = (id: number) => {
    setDealTypeId(id);
    setShowDealTypeModal(false);

    if (id === 1) {
      setIsFree(false);
    } else if (id === 2) {
      setPrice("0");
      setIsFree(true);
    } else if (id === 3) {
      setPrice("0");
      setIsFree(false);
    }
  };

  const handleSelectBrand = (id: number) => {
    setSelectedBrandId(id);
    setShowBrandModal(false);

    if (id === brandId) {
      console.log("Đã chọn lại cùng hãng, tự gọi fetch...");
      fetchProductModels(id);
    } else {
      setBrandId(id);
    }
  };

  const handleSelectProductModel = (id: number) => {
    setSelectedProductModelId(id);
    setProductModelId(id);
    setShowProductModelModal(false);
  };

  const handleSelectColor = (id: number) => {
    setSelectedColorId(id);
    setColorId(id);
    setShowColorModal(false);
  };

  const handleSelectCapacity = (id: number) => {
    setSelectedCapacityId(id);
    setCapacityId(id);
    setShowCapacityModal(false);
  };

  const handleSelectWarranty = (id: number) => {
    setSelectedWarrantyId(id);
    setWarrantyId(id);
    setShowWarrantyModal(false);
  };

  // ===== BẮT ĐẦU THÊM 4 HÀM HANDLE MỚI (LAPTOP) =====
  const handleSelectProcessor = (id: number) => {
    setSelectedProcessorId(id);
    setProcessorId(id);
    setShowProcessorModal(false);
  };

  const handleSelectRamOption = (id: number) => {
    setSelectedRamOptionId(id);
    setRamOptionId(id);
    setShowRamOptionModal(false);
  };

  const handleSelectStorageType = (id: number) => {
    setSelectedStorageTypeId(id);
    setStorageTypeId(id);
    setShowStorageTypeModal(false);
  };

  const handleSelectGraphicsCard = (id: number) => {
    setSelectedGraphicsCardId(id);
    setGraphicsCardId(id);
    setShowGraphicsCardModal(false);
  };

  const handleSelectBreed = (id: number) => {
    setSelectedBreedId(id);
    setBreedId(id);
    setShowBreedModal(false);
  };

  const handleSelectAgeRange = (id: number) => {
    setSelectedAgeRangeId(id);
    setAgeRangeId(id);
    setShowAgeRangeModal(false);
  };

  const handleSelectGender = (id: number) => {
    setSelectedGenderId(id);
    setGenderId(id);
    setShowGenderModal(false);
  };

  const handleSelectEngineCapacity = (id: number) => {
    setSelectedEngineCapacityId(id);
    setEngineCapacityId(id);
    setShowEngineCapacityModal(false);
  };

  // Hàm xử lý ảnh mới
  const processImageForUpload = async (uri: string) => {
    try {
      console.log("Đang xử lý ảnh:", uri);
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1080 } }, // Thay đổi kích thước, giữ tỷ lệ
        ],
        {
          compress: 0.7, // Nén ảnh (0.7 = 70% chất lượng)
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      console.log("Đã xử lý xong:", manipResult.uri);
      return manipResult.uri; // Trả về uri của ảnh mới đã nén
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh:", error);
      return uri; // Nếu lỗi, trả về ảnh gốc (rủi ro)
    }
  };

  const handleUploadImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, // Giảm chất lượng ngay khi chụp
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4,
        quality: 1,
      });
    }

    if (!result.canceled && result.assets) {
      // Kiểm tra giới hạn TỔNG SỐ ẢNH
      if (images.length + result.assets.length > 4) {
        alert("Bạn chỉ được chọn tối đa 4 ảnh.");
        return;
      }

      const selected: string[] = []; // Bật loading hoặc spinner ở đây nếu bạn muốn
      console.log("Bắt đầu xử lý nén ảnh...");

      for (const asset of result.assets) {
        // LUÔN LUÔN xử lý ảnh (nén + resize)
        const processedUri = await processImageForUpload(asset.uri);
        selected.push(processedUri);
      }
      console.log("Đã xử lý ảnh xong."); // Tắt loading
      setImages((prev) => [...prev, ...selected]);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Cần quyền truy cập camera để chụp ảnh");
      }
    })();
  }, []);

  // Hàm xóa ảnh
  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Hàm đăng bài
  const handlePost = async () => {
    if (isLoading) return;

    const finalName =
      title && title.trim() !== ""
        ? title.trim()
        : name && name.trim() !== ""
          ? name.trim()
          : "";

    // VALIDATION (Kiểm tra thiếu trường)
    const missingFields: string[] = [];
    if (!category) missingFields.push("Danh mục cha");
    if (!subCategory) missingFields.push("Danh mục con");
    if (!finalName) missingFields.push("Tên sản phẩm");
    if (!description || description.trim() === "")
      missingFields.push("Mô tả sản phẩm");
    if (category?.name !== "Thú cưng" && !conditionId) {
      missingFields.push("Tình trạng sản phẩm");
    }
    if (showProductTypeDropdown && !productTypeId)
      missingFields.push("Loại sản phẩm");
    if (showMaterialDropdown && !materialId) missingFields.push("Chất liệu");
    if (showSizeDropdown && !sizeId) missingFields.push("Kích cỡ");
    if (showBrandDropdown && !brandId) missingFields.push("Hãng");
    if (showProductModelDropdown && !productModelId) missingFields.push("Dòng");
    if (showColorDropdown && !colorId) missingFields.push("Màu sắc");
    if (showCapacityDropdown && !capacityId) missingFields.push("Dung lượng");
    if (showWarrantyDropdown && !warrantyId) missingFields.push("Bảo hành");
    if (showOriginDropdown && !originId) missingFields.push("Xuất xứ");

    if (showProcessorDropdown && !processorId)
      missingFields.push("Bộ vi xử lý");
    if (showRamOptionDropdown && !ramOptionId) missingFields.push("RAM");
    if (showStorageTypeDropdown && !storageTypeId)
      missingFields.push("Loại ổ cứng");
    if (showGraphicsCardDropdown && !graphicsCardId)
      missingFields.push("Card màn hình");

    if (showBreedDropdown && !breedId) missingFields.push("Giống");
    if (showAgeRangeDropdown && !ageRangeId) missingFields.push("Độ tuổi");
    if (showGenderDropdown && !genderId) missingFields.push("Giới tính");

    if (showEngineCapacityDropdown && !engineCapacityId)
      missingFields.push("Dung tích xe");
    if (showMileageInput && !mileage) missingFields.push("Số km đã đi");

    if (showAuthorField && !author) missingFields.push("Tác giả");
    if (showYearField && !year) missingFields.push("Năm sản xuất");
    if (!dealTypeId) missingFields.push("Hình thức giao dịch");
    if (!postTypeId) missingFields.push("Loại bài đăng");
    if (images.length === 0)
      missingFields.push("Hình ảnh sản phẩm (ít nhất 1 ảnh)");
    if (!address || address.trim() === "")
      missingFields.push("Địa chỉ giao dịch");
    if (dealTypeId === 1 && (!price || parseFloat(price) <= 0))
      missingFields.push("Giá bán (phải > 0 nếu bán có giá)");

    if (missingFields.length > 0) {
      Alert.alert(
        "Thiếu thông tin",
        `Vui lòng điền đầy đủ các trường bắt buộc: ${missingFields.join(
          ", "
        )}.`,
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // 1. Các trường bắt buộc (String)
      formData.append("name", finalName);
      formData.append("description", description);
      formData.append("price", dealTypeId === 1 ? String(price) : "0");
      formData.append("address_json", JSON.stringify({ full: address }));

      // 2. Các trường bắt buộc (Number)
      formData.append("user_id", String(user?.id));
      formData.append("post_type_id", String(postTypeId));
      formData.append("deal_type_id", String(dealTypeId));
      formData.append("category_id", String((category as any)?.id));
      formData.append("sub_category_id", String(subCategory?.id));

      if (selectedGroupId) {
        // Nếu có chọn nhóm -> Gửi ID nhóm và visibility_type = 1
        formData.append("group_id", String(selectedGroupId));
        formData.append("visibility_type", "1");
      } else {
        // Nếu không chọn (null) -> visibility_type = 0 (Toàn trường)
        formData.append("visibility_type", "0");
      }
      
      if (conditionId) {
        formData.append("condition_id", String(conditionId));
      }

      // 4. Các trường tùy chọn (Optional)
      if (productTypeId)
        formData.append("product_type_id", String(productTypeId));
      if (materialId) formData.append("material_id", String(materialId));
      if (sizeId) formData.append("size_id", String(sizeId));
      if (brandId) formData.append("brand_id", String(brandId));
      if (productModelId)
        formData.append("product_model_id", String(productModelId));
      if (colorId) formData.append("color_id", String(colorId));
      if (capacityId) formData.append("capacity_id", String(capacityId));
      if (warrantyId) formData.append("warranty_id", String(warrantyId));
      if (originId) formData.append("origin_id", String(originId));
      if (author) formData.append("author", author);
      if (year) formData.append("year", String(year));

      if (processorId) formData.append("processor_id", String(processorId));
      if (ramOptionId) formData.append("ram_option_id", String(ramOptionId));
      if (storageTypeId)
        formData.append("storage_type_id", String(storageTypeId));
      if (graphicsCardId)
        formData.append("graphics_card_id", String(graphicsCardId));

      if (breedId) formData.append("breed_id", String(breedId));
      if (ageRangeId) formData.append("age_range_id", String(ageRangeId));
      if (genderId) formData.append("gender_id", String(genderId));

      if (engineCapacityId)
        formData.append("engine_capacity_id", String(engineCapacityId));
      // Gửi đi số km (bỏ dấu chấm)
      if (mileage) formData.append("mileage", mileage.replace(/\D/g, ""));

      if (dealTypeId === 3 && exchangeCategory && exchangeSubCategory) {
        formData.append("category_change_id", String(exchangeCategory.id));
        formData.append(
          "sub_category_change_id",
          String(exchangeSubCategory.id)
        );
      }

      // 5. Hình ảnh
      images.forEach((uri, index) => {
        const filename = uri.split("/").pop();
        const ext = filename?.split(".").pop();
        const type = ext ? `image/${ext}` : "image/jpeg";
        formData.append("files", {
          uri,
          name: filename || `photo_${index}.jpg`,
          type,
        } as any);
      });

      console.log("FormData sẽ gửi đi:", formData);

      const response = await axios.post(`${path}/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Thành công", "Đăng tin thành công. Đang chờ duyệt");
        navigation.navigate("Home");
      } else {
        Alert.alert("Lỗi", "Không thể đăng tin. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Lỗi khi đăng tin:", err);

      if (err.response && err.response.status === 400) {
        Alert.alert(
          "Thông tin không hợp lệ",
          err.response.data.message ||
            "Vui lòng kiểm tra lại các trường đã nhập."
        );
      } else if (err.message === "Network Error") {
        Alert.alert(
          "Lỗi mạng",
          "Không thể kết nối đến server. Vui lòng kiểm tra lại đường dẫn API và tường lửa."
        );
      } else {
        Alert.alert(
          "Lỗi máy chủ",
          "Đã xảy ra lỗi phía máy chủ, vui lòng thử lại sau."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true); // Bật loading
      try {
        const [conditionRes, dealTypeRes, postTypeRes] = await Promise.all([
          axios.get(`${path}/conditions`),
          axios.get(`${path}/deal-types`),
          axios.get(`${path}/post-types`),
        ]);

        if (conditionRes.status === 200) setConditions(conditionRes.data);
        if (dealTypeRes.status === 200) setDealTypes(dealTypeRes.data);
        if (postTypeRes.status === 200) setPostTypes(postTypeRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        Alert.alert("Lỗi", "Không thể tải các tùy chọn cơ bản.");
      } finally {
        setIsLoadingOptions(false); // Tắt loading
      }
    };
    fetchOptions();
  }, []);

  const categoryId = category?.id;
  const subCategoryId = subCategory?.id;

  const [showProductTypeDropdown, setShowProductTypeDropdown] = useState(false);
  const [showAuthorField, setShowAuthorField] = useState(false);
  const [showYearField, setShowYearField] = useState(false);

  const [author, setAuthor] = useState("");
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    // --- HÀM FETCH LOẠI SẢN PHẨM ---
    const fetchProductTypes = async () => {
      setShowProductTypeDropdown(false);
      setSelectedProductTypeId(null);
      setProductTypeId(null);
      if (!categoryId) return;
      setIsLoadingProductTypes(true);
      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/product-types/by-sub-category/${subCategoryId}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setProductTypes(data);
              setShowTypeModal(false);
              setShowProductTypeDropdown(true);
              setIsLoadingProductTypes(false);
              return;
            }
          }
        } catch (err) {
          console.warn(
            `[Loại SP] Không tìm thấy CỤ THỂ cho ${subCategoryId}, fallback...`
          );
        }
      }
      try {
        const res = await fetch(
          `${path}/product-types/by-category/${categoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProductTypes(data);
            setShowTypeModal(false);
            setShowProductTypeDropdown(true);
          } else {
            setShowProductTypeDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch loại SP chung:", (err as Error).message);
        setShowProductTypeDropdown(false);
      } finally {
        setIsLoadingProductTypes(false);
      }
    };

    // --- HÀM FETCH XUẤT XỨ ---
    const fetchOrigins = async () => {
      setShowOriginDropdown(false);
      setSelectedOriginId(null);
      setOriginId(null);
      if (!categoryId) return;
      setIsLoadingOrigins(true);
      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/origins/by-sub-category/${subCategoryId}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setOrigins(data);
              setShowOriginModal(false);
              setShowOriginDropdown(true);
              setIsLoadingOrigins(false);
              return;
            }
          }
        } catch (err) {
          console.warn(
            `[Xuất xứ] Không tìm thấy theo SubCat ${subCategoryId}, fallback...`
          );
        }
      }
      try {
        const res = await fetch(`${path}/origins/by-category/${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setOrigins(data);
            setShowOriginModal(false);
            setShowOriginDropdown(true);
          } else {
            setShowOriginDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch xuất xứ:", (err as Error).message);
        setShowOriginDropdown(false);
      } finally {
        setIsLoadingOrigins(false);
      }
    };

    // --- HÀM FETCH CHẤT LIỆU ---
    const fetchMaterials = async () => {
      setShowMaterialDropdown(false);
      setSelectedMaterialId(null);
      setMaterialId(null);
      if (!categoryId) return;
      setIsLoadingMaterials(true);
      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/materials/by-sub-category/${subCategoryId}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setMaterials(data);
              setShowMaterialModal(false);
              setShowMaterialDropdown(true);
              setIsLoadingMaterials(false);
              return;
            }
          }
        } catch (err) {
          console.warn(
            `[Chất liệu] Không tìm thấy theo SubCat ${subCategoryId}, fallback...`
          );
        }
      }
      try {
        const res = await fetch(`${path}/materials/by-category/${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMaterials(data);
            setShowMaterialModal(false);
            setShowMaterialDropdown(true);
          } else {
            setShowMaterialDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch chất liệu:", (err as Error).message);
        setShowMaterialDropdown(false);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    // --- HÀM FETCH KÍCH CỠ ---
    const fetchSizes = async () => {
      setShowSizeDropdown(false);
      setSelectedSizeId(null);
      setSizeId(null);
      if (!subCategoryId) return;
      setIsLoadingSizes(true);
      try {
        const res = await fetch(
          `${path}/sizes/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSizes(data);
            setShowSizeModal(false);
            setShowSizeDropdown(true);
          } else {
            setShowSizeDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch kích cỡ:", (err as Error).message);
        setShowSizeDropdown(false);
      } finally {
        setIsLoadingSizes(false);
      }
    };

    // --- HÀM FETCH HÃNG ---
    const fetchBrands = async () => {
      setShowBrandDropdown(false);
      setSelectedBrandId(null);
      setBrandId(null);
      if (!subCategoryId) return;
      setIsLoadingBrands(true);
      try {
        const res = await fetch(
          `${path}/brands/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBrands(data);
            setShowBrandModal(false);
            setShowBrandDropdown(true);
          } else {
            setShowBrandDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch hãng:", (err as Error).message);
        setShowBrandDropdown(false);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    // --- HÀM FETCH MÀU SẮC ---
    const fetchColors = async () => {
      setShowColorDropdown(false);
      setSelectedColorId(null);
      setColorId(null);
      if (!subCategoryId) return;
      setIsLoadingColors(true);
      try {
        const res = await fetch(
          `${path}/colors/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setColors(data);
            setShowColorModal(false);
            setShowColorDropdown(true);
          } else {
            setShowColorDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch màu:", (err as Error).message);
        setShowColorDropdown(false);
      } finally {
        setIsLoadingColors(false);
      }
    };

    // --- HÀM FETCH DUNG LƯỢNG ---
    const fetchCapacities = async () => {
      setShowCapacityDropdown(false);
      setSelectedCapacityId(null);
      setCapacityId(null);
      if (!subCategoryId) return;
      setIsLoadingCapacities(true);
      try {
        const res = await fetch(
          `${path}/capacities/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCapacities(data);
            setShowCapacityModal(false);
            setShowCapacityDropdown(true);
          } else {
            setShowCapacityDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch dung lượng:", (err as Error).message);
        setShowCapacityDropdown(false);
      } finally {
        setIsLoadingCapacities(false);
      }
    };

    // --- HÀM FETCH BẢO HÀNH ---
    const fetchWarranties = async () => {
      setShowWarrantyDropdown(false);
      setSelectedWarrantyId(null);
      setWarrantyId(null);
      if (!subCategoryId) return;
      setIsLoadingWarranties(true);
      try {
        const res = await fetch(
          `${path}/warranties/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setWarranties(data);
            setShowWarrantyModal(false);
            setShowWarrantyDropdown(true);
          } else {
            setShowWarrantyDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch bảo hành:", (err as Error).message);
        setShowWarrantyDropdown(false);
      } finally {
        setIsLoadingWarranties(false);
      }
    };

    // --- HÀM FETCH BỘ VI XỬ LÝ ---
    const fetchProcessors = async () => {
      setShowProcessorDropdown(false);
      setSelectedProcessorId(null);
      setProcessorId(null);
      if (!subCategoryId) return;
      setIsLoadingProcessors(true);
      try {
        const res = await fetch(
          `${path}/processors/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProcessors(data);
            setShowProcessorModal(false);
            setShowProcessorDropdown(true);
          } else {
            setShowProcessorDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch BXL:", (err as Error).message);
        setShowProcessorDropdown(false);
      } finally {
        setIsLoadingProcessors(false);
      }
    };

    // --- HÀM FETCH RAM ---
    const fetchRamOptions = async () => {
      setShowRamOptionDropdown(false);
      setSelectedRamOptionId(null);
      setRamOptionId(null);
      if (!subCategoryId) return;
      setIsLoadingRamOptions(true);
      try {
        const res = await fetch(
          `${path}/ram-options/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setRamOptions(data);
            setShowRamOptionModal(false);
            setShowRamOptionDropdown(true);
          } else {
            setShowRamOptionDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch RAM:", (err as Error).message);
        setShowRamOptionDropdown(false);
      } finally {
        setIsLoadingRamOptions(false);
      }
    };

    // --- HÀM FETCH LOẠI Ổ CỨNG ---
    const fetchStorageTypes = async () => {
      setShowStorageTypeDropdown(false);
      setSelectedStorageTypeId(null);
      setStorageTypeId(null);
      if (!subCategoryId) return;
      setIsLoadingStorageTypes(true);
      try {
        const res = await fetch(
          `${path}/storage-types/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setStorageTypes(data);
            setShowStorageTypeModal(false);
            setShowStorageTypeDropdown(true);
          } else {
            setShowStorageTypeDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch loại ổ cứng:", (err as Error).message);
        setShowStorageTypeDropdown(false);
      } finally {
        setIsLoadingStorageTypes(false);
      }
    };

    // --- HÀM FETCH CARD MÀN HÌNH ---
    const fetchGraphicsCards = async () => {
      setShowGraphicsCardDropdown(false);
      setSelectedGraphicsCardId(null);
      setGraphicsCardId(null);
      if (!subCategoryId) return;
      setIsLoadingGraphicsCards(true);
      try {
        const res = await fetch(
          `${path}/graphics-cards/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setGraphicsCards(data);
            setShowGraphicsCardModal(false);
            setShowGraphicsCardDropdown(true);
          } else {
            setShowGraphicsCardDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch card MH:", (err as Error).message);
        setShowGraphicsCardDropdown(false);
      } finally {
        setIsLoadingGraphicsCards(false);
      }
    };

    // --- HÀM FETCH GIỐNG THÚ CƯNG ---
    const fetchBreeds = async () => {
      setShowBreedDropdown(false);
      setSelectedBreedId(null);
      setBreedId(null);
      if (!subCategoryId) return;
      setIsLoadingBreeds(true);
      try {
        const res = await fetch(
          `${path}/breeds/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBreeds(data);
            setShowBreedModal(false);
            setShowBreedDropdown(true);
          } else {
            setShowBreedDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch giống thú cưng:", (err as Error).message);
        setShowBreedDropdown(false);
      } finally {
        setIsLoadingBreeds(false);
      }
    };

    // --- HÀM FETCH ĐỘ TUỔI ---
    const fetchAgeRanges = async () => {
      setShowAgeRangeDropdown(false);
      setSelectedAgeRangeId(null);
      setAgeRangeId(null);
      if (!subCategoryId) return;
      setIsLoadingAgeRanges(true);
      try {
        const res = await fetch(
          `${path}/age-ranges/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAgeRanges(data);
            setShowAgeRangeModal(false);
            setShowAgeRangeDropdown(true);
          } else {
            setShowAgeRangeDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch độ tuổi:", (err as Error).message);
        setShowAgeRangeDropdown(false);
      } finally {
        setIsLoadingAgeRanges(false);
      }
    };

    // --- HÀM FETCH GIỚI TÍNH ---
    const fetchGenders = async () => {
      setShowGenderDropdown(false);
      setSelectedGenderId(null);
      setGenderId(null);
      if (!subCategoryId) return;
      setIsLoadingGenders(true);
      try {
        const res = await fetch(
          `${path}/genders/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setGenders(data);
            setShowGenderModal(false);
            setShowGenderDropdown(true);
          } else {
            setShowGenderDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch giới tính:", (err as Error).message);
        setShowGenderDropdown(false);
      } finally {
        setIsLoadingGenders(false);
      }
    };

    // --- HÀM FETCH DUNG TÍCH XE ---
    const fetchEngineCapacities = async () => {
      setShowEngineCapacityDropdown(false);
      setSelectedEngineCapacityId(null);
      setEngineCapacityId(null);
      if (!subCategoryId) return;
      setIsLoadingEngineCapacities(true);
      try {
        const res = await fetch(
          `${path}/engine-capacities/by-sub-category/${subCategoryId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setEngineCapacities(data);
            setShowEngineCapacityModal(false);
            setShowEngineCapacityDropdown(true);
          } else {
            setShowEngineCapacityDropdown(false);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch dung tích xe:", (err as Error).message);
        setShowEngineCapacityDropdown(false);
      } finally {
        setIsLoadingEngineCapacities(false);
      }
    };

    //  LOGIC CHẠY CHÍNH

    // 1. Reset tất cả các trường
    setShowAuthorField(false);
    setShowYearField(false);
    setShowProductTypeDropdown(false);
    setShowOriginDropdown(false);
    setShowMaterialDropdown(false);
    setShowSizeDropdown(false);
    setShowBrandDropdown(false);
    setShowColorDropdown(false);
    setShowCapacityDropdown(false);
    setShowWarrantyDropdown(false);
    setShowProcessorDropdown(false);
    setShowRamOptionDropdown(false);
    setShowStorageTypeDropdown(false);
    setShowGraphicsCardDropdown(false);
    setShowBreedDropdown(false);
    setShowAgeRangeDropdown(false);
    setShowGenderDropdown(false);
    setShowEngineCapacityDropdown(false);
    setShowMileageInput(false);

    // Tắt loading (nếu có)
    setIsLoadingProductTypes(false);
    setIsLoadingOrigins(false);
    setIsLoadingMaterials(false);
    setIsLoadingSizes(false);
    setIsLoadingBrands(false);
    setIsLoadingColors(false);
    setIsLoadingCapacities(false);
    setIsLoadingWarranties(false);
    setIsLoadingProcessors(false);
    setIsLoadingRamOptions(false);
    setIsLoadingStorageTypes(false);
    setIsLoadingGraphicsCards(false);
    setIsLoadingBreeds(false);
    setIsLoadingAgeRanges(false);
    setIsLoadingGenders(false);
    setIsLoadingEngineCapacities(false);

    // Reset giá trị
    setProductTypeId(null);
    setOriginId(null);
    setMaterialId(null);
    setSizeId(null);
    setBrandId(null);
    setColorId(null);
    setCapacityId(null);
    setWarrantyId(null);
    setProcessorId(null);
    setRamOptionId(null);
    setStorageTypeId(null);
    setGraphicsCardId(null);
    setBreedId(null);
    setAgeRangeId(null);
    setGenderId(null);
    setEngineCapacityId(null);
    setMileage("");
    setAuthor("");
    setYear(null);

    // Nếu là "Thú cưng" (ID 5) hoặc "Tài liệu khoa" (ID 1)
    if (category?.name === "Tài liệu khoa") {
      setShowAuthorField(true);
      setShowYearField(true);
    } else if (category?.name === "Thú cưng") {
      // (ID 53, 54, 55, 56, 57)
      const petSubIds = [53, 54, 55, 56, 57];
      if (petSubIds.includes(Number(subCategoryId))) {
        fetchBreeds();
        fetchAgeRanges();
        fetchGenders();
      }
    }
    // 2. Nếu là danh mục khác
    else {
      const subIdNum = Number(subCategoryId);

      // Chạy chung
      fetchProductTypes();
      fetchOrigins();

      // Đồ gia dụng (23, 24)
      if ([23, 24].includes(subIdNum)) {
        fetchMaterials();
      }

      // Kích cỡ (Giường 25, Đồ điện tử 39, 40, 41, Xe cộ 49, 51, 52)
      if ([25, 39, 40, 41, 62].includes(subIdNum)) {
        fetchSizes();
      }

      // Hãng (Đồ điện tử 38, 39, 40, 46, Xe cộ 49, 51, 52)
      if ([38, 39, 40, 46, 60, 61, 62].includes(subIdNum)) {
        fetchBrands();
      }

      // Màu sắc, Bảo hành: (Áp dụng cho Đồ điện tử VÀ Xe cộ)
      if ([38, 39, 40, 41, 60, 61, 62].includes(subIdNum)) {
        fetchColors();
        fetchWarranties();
      } else {
        setShowColorDropdown(false);
        setColorId(null);
        setShowWarrantyDropdown(false);
        setWarrantyId(null);
      }

      // Dung lượng (Storage): (Chỉ cho Đồ điện tử)
      if ([38, 39, 40, 41].includes(subIdNum)) {
        fetchCapacities();
      } else {
        setShowCapacityDropdown(false);
        setCapacityId(null);
      }

      // Bảo hành (Cho các mục con khác 42-48)
      if ([42, 43, 44, 45, 46, 47, 48].includes(subIdNum)) {
        fetchWarranties();
      }

      // Laptop & PC (40, 41)
      if ([40, 41].includes(subIdNum)) {
        fetchProcessors();
        fetchRamOptions();
        fetchStorageTypes();
        fetchGraphicsCards();
      }

      // Xe cộ (60, 61, 62)
      if ([60, 61, 62].includes(subIdNum)) {
        setShowYearField(true); // Bật Năm sản xuất (cho cả 3)

        if (subIdNum === 60) {
          // Chỉ Xe máy (60)
          setShowMileageInput(true); // Bật Số km
          fetchEngineCapacities(); // Bật Dung tích xe
        } else {
          // Ẩn (Xe điện 61, Xe đạp 62)
          setShowMileageInput(false);
          setMileage("");
          setShowEngineCapacityDropdown(false);
          setEngineCapacityId(null);
        }
      }
    }
  }, [category, categoryId, subCategoryId]);

  const fetchProductModels = useCallback(
    async (currentBrandId: number | null) => {
      // 1. Reset
      setShowProductModelDropdown(false);
      setSelectedProductModelId(null);
      setProductModelId(null);

      // 2. Nếu không có brandId, thì dừng lại
      if (!currentBrandId) return;

      // 3. Bật loading
      setIsLoadingModels(true);

      console.log(`[Dòng] Đang tìm dòng cho BrandID ${currentBrandId}...`);
      try {
        const res = await fetch(
          `${path}/product-models/by-brand/${currentBrandId}` // <-- API DÒNG MÁY
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            console.log(`[Dòng] Tìm thấy ${data.length} dòng.`);
            setProductModels(data);
            setShowProductModelModal(false);
            setShowProductModelDropdown(true); // ✅ HIỂN THỊ
          } else {
            console.log(`[Dòng] Không tìm thấy cho BrandID ${currentBrandId}`);
            setShowProductModelDropdown(false); // ẨN
          }
        } else {
          console.log(
            `[Dòng] Không tìm thấy (non-ok) cho BrandID ${currentBrandId}`
          );
          setShowProductModelDropdown(false); // ẨN
        }
      } catch (err) {
        console.error("Lỗi fetch dòng:", (err as Error).message);
        setShowProductModelDropdown(false);
      } finally {
        setIsLoadingModels(false);
      }
    },
    [path]
  );

  useEffect(() => {
    fetchProductModels(brandId);
  }, [brandId, fetchProductModels]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.headerIcon}
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng tin</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Danh mục */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => navigation.navigate("ChooseCategoryScreen")}
          >
            <Text style={styles.dropdownLabel}>Danh mục sản phẩm</Text>
            <View style={styles.dropdownContent}>
              <Text
                style={styles.dropdownText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {category
                  ? `${category.name}${
                      subCategory ? ` - ${subCategory.name || subCategory}` : ""
                    }`
                  : "Chọn danh mục"}
              </Text>

              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upload hình ảnh */}
        <View style={styles.section}>
          <Text style={styles.dropdownLabel}>Hình ảnh sản phẩm</Text>

          <View style={{ flexDirection: "row", gap: 12, marginVertical: 8 }}>
            {/* Nút chọn từ thư viện */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleUploadImage(false)}
            >
              <MaterialCommunityIcons name="image" size={28} color="#f59e0b" />
              <Text style={styles.uploadText}>Chọn từ thư viện</Text>
            </TouchableOpacity>

            {/* Nút chụp ảnh */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleUploadImage(true)} // true = chụp ảnh
            >
              <MaterialCommunityIcons name="camera" size={28} color="#f59e0b" />
              <Text style={styles.uploadText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            Ảnh đầu tiên sẽ là ảnh chính của sản phẩm
          </Text>

          <View style={styles.imageRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={{ position: "relative", marginRight: 8 }}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  onPress={() => removeImage(idx)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Tên sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.dropdownLabel}>Tên sản phẩm</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên sản phẩm *"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.helperText}>Nhập tên sản phẩm của bạn</Text>
        </View>
        {isLoadingOptions && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải tùy chọn...</Text>
          </View>
        )}

        {/* Tình trạng sản phẩm */}
        {!isLoadingOptions && category?.name !== "Thú cưng" && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowConditionModal(true)}
            >
              <Text style={styles.dropdownLabel}>Tình trạng sản phẩm</Text>
              <View style={styles.dropdownContent}>
                <Text style={styles.dropdownText}>
                  {conditionId
                    ? conditions.find((item) => item.id === conditionId)
                        ?.name || "Không xác định"
                    : "Chọn tình trạng"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Chọn tình trạng sản phẩm của bạn
            </Text>
          </View>
        )}

        {/* Loading Giống */}
        {isLoadingBreeds && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải danh sách giống...</Text>
          </View>
        )}
        {/* Giống (Thú cưng) */}
        {showBreedDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBreedModal(true)}
            >
              <Text style={styles.dropdownLabel}>Giống thú cưng</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedBreedId
                    ? (breeds.find((t) => t.id === selectedBreedId)?.name ??
                      "Không xác định")
                    : "Chọn giống"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn giống của thú cưng</Text>
          </View>
        )}

        {/* Loading Độ tuổi */}
        {isLoadingAgeRanges && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải độ tuổi...</Text>
          </View>
        )}
        {/* Độ tuổi (Thú cưng) */}
        {showAgeRangeDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowAgeRangeModal(true)}
            >
              <Text style={styles.dropdownLabel}>Độ tuổi</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedAgeRangeId
                    ? (ageRanges.find((t) => t.id === selectedAgeRangeId)
                        ?.name ?? "Không xác định")
                    : "Chọn độ tuổi"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn độ tuổi của thú cưng</Text>
          </View>
        )}

        {/* Loading Giới tính */}
        {isLoadingGenders && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải giới tính...</Text>
          </View>
        )}
        {/* Giới tính (Thú cưng) */}
        {showGenderDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.dropdownLabel}>Giới tính</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedGenderId
                    ? (genders.find((t) => t.id === selectedGenderId)?.name ??
                      "Không xác định")
                    : "Chọn giới tính"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn giới tính của thú cưng</Text>
          </View>
        )}

        {/* Loading Loại sản phẩm */}
        {isLoadingProductTypes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải loại sản phẩm...</Text>
          </View>
        )}
        {/* Loại sản phẩm */}
        {showProductTypeDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowTypeModal(true)}
            >
              <Text style={styles.dropdownLabel}>Loại sản phẩm</Text>
              <View style={styles.dropdownContent}>
                <ScrollView>
                  <Text style={styles.dropdownText}>
                    {selectedProductTypeId
                      ? (productTypes.find(
                          (t) => t.id === selectedProductTypeId
                        )?.name ?? "Không xác định")
                      : "Chọn loại sản phẩm"}
                  </Text>
                </ScrollView>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn loại sản phẩm của bạn</Text>
          </View>
        )}

        {/* Loading Hãng */}
        {isLoadingBrands && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải danh sách hãng...</Text>
          </View>
        )}
        {/* Hãng */}
        {showBrandDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBrandModal(true)}
            >
              <Text style={styles.dropdownLabel}>Hãng</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedBrandId
                    ? (brands.find((t) => t.id === selectedBrandId)?.name ??
                      "Không xác định")
                    : "Chọn hãng"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn hãng sản xuất</Text>
          </View>
        )}

        {/* Loading Dòng */}
        {isLoadingModels && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải dòng...</Text>
          </View>
        )}
        {/* Dòng */}
        {showProductModelDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowProductModelModal(true)}
            >
              <Text style={styles.dropdownLabel}>Dòng</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedProductModelId
                    ? (productModels.find(
                        (t) => t.id === selectedProductModelId
                      )?.name ?? "Không xác định")
                    : "Chọn dòng"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn dòng (model)</Text>
          </View>
        )}
        {/* Loading Dung tích xe */}
        {isLoadingEngineCapacities && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải dung tích xe...</Text>
          </View>
        )}
        {/* Dung tích xe */}
        {showEngineCapacityDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowEngineCapacityModal(true)}
            >
              <Text style={styles.dropdownLabel}>Dung tích xe</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedEngineCapacityId
                    ? (engineCapacities.find(
                        (t) => t.id === selectedEngineCapacityId
                      )?.name ?? "Không xác định")
                    : "Chọn dung tích xe (cc)"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn dung tích (cc) của xe</Text>
          </View>
        )}

        {/* Số km đã đi (TextInput) */}
        {showMileageInput && (
          <View style={styles.section}>
            <Text style={styles.dropdownLabel}>Số km đã đi (Odometer)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số km đã đi (ví dụ: 15000)"
              value={mileage}
              onChangeText={(text) => {
                const numeric = text.replace(/\D/g, "").slice(0, 9); // Bỏ dấu chấm
                setMileage(numeric);
              }}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>Nhập số km xe đã di chuyển</Text>
          </View>
        )}
        {/* ===== BẮT ĐẦU THÊM 4 JSX MỚI (LAPTOP) ===== */}

        {/* Loading Bộ vi xử lý */}
        {isLoadingProcessors && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải bộ vi xử lý...</Text>
          </View>
        )}
        {/* Bộ vi xử lý */}
        {showProcessorDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowProcessorModal(true)}
            >
              <Text style={styles.dropdownLabel}>Bộ vi xử lý</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedProcessorId
                    ? (processors.find((t) => t.id === selectedProcessorId)
                        ?.name ?? "Không xác định")
                    : "Chọn bộ vi xử lý"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn bộ vi xử lý (CPU)</Text>
          </View>
        )}

        {/* Loading RAM */}
        {isLoadingRamOptions && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải tùy chọn RAM...</Text>
          </View>
        )}
        {/* RAM */}
        {showRamOptionDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowRamOptionModal(true)}
            >
              <Text style={styles.dropdownLabel}>RAM</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedRamOptionId
                    ? (ramOptions.find((t) => t.id === selectedRamOptionId)
                        ?.name ?? "Không xác định")
                    : "Chọn dung lượng RAM"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn dung lượng RAM</Text>
          </View>
        )}

        {/* Loading Loại ổ cứng */}
        {isLoadingStorageTypes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải loại ổ cứng...</Text>
          </View>
        )}
        {/* Loại ổ cứng */}
        {showStorageTypeDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStorageTypeModal(true)}
            >
              <Text style={styles.dropdownLabel}>Loại ổ cứng</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedStorageTypeId
                    ? (storageTypes.find((t) => t.id === selectedStorageTypeId)
                        ?.name ?? "Không xác định")
                    : "Chọn loại ổ cứng"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn loại ổ cứng (SSD, HDD)</Text>
          </View>
        )}

        {/* Loading Card màn hình */}
        {isLoadingGraphicsCards && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải card màn hình...</Text>
          </View>
        )}
        {/* Card màn hình */}
        {showGraphicsCardDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowGraphicsCardModal(true)}
            >
              <Text style={styles.dropdownLabel}>Card màn hình</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedGraphicsCardId
                    ? (graphicsCards.find(
                        (t) => t.id === selectedGraphicsCardId
                      )?.name ?? "Không xác định")
                    : "Chọn card màn hình"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn card màn hình (GPU)</Text>
          </View>
        )}

        {/* ===== KẾT THÚC THÊM 4 JSX MỚI (LAPTOP) ===== */}

        {/* Loading Màu sắc */}
        {isLoadingColors && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải màu sắc...</Text>
          </View>
        )}
        {/* Màu sắc */}
        {showColorDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowColorModal(true)}
            >
              <Text style={styles.dropdownLabel}>Màu sắc</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedColorId
                    ? (colors.find((t) => t.id === selectedColorId)?.name ??
                      "Không xác định")
                    : "Chọn màu sắc"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn màu sắc sản phẩm</Text>
          </View>
        )}

        {/* Loading Dung lượng */}
        {isLoadingCapacities && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải dung lượng...</Text>
          </View>
        )}
        {/* Dung lượng */}
        {showCapacityDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCapacityModal(true)}
            >
              <Text style={styles.dropdownLabel}>Dung lượng</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedCapacityId
                    ? (capacities.find((t) => t.id === selectedCapacityId)
                        ?.name ?? "Không xác định")
                    : "Chọn dung lượng"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn dung lượng (ROM)</Text>
          </View>
        )}

        {/* Loading Bảo hành */}
        {isLoadingWarranties && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải bảo hành...</Text>
          </View>
        )}
        {/* Bảo hành */}
        {showWarrantyDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowWarrantyModal(true)}
            >
              <Text style={styles.dropdownLabel}>Bảo hành</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedWarrantyId
                    ? (warranties.find((t) => t.id === selectedWarrantyId)
                        ?.name ?? "Không xác định")
                    : "Chọn tình trạng bảo hành"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn tình trạng bảo hành</Text>
          </View>
        )}

        {/* Loading Kích cỡ */}
        {isLoadingSizes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải kích cỡ...</Text>
          </View>
        )}
        {/* Kích cỡ */}
        {showSizeDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSizeModal(true)}
            >
              <Text style={styles.dropdownLabel}>Kích cỡ</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedSizeId
                    ? (sizes.find((t) => t.id === selectedSizeId)?.name ??
                      "Không xác định")
                    : "Chọn kích cỡ"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn kích cỡ</Text>
          </View>
        )}

        {/* Loading Chất liệu */}
        {isLoadingMaterials && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải chất liệu...</Text>
          </View>
        )}
        {/* Chất liệu */}
        {showMaterialDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowMaterialModal(true)}
            >
              <Text style={styles.dropdownLabel}>Chất liệu</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedMaterialId
                    ? (materials.find((t) => t.id === selectedMaterialId)
                        ?.name ?? "Không xác định")
                    : "Chọn chất liệu"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn chất liệu của sản phẩm</Text>
          </View>
        )}

        {/* Loading Xuất xứ */}
        {isLoadingOrigins && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8c7ae6" />
            <Text style={styles.loadingText}>Đang tải xuất xứ...</Text>
          </View>
        )}
        {/* Xuất xứ */}
        {showOriginDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowOriginModal(true)}
            >
              <Text style={styles.dropdownLabel}>Xuất xứ</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedOriginId
                    ? (origins.find((t) => t.id === selectedOriginId)?.name ??
                      "Không xác định")
                    : "Chọn xuất xứ"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn xuất xứ của sản phẩm</Text>
          </View>
        )}
        {/* Input Tài liệu khoa (Tác giả) */}
        {showAuthorField && (
          <View style={styles.section}>
            <Text style={styles.dropdownLabel}>Tác giả/ Người biên soạn</Text>
            <TextInput
              style={styles.input}
              placeholder="Tác giả / Người biên soạn *"
              value={author}
              onChangeText={setAuthor}
            />
          </View>
        )}

        {/* Input đặc thù (Năm sản xuất) */}
        {showYearField && (
          <View style={styles.section}>
            <Text style={styles.dropdownLabel}>Năm sản xuất</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={year}
                onValueChange={(itemValue) => setYear(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Chọn năm *" value={null} />
                {years.map((y) => (
                  <Picker.Item key={y} label={y.toString()} value={y} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Hình thức giao dịch */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDealTypeModal(true)}
          >
            <Text style={styles.dropdownLabel}>Hình thức giao dịch</Text>
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownText}>
                {dealTypeId
                  ? dealTypes.find(
                      (opt) => Number(opt.id) === Number(dealTypeId)
                    )?.name || "Không xác định"
                  : "Chọn hình thức"}
              </Text>

              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>

          {/* Giá bán - Chỉ hiển thị nếu chọn "Giá bán" */}
          {dealTypeId === 1 && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.dropdownLabel, { marginBottom: 4 }]}>
                Giá bán (VNĐ)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá bán mong muốn"
                value={price.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                onChangeText={(text) => {
                  const numeric = text.replace(/\D/g, "").slice(0, 9);
                  setPrice(numeric);
                }}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Danh mục trao đổi - Chỉ hiển thị nếu chọn "Trao đổi" */}
          {dealTypeId === 3 && (
            <TouchableOpacity
              style={styles.section} // để giữ style hiện tại
              onPress={() => {
                navigation.navigate("ChooseExchangeCategoryScreen", {
                  onSelectCategory: (
                    category: Category,
                    subCategory: SubCategory
                  ) => {
                    setExchangeCategory(category);
                    setExchangeSubCategory(subCategory);
                  },
                });
              }}
            >
              <Text>
                {exchangeCategory && exchangeSubCategory
                  ? `${exchangeCategory.name} - ${exchangeSubCategory.name}`
                  : "Chọn danh mục trao đổi"}
              </Text>
              <Text style={styles.helperText}>
                Chọn danh mục cha và con bạn muốn đổi
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.helperText}>
            Chọn hình thức giao dịch bạn muốn
          </Text>
        </View>

        {/* Mô tả sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.dropdownLabel}>Mô tả sản phẩm</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết sản phẩm *"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.helperText}>
            Nhập mô tả chi tiết cho sản phẩm của bạn
          </Text>
        </View>

        {/* Địa chỉ giao dịch */}
        <View style={styles.section}>
          <Text style={styles.dropdownLabel}>Chọn địa chỉ giao dịch</Text>
          <AddressPicker onChange={(fullAddress) => setAddress(fullAddress)} />
          <Text style={styles.helperText}>Chọn địa chỉ giao dịch</Text>
        </View>

        {/* Chọn phạm vi bài đăng */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={styles.dropdownLabel}>Đăng tại (Phạm vi)</Text>
            <View style={styles.dropdownContent}>
              <Text
                style={styles.dropdownText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedGroupId
                  ? groups.find((g) => g.id === selectedGroupId)?.name ||
                    "Không xác định"
                  : "Toàn trường"}
              </Text>
              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Chọn đăng công khai hoặc trong nhóm bạn đã tham gia
          </Text>
        </View>

        {/* Loại bài đăng */}
        {!isLoadingOptions && (
          <View style={styles.section}>
            <Text style={styles.dropdownLabel}>Loại bài đăng *</Text>
            <View style={styles.radioContainer}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.radioOption,
                    Number(postTypeId) === Number(type.id) &&
                      styles.radioOptionSelected,
                  ]}
                  onPress={() => handleSelectPostType(Number(type.id))}
                >
                  <Text
                    style={[
                      styles.radioOptionText,
                      Number(postTypeId) === Number(type.id) &&
                        styles.radioOptionTextSelected,
                    ]}
                  >
                    {type.name}
                  </Text>
                  {Number(postTypeId) === Number(type.id) && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#8c7ae6"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>
              Chọn loại bài đăng (Đăng bán hoặc Đăng mua)
            </Text>
          </View>
        )}
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.postButton, isLoading && { opacity: 0.7 }]}
            onPress={handlePost}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.postButtonText}>Đang đăng tin...</Text>
              </View>
            ) : (
              <Text style={styles.postButtonText}>Đăng tin</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* === MODALS === */}

      {/* Menu chọn tình trạng sản phẩm */}
      {showConditionModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn tình trạng sản phẩm</Text>
            {conditions.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalOption,
                  conditionId === type.id && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelectCondition(type.id)}
              >
                <Text style={styles.modalOptionText}>{type.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowConditionModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn loại sản phẩm */}
      {showTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn loại sản phẩm</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {productTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedProductTypeId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectProductType(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowTypeModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Hãng */}
      {showBrandModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn hãng</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {brands.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedBrandId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectBrand(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowBrandModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Dòng */}
      {showProductModelModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn dòng</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {productModels.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedProductModelId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectProductModel(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowProductModelModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Bộ vi xử lý */}
      {showProcessorModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn bộ vi xử lý</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {processors.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedProcessorId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectProcessor(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowProcessorModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn RAM */}
      {showRamOptionModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn RAM</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {ramOptions.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedRamOptionId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectRamOption(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowRamOptionModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Loại ổ cứng */}
      {showStorageTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn loại ổ cứng</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {storageTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedStorageTypeId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectStorageType(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowStorageTypeModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Card màn hình */}
      {showGraphicsCardModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn card màn hình</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {graphicsCards.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedGraphicsCardId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectGraphicsCard(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowGraphicsCardModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Giống */}
      {showBreedModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn giống thú cưng</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {breeds.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedBreedId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectBreed(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowBreedModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Độ tuổi */}
      {showAgeRangeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn độ tuổi</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {ageRanges.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedAgeRangeId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectAgeRange(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowAgeRangeModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Giới tính */}
      {showGenderModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn giới tính</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {genders.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedGenderId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectGender(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Menu chọn Dung tích xe */}
      {showEngineCapacityModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn dung tích xe</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {engineCapacities.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedEngineCapacityId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectEngineCapacity(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowEngineCapacityModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Menu chọn Màu sắc */}
      {showColorModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn màu sắc</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {colors.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedColorId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectColor(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowColorModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Dung lượng */}
      {showCapacityModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn dung lượng</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {capacities.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedCapacityId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectCapacity(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowCapacityModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Bảo hành */}
      {showWarrantyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn bảo hành</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {warranties.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedWarrantyId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectWarranty(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowWarrantyModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Menu chọn Kích cỡ */}
      {showSizeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn kích cỡ</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {sizes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedSizeId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectSize(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowSizeModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Chất liệu */}
      {showMaterialModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn chất liệu</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {materials.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedMaterialId === type.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectMaterial(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowMaterialModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu chọn Xuất xứ */}
      {showOriginModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn xuất xứ</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {origins.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    selectedOriginId === type.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectOrigin(type.id)}
                >
                  <Text style={styles.modalOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowOriginModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Chọn hình thức giao dịch */}
      {showDealTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn hình thức giao dịch</Text>
            {dealTypes.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.modalOption,
                  dealTypeId === option.id && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelectDealType(Number(option.id))}
              >
                <Text style={styles.modalOptionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowDealTypeModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- MODAL CHỌN NHÓM --- */}
      {showGroupModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn nơi đăng bài</Text>
            <ScrollView style={{ flexShrink: 1, maxHeight: 300 }}>
              {/* Option 1: Toàn trường (Mặc định) */}
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedGroupId === null && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelectGroup(null)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalOptionText}>Toàn trường</Text>
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    Hiển thị công khai cho tất cả sinh viên
                  </Text>
                </View>
                {selectedGroupId === null && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#8c7ae6"
                  />
                )}
              </TouchableOpacity>

              {/* Option 2: Các nhóm đã tham gia */}
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.modalOption,
                    selectedGroupId === group.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectGroup(group.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalOptionText}>{group.name}</Text>
                    <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                      Chỉ hiển thị trong nhóm này
                    </Text>
                  </View>
                  {selectedGroupId === group.id && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#8c7ae6"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowGroupModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default PostFormScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#f8fafc", // Nền nhạt
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#64748b", // Màu xám
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#8c7ae6",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  picker: {
    height: 50,
    width: "100%",
  },

  dropdown: {
    marginBottom: 8,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdownText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fcd34d",
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 6,
    fontWeight: "500",
  },

  imageRow: { flexDirection: "row", marginLeft: 10, marginTop: 10 },
  imagePreview: { width: 60, height: 60, marginRight: 8, borderRadius: 5 },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f59e0b",
  },
  postButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: "60%",
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
  },
  modalOptionSelected: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#8c7ae6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  radioOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  radioOptionSelected: {
    borderColor: "#8c7ae6",
    backgroundColor: "#f0f9ff",
  },
  radioOptionText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  radioOptionTextSelected: {
    color: "#8c7ae6",
  },
});
