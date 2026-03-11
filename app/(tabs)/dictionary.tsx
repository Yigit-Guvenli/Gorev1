import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

interface Term {
  term: string;
  desc: string;
  category: string;
}

const CATEGORIES = ["Tümü", "Genel", "Oyun", "Mekanik", "Takım", "Ödüller"];

const TERMS: Term[] = [
  { term: "FIRST", desc: "\"For Inspiration and Recognition of Science and Technology\" kelimelerinin baş harflerinden oluşan, gençleri bilim ve teknolojiye teşvik etmek amacıyla kurulmuş kâr amacı gütmeyen organizasyon.", category: "Genel" },
  { term: "FRC", desc: "FIRST Robotics Competition. FIRST organizasyonunun lise öğrencilerine yönelik en büyük ve kapsamlı robotik yarışması.", category: "Genel" },
  { term: "Gracious Professionalism", desc: "Hem rekabetin hem de karşılıklı saygının bir arada yürüdüğü bir FRC felsefesi. Rakiplerinize yardım etmeyi ve onlardan öğrenmeyi teşvik eder.", category: "Genel" },
  { term: "Coopertition", desc: "\"Cooperation\" ve \"Competition\" kelimelerinin birleşimi. Takımların hem rekabet edip hem de birbirlerine yardım ederek daha büyük başarılara ulaşmasını ifade eder.", category: "Genel" },
  { term: "Rookie", desc: "FRC'ye ilk defa katılan takım veya üye.", category: "Genel" },
  { term: "Veteran", desc: "FRC'de en az bir sezon tecrübesi olan takım veya üye.", category: "Genel" },
  { term: "Alliance (İttifak)", desc: "Maç sırasında birlikte hareket eden takımlar grubu. Genellikle Kırmızı ve Mavi olmak üzere iki ittifak bulunur.", category: "Oyun" },
  { term: "Autonomous Period", desc: "Maçın ilk 15 saniyesi; robotlar sürücü kontrolü olmadan önceden programlanmış görevleri yapar.", category: "Oyun" },
  { term: "Tele-Op Period", desc: "Otonomdan sonraki sürücü kontrollü bölüm.", category: "Oyun" },
  { term: "Endgame", desc: "Maçın sonunda ekstra puan getiren görevlerin yapıldığı bölüm.", category: "Oyun" },
  { term: "Game Piece", desc: "Robotların topladığı, taşıdığı ve skorladığı oyun nesneleri.", category: "Oyun" },
  { term: "Driver Station", desc: "Sürücülerin robotu yönettiği kontrol alanı.", category: "Oyun" },
  { term: "Ranking Points (RP)", desc: "Takımların sıralamada kullanıldığı puan sistemi.", category: "Oyun" },
  { term: "Chassis / Drivetrain", desc: "Robotun hareketini sağlayan temel mekanik ve aktarma yapısı.", category: "Mekanik" },
  { term: "Bumper", desc: "Robotu çarpışmalara karşı koruyan güvenlik bileşeni.", category: "Mekanik" },
  { term: "Manipulator / Actuator", desc: "Oyun elemanlarını toplama, taşıma ve yerleştirme mekanizmaları.", category: "Mekanik" },
  { term: "roboRIO", desc: "Robotun ana kontrol birimi.", category: "Mekanik" },
  { term: "Motor Controller", desc: "Motorlara giden gücü ve komutları yöneten sürücü kartı.", category: "Mekanik" },
  { term: "Pneumatics", desc: "Basınçlı hava ile çalışan mekanizma sistemi.", category: "Mekanik" },
  { term: "Sensor", desc: "Robotun çevreyi algılamasını sağlayan bileşenler.", category: "Mekanik" },
  { term: "Drive Team", desc: "Maç esnasında robotu yöneten ekip: sürücü, operatör, koç ve insan oyuncu.", category: "Takım" },
  { term: "Pit", desc: "Takımın robot bakım ve hazırlıklarını yaptığı çalışma alanı.", category: "Takım" },
  { term: "Scouting", desc: "Takım performanslarını izleyip veri toplayarak strateji geliştirme süreci.", category: "Takım" },
  { term: "Mentor", desc: "Öğrencilere teknik ve sosyal alanlarda rehberlik eden gönüllü yetişkin.", category: "Takım" },
  { term: "Kickoff", desc: "Yeni FRC oyununun ve kurallarının açıklandığı sezon başlangıç etkinliği.", category: "Ödüller" },
  { term: "Regional / District", desc: "Takımların sezon boyunca yarıştığı resmi turnuva formatları.", category: "Ödüller" },
  { term: "Championship", desc: "Sezon sonunda en iyi takımların yarıştığı final etkinliği.", category: "Ödüller" },
  { term: "FIRST Impact Award", desc: "Toplumsal etki ve FIRST değerlerini en güçlü yansıtan takıma verilen prestijli ödül.", category: "Ödüller" },
  { term: "Engineering Inspiration Award", desc: "Mühendislik bilincini ve ilhamını güçlü şekilde yaygınlaştıran takımlara verilir.", category: "Ödüller" },
  { term: "Rookie All-Star Award", desc: "İlk yılında güçlü performans ve potansiyel gösteren çaylak takıma verilir.", category: "Ödüller" },
  { term: "Excellence in Engineering Award", desc: "Robot tasarımında güçlü mühendislik uygulamalarını ödüllendirir.", category: "Ödüller" },
  { term: "Winner", desc: "Final maçlarını kazanan ittifaktaki takımların unvanı.", category: "Ödüller" },
  { term: "Finalist", desc: "Final maçlarını ikinci sırada tamamlayan ittifaktaki takımların unvanı.", category: "Ödüller" },
];

// ─── Term Card ────────────────────────────────────────────────────────────────

const TermCard: React.FC<{ term: Term; index: number }> = ({ term, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.termCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.termHeader}>
        <Text style={styles.termName}>{term.term}</Text>
        <View style={styles.termCategoryBadge}>
          <Text style={styles.termCategoryText}>{term.category}</Text>
        </View>
      </View>
      <Text style={styles.termDesc}>{term.desc}</Text>
    </Animated.View>
  );
};

// ─── Filter Button ────────────────────────────────────────────────────────────

const FilterButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.filterBtn, active && styles.filterBtnActive]}
  >
    <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DictionaryScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [headerHeight, setHeaderHeight] = useState(240);
  const router = useRouter();

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
    if (currentY <= 10) {
      showHeader();
    } else if (diff > 4) {
      hideHeader();
    } else if (diff < -4) {
      showHeader();
    }
    lastScrollY.current = currentY;
  };

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-headerHeight, 0],
  });

  const filtered = TERMS.filter((t) => {
    const matchSearch = t.term.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Tümü" || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <Animated.View
        style={[
          styles.header,
          { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] },
        ]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>SÖZLÜK</Text>
        <Text style={styles.headerTitle}>FIRST Terimleri</Text>
        <Text style={styles.headerSub}>FRC, FTC, FLL terim ve kısaltmaları</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Terim ara..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingTop: headerHeight + 12 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.resultCount}>{filtered.length} terim</Text>
        {filtered.map((term, i) => (
          <TermCard key={term.term} term={term} index={i} />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfaf2",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#fdfaf2",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ede8d8",
  },
  backBtn: {
    marginBottom: 10,
  },
  backBtnText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  headerLabel: {
    color: "#e5ae32",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  clearBtn: {
    fontSize: 14,
    color: "#9ca3af",
    paddingLeft: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c8bfa0",
    backgroundColor: "#fdfaf2",
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    borderColor: "#e5ae32",
    backgroundColor: "#e5ae32",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },
  filterBtnTextActive: {
    color: "#111827",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  resultCount: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
    fontWeight: "600",
  },
  termCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    padding: 16,
    marginBottom: 10,
  },
  termHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  termName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    flex: 1,
  },
  termCategoryBadge: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  termCategoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
  },
  termDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
  },
});

export default DictionaryScreen;