import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://10.0.2.2:3000"; // Android emülatör için localhost

interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: "video" | "text";
  content: string;
  duration: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  team: string;
  category: string;
  level: string;
  cover: string;
  desc: string;
}

const CourseDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        fetch(`${BASE_URL}/courses/${id}`),
        fetch(`${BASE_URL}/modules?courseId=${id}`),
      ]);
      const courseData = await courseRes.json();
      const modulesData = await modulesRes.json();

      setCourse(courseData);
      setModules(modulesData.sort((a: Module, b: Module) => a.order - b.order));

      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    if (lessons[moduleId]) return;
    try {
      const res = await fetch(`${BASE_URL}/lessons?moduleId=${moduleId}`);
      const data = await res.json();
      setLessons(prev => ({
        ...prev,
        [moduleId]: data.sort((a: Lesson, b: Lesson) => a.order - b.order),
      }));
    } catch (error) {
      console.error("Ders çekme hatası:", error);
    }
  };

  const toggleModule = async (moduleId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/lessons?moduleId=${moduleId}`);
      const data = await res.json();
      const sorted = data.sort((a: Lesson, b: Lesson) => a.order - b.order);
      if (sorted.length > 0) {
        const nextLesson = sorted[1] ?? null;
        router.navigate({ 
          pathname: "/(tabs)/video", 
          params: { 
            url: sorted[0].content, 
            title: sorted[0].title,
            nextUrl: nextLesson?.content ?? "",
            nextTitle: nextLesson?.title ?? "",
            courseId: id,
          } 
        } as any);
      }
    } catch (error) {
      console.error("Ders çekme hatası:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e5ae32" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#111827" }}>Kurs bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: course.cover }} style={styles.coverImage} resizeMode="cover" />

        <View style={styles.backBtnAbsolute}>
          <TouchableOpacity
            onPress={() => router.navigate("/(tabs)/courses" as any)}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: headerAnim }]}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#f5f0e0" }]}>
              <Text style={[styles.badgeText, { color: "#6b7280" }]}>{course.level}</Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.team}>⚡ {course.team}</Text>
          <Text style={styles.desc}>{course.desc}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>KURS İÇERİĞİ</Text>
          <Text style={styles.sectionTitle}>{modules.length} Modül</Text>

          {modules.map((mod, index) => (
            <View key={mod.id} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModule(mod.id)}
                activeOpacity={0.8}
              >
                <View style={styles.moduleLeft}>
                  <View style={styles.moduleNumber}>
                    <Text style={styles.moduleNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                </View>
                <Text style={styles.moduleArrow}>▶</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fdfaf2" },

  coverImage: { width: "100%", height: 240, backgroundColor: "#e8e0c8" },

  backBtnAbsolute: {
    position: "absolute",
    top: 48,
    left: 24,
  },
  backBtn: {
    backgroundColor: "#fdfaf2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: { color: "#111827", fontSize: 14, fontWeight: "800" },

  content: { padding: 24 },

  badges: { flexDirection: "row", gap: 8, marginBottom: 12 },
  badge: { backgroundColor: "#e5ae32", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#111827" },

  title: { fontSize: 24, fontWeight: "900", color: "#111827", lineHeight: 30, marginBottom: 8 },
  team: { fontSize: 13, color: "#6b7280", fontWeight: "600", marginBottom: 12 },
  desc: { fontSize: 14, color: "#4b5563", lineHeight: 22, marginBottom: 24 },

  divider: { height: 1, backgroundColor: "#e8e0c8", marginBottom: 24 },

  sectionLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 16 },

  moduleCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    marginBottom: 10,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  moduleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5ae32",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleNumberText: { fontSize: 14, fontWeight: "900", color: "#111827" },
  moduleTitle: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1 },
  moduleArrow: { fontSize: 12, color: "#9ca3af" },

  lessonsList: { borderTopWidth: 1, borderTopColor: "#e8e0c8" },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e0c8",
    gap: 12,
  },
  lessonIcon: { fontSize: 16 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 2 },
  lessonDuration: { fontSize: 11, color: "#9ca3af" },
});

export default CourseDetailScreen;