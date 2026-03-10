import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

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
      marginRight: 8,
    }}
  >
    <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{label}</Text>
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
  const headerAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

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

      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>EĞİTİM</Text>
        <Text style={styles.headerTitle}>Kurslar</Text>
        <Text style={styles.headerSub}>{COURSES.length} kurs mevcut</Text>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <FilterButton key={cat} label={cat} active={activeCategory === cat} onPress={() => setActiveCategory(cat)} />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }}
      >
        {LEVELS.map((lvl) => (
          <FilterButton key={lvl} label={lvl} active={activeLevel === lvl} onPress={() => setActiveLevel(lvl)} />
        ))}
      </ScrollView>

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
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
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "#111827", letterSpacing: -1, marginBottom: 4 },
  headerSub: { fontSize: 14, color: "#9ca3af" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
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