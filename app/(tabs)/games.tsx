import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

interface Game {
  id: string;
  title: string;
  desc: string;
  category: string;
  emoji: string;
}

const CATEGORIES = ["Tümü", "Kelime", "Quiz", "Tahmin", "Eşleştirme", "Hafıza"];

const GAMES: Game[] = [
  { id: "1", title: "FIRST Kelime Avı", desc: "FRC terimlerini bul ve eşleştir!", category: "Kelime", emoji: "🔤" },
  { id: "2", title: "Robotik Quiz", desc: "FIRST bilgini test et!", category: "Quiz", emoji: "❓" },
  { id: "3", title: "Parça Tahmin", desc: "Robot parçasını tahmin et!", category: "Tahmin", emoji: "🤖" },
  { id: "4", title: "Terim Eşleştir", desc: "FIRST terimlerini eşleştir!", category: "Eşleştirme", emoji: "🔗" },
  { id: "5", title: "Hafıza Kartları", desc: "Kartları eşleştirerek hafızanı geliştir!", category: "Hafıza", emoji: "🧠" },
  { id: "6", title: "FRC Sözlük Quiz", desc: "FRC sözlüğünü ne kadar biliyorsun?", category: "Quiz", emoji: "📖" },
  { id: "7", title: "Takım Tahmin", desc: "Takım logosunu tahmin et!", category: "Tahmin", emoji: "🏆" },
  { id: "8", title: "Kelime Bulmaca", desc: "FIRST terimlerini bulmacada bul!", category: "Kelime", emoji: "🔍" },
];



const GameCard: React.FC<{ game: Game; index: number }> = ({ game, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.gameCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.gameCardInner} activeOpacity={0.8}>
        <View style={styles.gameEmoji}>
          <Text style={styles.gameEmojiText}>{game.emoji}</Text>
        </View>
        <View style={styles.gameInfo}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <View style={styles.gameCategoryBadge}>
              <Text style={styles.gameCategoryText}>{game.category}</Text>
            </View>
          </View>
          <Text style={styles.gameDesc}>{game.desc}</Text>
        </View>
        <View style={styles.playBtn}>
          <Text style={styles.playBtnText}>▶</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: active ? "#e5ae32" : "#c8bfa0",
      backgroundColor: active ? "#e5ae32" : "#fdfaf2",
    }}
  >
    <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
      {label}
    </Text>
  </TouchableOpacity>
);

const GamesScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [headerHeight, setHeaderHeight] = useState(195);
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

  const filtered = activeCategory === "Tümü"
    ? GAMES
    : GAMES.filter((g) => g.category === activeCategory);

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
        <Text style={styles.headerLabel}>EĞLENCE</Text>
        <Text style={styles.headerTitle}>Oyunlar</Text>
        <Text style={styles.headerSub}>FIRST terimleriyle öğrenirken eğlen</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 12, gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <CategoryButton
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
        <Text style={styles.resultCount}>{filtered.length} oyun</Text>
        {filtered.map((game, i) => (
          <GameCard key={game.id} game={game} index={i} />
        ))}
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
  headerSub: { fontSize: 13, color: "#9ca3af" },

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

  gameCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    marginBottom: 12,
    overflow: "hidden",
  },
  gameCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  gameEmoji: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fdfaf2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e8e0c8",
  },
  gameEmojiText: { fontSize: 28 },
  gameInfo: { flex: 1 },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  gameTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  gameCategoryBadge: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gameCategoryText: { fontSize: 10, fontWeight: "800", color: "#111827" },
  gameDesc: { fontSize: 12, color: "#6b7280", lineHeight: 18 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5ae32",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnText: { fontSize: 14, color: "#111827" },
});

export default GamesScreen;