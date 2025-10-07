import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ShopScreenProps } from '../../types/navigation';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useShopStore } from '../../store/shopStore';
import { Product } from '../../store/shopStore';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - theme.spacing[8] - theme.spacing[4]) / 2;

export const ShopScreen: React.FC = () => {
  const navigation = useNavigation<ShopScreenProps['navigation']>();
  const {
    products,
    cart,

    fetchProducts,
    addToCart,
    setSelectedProduct,
  } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchProducts();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'cups', name: 'Cups', icon: 'golf' },
    { id: 'accessories', name: 'Accessories', icon: 'hardware-chip' },
    { id: 'apparel', name: 'Apparel', icon: 'shirt' },
    { id: 'equipment', name: 'Equipment', icon: 'construct' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to product detail screen
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
        style={styles.productGradient}
      >
        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={theme.colors.warning.primary} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(product)}
        >
          <LinearGradient
            colors={[theme.colors.neon.green, theme.colors.neon.blue]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={16} color={theme.colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const CategoryButton = ({ category }: { category: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton,
      ]}
      onPress={() => {
        setSelectedCategory(category.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <Ionicons
        name={category.icon as any}
        size={20}
        color={
          selectedCategory === category.id
            ? theme.colors.text.primary
            : theme.colors.text.secondary
        }
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.selectedCategoryText,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Shop</Text>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
              <Ionicons name="bag" size={24} color={theme.colors.text.primary} />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <LinearGradient
              colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
              style={styles.searchGradient}
            >
              <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor={theme.colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </ScrollView>

          {/* Products Grid */}
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="bag-outline" size={64} color={theme.colors.text.secondary} />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
              </View>
            }
          />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  cartButton: {
    position: 'relative' as const,
    padding: theme.spacing[2],
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    marginBottom: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[3],
  },
  categoriesContainer: {
    marginBottom: theme.spacing[4],
  },
  categoriesContent: {
    paddingRight: theme.spacing[4],
  },
  categoryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing[3],
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.neon.blue,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedCategoryText: {
    color: theme.colors.text.primary,
  },
  productsContainer: {
    paddingBottom: theme.spacing[6],
  },
  productRow: {
    justifyContent: 'space-between' as const,
  },
  productCard: {
    width: PRODUCT_WIDTH,
    marginBottom: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
  },
  productGradient: {
    padding: theme.spacing[3],
    position: 'relative' as const,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[3],
  },
  productInfo: {
    marginBottom: theme.spacing[2],
  },
  productName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  productPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.green,
    marginBottom: theme.spacing[1],
  },
  ratingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
  },
  addToCartButton: {
    position: 'absolute' as const,
    top: theme.spacing[3],
    right: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden' as const,
  },
  addButtonGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});


