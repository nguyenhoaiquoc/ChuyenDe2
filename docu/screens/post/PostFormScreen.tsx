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

const { width } = Dimensions.get("window");
const PostFormScreen = ({ navigation, route }: { navigation: any; route: any }) => {

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
  const [conditionId, setConditionId] = useState<number | null>(null);
  const [productTypeId, setProductTypeId] = useState<number | null>(null);
  const [dealTypeId, setDealTypeId] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // STATE ĐANG TẢI
  const [isLoading, setIsLoading] = useState(false);

  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditions, setConditions] = useState<{ id: number; name: string }[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null);

  const handleSelectCondition = (id: number) => {
    setSelectedConditionId(id);
    setConditionId(id);
    setShowConditionModal(false);
  };

  const [postTypeId, setPostTypeId] = useState<number | null>(null);
  const [showPostTypeModal, setShowPostTypeModal] = useState(false);
  const [postTypes, setPostTypes] = useState<{ id: number; name: string }[]>([]);

  const handleSelectPostType = (id: number) => {
    setPostTypeId(id);
    setShowPostTypeModal(false);
  };

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [productTypes, setProductTypes] = useState<{ id: number; name: string }[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);

  // useEffect(() => {
  //   const fetchProductTypes = async () => {
  //     try {
  //       const res = await axios.get(`${path}/product-types`);
  //       if (res.status === 200) {
  //         setProductTypes(res.data);
  //       }
  //     } catch (err) {
  //       console.error("Lỗi tải product types:", err);
  //     }
  //   };
  //   fetchProductTypes();
  // }, []);


  const handleSelectProductType = (id: number) => {
    setSelectedProductTypeId(id);
    setProductTypeId(id);
    setShowTypeModal(false);
  };

  const [exchangeCategory, setExchangeCategory] = useState<{ id: string, name: string } | null>(null);
  const [exchangeSubCategory, setExchangeSubCategory] = useState<{ id: string, name: string } | null>(null);

  const [dealTypes, setDealTypes] = useState<{ id: number; name: string }[]>([]);
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

  // Hàm xử lý tải ảnh lên
  const handleUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      const total = images.length + selected.length;

      if (total > 4) {
        alert("Bạn chỉ được chọn tối đa 4 ảnh.");
        return;
      }

      setImages((prevImages) => {
        const updatedImages = prevImages.concat(selected);
        return updatedImages;
      });
    }
  };


  // Hàm xóa ảnh
  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Hàm đăng bài
  const handlePost = async () => {
    if (isLoading) return;

    const finalTitle = title && title.trim() !== "" ? title.trim() : (name && name.trim() !== "" ? name.trim() : "");

    // Validation
    const missingFields: string[] = [];
    if (!category) missingFields.push("Danh mục cha");
    if (!subCategory) missingFields.push("Danh mục con");
    if (!finalTitle) missingFields.push("Tên sản phẩm");
    if (!description || description.trim() === "") missingFields.push("Mô tả sản phẩm");
    if (!conditionId) missingFields.push("Tình trạng sản phẩm");
    if (!productTypeId) missingFields.push("Loại sản phẩm");
    if (!dealTypeId) missingFields.push("Hình thức giao dịch");
    if (!postTypeId) missingFields.push("Loại bài đăng");
    if (images.length === 0) missingFields.push("Hình ảnh sản phẩm (ít nhất 1 ảnh)");
    if (!address || address.trim() === "") missingFields.push("Địa chỉ giao dịch");
    if (dealTypeId === 1 && (!price || parseFloat(price) <= 0)) missingFields.push("Giá bán (phải > 0 nếu bán có giá)");

    if (missingFields.length > 0) {
      Alert.alert(
        "Thiếu thông tin",
        `Vui lòng điền đầy đủ các trường bắt buộc: ${missingFields.join(", ")}.`,
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name || finalTitle);
      formData.append("title", finalTitle);
      formData.append("product_type_id", String(productTypeId));
      formData.append("description", description);
      formData.append("price", dealTypeId === 1 ? String(price) : "0");
      formData.append("user_id", "1");
      formData.append("category_id", String((category as any)?.id || ""));
      formData.append("sub_category_id", String(subCategory?.id || ""));
      formData.append("post_type_id", String(postTypeId)); // Sử dụng postTypeId từ state
      formData.append("deal_type_id", String(dealTypeId));
      formData.append("condition_id", String(conditionId));
      formData.append("status_id", "1");
      formData.append("is_approved", "false");
      formData.append("address_json", JSON.stringify({ full: address }));

      if (dealTypeId === 3 && exchangeCategory && exchangeSubCategory) {
        formData.append("categoryChange_id", String(exchangeCategory.id));
        formData.append("subCategoryChange_id", String(exchangeSubCategory.id));
      }

      images.forEach((uri, index) => {
        const filename = uri.split("/").pop();
        const ext = filename?.split(".").pop();
        const type = ext ? `image/${ext}` : "image";
        formData.append("files", {
          uri,
          name: filename || `photo_${index}.jpg`,
          type,
        } as any);
      });

      console.log("formData:", formData);

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
      Alert.alert("Lỗi", "Không thể kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [conditionRes, dealTypeRes, productTypeRes, postTypeRes] = await Promise.all([
          axios.get(`${path}/conditions`),
          axios.get(`${path}/deal-types`),
          axios.get(`${path}/product-types`),
          axios.get(`${path}/post-types`),
        ]);
        // console.log("Conditions:", conditionRes.data);
        // console.log("DealTypes:", dealTypeRes.data);
        // console.log("ProductTypes:", productTypeRes.data);
        // console.log("PostTypes:", postTypeRes.data);

        if (conditionRes.status === 200) setConditions(conditionRes.data);
        if (dealTypeRes.status === 200) setDealTypes(dealTypeRes.data);
        if (productTypeRes.status === 200) setProductTypes(productTypeRes.data);
        if (postTypeRes.status === 200) setPostTypes(postTypeRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    };
    fetchOptions();
  }, []);

  return (

    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.headerIcon}>
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng tin</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>


        {/* Danh mục */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dropdown} onPress={() => navigation.navigate("ChooseCategoryScreen")}>
            <Text style={styles.dropdownLabel}>Danh mục sản phẩm</Text>
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownText} numberOfLines={1} ellipsizeMode="tail">
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
          <TouchableOpacity style={styles.uploadBox} onPress={handleUploadImage}>
            <MaterialCommunityIcons name="camera-plus" size={28} color="#f59e0b" />
            <Text style={styles.uploadText}>Thêm 1-4 ảnh (ảnh đầu là ảnh chính)</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Ảnh đầu tiên sẽ là ảnh chính của sản phẩm</Text>

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
                  <MaterialCommunityIcons name="close-circle" size={20} color="red" />
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
                  ? conditions.find((item) => item.id === conditionId)?.name || "Không xác định"
                  : "Chọn tình trạng"}
              </Text>
              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>Chọn tình trạng sản phẩm của bạn</Text>
        </View>

        {/* Loại sản phẩm */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={styles.dropdownLabel}>Loại sản phẩm</Text>
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownText}>
                {selectedProductTypeId
                  ? (productTypes.find((t) => t.id === selectedProductTypeId)?.name ?? "Không xác định")
                  : "Chọn loại sản phẩm"}
              </Text>
              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>Chọn loại sản phẩm của bạn</Text>
        </View>

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
                  ? dealTypes.find((opt) => Number(opt.id) === Number(dealTypeId))?.name
                  || "Không xác định"
                  : "Chọn hình thức"}
              </Text>

              <FontAwesome6 name="chevron-down" size={20} color="#8c7ae6" />
            </View>
          </TouchableOpacity>

          {/* Giá bán - Chỉ hiển thị nếu chọn "Giá bán" */}
          {/* Nếu chọn "Giá bán" (id = 1) thì hiện input giá */}
          {dealTypeId === 1 && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.dropdownLabel, { marginBottom: 4 }]}>Giá bán (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá bán mong muốn"
                value={price}
                onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Danh mục trao đổi - Chỉ hiển thị nếu chọn "Trao đổi" */}
          {dealTypeId === 3 && (
            <View style={styles.section}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ChooseExchangeCategoryScreen", {
                    onSelectCategory: (category: Category, subCategory: SubCategory) => {
                      // Cập nhật state để hiển thị trên PostFormScreen
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
              </TouchableOpacity>
              <Text style={styles.helperText}>Chọn danh mục cha và con bạn muốn đổi</Text>
            </View>
          )}
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
        </View>

        {/* Địa chỉ giao dịch */}
        <View style={styles.section}>
          <Text style={styles.dropdownLabel}>Chọn địa chỉ giao dịch</Text>
          <AddressPicker onChange={(fullAddress) => setAddress(fullAddress)} />
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
                  Number(postTypeId) === Number(type.id) && styles.radioOptionSelected,
                ]}
                onPress={() => handleSelectPostType(Number(type.id))}
              >
                <Text
                  style={[
                    styles.radioOptionText,
                    Number(postTypeId) === Number(type.id) && styles.radioOptionTextSelected,
                  ]}
                >
                  {type.name}
                </Text>
                {Number(postTypeId) === Number(type.id) && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#8c7ae6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>Chọn loại bài đăng (Đăng bán hoặc Đăng mua)</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.postButton,
              // 💡 Thay đổi opacity khi đang tải để người dùng nhận biết
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handlePost}
            disabled={isLoading} // 💡 KHÔNG CHO PHÉP NHẤN NÚT KHI ĐANG TẢI
          >
            {isLoading ? (
              // 💡 HIỂN THỊ ICON TẢI VÀ TEXT
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  conditionId === type.id && styles.modalOptionSelected
                ]}
                onPress={() => handleSelectCondition(type.id)}
              >
                <Text style={styles.modalOptionText}>{type.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowConditionModal(false)} style={styles.modalCancelButton}>
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
            {productTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalOption,
                  selectedProductTypeId === type.id && styles.modalOptionSelected
                ]}
                onPress={() => handleSelectProductType(type.id)}
              >
                <Text style={styles.modalOptionText}>{type.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowTypeModal(false)} style={styles.modalCancelButton}>
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
                  dealTypeId === option.id && styles.modalOptionSelected
                ]}
                onPress={() => handleSelectDealType(Number(option.id))}
              >
                <Text style={styles.modalOptionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setShowDealTypeModal(false)} style={styles.modalCancelButton}>
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
    marginTop: 20
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: "#92400e",
    marginLeft: 12,
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
    maxHeight: "80%",
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