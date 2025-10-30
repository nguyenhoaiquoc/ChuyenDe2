import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      if (userId && userName) {
        setUser({ id: Number(userId), name: userName });
      }
    };
    fetchUser();
  }, []);

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

  // State cho Kích thước
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
  // Hàm chọn hình thức giao dịch
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

  const handleUploadImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
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
      const selected: string[] = [];
      for (const asset of result.assets) {
        // Convert HEIC sang JPEG nếu cần
        const uri = await convertToJpgIfNeeded(asset.uri);
        selected.push(uri);
      }

      if (images.length + selected.length > 4) {
        alert("Bạn chỉ được chọn tối đa 4 ảnh.");
        return;
      }

      setImages((prev) => [...prev, ...selected]);
    }
  };

  const convertToJpgIfNeeded = async (uri: string) => {
    const ext = uri.split(".").pop()?.toLowerCase();

    if (ext === "heic" || ext === "heif") {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
          format: ImageManipulator.SaveFormat.JPEG,
          compress: 0.8,
        });
        return manipResult.uri;
      } catch (error) {
        console.error("Lỗi convert HEIC/HEIF:", error);
        return uri; // fallback
      }
    }
    return uri;
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

    const missingFields: string[] = [];
    if (!category) missingFields.push("Danh mục cha");
    if (!subCategory) missingFields.push("Danh mục con");
    if (!finalName) missingFields.push("Tên sản phẩm");
    if (!description || description.trim() === "")
      missingFields.push("Mô tả sản phẩm");
    if (!conditionId) missingFields.push("Tình trạng sản phẩm");
    if (showProductTypeDropdown && !productTypeId) {
      missingFields.push("Loại sản phẩm");
    }
    if (showMaterialDropdown && !materialId) {
      missingFields.push("Chất liệu");
    }
    if (showSizeDropdown && !sizeId) {
      missingFields.push("Kích thước");
    }
    if (showOriginDropdown && !originId) {
      missingFields.push("Xuất xứ");
    }
    if (showAcademicFields && category?.name === "Tài liệu khoa" && !author) {
      missingFields.push("Tác giả");
    }
    if (showAcademicFields && category?.name === "Tài liệu khoa" && !year) {
      missingFields.push("Năm xuất bản");
    }
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

      // XÂY DỰNG FORMDATA
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
      formData.append("condition_id", String(conditionId));

      // 3. Trường bắt buộc (Boolean)
      formData.append("is_approved", "false");

      // 4. Các trường tùy chọn (Optional)
      // Chỉ gửi nếu chúng có giá trị
      if (productTypeId) {
        formData.append("product_type_id", String(productTypeId));
      }
      if (materialId) {
        formData.append("material_id", String(materialId));
      }
      if (sizeId) {
        formData.append("size_id", String(sizeId));
      }
      if (originId) {
        formData.append("origin_id", String(originId));
      }
      if (author) {
        formData.append("author", author);
      }
      if (year) {
        formData.append("year", String(year));
      }
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
        Alert.alert("Thành công", "Đăng tin thành công!");
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
      }
    };
    fetchOptions();
  }, []);

  const categoryId = category?.id;
  const subCategoryId = subCategory?.id;

  const [showProductTypeDropdown, setShowProductTypeDropdown] = useState(false);
  const [showAcademicFields, setShowAcademicFields] = useState(false);

  const [author, setAuthor] = useState("");
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const fetchProductTypes = async () => {
      // 1. Luôn ẩn dropdown trước khi bắt đầu tìm kiếm
      setShowProductTypeDropdown(false);
      // Đồng thời reset giá trị đã chọn
      setSelectedProductTypeId(null);
      setProductTypeId(null);

      // 2. Phải có categoryId mới tìm
      if (!categoryId) {
        return;
      }

      // 3. ƯU TIÊN 1: Tìm theo ID DANH MỤC CON (nếu có)
      //    (Ví dụ: "Bàn ghế" subCatId = 23)
      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/product-types/by-sub-category/${subCategoryId}`
          );

          if (res.ok) {
            const data = await res.json();
            // Nếu tìm thấy (mảng không rỗng)
            if (data && data.length > 0) {
              console.log(
                `[Loại SP] Tìm thấy ${data.length} loại CỤ THỂ theo SubCatID ${subCategoryId}`
              );
              setProductTypes(data);
              setShowTypeModal(false); // Reset modal
              setShowProductTypeDropdown(true); // ✅ HIỂN THỊ
              return; // Dừng lại, không tìm theo danh mục cha nữa
            }
          }
          // Nếu res không ok (vd: 404) hoặc data rỗng -> sẽ tự động chạy xuống Ưu tiên 2
        } catch (err) {
          // Bỏ qua lỗi này, để chạy xuống Ưu tiên 2
          console.warn(
            `[Loại SP] Không tìm thấy loại SP cụ thể cho ${subCategoryId}, đang fallback...`
          );
        }
      }

      // 4. ƯU TIÊN 2: Tìm theo ID DANH MỤC CHA
      //    (Chạy khi subCategoryId=null HOẶC khi Ưu tiên 1 không tìm thấy)
      //    (Ví dụ: "Thời trang" catId = 2)
      try {
        const res = await fetch(
          `${path}/product-types/by-category/${categoryId}`
        );

        if (res.ok) {
          const data = await res.json();
          // Nếu tìm thấy (mảng không rỗng)
          if (data && data.length > 0) {
            console.log(
              `[Loại SP] Tìm thấy ${data.length} loại CHUNG theo CatID ${categoryId}`
            );
            setProductTypes(data);
            setShowTypeModal(false); // Reset modal
            setShowProductTypeDropdown(true); // ✅ HIỂN THỊ
            return; // Dừng lại
          }
        }

        // Nếu không tìm thấy ở cả 2 ưu tiên
        console.log(
          `[Loại SP] Không tìm thấy loại nào cho CatID ${categoryId}`
        );
        setShowProductTypeDropdown(false); // Đảm bảo đã ẩn
      } catch (err) {
        console.error("Lỗi khi fetch loại SP chung:", (err as Error).message);
        setShowProductTypeDropdown(false); // Ẩn nếu lỗi
      }
    };

    // HÀM FETCH XUẤT XỨ
    const fetchOrigins = async () => {
      // 1. Reset
      setShowOriginDropdown(false);
      setSelectedOriginId(null);
      setOriginId(null); // 2. Phải có categoryId

      if (!categoryId) return; // 3. Ưu tiên 1: Tìm theo SubCategory ID

      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/origins/by-sub-category/${subCategoryId}` // <-- API Xuất xứ
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              console.log(
                `[Xuất xứ] Tìm thấy ${data.length} theo SubCatID ${subCategoryId}`
              );
              setOrigins(data); // <-- Set state Xuất xứ
              setShowOriginModal(false);
              setShowOriginDropdown(true); // <-- Hiển thị dropdown Xuất xứ
              return;
            }
          }
        } catch (err) {
          console.warn(
            `[Xuất xứ] Không tìm thấy theo SubCat ${subCategoryId}, fallback...`
          );
        }
      }

      // --- BƯỚC 1: Xử lý logic đặc thù cho "Tài liệu khoa" ---
      try {
        const res = await fetch(`${path}/origins/by-category/${categoryId}`); // <-- API Xuất xứ
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            console.log(
              `[Xuất xứ] Tìm thấy ${data.length} theo CatID ${categoryId}`
            );
            setOrigins(data); // <-- Set state Xuất xứ
            setShowOriginModal(false);
            setShowOriginDropdown(true); // <-- Hiển thị dropdown Xuất xứ
            return;
          }
        }
        console.log(`[Xuất xứ] Không tìm thấy cho CatID ${categoryId}`);
        setShowOriginDropdown(false);
      } catch (err) {
        console.error("Lỗi fetch xuất xứ:", (err as Error).message);
        setShowOriginDropdown(false);
      }
    };

    // HÀM FETCH CHẤT LIỆU
    const fetchMaterials = async () => {
      // 1. Reset
      setShowMaterialDropdown(false);
      setSelectedMaterialId(null);
      setMaterialId(null);
      // 2. Check CatID
      if (!categoryId) return;
      // 3. Ưu tiên 1: Tìm theo SubCategory ID
      if (subCategoryId) {
        try {
          const res = await fetch(
            `${path}/materials/by-sub-category/${subCategoryId}` // <-- API Chất liệu
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              console.log(
                `[Chất liệu] Tìm thấy ${data.length} theo SubCatID ${subCategoryId}`
              );
              setMaterials(data); // <-- Set state Chất liệu
              setShowMaterialModal(false);
              setShowMaterialDropdown(true); // <-- Hiển thị dropdown Chất liệu
              return;
            }
          }
        } catch (err) {
          console.warn(
            `[Chất liệu] Không tìm thấy theo SubCat ${subCategoryId}, fallback...`
          );
        }
      }
      // 4. Ưu tiên 2: Tìm theo Category ID
      try {
        const res = await fetch(`${path}/materials/by-category/${categoryId}`); // <-- API Chất liệu
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            console.log(
              `[Chất liệu] Tìm thấy ${data.length} theo CatID ${categoryId}`
            );
            setMaterials(data); // <-- Set state Chất liệu
            setShowMaterialModal(false);
            setShowMaterialDropdown(true); // <-- Hiển thị dropdown Chất liệu
            return;
          }
        }
        console.log(`[Chất liệu] Không tìm thấy cho CatID ${categoryId}`);
        setShowMaterialDropdown(false);
      } catch (err) {
        console.error("Lỗi fetch chất liệu:", (err as Error).message);
        setShowMaterialDropdown(false);
      }
    };

    const fetchSizes = async () => {
      // 1. Reset
      setShowSizeDropdown(false);
      setSelectedSizeId(null);
      setSizeId(null);

      // 2. Phải có SubCategory ID (vì nó chỉ áp dụng cho 1 subCat)
      if (!subCategoryId) return;

      // 3. Chỉ fetch theo SubCategory ID (API /sizes/by-sub-category/:id)
      try {
        const res = await fetch(
          `${path}/sizes/by-sub-category/${subCategoryId}` // <-- API Kích thước
        );
        if (res.ok) {
          const data = await res.json();
          // Nếu tìm thấy (cho subCat 25)
          if (data && data.length > 0) {
            console.log(
              `[Kích thước] Tìm thấy ${data.length} theo SubCatID ${subCategoryId}`
            );
            setSizes(data); // <-- Set state Kích thước
            setShowSizeModal(false);
            setShowSizeDropdown(true); // <-- Hiển thị dropdown Kích thước
            return;
          }
        }
        // Nếu không tìm thấy (ví dụ subCat 23, 24...)
        console.log(
          `[Kích thước] Không tìm thấy cho SubCatID ${subCategoryId}`
        );
        setShowSizeDropdown(false);
      } catch (err) {
        console.error("Lỗi fetch kích thước:", (err as Error).message);
        setShowSizeDropdown(false);
      }
    };

    if (category?.name === "Tài liệu khoa") {
      setShowAcademicFields(true); // HIỂN THỊ Tác giả, Năm
      setShowProductTypeDropdown(false); // ẨN Loại sản phẩm
      setShowOriginDropdown(false); // ẨN Xuất xứ
      setShowMaterialDropdown(false); // ẨN Chất liệu
      setShowSizeDropdown(false); // ✅ ẨN Kích thước
    }
    // 2. Nếu là danh mục khác
    else {
      setShowAcademicFields(false); // ẨN Tác giả, Năm
      fetchProductTypes(); // Chạy fetch Loại sản phẩm
      fetchOrigins(); // Chạy fetch Xuất xứ

      // Logic cho Chất liệu (chỉ CatID 3)
      if (Number(categoryId) === 3) {
        fetchMaterials(); // Chạy fetch Chất liệu
      } else {
        setShowMaterialDropdown(false);
        setMaterialId(null);
      }

      // ✅ LOGIC MỚI CHO KÍCH THƯỚC
      // Chỉ hiển thị nếu SubCategory ID là 25 ("Giường, chăn ga gối nệm")
      if (Number(subCategoryId) === 25) {
        fetchSizes(); // Chạy fetch Kích thước
      } else {
        setShowSizeDropdown(false);
        setSizeId(null);
      }
    }
  }, [category, categoryId, subCategoryId]);

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
                  ? `${category.name}${subCategory ? ` - ${subCategory.name || subCategory}` : ""}`
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

        {/* Tình trạng sản phẩm */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowConditionModal(true)}
          >
            <Text style={styles.dropdownLabel}>Tình trạng sản phẩm</Text>
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownText}>
                {conditionId
                  ? conditions.find((item) => item.id === conditionId)?.name ||
                    "Không xác định"
                  : "Chọn tình trạng"}
              </Text>
              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Chọn tình trạng sản phẩm của bạn
          </Text>
        </View>

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

        {showSizeDropdown && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSizeModal(true)}
            >
              <Text style={styles.dropdownLabel}>Kích thước</Text>
              <View style={styles.dropdownContent}>
                <Text
                  style={styles.dropdownText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedSizeId
                    ? (sizes.find((t) => t.id === selectedSizeId)?.name ??
                      "Không xác định")
                    : "Chọn kích thước"}
                </Text>
                <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
              </View>
            </TouchableOpacity>
            <Text style={styles.helperText}>Chọn kích thước (nếu có)</Text>
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
        {/* Input đặc thù Tài liệu khoa */}
        {showAcademicFields && (
          <>
            <View style={styles.section}>
              <Text style={styles.dropdownLabel}>Tác giả/ Người biên soạn</Text>
              <TextInput
                style={styles.input}
                placeholder="Tác giả / Người biên soạn *"
                value={author}
                onChangeText={setAuthor}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.dropdownLabel}>Năm xuất bản / Năm học</Text>
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
          </>
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
          {/* Nếu chọn "Giá bán" (id = 1) thì hiện input giá */}
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

        {/* Loại bài đăng */}
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

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.postButton, isLoading && { opacity: 0.7 }]}
            onPress={handlePost}
            disabled={isLoading} // 💡 KHÔNG CHO PHÉP NHẤN NÚT KHI ĐANG TẢI
          >
            {isLoading ? (
              // 💡 HIỂN THỊ ICON TẢI VÀ TEXT
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.postButtonText}>Đang đăng tin...</Text>
              </View>
            ) : (
              // 💡 HIỂN THỊ TEXT BÌNH THƯỜNG
              <Text style={styles.postButtonText}>Đăng tin</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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

            {/* BỌC DANH SÁCH BẰNG SCROLLVIEW */}
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

      {/* Menu chọn Kích thước */}
      {showSizeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.dropdownLabel}>Chọn kích thước</Text>
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
              onPress={() => setShowSizeModal(false)} // <-- Đóng modal Kích thước
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
    </View>
  );
};

export default PostFormScreen;

const styles = StyleSheet.create({
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
