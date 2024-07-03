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
  RefreshControl,
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
import Slider from "@react-native-community/slider";
const { width } = Dimensions.get("window");

interface FilterModalProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
}

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

const FilterModal: FC<FilterModalProps> = ({ bottomSheetRef }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRangeValue, setPriceRangeValue] = useState<number>(50);

  const animatedOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(animatedOpacity.value),
    };
  });

  useEffect(() => {
    animatedOpacity.value = 1;
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(range === selectedPriceRange ? null : range);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand === selectedBrand ? null : brand);
  };

  return (
    <BottomSheetView style={styles.filterContainer}>
      <Animated.View style={[styles.filterContent, animatedStyle]}>
        <Text style={styles.filterTitle}>Filter Products</Text>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Category</Text>
          <View style={styles.filterOptions}>
            {["Electronics", "Clothing", "Books"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterOption,
                  selectedCategory === category && styles.selectedFilterOption,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={
                    selectedCategory === category
                      ? styles.selectedFilterOptionText
                      : {}
                  }
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Price Range</Text>
          <View style={styles.filterOptions}>
            {["₹0 - ₹50", "₹50 - ₹100", "₹100+"].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.filterOption,
                  selectedPriceRange === range && styles.selectedFilterOption,
                ]}
                onPress={() => handlePriceRangeSelect(range)}
              >
                <Text
                  style={
                    selectedPriceRange === range
                      ? styles.selectedFilterOptionText
                      : {}
                  }
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={200}
            value={priceRangeValue}
            onValueChange={setPriceRangeValue}
            minimumTrackTintColor="#0066cc"
            maximumTrackTintColor="#000000"
          />
          <Text style={styles.sliderValue}>
            Price: ₹{priceRangeValue.toFixed(0)}
          </Text>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Brand</Text>
          <View style={styles.filterOptions}>
            {["Apple", "Samsung", "Nike"].map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[
                  styles.filterOption,
                  selectedBrand === brand && styles.selectedFilterOption,
                ]}
                onPress={() => handleBrandSelect(brand)}
              >
                <Text
                  style={
                    selectedBrand === brand
                      ? styles.selectedFilterOptionText
                      : {}
                  }
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Built with ♥ by Rahul Mistry</Text>
        </View>
      </Animated.View>
    </BottomSheetView>
  );
};
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
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [snapPoints, setSnapPoints] = useState(["62%"]);
  const limit = 10;

  const openFilterModal = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Your logic to fetch new data here
    const response = await fetch(
      `https://api.escuelajs.co/api/v1/products?offset=0&limit=${limit}`
    );
    const newData = await response.json();
    setData(newData);
    setRefreshing(false);
  }, []);

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
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Ionicons name="filter" size={24} color="#0066cc" />
        </TouchableOpacity>
      </View>
    ),
    [searchQuery, openFilterModal]
  );

  if (loading && offset === 0) {
    return (
      <SafeAreaView style={styles.loadingContainerMain}>
        <ActivityIndicator size="large" color="#0099ff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <FilterModal bottomSheetRef={bottomSheetRef} />
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  filterContainer: {
    flex: 1,
    padding: 20,
  },
  filterContent: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  applyButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filterOption: {
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterOption: {
    backgroundColor: "#0066cc",
  },
  selectedFilterOptionText: {
    color: "#fff",
  },
  slider: {
    width: "100%",
    height: 40,
    marginTop: 10,
  },
  sliderValue: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 16,
    color: "#555",
  },
  loadingContainerMain: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  bottomTextContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 12,
    color: "#ccc",
  },
});

export default Page;
