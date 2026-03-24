import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 12) / 4;

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

const PAIRS = [
  { emoji: "⚙️", label: "Dişli" },
  { emoji: "🔧", label: "Anahtar" },
  { emoji: "🤖", label: "roboRIO" },
  { emoji: "⚡", label: "Motor" },
  { emoji: "🎮", label: "Joystick" },
  { emoji: "🔋", label: "Batarya" },
];

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

const buildCards = (): Card[] => {
  const cards: Card[] = [];
  PAIRS.forEach((pair, i) => {
    cards.push({ id: i * 2, pairId: i, emoji: pair.emoji, label: pair.label, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, pairId: i, emoji: pair.emoji, label: pair.label, flipped: false, matched: false });
  });
  return shuffle(cards);
};

const MemoryCard: React.FC<{
  card: Card;
  onPress: () => void;
}> = ({ card, onPress }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: card.flipped || card.matched ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [card.flipped, card.matched]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={card.flipped || card.matched}
      style={styles.cardWrapper}
      activeOpacity={0.8}
    >
      {/* Arka yüz */}
      <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: frontRotate }] }]}>
        <Text style={styles.cardBackText}>?</Text>
      </Animated.View>
      {/* Ön yüz */}
      <Animated.View style={[
        styles.card, styles.cardFront,
        card.matched && styles.cardMatched,
        { transform: [{ rotateY: backRotate }], position: "absolute" }
      ]}>
        <Text style={styles.cardEmoji}>{card.emoji}</Text>
        <Text style={styles.cardLabel}>{card.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const MemoryGame: React.FC = () => {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(buildCards());

  useFocusEffect(
    useCallback(() => {
      return () => {
        setCards(buildCards());
        setSelected([]);
        setMoves(0);
        setTime(0);
        setRunning(true);
        setFinished(false);
      };
    }, [])
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (running) setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const handlePress = (id: number) => {
    if (selected.length === 2) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected.map(sid => newCards.find(c => c.id === sid)!);
      if (a.pairId === b.pairId) {
        setTimeout(() => {
          const matched = newCards.map(c =>
            c.pairId === a.pairId ? { ...c, matched: true } : c
          );
          setCards(matched);
          setSelected([]);
          if (matched.every(c => c.matched)) {
            setRunning(false);
            setFinished(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(newCards.map(c =>
            newSelected.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setSelected([]);
        }, 1000);
      }
    }
  };

  const restart = () => {
    setCards(buildCards());
    setSelected([]);
    setMoves(0);
    setTime(0);
    setRunning(true);
    setFinished(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/games" as any)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>OYUN</Text>
        <Text style={styles.headerTitle}>Hafıza Kartları</Text>
        <Text style={styles.headerSub}>Robot parçalarını eşleştir!</Text>
      </View>

      {/* Skor */}
      <View style={styles.scoreRow}>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Hamle</Text>
          <Text style={styles.scoreValue}>{moves}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Süre</Text>
          <Text style={styles.scoreValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Eşleşme</Text>
          <Text style={styles.scoreValue}>{cards.filter(c => c.matched).length / 2}/{PAIRS.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.gridInner}>
          {cards.map(card => (
            <MemoryCard key={card.id} card={card} onPress={() => handlePress(card.id)} />
          ))}
        </View>
      </ScrollView>

      {/* Bitti ekranı */}
      {finished && (
        <View style={styles.finishedOverlay}>
          <View style={styles.finishedCard}>
            <Text style={styles.finishedEmoji}>🎉</Text>
            <Text style={styles.finishedTitle}>Tebrikler!</Text>
            <Text style={styles.finishedSub}>
              {moves} hamlede {formatTime(time)} sürede tamamladın!
            </Text>
            <View style={styles.finishedBtns}>
              <TouchableOpacity style={styles.restartBtn} onPress={restart}>
                <Text style={styles.restartBtnText}>Tekrar Oyna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeBtn} onPress={() => router.push("/(tabs)/games" as any)}>
                <Text style={styles.homeBtnText}>Geri Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

  header: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 12 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: "#111827", letterSpacing: -1, marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#9ca3af" },

  scoreRow: { flexDirection: "row", justifyContent: "center", gap: 12, paddingHorizontal: 24, marginBottom: 16 },
  scorePill: {
    flex: 1, backgroundColor: "#f5f0e0", borderRadius: 12,
    padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#e8e0c8",
  },
  scoreLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "700", marginBottom: 2 },
  scoreValue: { fontSize: 18, fontWeight: "900", color: "#111827" },

  grid: { paddingHorizontal: 24, paddingBottom: 32 },
  gridInner: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },

  cardWrapper: { width: CARD_SIZE, height: CARD_SIZE },
  card: {
    width: "100%", height: "100%", borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  cardBack: { backgroundColor: "#e5ae32", borderWidth: 2, borderColor: "#d4991f" },
  cardBackText: { fontSize: 24, fontWeight: "900", color: "#111827" },
  cardFront: { backgroundColor: "#f5f0e0", borderWidth: 2, borderColor: "#e8e0c8" },
  cardMatched: { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" },
  cardEmoji: { fontSize: 22 },
  cardLabel: { fontSize: 9, fontWeight: "700", color: "#111827", marginTop: 2, textAlign: "center" },

  finishedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  finishedCard: {
    backgroundColor: "#fdfaf2", borderRadius: 20, padding: 32,
    alignItems: "center", margin: 24,
  },
  finishedEmoji: { fontSize: 48, marginBottom: 8 },
  finishedTitle: { fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 8 },
  finishedSub: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  finishedBtns: { flexDirection: "row", gap: 12 },
  restartBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  restartBtnText: { color: "#111827", fontWeight: "800", fontSize: 15 },
  homeBtn: { backgroundColor: "#f5f0e0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e8e0c8" },
  homeBtnText: { color: "#111827", fontWeight: "700", fontSize: 15 },
});

export default MemoryGame;