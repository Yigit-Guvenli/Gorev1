import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.85;
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

// ✏️ BURAYA KENDİ İÇERİKLERİNİ YAZ
const ITEMS = [
  { label: "İnstagram Etiket İle St", emoji: "", color: "#e5ae32", textColor: "#fdfaf2" },
  { label: "Ödül 1",      emoji: "", color: "#fdfaf2", textColor: "#e5ae32" },
  { label: "Yüz Boyama", emoji: "", color: "#374151", textColor: "#fdfaf2" },
  { label: "Ödül 2",      emoji: "", color: "#e5ae32", textColor: "#fdfaf2" },
  { label: "Challenge 3", emoji: "", color: "#fdfaf2", textColor: "#e5ae32" },
  { label: "Ödül 3",      emoji: "", color: "#374151", textColor: "#fdfaf2" },
  { label: "Challenge 4", emoji: "", color: "#e5ae32", textColor: "#fdfaf2" },
  { label: "Ödül 4",      emoji: "", color: "#fdfaf2", textColor: "#e5ae32" },
];

const SLICE_ANGLE = 360 / ITEMS.length;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSlicePath(index: number): string {
  const startAngle = index * SLICE_ANGLE;
  const endAngle = startAngle + SLICE_ANGLE;
  const start = polarToCartesian(CENTER, CENTER, RADIUS - 2, startAngle);
  const end = polarToCartesian(CENTER, CENTER, RADIUS - 2, endAngle);
  const largeArc = SLICE_ANGLE > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS - 2} ${RADIUS - 2} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

const SpinWheel: React.FC = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof ITEMS)[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomSlice = Math.floor(Math.random() * ITEMS.length);
    const targetAngle = extraSpins * 360 + randomSlice * SLICE_ANGLE;
    const totalRotation = currentRotation.current + targetAngle;
    currentRotation.current = totalRotation;

    spinAnim.setValue(currentRotation.current - targetAngle);

    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const normalizedAngle = ((totalRotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalizedAngle + 270) % 360;
      const index = Math.floor(pointerAngle / SLICE_ANGLE) % ITEMS.length;
      setResult(ITEMS[index]);
      setModalVisible(true);
      setSpinning(false);
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend",
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ÇARKI ÇEVİR</Text>
      <Text style={styles.sub}>👀👀👀</Text>

      {/* Ok göstergesi */}
      <View style={styles.pointerContainer}>
        <Text style={styles.pointer}>▼</Text>
      </View>

      {/* Çark */}
      <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate }] }]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          {ITEMS.map((item, i) => {
            const midAngle = i * SLICE_ANGLE + SLICE_ANGLE / 2;
            const textPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.62, midAngle);
            const emojiPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.82, midAngle);
            const textRot = midAngle - 90;

            return (
              <G key={i}>
                <Path d={buildSlicePath(i)} fill={item.color} stroke="#111827" strokeWidth={2} />
                <SvgText
                  x={textPos.x}
                  y={textPos.y}
                  fill={item.textColor}
                  fontSize={11}
                  fontWeight="800"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={textRot}
                  origin={`${textPos.x}, ${textPos.y}`}
                >
                  {item.label}
                </SvgText>
                <SvgText
                  x={emojiPos.x}
                  y={emojiPos.y}
                  fontSize={16}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={textRot}
                  origin={`${emojiPos.x}, ${emojiPos.y}`}
                >
                  {item.emoji}
                </SvgText>
              </G>
            );
          })}
          {/* Merkez daire */}
          <Circle cx={CENTER} cy={CENTER} r={22} fill="#111827" stroke="#e5ae32" strokeWidth={3} />
        </Svg>
      </Animated.View>

      {/* Çevir butonu */}
      <TouchableOpacity
        style={[styles.spinBtn, spinning && styles.spinBtnDisabled]}
        onPress={spin}
        disabled={spinning}
        activeOpacity={0.85}
      >
        <Text style={styles.spinBtnText}>{spinning ? "Dönüyor..." : "ÇEVİR 🎰"}</Text>
      </TouchableOpacity>

      {/* Sonuç Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>{result?.emoji}</Text>
            <Text style={styles.modalTitle}>Sonuç!</Text>
            <Text style={styles.modalResult}>{result?.label}</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Tamam 🎉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfaf2",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 3,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
    marginBottom: 24,
  },
  pointerContainer: {
    zIndex: 10,
    marginBottom: -16,
  },
  pointer: {
    fontSize: 32,
    color: "#e5ae32",
    textShadowColor: "#fdfaf2",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  spinBtn: {
    marginTop: 32,
    backgroundColor: "#fdfaf2",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e5ae32",
  },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    width: "75%",
    borderWidth: 2,
    borderColor: "#e5ae32",
  },
  modalEmoji: { fontSize: 56, marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: "700", color: "#9ca3af", letterSpacing: 2, marginBottom: 8 },
  modalResult: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fdfaf2",
    textAlign: "center",
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: "#e5ae32",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 50,
  },
  modalBtnText: { color: "#111827", fontWeight: "900", fontSize: 16 },
});

export default SpinWheel;