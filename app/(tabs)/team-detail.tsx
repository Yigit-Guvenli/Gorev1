import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
import { TEAMS } from "./teams";

const TEAM_COURSES: Record<string, { title: string; level: string; cover: string }[]> = {
  "6430": [
    {
      title: "Kapsamlı SOLIDWORKS Eğitimi",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_85_cover_f463cd1204dd5744.png",
    },
  ],
  "6228": [
    {
      title: "FRC Takımları İçin Robot Yazılım Eğitimi",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_88_cover_27875cecf54e67dd.jpeg",
    },
    {
      title: "Fusion 360 Eğitimi",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_82_cover_9fc8db35e94b6113.png",
    },
    {
      title: "FRC Takımları İçin Sponsor Bulma Rehberi",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_84_cover_da5b57ec2547bcb6.png",
    },
    {
      title: "FRC Hibe Bulma Süreci Rehberi",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_83_cover_6bebbfe7c3857731.jpg",
    },
  ],
  "7742": [
    {
      title: "Cosmic Science",
      level: "Başlangıç",
      cover: "https://www.rookieverse.net/uploads/covers/course_90_cover_ae11997ed7d4b384.png",
    },
  ],
};

const LEVEL_COLORS: Record<string, string> = {
  "Başlangıç": "#4ade80",
  "Orta": "#fb923c",
  "İleri": "#f87171",
};

const SocialButton: React.FC<{ emoji: string; label: string; url: string }> = ({ emoji, label, url }) => (
  <TouchableOpacity
    style={styles.socialBtn}
    activeOpacity={0.75}
    onPress={() => Linking.openURL(url)}
  >
    <Text style={styles.socialEmoji}>{emoji}</Text>
    <Text style={styles.socialLabel}>{label}</Text>
  </TouchableOpacity>
);

const CourseCard: React.FC<{ title: string; level: string; cover: string; index: number }> = ({ title, level, cover, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.courseCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {imgError ? (
        <View style={styles.courseImagePlaceholder}>
          <Text style={styles.courseImagePlaceholderText}>📷</Text>
        </View>
      ) : (
        <Image
          source={{ uri: cover }}
          style={styles.courseImage}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}
      <View style={styles.courseBody}>
        <Text style={styles.courseTitle} numberOfLines={2}>{title}</Text>
        <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[level] ?? "#e5ae32" }]}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const TeamDetailScreen: React.FC = () => {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const team = TEAMS.find((t) => t.number === number);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!team) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Takım bulunamadı</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnAlt}>
            <Text style={styles.backBtnAltText}>← Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const courses = TEAM_COURSES[team.number] ?? [];
  const hasSocial = team.instagram || team.youtube || team.linkedin || team.website;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity onPress={() => router.push("/(tabs)/teams")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[
            styles.logoContainer,
            { backgroundColor:
                team.number === "7439" ? "#fddc01" :
                team.number === "6985" ? "#1b46b6" :
                team.number === "6430" ? "#3b0c6c" :
                team.number === "6232" ? "#0d093c" :
                team.number === "4972" || team.number === "6948" || team.number === "6402" || team.number === "7086" || team.number === "8557" ? "#000000" :
                team.number === "11371" ? "#02050a" :
                "#ffffff",
              borderColor:
                team.number === "7742" || team.number === "6228" ? "#e0e0e0" : "transparent"
            }
          ]}>
            <Image source={team.logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>#{team.number}</Text>
          </View>
        </Animated.View>

        {hasSocial && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionLabel}>SOSYAL MEDYA</Text>
            <View style={styles.socialRow}>
              {team.instagram && <SocialButton emoji="📸" label="Instagram" url={team.instagram} />}
              {team.youtube && <SocialButton emoji="▶️" label="YouTube" url={team.youtube} />}
              {team.linkedin && <SocialButton emoji="💼" label="LinkedIn" url={team.linkedin} />}
              {team.website && <SocialButton emoji="🌐" label="Web Sitesi" url={team.website} />}
            </View>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KURSLAR</Text>
          <Text style={styles.sectionTitle}>Bu Takımın Kursları</Text>
          {courses.length > 0 ? (
            courses.map((course, i) => (
              <CourseCard
                key={i}
                title={course.title}
                level={course.level}
                cover={course.cover}
                index={i}
              />
            ))
          ) : (
            <View style={styles.noCoursesBox}>
              <Text style={styles.noCoursesEmoji}>📭</Text>
              <Text style={styles.noCoursesText}>Bu takım henüz kurs eklemedi.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },
  scrollContent: { paddingBottom: 48 },

  backBtn: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 8 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },

  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },
  logo: { width: 90, height: 90 },
  teamName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 10,
  },
  numberBadge: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  numberText: { fontSize: 13, fontWeight: "800", color: "#111827" },

  section: { paddingHorizontal: 24, marginBottom: 28 },
  sectionLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#111827", letterSpacing: -0.5, marginBottom: 14 },

  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f0e0",
    borderWidth: 1,
    borderColor: "#e8e0c8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  socialEmoji: { fontSize: 18 },
  socialLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },

  courseCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  courseImage: { width: 80, height: 80, backgroundColor: "#e8e0c8" },
  courseImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#e8e0c8",
    alignItems: "center",
    justifyContent: "center",
  },
  courseImagePlaceholderText: { fontSize: 24 },
  courseBody: { flex: 1, padding: 14, gap: 8 },
  courseTitle: { fontSize: 14, fontWeight: "800", color: "#111827", lineHeight: 20 },
  levelBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 10, fontWeight: "800", color: "#111827" },

  noCoursesBox: {
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  noCoursesEmoji: { fontSize: 32 },
  noCoursesText: { fontSize: 14, color: "#9ca3af", fontWeight: "600", textAlign: "center" },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { fontSize: 18, color: "#9ca3af" },
  backBtnAlt: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnAltText: { fontWeight: "800", color: "#111827" },
});

export default TeamDetailScreen;