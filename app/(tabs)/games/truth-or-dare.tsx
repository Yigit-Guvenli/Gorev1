import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Side = "top" | "bottom" | null;

const TruthOrDareScreen: React.FC = () => {
  const router = useRouter();

  const [activeSide, setActiveSide] = useState<Side>("top");
  const [result, setResult] = useState<Side>(null);
  const [running, setRunning] = useState(false);

  const topAnim = useRef(new Animated.Value(1)).current;
  const bottomAnim = useRef(new Animated.Value(0.15)).current;
  const topScale = useRef(new Animated.Value(1)).current;
  const bottomScale = useRef(new Animated.Value(0.95)).current;

  const intervalRef = useRef<any>(null);


  const resetAll = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    setRunning(false);
    setResult(null);
    setActiveSide("top");

    topAnim.setValue(1);
    bottomAnim.setValue(0.15);
    topScale.setValue(1);
    bottomScale.setValue(0.95);
  };


  useFocusEffect(
    useCallback(() => {
      return () => {
        resetAll();
      };
    }, [])
  );

  const flashSide = (side: Side) => {
    setActiveSide(side);

    if (side === "top") {
      Animated.parallel([
        Animated.timing(topAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(bottomAnim, { toValue: 0.15, duration: 80, useNativeDriver: true }),
        Animated.timing(topScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(bottomScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(topAnim, { toValue: 0.15, duration: 80, useNativeDriver: true }),
        Animated.timing(bottomAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(topScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.timing(bottomScale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  };

  const start = () => {
    if (running) return;

    setRunning(true);
    setResult(null);

    let current: Side = "top";
    let elapsed = 0;
    const totalDuration = 3000 + Math.random() * 2000;

    const tick = () => {
      const speed = Math.min(50 + (elapsed / totalDuration) * 500, 600);

      current = current === "top" ? "bottom" : "top";
      flashSide(current);

      elapsed += speed;

      if (elapsed < totalDuration) {
        intervalRef.current = setTimeout(tick, speed);
      } else {
        setResult(current);
        setRunning(false);
      }
    };

    intervalRef.current = setTimeout(tick, 80);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* ÜST */}
      <Animated.View
        style={[
          styles.half,
          styles.topHalf,
          {
            opacity: topAnim,
            transform: [{ scale: topScale }, { rotate: "180deg" }],
          },
        ]}
      >
        {result === "top" ? (
          <View style={styles.resultContent}>
            <Text style={styles.resultEmoji}>🎯</Text>
            <Text style={styles.resultLabel}>BU KİŞİ SORUYOR!</Text>
          </View>
        ) : (
          <View style={styles.sideContent}>
            <Text style={styles.sideEmoji}>👤</Text>
            <Text style={styles.sideLabel}>OYUNCU 1</Text>
          </View>
        )}
      </Animated.View>

      {/* ORTA */}
      <View style={styles.middle}>
        <View style={styles.middleLine} />

        <TouchableOpacity
          style={[styles.startBtn, running && styles.startBtnDisabled]}
          onPress={start}
          disabled={running}
        >
          <Text style={styles.startBtnText}>
            {running ? "..." : result ? "TEKRAR" : "BAŞLAT"}
          </Text>
        </TouchableOpacity>

        <View style={styles.middleLine} />
      </View>

      {/* ALT */}
      <Animated.View
        style={[
          styles.half,
          styles.bottomHalf,
          {
            opacity: bottomAnim,
            transform: [{ scale: bottomScale }],
          },
        ]}
      >
        {result === "bottom" ? (
          <View style={styles.resultContent}>
            <Text style={styles.resultEmoji}>🎯</Text>
            <Text style={styles.resultLabel}>BU KİŞİ SORUYOR!</Text>
          </View>
        ) : (
          <View style={styles.sideContent}>
            <Text style={styles.sideEmoji}>👤</Text>
            <Text style={styles.sideLabel}>OYUNCU 2</Text>
          </View>
        )}
      </Animated.View>

      {/* GERİ */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },

  half: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
  },
  topHalf: {
    borderBottomWidth: 0,
    backgroundColor: "#1a2332",
  },
  bottomHalf: {
    backgroundColor: "#1a2332",
  },

  sideContent: {
    alignItems: "center",
    gap: 12,
  },
  sideEmoji: {
    fontSize: 64,
  },
  sideLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#e5ae32",
    letterSpacing: 3,
  },

  resultContent: {
    alignItems: "center",
    gap: 12,
  },
  resultEmoji: {
    fontSize: 72,
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: "900",
    color: "#e5ae32",
    letterSpacing: 2,
    textAlign: "center",
  },

  middle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 24,
    gap: 16,
  },
  middleLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#374151",
  },
  startBtn: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 50,
    elevation: 8,
    shadowColor: "#e5ae32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  startBtnDisabled: {
    backgroundColor: "#92763e",
    shadowOpacity: 0,
  },
  startBtnText: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  backBtn: {
    position: "absolute",
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: "#fdfaf2",
    fontSize: 20,
    fontWeight: "800",
  },
});

export default TruthOrDareScreen;