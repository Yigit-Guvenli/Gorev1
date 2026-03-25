import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://192.168.1.110:3000";

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
  type: "video" | "text" | "pdf";
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

const LESSON_ICONS: Record<string, string> = {
  video: "▶",
  pdf: "📄",
  text: "📝",
};

const CourseDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [loadingModule, setLoadingModule] = useState<string | null>(null);
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

  const toggleModule = async (moduleId: string) => {
    // Zaten açıksa kapat
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      return;
    }

    // Dersler daha önce yüklenmediyse çek
    if (!lessons[moduleId]) {
      setLoadingModule(moduleId);
      try {
        const res = await fetch(`${BASE_URL}/lessons?moduleId=${moduleId}`);
        const data = await res.json();
        const sorted: Lesson[] = data.sort((a: Lesson, b: Lesson) => a.order - b.order);
        setLessons(prev => ({ ...prev, [moduleId]: sorted }));
      } catch (error) {
        console.error("Ders çekme hatası:", error);
      } finally {
        setLoadingModule(null);
      }
    }

    setExpandedModule(moduleId);
  };

  const handleLessonPress = async (lesson: Lesson, moduleId: string) => {
    const moduleLessons = lessons[moduleId] ?? [];
    const currentIndex = moduleLessons.findIndex(l => l.id === lesson.id);
    const nextLesson = moduleLessons[currentIndex + 1] ?? null;

    if (lesson.type === "pdf") {
      await Linking.openURL(lesson.content);
    } else if (lesson.type === "text") {
      router.navigate({
        pathname: "/(tabs)/text-lesson",
        params: {
          content: lesson.content,
          title: lesson.title,
          nextUrl: nextLesson?.content ?? "",
          nextTitle: nextLesson?.title ?? "",
          nextType: nextLesson?.type ?? "",
          courseId: id,
        },
      } as any);
    } else {
      router.navigate({
        pathname: "/(tabs)/video",
        params: {
          url: lesson.content,
          title: lesson.title,
          nextUrl: nextLesson?.content ?? "",
          nextTitle: nextLesson?.title ?? "",
          nextType: nextLesson?.type ?? "",
          courseId: id,
        },
      } as any);
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

          {modules.map((mod, index) => {
            const isExpanded = expandedModule === mod.id;
            const isLoadingThis = loadingModule === mod.id;
            const modLessons = lessons[mod.id] ?? [];

            return (
              <View key={mod.id} style={styles.moduleCard}>
                {/* Modül başlığı */}
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
                  {isLoadingThis ? (
                    <ActivityIndicator size="small" color="#e5ae32" />
                  ) : (
                    <Text style={[styles.moduleArrow, isExpanded && styles.moduleArrowOpen]}>
                      ▼
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Ders listesi (accordion) */}
                {isExpanded && modLessons.length > 0 && (
                  <View style={styles.lessonsList}>
                    {modLessons.map((lesson, lessonIndex) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonItem,
                          lessonIndex === modLessons.length - 1 && styles.lessonItemLast,
                        ]}
                        onPress={() => handleLessonPress(lesson, mod.id)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.lessonIconBox}>
                          <Text style={styles.lessonIcon}>
                            {LESSON_ICONS[lesson.type] ?? "📌"}
                          </Text>
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          {lesson.duration ? (
                            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                          ) : null}
                        </View>
                        <Text style={styles.lessonChevron}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {isExpanded && modLessons.length === 0 && !isLoadingThis && (
                  <View style={styles.emptyLessons}>
                    <Text style={styles.emptyLessonsText}>Henüz ders eklenmemiş</Text>
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fdfaf2" },

  coverImage: { width: "100%", height: 240, backgroundColor: "#e8e0c8" },

  backBtnAbsolute: { position: "absolute", top: 48, left: 24 },
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
  moduleArrow: { fontSize: 13, color: "#9ca3af" },
  moduleArrowOpen: { color: "#e5ae32" },

  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: "#e8e0c8",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e0c8",
    gap: 12,
    backgroundColor: "#fdfaf2",
  },
  lessonItemLast: {
    borderBottomWidth: 0,
  },
  lessonIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f5f0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIcon: { fontSize: 15 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 2 },
  lessonDuration: { fontSize: 11, color: "#9ca3af" },
  lessonChevron: { fontSize: 20, color: "#9ca3af", fontWeight: "300" },

  emptyLessons: {
    borderTopWidth: 1,
    borderTopColor: "#e8e0c8",
    padding: 16,
    alignItems: "center",
  },
  emptyLessonsText: { fontSize: 13, color: "#9ca3af" },
});

export default CourseDetailScreen;