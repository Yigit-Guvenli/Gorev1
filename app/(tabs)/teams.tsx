import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface Team {
  number: string;
  name: string;
  logo: any;        // local asset — detay sayfası için
  logoUrl: string;  // URL — liste için
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
}

export const TEAMS: Team[] = [
  {
    number: "4972",
    name: "Borusan Robotics",
    logo: require("@/assets/images/Teams/BorusanRobotics.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_10/logo_1767641761_5325daf9.png",
    instagram: "https://www.instagram.com/borusanrobotik4972",
    youtube: "https://www.youtube.com/@borusanrobotics",
    linkedin: "https://www.linkedin.com/company/borusan-robotik/",
  },
  {
    number: "6228",
    name: "Mat Robotics",
    logo: require("@/assets/images/Teams/MatRobotics.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_6/logo_1759600232_2db59518.png",
    instagram: "https://www.instagram.com/matrobotics6228",
    website: "https://team6228.com",
    linkedin: "https://www.linkedin.com/company/team6228",
  },
  {
    number: "6232",
    name: "FLORYA BISONS",
    logo: require("@/assets/images/Teams/Florya.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_7/logo_1761204118_f05d27fa.jpg",
  },
  {
    number: "6402",
    name: "Göktürkler",
    logo: require("@/assets/images/Teams/Göktürkler.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_13/logo_1769350917_0e4b95ab.jpg",
  },
  {
    number: "6430",
    name: "Kalsedon",
    logo: require("@/assets/images/Teams/Kalsedon.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_8/logo_1761852879_c26ed027.jpg",
  },
  {
    number: "6948",
    name: "Eagles",
    logo: require("@/assets/images/Teams/EAGLES.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_12/logo_1769350845_1e5c443c.jpg",
  },
  {
    number: "6985",
    name: "EnkaTech",
    logo: require("@/assets/images/Teams/Enka.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_9/logo_1762029922_fb7caad3.jpg",
  },
  {
    number: "7086",
    name: "Iorobot",
    logo: require("@/assets/images/Teams/IOROBOT.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_14/logo_1769440070_49ffc47e.jpg",
  },
  {
    number: "7439",
    name: "Qubit",
    logo: require("@/assets/images/Teams/Qubit.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_16/logo_1769605766_b8730791.jpg",
  },
  {
    number: "7742",
    name: "Cosmos Robot Works",
    logo: require("@/assets/images/Teams/Cosmos Robot Works.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_15/logo_1769605611_867aee15.jpg",
    instagram: "https://www.instagram.com/cosmosrobotworks",
    youtube: "https://www.youtube.com/@cosmosrobotworks",
    linkedin: "https://www.linkedin.com/company/cosmos-robot-works/",
    website: "https://cosmos7742.com/",
  },
  {
    number: "8557",
    name: "Conquera",
    logo: require("@/assets/images/Teams/Conquera.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_11/logo_1768243376_f29e38a2.jpg",
  },
  {
    number: "11371",
    name: "Odyssey",
    logo: require("@/assets/images/Teams/Odyssey.png"),
    logoUrl: "https://www.rookieverse.net/uploads/team_18/logo_1770490468_9feede33.jpg",
  },
];

const TeamCard: React.FC<{ team: Team; index: number; onPress: () => void }> = ({ team, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.teamCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.teamCardInner} activeOpacity={0.8} onPress={onPress}>
        <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} resizeMode="contain" />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.teamNumberBadge}>
            <Text style={styles.teamNumber}>#{team.number}</Text>
          </View>
        </View>
        <Text style={styles.teamArrow}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TeamsScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [headerHeight, setHeaderHeight] = useState(210);
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

  const filtered = TEAMS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.number.includes(search)
  );

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
        <Text style={styles.headerLabel}>TOPLULUK</Text>
        <Text style={styles.headerTitle}>Takımlar</Text>
        <Text style={styles.headerSub}>{TEAMS.length} takım listeleniyor</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Takım adı veya numara ara..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingTop: headerHeight + 12 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Takım bulunamadı</Text>
          </View>
        ) : (
          filtered.map((team, i) => (
            <TeamCard
              key={team.number}
              team={team}
              index={i}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/team-detail",
                  params: { number: team.number },
                })
              }
            />
          ))
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ede8d8",
  },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: "#111827", fontSize: 16, fontWeight: "800" },
  headerLabel: { color: "#e5ae32", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 30, fontWeight: "900", color: "#111827", letterSpacing: -1, marginBottom: 2 },
  headerSub: { fontSize: 13, color: "#9ca3af", marginBottom: 12 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f0e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e8e0c8",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  clearBtn: { fontSize: 14, color: "#9ca3af", paddingLeft: 8 },
  list: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  teamCard: {
    backgroundColor: "#f5f0e0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0c8",
    overflow: "hidden",
  },
  teamCardInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  teamLogo: { width: 56, height: 56, borderRadius: 12 },
  teamInfo: { flex: 1, gap: 6 },
  teamName: { fontSize: 16, fontWeight: "800", color: "#111827" },
  teamNumberBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e5ae32",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  teamNumber: { fontSize: 11, fontWeight: "800", color: "#111827" },
  teamArrow: { fontSize: 24, color: "#9ca3af", fontWeight: "300" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16, color: "#9ca3af" },
});

export default TeamsScreen;