import React from "react";
import { View, FlatList, ScrollView } from "react-native";
import ProductCard from "../../../components/ProductCard";

const products = [
  {
    id: "1",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm A",
    price: "150.000 đ",
    location: "TP Hồ Chí Minh",
    time: "2 ngày trước",
    tag: "Đồ dùng",
    imageCount: 3,
    isFavorite: false,
  },
  {
    id: "2",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm B",
    price: "250.000 đ",
    location: "Thủ Đức",
    time: "1 ngày trước",
    tag: "Thời trang",
    imageCount: 2,
    isFavorite: false,
  },
  {
    id: "3",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm C",
    price: "99.000 đ",
    location: "Quận 1",
    time: "3 ngày trước",
    tag: "Đồ dùng",
    imageCount: 1,
    isFavorite: true,
  },
  {
    id: "4",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm D",
    price: "120.000 đ",
    location: "Quận 3",
    time: "4 ngày trước",
    tag: "Đồ gia dụng",
    imageCount: 2,
    isFavorite: true,
  },
];

export default function PostsTab() {
  return (
    <ScrollView className="flex-1 px-4">
      {/* Danh sách bài viết */}
      <View className="my-10">
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProductCard
              image={item.image}
              name={item.name}
              price={item.price}
              location={item.location}
              time={item.time}
              tag={item.tag}
              imageCount={item.imageCount}
              isFavorite={item.isFavorite}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}

// import React from "react";
// import { View, FlatList, ScrollView, Text, Image } from "react-native";

// const posts = [
//   {
//     id: "1",
//     groupName: "Hội yêu chó",
//     groupImage: require("../../../assets/hoa.png"),
//     userName: "Nguyễn Văn A",
//     title: "Chia sẻ kinh nghiệm nuôi chó",
//     postImage: require("../../../assets/hoa.png"),
//   },
//   {
//     id: "2",
//     groupName: "Hội yêu mèo",
//     groupImage: require("../../../assets/hoa.png"),
//     userName: "Trần Thị B",
//     title: "Mèo nhà mình dễ thương quá 😻",
//     postImage: require("../../../assets/hoa.png"),
//   },
//   {
//     id: "3",
//     groupName: "Đồ cũ sinh viên",
//     groupImage: require("../../../assets/hoa.png"),
//     userName: "Lê Văn C",
//     title: "Thanh lý bàn học giá rẻ",
//     postImage: require("../../../assets/hoa.png"),
//   },
//   {
//     id: "4",
//     groupName: "Ẩm thực Việt",
//     groupImage: require("../../../assets/hoa.png"),
//     userName: "Phạm Thị D",
//     title: "Cơm tấm ngon ở Sài Gòn",
//     postImage: require("../../../assets/hoa.png"),
//   },
// ];

// export default function PostsTab() {
//   return (
//     <ScrollView className="flex-1 px-4">
//       <View className="my-10">
//         <FlatList
//           data={posts}
//           keyExtractor={(item) => item.id}
//           numColumns={1} // 👉 mỗi bài viết chiếm full width
//           renderItem={({ item }) => (
//             <View className="mb-6 p-3 bg-white rounded-lg shadow">
//               {/* Nhóm */}
//               <View className="flex-row items-center mb-2">
//                 <Image
//                   source={item.groupImage}
//                   className="w-8 h-8 rounded-full"
//                 />
//                 <Text className="ml-2 font-semibold">{item.groupName}</Text>
//               </View>

//               {/* User + Title */}
//               <Text className="text-gray-600 text-sm">
//                 Đăng bởi {item.userName}
//               </Text>
//               <Text className="font-bold text-base mt-1">{item.title}</Text>

//               {/* Ảnh bài viết */}
//               <Image
//                 source={item.postImage}
//                 className="w-full h-40 mt-2 rounded-lg"
//                 resizeMode="cover"
//               />
//             </View>
//           )}
//         />
//       </View>
//     </ScrollView>
//   );
// }
