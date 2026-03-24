import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const VideoScreen: React.FC = () => {
  const { url, title, nextUrl, nextTitle, courseId } = useLocalSearchParams<{
    url: string; title: string; nextUrl?: string; nextTitle?: string; courseId?: string;
  }>();
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [dims, setDims] = useState(Dimensions.get("window"));
  const [finished, setFinished] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    const sub = Dimensions.addEventListener("change", ({ window }) => setDims(window));
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      sub.remove();
      videoRef.current?.pauseAsync(); // ← ekrandan çıkınca video durur
    };
  }, []);

  // Ekrandan çıkınca video kesin durur
  useFocusEffect(
    useCallback(() => {
      return () => {
        videoRef.current?.pauseAsync();
      };
    }, [])
  );

  const isLandscape = dims.width > dims.height;

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) setFinished(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={{ width: "100%", height: isLandscape ? dims.height : 300 }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />

      {/* Geri butonu */}
      <TouchableOpacity
        onPress={() => router.navigate({ pathname: "/(tabs)/course-detail", params: { id: courseId } } as any)}
        style={styles.backBtn}
      >
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>

      {/* Başlık */}
      {title && !finished ? (
        <View style={styles.titleBar}>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>
      ) : null}

      {/* Video bitti ekranı */}
      {finished && (
        <View style={styles.finishedOverlay}>
          <Text style={styles.finishedTitle}>Bu eğitimi beğendin mi?</Text>
          <View style={styles.likeRow}>
            <TouchableOpacity
              style={[styles.voteBtn, liked === true && styles.voteBtnActive]}
              onPress={() => setLiked(true)}
            >
              <Text style={styles.voteBtnText}>👍 Evet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.voteBtn, liked === false && styles.voteBtnActive]}
              onPress={() => setLiked(false)}
            >
              <Text style={styles.voteBtnText}>👎 Hayır</Text>
            </TouchableOpacity>
          </View>
          {liked !== null && (
            <Text style={styles.thankText}>Seçiminiz için teşekkür ederiz 🙏</Text>
          )}

          <View style={styles.actionRow}>
            {nextUrl ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  setFinished(false);
                  router.replace({ pathname: "/(tabs)/video", params: { url: nextUrl, title: nextTitle, courseId } } as any);
                }}
              >
                <Text style={styles.nextBtnText}>Sonraki Ders ▶</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => {
                setFinished(false);
                router.navigate({ pathname: "/(tabs)/course-detail", params: { id: courseId } } as any);
              }}
            >
              <Text style={styles.homeBtnText}>Kursa Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => {
                setFinished(false);
                router.push("/(tabs)");
              }}
            >
              <Text style={styles.homeBtnText}>Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", justifyContent: "center" },
  backBtn: {
    position: "absolute", top: 48, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  backBtnText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  titleBar: {
    position: "absolute", bottom: 40, left: 20, right: 20,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, padding: 12,
  },
  titleText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  finishedOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#111827", padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  finishedTitle: { color: "#fff", fontSize: 18, fontWeight: "900", marginBottom: 16, textAlign: "center" },
  likeRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 20 },
  voteBtn: { backgroundColor: "#374151", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  voteBtnActive: { backgroundColor: "#e5ae32" },
  voteBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  thankText: { color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: -8, marginBottom: 8 },
  actionRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  nextBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  nextBtnText: { color: "#111827", fontWeight: "800" },
  homeBtn: { backgroundColor: "#374151", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  homeBtnText: { color: "#fff", fontWeight: "700" },
});

export default VideoScreen;