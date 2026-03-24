import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface Team {
  number: string;
  name: string;
}

const ALL_TEAMS: Team[] = [
  { number: "2905", name: "Sultans of Turkiye" },
  { number: "6014", name: "ARC" },
  { number: "6228", name: "MAT Robotics" },
  { number: "6399", name: "Tinspiratio" },
  { number: "6429", name: "4th Dimension" },
  { number: "6985", name: "ENKA TECH" },
  { number: "7050", name: "SARNIC" },
  { number: "7444", name: "MOON STAR ROBOTICS" },
  { number: "7840", name: "EMONER ROBOTICS" },
  { number: "8151", name: "Wildfire" },
  { number: "8182", name: "Loth Robotics" },
  { number: "8308", name: "GFLRobotics" },
  { number: "8595", name: "This Is How We Play" },
  { number: "8759", name: "ARPEX" },
  { number: "8806", name: "Our Lady of Providence Dream League" },
  { number: "8859", name: "Bora Robotics" },
  { number: "9020", name: "MCT Galatasaray Robotics" },
  { number: "9025", name: "Mechameleons" },
  { number: "9089", name: "ACS Phoenix" },
  { number: "9231", name: "Haydarpasa Panthers" },
  { number: "9232", name: "IBBTECH" },
  { number: "9247", name: "SainTech Robotics" },
  { number: "9497", name: "NIMBLE PANTHER" },
  { number: "9555", name: "TEAM HELIOS" },
  { number: "9591", name: "DESTAN" },
  { number: "10202", name: "NOVATRON" },
  { number: "10203", name: "LANCE" },
  { number: "10236", name: "REXTED" },
  { number: "10243", name: "Yücel Boru ANATOLIAN WOLVES" },
  { number: "10251", name: "Chimera" },
  { number: "10383", name: "Robistim" },
  { number: "10445", name: "HYPERVOLT" },
  { number: "10521", name: "ERA Robotics" },
  { number: "10549", name: "MardinBK Robocretors Team" },
  { number: "10598", name: "TADroid" },
  { number: "10689", name: "KAGITHANE TEKNOLOJI TAKIMI" },
  { number: "11010", name: "Bobcats" },
  { number: "11216", name: "FLAZIA ROBOTICS" },
  { number: "11335", name: "MARETECH" },
  { number: "11371", name: "Odyssey" },
  { number: "11388", name: "STEAM & IRON ROBOTICS" },
  { number: "11392", name: "Gulf Tech" },
  { number: "11442", name: "FEKAL ROBOTICS" },
  { number: "11453", name: "FutureX Robotics" },
];

type Mode = "number" | "name";
type Phase = "select" | "playing" | "finished";

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
const pickTeams = () => shuffle(ALL_TEAMS).slice(0, 10);

const TeamGuessGame: React.FC = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<Mode>("number");
  const [teams, setTeams] = useState<Team[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ team: Team; guess: string; correct: boolean }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [suggestions, setSuggestions] = useState<Team[]>([]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Oyun ekranından çıkınca sıfırla
  useEffect(() => {
    return () => {
      setPhase("select");
      setInput("");
      setScore(0);
      setResults([]);
      setFeedback(null);
      setSuggestions([]);
    };
  }, []);

  const startGame = (selectedMode: Mode) => {
    setMode(selectedMode);
    setTeams(pickTeams());
    setCurrent(0);
    setInput("");
    setScore(0);
    setResults([]);
    setFeedback(null);
    setSuggestions([]);
    setPhase("playing");
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (mode === "name" && text.trim().length > 0) {
      const filtered = ALL_TEAMS.filter(t =>
        t.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 4);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (team: Team) => {
    setInput(team.name);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (!input.trim() || feedback) return;
    const team = teams[current];
    const correct = mode === "number"
      ? input.trim() === team.number
      : input.trim().toLowerCase() === team.name.toLowerCase();

    setResults(prev => [...prev, { team, guess: input.trim(), correct }]);
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? "correct" : "wrong");
    setSuggestions([]);

    if (correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (current + 1 >= teams.length) {
        setPhase("finished");
      } else {
        setCurrent(c => c + 1);
      }
    }, 1200);
  };

  const goToGames = () => router.replace("/(tabs)/games" as any);

  // ─── SELECT ───────────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />
        <Animated.View style={[styles.selectWrapper, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={goToGames} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerLabel}>OYUN</Text>
          <Text style={styles.headerTitle}>Takım Tahmin</Text>
          <Text style={styles.headerSub}>Haliç Regional takımlarını ne kadar tanıyorsun?</Text>

          <Text style={styles.selectQuestion}>Ne tahmin etmek istiyorsun?</Text>

          <TouchableOpacity style={styles.modeCard} activeOpacity={0.8} onPress={() => startGame("number")}>
            <Text style={styles.modeEmoji}>🔢</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Numarayı Tahmin Et</Text>
              <Text style={styles.modeDesc}>Takım ismini görürsün, numarasını yazarsın</Text>
            </View>
            <Text style={styles.modeArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeCard} activeOpacity={0.8} onPress={() => startGame("name")}>
            <Text style={styles.modeEmoji}>🏷️</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>İsmi Tahmin Et</Text>
              <Text style={styles.modeDesc}>Takım numarasını görürsün, ismini yazarsın</Text>
            </View>
            <Text style={styles.modeArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>🎯 Her turda rastgele 10 takım gelir</Text>
            <Text style={styles.infoText}>📝 Yazarak cevap verirsin</Text>
            <Text style={styles.infoText}>⚡ Haliç Regional'daki {ALL_TEAMS.length} takım havuzu</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ─── FINISHED ─────────────────────────────────────────────────────────────────
  if (phase === "finished") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />
        <ScrollView contentContainerStyle={styles.finishedScroll}>
          <Text style={styles.finishedEmoji}>
            {score === 10 ? "🏆" : score >= 7 ? "🎉" : score >= 4 ? "👍" : "💪"}
          </Text>
          <Text style={styles.finishedTitle}>Bitti!</Text>
          <Text style={styles.finishedScore}>{score} / 10</Text>
          <Text style={styles.finishedSub}>
            {score === 10 ? "Mükemmel! Hepsini bildin!" :
             score >= 7 ? "Harika! Çok iyi bir skor!" :
             score >= 4 ? "Fena değil, biraz daha pratik yap!" :
             "Daha fazla pratik yapmalısın!"}
          </Text>

          <View style={styles.resultsList}>
            {results.map((r, i) => (
              <View key={i} style={[styles.resultItem, r.correct ? styles.resultCorrect : styles.resultWrong]}>
                <Text style={styles.resultIcon}>{r.correct ? "✓" : "✗"}</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTeamName}>{r.team.name}</Text>
                  <Text style={styles.resultTeamNumber}>#{r.team.number}</Text>
                  {!r.correct && (
                    <Text style={styles.resultGuess}>Cevabın: {r.guess}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.finishedBtns}>
            <TouchableOpacity style={styles.restartBtn} onPress={() => startGame(mode)}>
              <Text style={styles.restartBtnText}>Tekrar Oyna</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeBtn} onPress={goToGames}>
              <Text style={styles.homeBtnText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── PLAYING ──────────────────────────────────────────────────────────────────
  const team = teams[current];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={goToGames} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>OYUN</Text>
        <Text style={styles.headerTitle}>Takım Tahmin</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(current / teams.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{current + 1} / {teams.length}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Puan</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Mod</Text>
          <Text style={styles.scoreValue}>{mode === "number" ? "🔢" : "🏷️"}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Kalan</Text>
          <Text style={styles.scoreValue}>{teams.length - current}</Text>
        </View>
      </View>

      <Animated.View style={[
        styles.questionCard,
        feedback === "correct" && styles.questionCardCorrect,
        feedback === "wrong" && styles.questionCardWrong,
        { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] },
      ]}>
        <Text style={styles.questionHint}>
          {mode === "number" ? "Bu takımın numarası nedir?" : "Bu takımın adı nedir?"}
        </Text>
        <Text style={styles.questionMain}>
          {mode === "number" ? team.name : `#${team.number}`}
        </Text>
        {feedback && (
          <Text style={styles.feedbackText}>
            {feedback === "correct"
              ? "✓ Doğru!"
              : `✗ Yanlış! Cevap: ${mode === "number" ? team.number : team.name}`}
          </Text>
        )}
      </Animated.View>

      {/* Input + Autocomplete */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={mode === "number" ? "Takım numarasını yaz..." : "Takım adını yaz..."}
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSubmit}
            keyboardType={mode === "number" ? "numeric" : "default"}
            editable={!feedback}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.submitBtn, (!input.trim() || !!feedback) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!input.trim() || !!feedback}
          >
            <Text style={styles.submitBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => handleSuggestionPress(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionName}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf2" },

  selectWrapper: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: "#111827", letterSpacing: -1, marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#9ca3af", marginBottom: 32 },
  selectQuestion: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 16 },
  modeCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f5f0e0", borderRadius: 16,
    borderWidth: 1.5, borderColor: "#e5ae32",
    padding: 18, marginBottom: 12, gap: 14,
  },
  modeEmoji: { fontSize: 32 },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 15, fontWeight: "800", color: "#111827", marginBottom: 4 },
  modeDesc: { fontSize: 12, color: "#6b7280", lineHeight: 18 },
  modeArrow: { fontSize: 20, color: "#e5ae32", fontWeight: "800" },
  infoBox: {
    marginTop: 24, backgroundColor: "#f5f0e0",
    borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1, borderColor: "#e8e0c8",
  },
  infoText: { fontSize: 13, color: "#6b7280" },

  header: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 12 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },

  progressRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, gap: 12, marginBottom: 12 },
  progressBar: { flex: 1, height: 6, backgroundColor: "#e8e0c8", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#e5ae32", borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: "700", color: "#9ca3af" },

  scoreRow: { flexDirection: "row", justifyContent: "center", gap: 12, paddingHorizontal: 24, marginBottom: 20 },
  scorePill: {
    flex: 1, backgroundColor: "#f5f0e0", borderRadius: 12,
    padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#e8e0c8",
  },
  scoreLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "700", marginBottom: 2 },
  scoreValue: { fontSize: 18, fontWeight: "900", color: "#111827" },

  questionCard: {
    marginHorizontal: 24, backgroundColor: "#111827",
    borderRadius: 20, padding: 28, alignItems: "center",
    marginBottom: 20, minHeight: 140, justifyContent: "center",
  },
  questionCardCorrect: { backgroundColor: "#065f46" },
  questionCardWrong: { backgroundColor: "#991b1b" },
  questionHint: { color: "#9ca3af", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  questionMain: { color: "#ffffff", fontSize: 26, fontWeight: "900", textAlign: "center", letterSpacing: -0.5 },
  feedbackText: { color: "#ffffff", fontSize: 13, marginTop: 12, fontWeight: "700", textAlign: "center" },

  inputWrapper: { paddingHorizontal: 24 },
  inputRow: { flexDirection: "row", gap: 10, marginBottom: 0 },
  input: {
    flex: 1, backgroundColor: "#f5f0e0", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#111827",
    borderWidth: 1, borderColor: "#e8e0c8",
  },
  submitBtn: {
    backgroundColor: "#e5ae32", borderRadius: 14,
    width: 52, alignItems: "center", justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: "#e8e0c8" },
  submitBtnText: { fontSize: 20, fontWeight: "900", color: "#111827" },

  suggestions: {
    backgroundColor: "#f5f0e0", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8e0c8",
    marginTop: 6, overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: "#e8e0c8" },
  suggestionName: { fontSize: 14, fontWeight: "700", color: "#111827", flex: 1 },

  finishedScroll: { padding: 24, paddingTop: 80, alignItems: "center" },
  finishedEmoji: { fontSize: 64, marginBottom: 12 },
  finishedTitle: { fontSize: 28, fontWeight: "900", color: "#111827", marginBottom: 4 },
  finishedScore: { fontSize: 48, fontWeight: "900", color: "#e5ae32", marginBottom: 8 },
  finishedSub: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 28 },
  resultsList: { width: "100%", gap: 8, marginBottom: 28 },
  resultItem: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, padding: 12, gap: 12, borderWidth: 1,
  },
  resultCorrect: { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" },
  resultWrong: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  resultIcon: { fontSize: 18, fontWeight: "900" },
  resultInfo: { flex: 1 },
  resultTeamName: { fontSize: 13, fontWeight: "800", color: "#111827" },
  resultTeamNumber: { fontSize: 11, color: "#6b7280" },
  resultGuess: { fontSize: 11, color: "#991b1b", marginTop: 2 },
  finishedBtns: { flexDirection: "row", gap: 12 },
  restartBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  restartBtnText: { color: "#111827", fontWeight: "800", fontSize: 15 },
  homeBtn: { backgroundColor: "#f5f0e0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e8e0c8" },
  homeBtnText: { color: "#111827", fontWeight: "700", fontSize: 15 },
});

export default TeamGuessGame;