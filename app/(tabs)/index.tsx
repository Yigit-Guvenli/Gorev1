import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

interface Course {
  id: string;
  title: string;
  level: string;
  team: string;
  category: string;
  cover: string;
}

interface Feature {
  image?: any;
  icon?: string;
  title: string;
  desc: string;
  route?: string;
}

const FEATURED_COURSES: Course[] = [
  {
    id: "kurs_b7463c4ad78235aa",
    title: "Kapsamlı SOLIDWORKS Eğitimi",
    level: "Başlangıç",
    team: "Kalsedon",
    category: "FRC",
    cover: "https://www.rookieverse.net/uploads/covers/course_85_cover_f463cd1204dd5744.png",
  },
  {
    id: "kurs_73b61a371e4eae29",
    title: "Fusion 360 Eğitimi",
    level: "Başlangıç",
    team: "Mat Robotics",
    category: "FRC",
    cover: "https://www.rookieverse.net/uploads/covers/course_82_cover_9fc8db35e94b6113.png",
  },
  {
    id: "kurs_8a8bd1372a7f0692",
    title: "Sponsor Bulma Rehberi",
    level: "Başlangıç",
    team: "Mat Robotics",
    category: "FRC",
    cover: "https://www.rookieverse.net/uploads/covers/course_84_cover_da5b57ec2547bcb6.png",
  },
];

const FEATURES: Feature[] = [
  {
    icon: "📚",
    title: "Kapsamlı Kurslar",
    desc: "FRC, FTC, FLL için başlangıçtan ileri seviyeye içerikler",
    route: "/(tabs)/cour",
  },
  {
    icon: "🎮",
    title: "İnteraktif Oyunlar",
    desc: "Öğrendiklerini eğlenceli oyunlarla pekiştir",
    route: "/(tabs)/games",
  },
  {
    icon: "🤝",
    title: "Topluluk Desteği",
    desc: "Türkiye'deki FIRST takımlarıyla bağlan",
    route: "/(tabs)/teams",
  },
];

const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 150, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.courseCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity activeOpacity={0.85}>
        <Image source={{ uri: course.cover }} style={styles.courseImage} resizeMode="cover" />
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>{course.category}</Text>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
          <View style={styles.courseFooter}>
            <Text style={styles.courseTeam}>⚡ {course.team}</Text>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FeatureCard: React.FC<{ feature: Feature; index: number; onPress?: () => void }> = ({ feature, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, delay: 300 + index * 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: 300 + index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={{ flex: 1 }}>
      <Animated.View style={[styles.featureCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }, onPress && styles.featureCardClickable]}>
        {feature.image ? (
          <Image source={feature.image} style={styles.featureIconImage} />
        ) : (
          <Text style={styles.featureIcon}>{feature.icon}</Text>
        )}
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDesc}>{feature.desc}</Text>
        {onPress && <Text style={styles.featureArrow}>→</Text>}
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>

        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroSlide }] }}>
            <Text style={styles.heroTag}>ROOKIEVERSE</Text>
            <Text style={styles.heroTitle}>
              {"FIRST\nDünyasına\n"}<Text style={{ color: "#e5ae32" }}>Hoş Geldin</Text>
            </Text>
            <Text style={styles.heroSub}>
              FIRST takımlarının tecrübesiyle hazırlanan; sıfırdan zirveye giden yolda Rookie üyeler ve takımların ihtiyaç duyduğu tüm kaynaklar artık tek çatı altında.
            </Text>
            <View style={styles.heroBtns}>
              <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={() => router.push("/(tabs)/courses")}>
                <Text style={styles.btnPrimaryText}>Kurslara Başla →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8} onPress={() => router.push("/(tabs)/games")}>
                <Text style={styles.btnSecondaryText}>Oyunları Keşfet</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NEDEN ROOKIEVERSE?</Text>
          <Text style={styles.sectionTitle}>Her şey burada</Text>
          <View style={styles.featuresRow}>
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={i}
                feature={f}
                index={i}
                onPress={f.route ? () => router.push(f.route as any) : undefined}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>KURSLAR</Text>
              <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
            </View>
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push("/(tabs)/courses")}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coursesScroll}>
            {FEATURED_COURSES.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>ROOKIEVERSE</Text>
          <Text style={styles.footerSub}>MAT Robotics © 2025</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

  hero: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, overflow: "hidden" },
  heroGlow: {
    position: "absolute", top: 0, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "#e5ae32", opacity: 0.15,
  },
  heroTag: {
    color: "#e5ae32",
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  heroTitle: { fontSize: 48, fontWeight: "900", color: "#111827", lineHeight: 52, letterSpacing: -1, marginBottom: 16 },
  heroSub: { fontSize: 16, color: "#4b5563", lineHeight: 24, marginBottom: 32, maxWidth: 300 },
  heroBtns: { flexDirection: "row", gap: 12 },
  btnPrimary: { backgroundColor: "#e5ae32", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnPrimaryText: { color: "#111827", fontWeight: "800", fontSize: 15 },
  btnSecondary: { borderWidth: 1.5, borderColor: "#111827", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  btnSecondaryText: { color: "#111827", fontWeight: "700", fontSize: 15 },

  section: { paddingHorizontal: 24, paddingVertical: 32 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  sectionLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { color: "#111827", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  seeAll: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#f0ead6" },
  seeAllText: { color: "#e5ae32", fontSize: 13, fontWeight: "700" },

  featuresRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  featureCard: { flex: 1, backgroundColor: "#f5f0e0", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e8e0c8" },
  featureCardClickable: { borderColor: "#e5ae32" },
  featureIconImage: { width: 40, height: 40, marginBottom: 8, resizeMode: "contain" },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { color: "#111827", fontSize: 13, fontWeight: "800", marginBottom: 6 },
  featureDesc: { color: "#6b7280", fontSize: 11, lineHeight: 16 },
  featureArrow: { color: "#e5ae32", fontSize: 16, fontWeight: "800", marginTop: 8 },

  coursesScroll: { paddingRight: 24, gap: 16 },
  courseCard: { width: width * 0.6, backgroundColor: "#f5f0e0", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e8e0c8" },
  courseImage: { width: "100%", height: 130, backgroundColor: "#e8e0c8" },
  courseBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "#e5ae32", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  courseBadgeText: { color: "#111827", fontSize: 11, fontWeight: "800" },
  courseInfo: { padding: 14 },
  courseTitle: { color: "#111827", fontSize: 14, fontWeight: "800", lineHeight: 20, marginBottom: 10 },
  courseFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  courseTeam: { color: "#6b7280", fontSize: 11, fontWeight: "600" },
  levelPill: { backgroundColor: "#e8e0c8", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { color: "#4b5563", fontSize: 10, fontWeight: "700" },

  footer: { alignItems: "center", paddingVertical: 32, gap: 6 },
  footerLogo: { color: "#111827", fontSize: 18, fontWeight: "900", letterSpacing: 4 },
  footerSub: { color: "#9ca3af", fontSize: 12 },
});

export default HomeScreen;