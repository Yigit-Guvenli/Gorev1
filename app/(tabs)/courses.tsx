import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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

interface Course {
  id: string;
  title: string;
  team: string;
  category: string;
  level: string;
  cover: string;
  desc: string;
}

const CATEGORIES = ["Tümü", "FRC", "FTC", "FLL"];
const LEVELS = ["Tümü", "Başlangıç", "Orta", "İleri"];

const COURSES: Course[] = [
  {
    id: "kurs_b7463c4ad78235aa",
    title: "Kapsamlı SOLIDWORKS Eğitimi",
    team: "Kalsedon #6430",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_85_cover_f463cd1204dd5744.png",
    desc: "Aklınıza gelen bir parçayı tasarlayabilecek, montaj mantığı ile bileşenleri birleştirerek robotunuzu modelleyebileceksiniz.",
  },
  {
    id: "kurs_95e76b707a474466",
    title: "FRC Takımları İçin Robot Yazılım Eğitimi",
    team: "Mat Robotics #6228",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_88_cover_27875cecf54e67dd.jpeg",
    desc: "FRC takımları için robot yazılımı geliştirme eğitimi.",
  },
  {
    id: "kurs_73b61a371e4eae29",
    title: "Fusion 360 Eğitimi",
    team: "Mat Robotics #6228",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_82_cover_9fc8db35e94b6113.png",
    desc: "Yeni başlayanlara FRC robot tasarımı için gerekli olan Fusion 360 becerilerini kazandırmayı amaçlar.",
  },
  {
    id: "kurs_8a8bd1372a7f0692",
    title: "FRC Takımları İçin Sponsor Bulma Rehberi",
    team: "Mat Robotics #6228",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_84_cover_da5b57ec2547bcb6.png",
    desc: "Rookielere sponsorluk bulma ve sürdürme sürecini öğretmeyi amaçlar.",
  },
  {
    id: "kurs_1b4c930e5ffa4bfc",
    title: "Cosmic Science",
    team: "Cosmos Robot Works #7742",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_90_cover_ae11997ed7d4b384.png",
    desc: "Takımların sürdürülebilirlik konusunda bilinç kazanmasını ve bunu PR faaliyetlerine yansıtabilmelerini sağlar.",
  },
  {
    id: "kurs_f61e85b8ce09faa8",
    title: "FRC Hibe Bulma Süreci Rehberi",
    team: "Mat Robotics #6228",
    category: "FRC",
    level: "Başlangıç",
    cover: "https://www.rookieverse.net/uploads/covers/course_83_cover_6bebbfe7c3857731.jpg",
    desc: "FRC takımlarının hibe süreçlerini doğru yönetmek ve gerekli kaynakları etkili şekilde elde edebilmesini sağlar.",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "Başlangıç": "#4ade80",
  "Orta": "#fb923c",
  "İleri": "#f87171",
};



const FilterButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: active ? "#e5ae32" : "#c8bfa0",
      backgroundColor: active ? "#e5ae32" : "#fdfaf2",
      minWidth: 60,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#111827" : "#333333", includeFontPadding: false }}>
      {label}
    </Text>
  </TouchableOpacity>
);

const CourseCard: React.FC<{ course: Course; index: number; onPress: () => void }> = ({ course, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.courseCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Image source={{ uri: course.cover }} style={styles.courseImage} resizeMode="cover" />
        <View style={styles.courseCategoryBadge}>
          <Text style={styles.courseCategoryText}>{course.category}</Text>
        </View>
        <View style={styles.courseBody}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDesc} numberOfLines={2}>{course.desc}</Text>
          <View style={styles.courseFooter}>
            <Text style={styles.courseTeam}>⚡ {course.team}</Text>
            <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[course.level] ?? "#e5ae32" }]}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CoursesScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [activeLevel, setActiveLevel] = useState("Tümü");
  const [headerHeight, setHeaderHeight] = useState(270);
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
    if (currentY <= 10) showHeader();
    else if (diff > 4) hideHeader();
    else if (diff < -4) showHeader();
    lastScrollY.current = currentY;
  };

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-headerHeight, 0],
  });

  const filtered = COURSES.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.team.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Tümü" || c.category === activeCategory;
    const matchLevel = activeLevel === "Tümü" || c.level === activeLevel;
    return matchSearch && matchCat && matchLevel;
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
        <Text style={styles.headerLabel}>EĞİTİM</Text>
        <Text style={styles.headerTitle}>Kurslar</Text>
        <Text style={styles.headerSub}>{COURSES.length} kurs mevcut</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Kurs veya takım ara..."
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

        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 10, gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <FilterButton key={cat} label={cat} active={activeCategory === cat} onPress={() => setActiveCategory(cat)} />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 8, gap: 8 }}>
          {LEVELS.map((lvl) => (
            <FilterButton key={lvl} label={lvl} active={activeLevel === lvl} onPress={() => setActiveLevel(lvl)} />
          ))}
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingTop: headerHeight + 12 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.resultCount}>{filtered.length} kurs</Text>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Kurs bulunamadı</Text>
          </View>
        ) : (
          filtered.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onPress={() => console.log("Kurs:", course.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

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
  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 30, fontWeight: "900", color: "#111827", letterSpacing: -1, marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#9ca3af", marginBottom: 10 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e8e0c8",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  clearBtn: { fontSize: 14, color: "#9ca3af", paddingLeft: 8 },

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

  courseCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    marginBottom: 16,
    overflow: "hidden",
  },
  courseImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#e8e0c8",
  },
  courseCategoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#e5ae32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  courseCategoryText: { color: "#111827", fontSize: 11, fontWeight: "800" },
  courseBody: { padding: 16 },
  courseTitle: { fontSize: 17, fontWeight: "900", color: "#111827", marginBottom: 6, lineHeight: 22 },
  courseDesc: { fontSize: 13, color: "#6b7280", lineHeight: 18, marginBottom: 12 },
  courseFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  courseTeam: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: "800", color: "#111827" },

  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16, color: "#9ca3af" },
});

export default CoursesScreen;