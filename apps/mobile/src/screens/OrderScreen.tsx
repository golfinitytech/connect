import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useCreateOrder, useMe, useMenu, useRounds } from '../api/hooks';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { useOrderStore } from '../store/orderStore';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { findNearestHole } from '../utils/geo';
import { Logo } from '../components/Logo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const OrderSkeleton = () => (
  <View style={{ flex: 1 }}>
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <RectSkeleton width={180} height={28} />
        <CircleSkeleton width={40} height={40} />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.tabScrollContent}
        style={styles.tabBar}
      >
        {[1, 2, 3, 4].map((i) => (
          <RectSkeleton key={i} width={80} height={36} borderRadius={18} />
        ))}
      </ScrollView>
    </View>

    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <RectSkeleton width={120} height={13} style={{ marginBottom: spacing.md }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.itemCard}>
          <View style={styles.itemContentRow}>
            <View style={styles.itemTextCol}>
              <RectSkeleton width={120} height={18} style={{ marginBottom: 6 }} />
              <RectSkeleton width="100%" height={14} style={{ marginBottom: 4 }} />
              <RectSkeleton width="80%" height={14} style={{ marginBottom: 12 }} />
              <View style={styles.itemFooter}>
                <RectSkeleton width={60} height={20} />
                <RectSkeleton width={64} height={36} borderRadius={12} />
              </View>
            </View>
            <RectSkeleton width={100} height={100} borderRadius={14} />
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

export function OrderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 1120 });
  const { data: me } = useMe();
  const { data: menuData, isLoading: menuLoading } = useMenu();
  const { data: rounds, isLoading: roundsLoading } = useRounds();
  const createOrder = useCreateOrder();
  const { items, addItem, clear } = useOrderStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const activeRound = useMemo(() => {
    return (rounds ?? []).find((round) => round.status === 'IN_PROGRESS');
  }, [rounds]);

  const currentHole = useMemo(() => {
    if (location && activeRound?.course?.holes) {
      const { hole, distance } = findNearestHole(
        location.coords.latitude,
        location.coords.longitude,
        activeRound.course.holes
      );
      // Only suggest if we are within 500m of a hole (user is likely on the course)
      if (distance < 500) {
        return hole.number;
      }
    }
    return activeRound?.currentHole ?? 1;
  }, [location, activeRound]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onCheckout = async () => {
    if (!me || items.length === 0) {
      return;
    }

    const created = await createOrder.mutateAsync({
      userId: me.id,
      holeNumber: currentHole,
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    });

    clear();
    navigation.navigate('OrderStatus', { orderId: created.id });
  };

  const categories = useMemo(() => {
    const fromData = Array.from(new Set((menuData ?? []).map((item) => item.category.name)));
    return fromData.length > 0 ? fromData : ['Drinks', 'Snacks', 'Meals'];
  }, [menuData]);

  const [selectedCategory, setSelectedCategory] = useState<string>('Drinks');

  const effectiveCategory = categories.includes(selectedCategory) ? selectedCategory : (categories[0] ?? 'Drinks');

  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (menuData ?? []).filter((item) => {
      const matchesCategory = item.category.name === effectiveCategory;
      if (!term) return matchesCategory;
      const matchesTerm = 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [menuData, effectiveCategory, searchTerm]);

  if (menuLoading || roundsLoading) {
    return (
      <ScreenWrapper style={styles.container} edges={['top']}>
        <OrderSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Refreshments</Text>
          <Pressable 
            style={styles.iconButton}
            onPress={() => setSearchOpen((value) => !value)}
          >
            <Ionicons name={searchOpen ? 'close' : 'search'} size={22} color={colors.text} />
          </Pressable>
        </View>

        {searchOpen && (
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search menu items"
                placeholderTextColor={colors.textMuted}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
            </View>
          </View>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabBar}
        >
          {categories.map((category) => {
            const active = effectiveCategory === category;
            return (
              <Pressable 
                key={category} 
                onPress={() => setSelectedCategory(category)}
                style={[styles.tabItem, active && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, centeredContainerStyle]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Featured {effectiveCategory}</Text>

        {visibleItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemContentRow}>
              <View style={styles.itemTextCol}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                  <Pressable
                    style={styles.addBtn}
                    onPress={() =>
                      addItem({
                        menuItemId: item.id,
                        name: item.name,
                        price: Number(item.price),
                      })
                    }
                  >
                    <Ionicons name="add" size={20} color="#0C2012" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                </View>
              </View>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="fast-food-outline" size={32} color={colors.border} />
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryPill}>
            <Ionicons name="location" size={16} color="#FFFFFF" />
            <Text style={styles.deliveryPillText}>
              {activeRound ? `Delivering to Hole ${currentHole}` : 'Pickup at Clubhouse'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutLabel}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
            <Text style={styles.checkoutSub}>${subtotal.toFixed(2)} + service fee</Text>
          </View>
          <PrimaryButton
            label={createOrder.isPending ? 'Processing...' : 'View Cart'}
            style={styles.checkoutButton}
            onPress={() => void onCheckout()}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F7F5',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tabBar: {
    marginTop: spacing.xs,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: colors.primaryDark,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  itemContentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemTextCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#0C2012',
    fontWeight: '800',
    fontSize: 14,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#F3F7F5',
  },
  itemImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#F3F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deliveryPill: {
    borderRadius: 999,
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  checkoutSub: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  checkoutButton: {
    flex: 1.5,
  },
});
