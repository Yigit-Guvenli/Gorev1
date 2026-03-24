import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TextLessonScreen: React.FC = () => {
  const { content, title, nextUrl, nextTitle, nextType, courseId } =
    useLocalSearchParams<{
      content: string;
      title: string;
      nextUrl?: string;
      nextTitle?: string;
      nextType?: string;
      courseId?: string;
    }>();

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [liked, setLiked] = useState<boolean | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const goNext = () => {
    if (!nextUrl) return;
    if (nextType === "video") {
      router.replace({
        pathname: "/(tabs)/video",
        params: { url: nextUrl, title: nextTitle, courseId },
      } as any);
    } else {
      router.replace({
        pathname: "/(tabs)/text-lesson",
        params: { content: nextUrl, title: nextTitle, courseId },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      {/* Geri butonu */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            router.navigate({
              pathname: "/(tabs)/course-detail",
              params: { id: courseId },
            } as any)
          }
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>📄 OKUMA</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Başlık alanı */}
          <View style={styles.titleSection}>
            <View style={styles.titleAccent} />
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* İçerik */}
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{content}</Text>
          </View>

          {/* Beğeni */}
          <View style={styles.likeSection}>
            <Text style={styles.likeTitle}>Bu dersi faydalı buldun mu?</Text>
            <View style={styles.likeRow}>
              <TouchableOpacity
                style={[styles.voteBtn, liked === true && styles.voteBtnActive]}
                onPress={() => setLiked(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.voteBtnText}>👍 Evet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voteBtn, liked === false && styles.voteBtnActive]}
                onPress={() => setLiked(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.voteBtnText}>👎 Hayır</Text>
              </TouchableOpacity>
            </View>
            {liked !== null && (
              <Text style={styles.thankText}>
                Geri bildiriminiz için teşekkürler 🙏
              </Text>
            )}
          </View>

          {/* Alt butonlar */}
          <View style={styles.actionRow}>
            {nextUrl ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={goNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>
                  {nextType === "video" ? "▶ Sonraki Video" : "Sonraki Ders →"}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.courseBtn}
              onPress={() =>
                router.navigate({
                  pathname: "/(tabs)/course-detail",
                  params: { id: courseId },
                } as any)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.courseBtnText}>Kursa Dön</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.85}
            >
              <Text style={styles.homeBtnText}>Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fdfaf2",
    borderBottomWidth: 1,
    borderBottomColor: "#ede8d8",
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f0e0",
    borderWidth: 1,
    borderColor: "#e8e0c8",
  },
  backBtnText: { color: "#111827", fontSize: 14, fontWeight: "800" },
  typeBadge: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: { fontSize: 11, fontWeight: "900", color: "#111827", letterSpacing: 1 },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  titleSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  titleAccent: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#e5ae32",
    alignSelf: "stretch",
    minHeight: 32,
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 28,
  },

  contentCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    padding: 20,
    marginBottom: 28,
  },
  contentText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "400",
  },

  likeSection: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  likeTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
  },
  likeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  voteBtn: {
    backgroundColor: "#374151",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  voteBtnActive: { backgroundColor: "#e5ae32" },
  voteBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  thankText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  nextBtn: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: { color: "#111827", fontWeight: "900", fontSize: 14 },
  courseBtn: {
    backgroundColor: "#f5f0e0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e0c8",
  },
  courseBtnText: { color: "#111827", fontWeight: "700", fontSize: 14 },
  homeBtn: {
    backgroundColor: "#374151",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  homeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

export default TextLessonScreen;