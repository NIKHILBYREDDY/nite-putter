import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useShopStore } from '../../store/shopStore';
import { ProductDetailScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route: _route, navigation }: ProductDetailScreenProps) => {
  const { selectedProduct, addToCart } = useShopStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      // Show success feedback
      navigation.goBack();
    }
  };

  if (!selectedProduct) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const mockImages = [
    selectedProduct.images[0],
    selectedProduct.images[0],
    selectedProduct.images[0],
  ];

  const mockReviews = [
    {
      id: '1',
      user: 'GolfPro23',
      rating: 5,
      comment: 'Amazing glow! Perfect for night golf sessions.',
      date: '2024-01-15',
    },
    {
      id: '2',
      user: 'NightOwl',
      rating: 4,
      comment: 'Great quality, bright colors. Love the customization options.',
      date: '2024-01-10',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {mockImages.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {mockImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{selectedProduct.name}</Text>
          <Text style={styles.productPrice}>${selectedProduct.price.toFixed(2)}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ 4.8</Text>
            <Text style={styles.reviewCount}>(24 reviews)</Text>
          </View>

          <Text style={styles.description}>
            {selectedProduct.description || 'Experience the ultimate night golf with our premium glow-in-the-dark accessories. Engineered for performance and style.'}
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.feature}>
              <Text style={styles.featureText}>• Ultra-bright LED technology</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureText}>• 8+ hour battery life</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureText}>• Waterproof design</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureText}>• Multiple color modes</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsTitle}>Reviews</Text>
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleAddToCart}>
          <LinearGradient
            colors={['#00FF88', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToCartButton}
          >
            <Text style={styles.addToCartText}>
              Add to Cart • ${(selectedProduct.price * quantity).toFixed(2)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#00FF88',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#888888',
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  feature: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#333333',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 20,
  },
  reviewsContainer: {
    marginBottom: 100,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  review: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888888',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  addToCartButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});