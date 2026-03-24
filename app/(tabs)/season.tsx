import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegionalStatus = "completed" | "upcoming" | "live";

interface Regional {
  name: string;
  dates: string;
  venue: string;
  city: string;
  startDate: Date;
  endDate: Date;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const REGIONALS: Regional[] = [
  {
    name: "İstanbul Regional",
    dates: "3–5 Mart 2026",
    venue: "Gençlik ve Spor Bakanlığı, Başakşehir Spor Kompleksi",
    city: "Başakşehir, İstanbul",
    startDate: new Date("2026-03-03"),
    endDate: new Date("2026-03-05"),
  },
  {
    name: "Bosphorus Regional",
    dates: "6–8 Mart 2026",
    venue: "Gençlik ve Spor Bakanlığı, Başakşehir Spor Kompleksi",
    city: "Başakşehir, İstanbul",
    startDate: new Date("2026-03-06"),
    endDate: new Date("2026-03-08"),
  },
  {
    name: "Haliç Regional",
    dates: "25–27 Mart 2026",
    venue: "Türkiye Atletizm Federasyonu Atletizm Salonu",
    city: "Bakırköy, İstanbul",
    startDate: new Date("2026-03-25"),
    endDate: new Date("2026-03-27"),
  },
  {
    name: "Marmara Regional",
    dates: "28–30 Mart 2026",
    venue: "Türkiye Atletizm Federasyonu Atletizm Salonu",
    city: "Bakırköy, İstanbul",
    startDate: new Date("2026-03-28"),
    endDate: new Date("2026-03-30"),
  },
  {
    name: "Avrasya Regional",
    dates: "31 Mart – 2 Nisan 2026",
    venue: "Türkiye Atletizm Federasyonu Atletizm Salonu",
    city: "Bakırköy, İstanbul",
    startDate: new Date("2026-03-31"),
    endDate: new Date("2026-04-02"),
  },
  {
    name: "Ankara Regional",
    dates: "7–9 Nisan 2026",
    venue: "Devlet Bahçeli Eğitim Yaşam ve Spor Yerleşkesi",
    city: "Etimesgut, Ankara",
    startDate: new Date("2026-04-07"),
    endDate: new Date("2026-04-09"),
  },
  {
    name: "Başkent Regional",
    dates: "10–12 Nisan 2026",
    venue: "Devlet Bahçeli Eğitim Yaşam ve Spor Yerleşkesi",
    city: "Etimesgut, Ankara",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-12"),
  },
];

const STATUS_CONFIG: Record<RegionalStatus, { label: string; bg: string; text: string }> = {
  completed: { label: "Tamamlandı", bg: "#d1fae5", text: "#065f46" },
  upcoming:  { label: "Yaklaşıyor", bg: "#fef3c7", text: "#92400e" },
  live:      { label: "Canlı",      bg: "#fee2e2", text: "#991b1b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(startDate: Date, endDate: Date): RegionalStatus {
  const now = new Date();
  const end = new Date(endDate);
  end.setHours(23, 59, 59);
  if (now > end) return "completed";
  if (now >= startDate) return "live";
  return "upcoming";
}

function getDaysRemaining(startDate: Date, endDate: Date): string | null {
  const now = new Date();
  const end = new Date(endDate);
  end.setHours(23, 59, 59);
  if (now > end) return null;
  if (now >= startDate) return "Devam Ediyor";
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const diff = Math.round((startMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));
  return `${diff} gün kaldı`;
}

// ─── Regional Card ────────────────────────────────────────────────────────────

const RegionalCard: React.FC<{ regional: Regional; index: number }> = ({ regional, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const status = getStatus(regional.startDate, regional.endDate);
  const statusCfg = STATUS_CONFIG[status];
  const daysRemaining = getDaysRemaining(regional.startDate, regional.endDate);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardName}>{regional.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {daysRemaining && (
        <View style={styles.daysRemainingBadge}>
          <Text style={styles.daysRemainingText}>{daysRemaining}</Text>
        </View>
      )}

      <View style={styles.cardDetail}>
        <Text style={styles.detailIcon}>📅</Text>
        <Text style={styles.detailText}>{regional.dates}</Text>
      </View>
      <View style={styles.cardDetail}>
        <Text style={styles.detailIcon}>📍</Text>
        <Text style={styles.detailText}>{regional.venue}</Text>
      </View>
      <View style={styles.cardDetail}>
        <Text style={styles.detailIcon}>🏙️</Text>
        <Text style={styles.detailText}>{regional.city}</Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SeasonScreen: React.FC = () => {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = React.useState(180);

  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const headerAnim = useRef(new Animated.Value(1)).current;

  const showHeader = () => {
    if (!headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  };

  const hideHeader = () => {
    if (headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (currentY <= 10) showHeader();
    else if (diff > 4) hideHeader();
    else if (diff < -4) showHeader();
    lastScrollY.current = currentY;
  };

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-headerHeight, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <Animated.View
        style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>2026 SEZONU</Text>
        <Text style={styles.headerTitle}>REBUILT™</Text>
        <Text style={styles.headerSub}>Türkiye Regional'ları — Mart & Nisan 2026</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 12 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Game Card */}
        <View style={styles.gameCard}>
          <View style={styles.gameCardHeader}>
            <Text style={styles.gameEmoji}>🤖</Text>
            <View>
              <Text style={styles.gameLabel}>2026 FRC OYUNU</Text>
              <Text style={styles.gameTitle}>REBUILT™</Text>
            </View>
          </View>
          <Text style={styles.gameDesc}>
            Qualcomm tarafından sunulan FIRST® AGE℠ sezonu, arkeoloji temasıyla robotik dünyasına ilham veriyor. Takımlar, REBUILT™ adlı bu yeni mücadelede mühendislik becerilerini kullanarak geçmişi yeniden hayal edecek. Her bir buluntu, her bir araç ve her bir sanat eseri, bizden önce gelen insanların ve fikirlerin hikayesini barındırıyor. Bu sezon, STEM becerilerini kullanarak geçmişin derinliklerine inecek ve bilime ışık tutacaksınız.
          </Text>
        </View>

        {/* Regionals */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAKVİM</Text>
          <Text style={styles.sectionTitle}>Türkiye Regional'ları</Text>
          {REGIONALS.map((regional, i) => (
            <RegionalCard key={regional.name} regional={regional} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 10,
    backgroundColor: "#fdfaf2",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ede8d8",
  },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 30, fontFamily: "Sakana", color: "#111827", letterSpacing: -1, marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#9ca3af" },

  content: { paddingHorizontal: 24, paddingBottom: 48 },

  gameCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    marginTop: 8,
  },
  gameCardHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  gameEmoji: { fontSize: 36 },
  gameLabel: { color: "#e5ae32", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  gameTitle: { color: "#ffffff", fontSize: 24, fontFamily: "Sakana", letterSpacing: -0.5 },
  gameDesc: { color: "#9ca3af", fontSize: 13, lineHeight: 20, marginBottom: 18 },
  gameMeta: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  gameMetaItem: { flex: 1, alignItems: "center", gap: 4 },
  gameMetaLabel: { color: "#6b7280", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  gameMetaValue: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  gameMetaDivider: { width: 1, height: 28, backgroundColor: "#374151" },

  section: { marginBottom: 16 },
  sectionLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: "#111827", letterSpacing: -0.5, marginBottom: 16 },

  card: {
    backgroundColor: "#f5f0e0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    padding: 16,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  cardName: { fontSize: 15, fontWeight: "900", color: "#111827", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800" },
  daysRemainingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e5ae32",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  daysRemainingText: { fontSize: 10, fontWeight: "800", color: "#111827" },
  cardDetail: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 5 },
  detailIcon: { fontSize: 13, marginTop: 1 },
  detailText: { fontSize: 12, color: "#6b7280", flex: 1, lineHeight: 18 },
});

export default SeasonScreen;