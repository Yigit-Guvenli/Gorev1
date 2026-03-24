import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const shuffleOptions = (q: Question): Question => {
  const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
  const shuffled = [...indexed].sort(() => Math.random() - 0.5);
  return {
    ...q,
    options: shuffled.map(o => o.opt),
    correct: shuffled.findIndex(o => o.isCorrect),
  };
};

const ALL_QUESTIONS: Question[] = [
  { question: "roboRIO ne işe yarar?", options: ["Motor sürer", "Ana kontrol kartıdır", "Batarya şarj eder", "Sensör üretir"], correct: 1 },
  { question: "FRC maçında Autonomous kaç saniye sürer?", options: ["10", "15", "20", "30"], correct: 2 },
  { question: "Alliance kaç takımdan oluşur?", options: ["2", "4", "3", "5"], correct: 2 },
  { question: "Bumper ne için kullanılır?", options: ["Puan kazanmak", "Robot hızlandırmak", "Çarpışmadan korumak", "Sensör takmak"], correct: 2 },
  { question: "Scouting ne demektir?", options: ["Robot tamir etmek", "Takımları izleyip veri toplamak", "Sponsor bulmak", "Kod yazmak"], correct: 1 },
  { question: "Pit alanı nedir?", options: ["Maç sahası", "Takımın çalışma alanı", "Hakem bölgesi", "Seyirci alanı"], correct: 1 },
  { question: "Gracious Professionalism ne anlama gelir?", options: ["Hızlı kazanmak", "Saygıyla rekabet etmek", "En iyi robotu yapmak", "Çok sponsor bulmak"], correct: 1 },
  { question: "Kickoff etkinliğinde ne açıklanır?", options: ["Şampiyon takım", "Yeni sezonun oyun kuralları", "Ödüller", "Takım sıralamaları"], correct: 1 },
  { question: "Motor Controller ne işe yarar?", options: ["Batarya şarj eder", "Sensör okur", "Motorlara giden gücü yönetir", "Kablosuz bağlantı sağlar"], correct: 2 },
  { question: "Rookie ne demektir?", options: ["Veteran takım", "İlk kez katılan takım/üye", "Hakem", "Sponsor"], correct: 1 },
  { question: "Endgame ne zaman oynanır?", options: ["Maç başında", "Autonomous'ta", "Maçın son bölümünde", "Pit'te"], correct: 2 },
  { question: "Pneumatics ne ile çalışır?", options: ["Elektrik", "Basınçlı hava", "Su", "Pil"], correct: 1 },
  { question: "Drive Team kaç kişiden oluşur?", options: ["2", "3", "4", "5"], correct: 2 },
  { question: "Ranking Points ne için kullanılır?", options: ["Para kazanmak", "Takımları sıralamak", "Robot puanlamak", "Sponsor bulmak"], correct: 1 },
  { question: "Coopertition ne anlama gelir?", options: ["Sadece rekabet", "Hem rekabet hem işbirliği", "Sadece işbirliği", "Kazanmak"], correct: 1 },
];

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

const RoboticQuiz: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(shuffle(ALL_QUESTIONS).slice(0, 10).map(shuffleOptions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      return () => resetGame();
    }, [])
  );

  const resetGame = () => {
    setQuestions(shuffle(ALL_QUESTIONS).slice(0, 10).map(shuffleOptions));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    slideAnim.setValue(0);
  };

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    if (index === questions[currentIndex].correct) {
      setScore(s => s + 1);
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    Animated.timing(slideAnim, { toValue: -400, duration: 200, useNativeDriver: true }).start(() => {
      slideAnim.setValue(400);
      setCurrentIndex(i => i + 1);
      setSelected(null);
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    });
  };

  const q = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  const getOptionStyle = (i: number) => {
    if (selected === null) return styles.option;
    if (i === q.correct) return [styles.option, styles.optionCorrect];
    if (i === selected && i !== q.correct) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  const getOptionTextStyle = (i: number) => {
    if (selected === null) return styles.optionText;
    if (i === q.correct) return [styles.optionText, styles.optionTextCorrect];
    if (i === selected && i !== q.correct) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf2" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/games" as any)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>OYUN</Text>
        <Text style={styles.headerTitle}>Robotik Quiz</Text>
        <Text style={styles.headerSub}>FIRST bilgini test et!</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ transform: [{ translateX: slideAnim }, { translateX: shakeAnim }] }}>
          {/* Soru kartı */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>Soru {currentIndex + 1}</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>

          {/* Seçenekler */}
          <View style={styles.options}>
            {q.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={getOptionStyle(i)}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.8}
                disabled={selected !== null}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>{["A", "B", "C", "D"][i]}</Text>
                </View>
                <Text style={getOptionTextStyle(i)}>{opt}</Text>
                {selected !== null && i === q.correct && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
                {selected === i && i !== q.correct && (
                  <Text style={styles.wrongIcon}>✕</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sonraki butonu */}
          {selected !== null && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 >= questions.length ? "Sonucu Gör" : "Sonraki →"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      {/* Skor */}
      <View style={styles.scoreBar}>
        <Text style={styles.scoreText}>Puan: <Text style={styles.scoreValue}>{score}</Text></Text>
      </View>

      {/* Bitti */}
      {finished && (
        <View style={styles.finishedOverlay}>
          <View style={styles.finishedCard}>
            <Text style={styles.finishedEmoji}>
              {score >= 8 ? "🏆" : score >= 5 ? "👍" : "💪"}
            </Text>
            <Text style={styles.finishedTitle}>Quiz Bitti!</Text>
            <Text style={styles.finishedScore}>{score} / {questions.length}</Text>
            <Text style={styles.finishedSub}>
              {score >= 8 ? "Harika! Robotik uzmanısın!" : score >= 5 ? "İyi iş! Biraz daha çalış!" : "Devam et, öğreniyorsun!"}
            </Text>
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

  progressContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  progressBg: { flex: 1, height: 8, backgroundColor: "#e8e0c8", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#e5ae32", borderRadius: 4 },
  progressText: { fontSize: 12, color: "#9ca3af", fontWeight: "700", minWidth: 40 },

  content: { paddingHorizontal: 24, paddingBottom: 80 },

  questionCard: {
    backgroundColor: "#f5f0e0", borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: "#e8e0c8", marginBottom: 20,
  },
  questionNumber: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  questionText: { fontSize: 18, fontWeight: "800", color: "#111827", lineHeight: 26 },

  options: { gap: 10, marginBottom: 20 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#f5f0e0", borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: "#e8e0c8",
  },
  optionCorrect: { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" },
  optionWrong: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  optionDim: { backgroundColor: "#f5f0e0", borderColor: "#e8e0c8", opacity: 0.5 },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#e8e0c8", alignItems: "center", justifyContent: "center",
  },
  optionLetterText: { fontSize: 13, fontWeight: "900", color: "#111827" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111827" },
  optionTextCorrect: { color: "#065f46", fontWeight: "800" },
  optionTextWrong: { color: "#991b1b", fontWeight: "800" },
  optionTextDim: { color: "#9ca3af" },
  checkIcon: { fontSize: 18, color: "#065f46" },
  wrongIcon: { fontSize: 18, color: "#991b1b" },

  nextBtn: {
    backgroundColor: "#e5ae32", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  nextBtnText: { color: "#111827", fontWeight: "900", fontSize: 16 },

  scoreBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#f5f0e0", paddingHorizontal: 24, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: "#e8e0c8",
  },
  scoreText: { fontSize: 14, color: "#6b7280", fontWeight: "700" },
  scoreValue: { color: "#e5ae32", fontWeight: "900", fontSize: 18 },

  finishedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  finishedCard: {
    backgroundColor: "#fdfaf2", borderRadius: 20, padding: 32,
    alignItems: "center", margin: 24, width: "85%",
  },
  finishedEmoji: { fontSize: 56, marginBottom: 8 },
  finishedTitle: { fontSize: 24, fontWeight: "900", color: "#111827", marginBottom: 8 },
  finishedScore: { fontSize: 48, fontWeight: "900", color: "#e5ae32", marginBottom: 8 },
  finishedSub: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  finishedBtns: { flexDirection: "row", gap: 12 },
  restartBtn: { backgroundColor: "#e5ae32", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  restartBtnText: { color: "#111827", fontWeight: "800", fontSize: 15 },
  homeBtn: { backgroundColor: "#f5f0e0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e8e0c8" },
  homeBtnText: { color: "#111827", fontWeight: "700", fontSize: 15 },
});

export default RoboticQuiz;