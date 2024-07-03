import { Ionicons } from "@expo/vector-icons";
import React, {
  FC,
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ViewToken,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  creationAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    image: string;
    creationAt: string;
    updatedAt: string;
  };
}

const ImageCarousel = memo(({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onViewRef = useRef(({ changed }: { changed: ViewToken[] }) => {
    if (changed[0].isViewable) {
      setActiveIndex(changed[0].index || 0);
    }
  });

  return (
    <View>
      <FlatList
        data={images}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <View style={styles.dotContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === activeIndex ? "#0066cc" : "#ccc" },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const ProductItem = memo(({ item }: { item: Product }) => (
  <View style={styles.itemContainer}>
    <ImageCarousel images={item.images} />
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.price}>₹ {item.price}</Text>
    <Text style={styles.description} numberOfLines={2}>
      {item.description}
    </Text>
  </View>
));

const Page: FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `https://api.escuelajs.co/api/v1/products?offset=${offset}&limit=${limit}`
      );
      const result = await response.json();

      setData((prevData) => [...prevData, ...result]);
      setOffset((prevOffset) => prevOffset + limit);
    } catch (error) {
      console.error("Fetch error: " + error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore) {
      fetchData();
    }
  }, [loadingMore, fetchData]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }, [loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductItem item={item} />,
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#0066cc" />
        </TouchableOpacity>
      </View>
    ),
    [searchQuery]
  );

  if (loading && offset === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#e6f2ff",
    borderRadius: 12,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  image: {
    width,
    height: 200,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginHorizontal: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0066cc",
    marginTop: 4,
    marginHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default Page;
