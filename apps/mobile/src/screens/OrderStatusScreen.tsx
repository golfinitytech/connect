import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrder, useUpdateOrderStatus } from '../api/hooks';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const OrderStatusSkeleton = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.topBar}>
      <CircleSkeleton width={32} height={32} />
      <RectSkeleton width={120} height={24} />
      <View style={styles.iconPlaceholder} />
    </View>

    <View style={styles.metaCard}>
      <View style={styles.metaHeader}>
        <RectSkeleton width={100} height={22} />
        <RectSkeleton width={80} height={24} borderRadius={8} />
      </View>
      <View style={styles.metaDivider} />
      <View style={styles.locationSection}>
        <View>
          <RectSkeleton width={100} height={11} style={{ marginBottom: 4 }} />
          <RectSkeleton width={140} height={18} />
        </View>
        <RectSkeleton width={42} height={42} borderRadius={12} />
      </View>
    </View>

    <View style={styles.progressCard}>
      <View style={styles.rowBetween}>
        <RectSkeleton width={120} height={20} />
        <RectSkeleton width={40} height={18} borderRadius={6} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.progressNodeWrap}>
            <CircleSkeleton width={44} height={44} />
            <RectSkeleton width={60} height={10} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      <View style={styles.statusInfoBox}>
        <RectSkeleton width="100%" height={15} style={{ marginBottom: 4 }} />
        <RectSkeleton width="80%" height={15} />
      </View>
    </View>
  </ScrollView>
);

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

const sequence = ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'] as const;

export function OrderStatusScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 980 });
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    // Note: Automated status transitions removed to rely on backend updates.
    // The useOrder hook has a refetchInterval to poll for status changes.
  }, [order, orderId, updateStatus]);

  if (isLoading || !order) {
    return (
      <ScreenWrapper style={{ flex: 1 }} edges={['top', 'bottom']}>
        <OrderStatusSkeleton />
      </ScreenWrapper>
    );
  }

  const activeIndex = sequence.indexOf(order.status as (typeof sequence)[number]);

  return (
    <ScreenWrapper style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.container, centeredContainerStyle]}>
        <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#0D1712" />
        </Pressable>
        <Text style={styles.title}>Order Status</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      <View style={styles.metaCard}>
        <View style={styles.metaHeader}>
          <Text style={styles.orderIdText}>#{order.id.slice(0, 6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.statusBadgeText}>{order.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.locationSection}>
          <View>
            <Text style={styles.metaLabel}>DELIVERY LOCATION</Text>
            <Text style={styles.metaValue}>Hole {order.holeNumber ?? '--'} Fairway</Text>
          </View>
          <View style={styles.locationIconWrap}>
            <Ionicons name="location" size={20} color={colors.primaryDark} />
          </View>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.progressTitle}>Delivery Progress</Text>
          <Text style={styles.liveBadge}>LIVE</Text>
        </View>

        <View style={styles.progressRow}>
          {sequence.map((status, index) => {
            const active = index <= activeIndex;
            const isCurrent = index === activeIndex;
            
            let iconName: any = 'close';
            if (status === 'ON_THE_WAY') iconName = 'flag';
            if (status === 'DELIVERED') iconName = 'checkmark';
            
            return (
              <View key={status} style={styles.progressNodeWrap}>
                <View style={[
                  styles.progressNode, 
                  active && styles.progressNodeActive,
                  isCurrent && { backgroundColor: colors.primary }
                ]}>
                  <Ionicons
                    name={iconName}
                    size={18}
                    color={active ? '#0A2211' : '#B8C7BF'}
                  />
                </View>
                <Text style={[
                  styles.progressLabel, 
                  active && styles.progressLabelActive,
                  isCurrent && { color: colors.primaryDark }
                ]}>
                  {status.replace('_', ' ')}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.statusInfoBox}>
          <Text style={styles.statusInfoText}>
            {order.status === 'PREPARING'
              ? 'Chef is adding the final touches to your meal.'
              : order.status === 'ON_THE_WAY'
                ? 'Runner is on the way to your hole.'
                : order.status === 'DELIVERED'
                  ? 'Order delivered. Enjoy.'
                  : 'Order queued and confirmed.'}
          </Text>
        </View>
      </View>

      <View style={styles.trackCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.progressTitle}>Track Updates</Text>
          <Text style={styles.liveBadge}>LIVE</Text>
        </View>
        {order.statusLogs?.map((log) => (
          <View key={log.id} style={styles.trackRow}>
            <View style={styles.trackDotWrap}>
              <View style={[styles.trackDot, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.trackContent}>
              <Text style={styles.trackStatusText}>{log.status.replace('_', ' ')}</Text>
              <Text style={styles.trackNoteText}>{log.note ?? 'Order created'}</Text>
            </View>
            <Text style={styles.trackTimeText}>
              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Order Summary</Text>
      <View style={styles.summaryCard}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <View style={styles.itemMain}>
              <View style={styles.thumbWrap}>
                {item.menuItem.imageUrl ? (
                  <Image source={{ uri: item.menuItem.imageUrl }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Ionicons name="fast-food-outline" size={24} color="#9AA7A1" />
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.quantity}x {item.menuItem.name}
                </Text>
                <Text style={styles.itemSub} numberOfLines={2}>
                  {item.menuItem.description}
                </Text>
              </View>
            </View>
            <Text style={styles.itemPrice}>
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryFooter}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${Number(order.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Fee (18%)</Text>
            <Text style={styles.totalValue}>${Number(order.serviceFee).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRowStrong}>
            <Text style={styles.totalStrongLabel}>Total Paid</Text>
            <Text style={styles.totalStrongValue}>${Number(order.totalPaid).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.helpBtn}
        hitSlop={10}
        onPress={() => Linking.openURL('tel:+15550101188')}
      >
        <Text style={styles.helpBtnText}>Call Pro Shop for assistance</Text>
      </Pressable>
    </ScrollView>
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
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  topBar: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  iconPlaceholder: {
    width: 36,
  },
  metaCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2211',
    textTransform: 'uppercase',
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#F0F4F2',
  },
  locationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  locationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0FAF3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1F2E7',
  },
  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: '#00F04C',
    color: '#0A2211',
    fontWeight: '900',
    fontSize: 11,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  progressNodeWrap: {
    alignItems: 'center',
    gap: 8,
    width: 70,
  },
  progressNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EFEC',
  },
  progressNodeActive: {
    backgroundColor: '#EAF5EE',
    borderColor: '#D3E8DB',
  },
  progressLabel: {
    fontSize: 10,
    color: '#A0B0A8',
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressLabelActive: {
    color: '#60706A',
  },
  statusInfoBox: {
    borderRadius: 14,
    backgroundColor: '#F8FCFA',
    borderWidth: 1,
    borderColor: '#E8F2ED',
    padding: spacing.md,
  },
  statusInfoText: {
    color: '#3E6E54',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  trackCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  trackDotWrap: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trackContent: {
    flex: 1,
    gap: 2,
  },
  trackStatusText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    textTransform: 'uppercase',
  },
  trackNoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  trackTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7A8C84',
    paddingTop: 2,
  },
  sectionHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F7F5',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  itemSub: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  itemPrice: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginLeft: spacing.sm,
  },
  summaryFooter: {
    padding: spacing.md,
    backgroundColor: '#F9FCFA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    color: '#7A8C84',
    fontWeight: '700',
    fontSize: 16,
  },
  totalValue: {
    color: '#7A8C84',
    fontWeight: '800',
    fontSize: 16,
  },
  totalRowStrong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E8F0EC',
  },
  totalStrongLabel: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  totalStrongValue: {
    color: colors.primaryDark,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  helpBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E4DE',
    backgroundColor: '#F3F7F5',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  helpBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
});
