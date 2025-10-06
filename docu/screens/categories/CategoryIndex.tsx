// categories/CategoryIndex.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ProductType } from '../../types';
import { Feather } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import Menu from '../../components/Menu';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryIndex'>;

const CategoryIndex: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params ?? {};
  const [query, setQuery] = useState('');

  const products: ProductType[] = useMemo(
    () => [
      { id: '1', image: require('../../assets/hoa.png'), title: 'Sản phẩm A', price: '150.000 đ', location: 'TP Hồ Chí Minh', time: '2 ngày trước', tag: 'Đồ dùng', imageCount: 3, isFavorite: false },
      { id: '2', image: require('../../assets/hoa.png'), title: 'Sản phẩm B', price: '250.000 đ', location: 'Thủ Đức', time: '1 ngày trước', tag: 'Thời trang', imageCount: 2, isFavorite: false },
      { id: '3', image: require('../../assets/hoa.png'), title: 'Sản phẩm C', price: '99.000 đ', location: 'Quận 1', time: '3 ngày trước', tag: 'Đồ dùng', imageCount: 1, isFavorite: false },
      { id: '4', image: require('../../assets/hoa.png'), title: 'Sản phẩm D', price: '120.000 đ', location: 'Quận 3', time: '4 ngày trước', tag: 'Đồ gia dụng', imageCount: 2, isFavorite: false },
      { id: '5', image: require('../../assets/hoa.png'), title: 'Sản phẩm E', price: '75.000 đ', location: 'Bình Thạnh', time: '5 ngày trước', tag: 'Phụ kiện', imageCount: 1, isFavorite: false },
      { id: '6', image: require('../../assets/hoa.png'), title: 'Sản phẩm F', price: '300.000 đ', location: 'Thủ Đức', time: '6 ngày trước', tag: 'Điện tử', imageCount: 4, isFavorite: false },
    ],
    [categoryId]
  );

  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase())),
    [products, query]
  );

  return (
    <View className="flex-1 bg-white3 mt-5">
      <View className="flex-row items-center px-4 pt-6 pb-3 bg-slate-50">
        <TouchableOpacity
          className="p-2 rounded-lg bg-white shadow"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Quay lại"
        >
          <Feather name="chevron-left" size={22} color="#111827" />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1 bg-white rounded-xl px-3 h-12 ml-3 border border-slate-200">
          <Feather name="search" size={16} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Tìm trong ${categoryName ?? 'danh mục'}`}
            returnKeyType="search"
            onSubmitEditing={() => { }}
            className="ml-3 flex-1 text-sm text-slate-800 p-0"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="p-2 rounded-full bg-slate-100 ml-2"
              onPress={() => setQuery('')}
              accessibilityLabel="Xóa"
            >
              <Feather name="x" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text className="text-lg font-semibold text-slate-800 px-4 mt-3">
        {categoryName ?? categoryId}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-8">Không tìm thấy sản phẩm</Text>}
        renderItem={({ item }) => (
          <ProductCard
            image={item.image}
            title={item.title}
            price={item.price}
            location={item.location}
            time={item.time}
            tag={item.tag}
            imageCount={item.imageCount}
            isFavorite={item.isFavorite}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onToggleFavorite={() => { }}
          />
        )}
      />

      <View className="absolute bottom-0 left-0 right-0">
        <Menu />
      </View>
    </View>
  );
};

export default CategoryIndex;
