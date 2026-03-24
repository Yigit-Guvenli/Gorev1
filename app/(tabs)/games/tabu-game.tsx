import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface TabuCard {
  word: string;
  forbidden: string[];
}

const CARDS: TabuCard[] = [
  { word: "roboRIO", forbidden: ["kontrol", "beyin", "bilgisayar", "robot", "ana"] },
  { word: "Alliance", forbidden: ["takım", "grup", "kırmızı", "mavi", "ittifak"] },
  { word: "Autonomous", forbidden: ["otonom", "otomatik", "sürücü", "program", "15"] },
  { word: "Bumper", forbidden: ["tampon", "koruma", "kumaş", "çarpma", "kenar"] },
  { word: "Drivetrain", forbidden: ["hareket", "tekerlek", "şasi", "sürmek", "motor"] },
  { word: "Gracious Professionalism", forbidden: ["saygı", "değer", "FIRST", "felsefe", "profesyonellik"] },
  { word: "Pit", forbidden: ["alan", "tamir", "çalışma", "garaj", "bölge"] },
  { word: "Scouting", forbidden: ["izlemek", "veri", "strateji", "not", "takip"] },
  { word: "Endgame", forbidden: ["son", "bölüm", "puan", "maç", "bitiş"] },
  { word: "Kickoff", forbidden: ["başlangıç", "oyun", "sezon", "açıklama", "FIRST"] },
  { word: "Regional", forbidden: ["turnuva", "yarışma", "bölge", "şampiyona", "katılım"] },
  { word: "Mentor", forbidden: ["rehber", "yetişkin", "öğretmek", "yardım", "takım"] },
  { word: "Drive Team", forbidden: ["sürücü", "operatör", "koç", "kontrol", "maç"] },
  { word: "Motor Controller", forbidden: ["motor", "sürücü", "kart", "güç", "kontrol"] },
  { word: "Ranking Points", forbidden: ["puan", "sıralama", "RP", "kazanmak", "tablo"] },
  { word: "Game Piece", forbidden: ["nesne", "top", "kutu", "oyun", "taşımak"] },
  { word: "Coopertition", forbidden: ["işbirliği", "rekabet", "birlikte", "FIRST", "yardım"] },
  { word: "Pneumatics", forbidden: ["hava", "basınç", "piston", "sistem", "mekanik"] },
  { word: "Championship", forbidden: ["dünya", "şampiyona", "final", "Houston", "yarışma"] },
  { word: "Rookie", forbidden: ["yeni", "ilk", "başlangıç", "çaylak", "sezon"] },
];

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

const TOTAL_TIME = 60;

const TabuGame: React.FC = () => {
  const router = useRouter();
  const [cards, setCards] = useState<TabuCard[]>(shuffle(CARDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(0);
  const [time, setTime] = useState(TOTAL_TIME);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      return () => resetGame();
    }, [])
  );

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setFinished(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started]);

  useEffect(() => {
    if (time <= 10 && time > 0) {
      Animated.sequence([
        Animated.timing(timerAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(timerAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [time]);

  const animateCard = (direction: "left" | "right", cb: () => void) => {
    Animated.timing(slideAnim, {
      toValue: direction === "left" ? -400 : 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(direction === "left" ? 400 : -400);
      cb();
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleCorrect = () => {
    if (!started || finished) return;
    animateCard("left", () => {
      setScore(s => s + 1);
      setCurrentIndex(i => Math.min(i + 1, cards.length - 1));
    });
  };

  const handlePass = () => {
    if (!started || finished) return;
    animateCard("right", () => {
      setPassed(p => p + 1);
      setCurrentIndex(i => Math.min(i + 1, cards.length - 1));
    });
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setCards(shuffle(CARDS));
    setCurrentIndex(0);
    setScore(0);
    setPassed(0);
    setTime(TOTAL_TIME);
    setStarted(false);
    setFinished(false);
    slideAnim.setValue(0);
  };

  const card = cards[currentIndex];
  const timerColor = time <= 10 ? "#f87171" : time <= 20 ? "#fb923c" : "#e5ae32";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/games" as any)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>OYUN</Text>
        <Text style={styles.headerTitle}>FRC Tabu</Text>
        <Text style={styles.headerSub}>Yasaklı kelimeleri kullanmadan anlat!</Text>
      </View>

      {/* Skor + Süre */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Doğru</Text>
          <Text style={[styles.statValue, { color: "#4ade80" }]}>{score}</Text>
        </View>
        <Animated.View style={[styles.timerPill, { transform: [{ scale: timerAnim }], borderColor: timerColor }]}>
          <Text style={[styles.timerValue, { color: timerColor }]}>{time}</Text>
          <Text style={styles.timerLabel}>saniye</Text>
        </Animated.View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Pas</Text>
          <Text style={[styles.statValue, { color: "#f87171" }]}>{passed}</Text>
        </View>
      </View>

      {/* Kart */}
      {!started ? (
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🎯</Text>
          <Text style={styles.startText}>Anlatan kişi hazır mı?</Text>
          <Text style={styles.startSub}>1 dakikan var, yasaklı kelimeleri kullanma!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => setStarted(true)}>
            <Text style={styles.startBtnText}>Başla ▶</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={[styles.cardContainer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.card}>
            <Text style={styles.cardWord}>{card.word}</Text>
            <View style={styles.divider} />
            <Text style={styles.forbiddenLabel}>YASAKLI KELİMELER</Text>
            {card.forbidden.map((w, i) => (
              <View key={i} style={styles.forbiddenRow}>
                <Text style={styles.forbiddenDot}>✕</Text>
                <Text style={styles.forbiddenWord}>{w}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Butonlar */}
      {started && !finished && (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.passBtn} onPress={handlePass}>
            <Text style={styles.passBtnText}>Pas ▷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.correctBtn} onPress={handleCorrect}>
            <Text style={styles.correctBtnText}>✓ Doğru</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bitti */}
      {finished && (
        <View style={styles.finishedOverlay}>
          <View style={styles.finishedCard}>
            <Text style={styles.finishedEmoji}>🏆</Text>
            <Text style={styles.finishedTitle}>Süre Bitti!</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{score}</Text>
                <Text style={styles.resultLabel}>Doğru</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultValue, { color: "#f87171" }]}>{passed}</Text>
                <Text style={styles.resultLabel}>Pas</Text>
              </View>
            </View>
            <View style={styles.finishedBtns}>
              <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
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

  statsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, paddingHorizontal: 24, marginBottom: 20 },
  statPill: { flex: 1, backgroundColor: "#f5f0e0", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#e8e0c8" },
  statLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "700" },
  statValue: { fontSize: 24, fontWeight: "900", color: "#111827" },
  timerPill: { flex: 1.2, backgroundColor: "#f5f0e0", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 2 },
  timerValue: { fontSize: 32, fontWeight: "900" },
  timerLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "700" },

  startContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  startEmoji: { fontSize: 64, marginBottom: 16 },
  startText: { fontSize: 22, fontWeight: "900", color: "#111827", marginBottom: 8, textAlign: "center" },
  startSub: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  startBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 },
  startBtnText: { color: "#111827", fontWeight: "900", fontSize: 18 },

  cardContainer: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  card: {
    backgroundColor: "#f5f0e0", borderRadius: 20, padding: 28,
    borderWidth: 2, borderColor: "#e8e0c8",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardWord: { fontSize: 32, fontWeight: "900", color: "#111827", textAlign: "center", marginBottom: 20 },
  divider: { height: 1, backgroundColor: "#e8e0c8", marginBottom: 16 },
  forbiddenLabel: { fontSize: 10, fontWeight: "800", color: "#e5ae32", letterSpacing: 2, marginBottom: 12, textAlign: "center" },
  forbiddenRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  forbiddenDot: { fontSize: 12, color: "#f87171", fontWeight: "800" },
  forbiddenWord: { fontSize: 16, fontWeight: "700", color: "#374151" },

  btnRow: { flexDirection: "row", gap: 12, paddingHorizontal: 24, paddingBottom: 40 },
  passBtn: {
    flex: 1, backgroundColor: "#f5f0e0", borderRadius: 16, paddingVertical: 18,
    alignItems: "center", borderWidth: 1.5, borderColor: "#e8e0c8",
  },
  passBtnText: { color: "#6b7280", fontWeight: "800", fontSize: 16 },
  correctBtn: {
    flex: 1.5, backgroundColor: "#e5ae32", borderRadius: 16, paddingVertical: 18,
    alignItems: "center",
  },
  correctBtnText: { color: "#111827", fontWeight: "900", fontSize: 18 },

  finishedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  finishedCard: { backgroundColor: "#fdfaf2", borderRadius: 20, padding: 32, alignItems: "center", margin: 24, width: "85%" },
  finishedEmoji: { fontSize: 56, marginBottom: 8 },
  finishedTitle: { fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 20 },
  resultRow: { flexDirection: "row", gap: 24, marginBottom: 28 },
  resultItem: { alignItems: "center" },
  resultValue: { fontSize: 40, fontWeight: "900", color: "#111827" },
  resultLabel: { fontSize: 13, color: "#9ca3af", fontWeight: "700" },
  finishedBtns: { flexDirection: "row", gap: 12 },
  restartBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  restartBtnText: { color: "#111827", fontWeight: "800", fontSize: 15 },
  homeBtn: { backgroundColor: "#f5f0e0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e8e0c8" },
  homeBtnText: { color: "#111827", fontWeight: "700", fontSize: 15 },
});

export default TabuGame;