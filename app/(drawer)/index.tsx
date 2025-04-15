import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const navigateToTabs = () => {
    router.push("/(drawer)/(tabs)");
  };

  return (
    <View className="flex-1 bg-black justify-center py-10 px-8 gap-10">
      <Text className="text-[100px] text-white mb-10">𝕏</Text>
      <View className="gap-2 flex-col">
        <Text className="text-5xl font-bold text-white mb-2.5 tracking-tighter">Happening now</Text>
        <Text className="text-3xl font-semibold text-white mb-12 tracking-tighter">Join today.</Text>
      </View>
      <TouchableOpacity
        className="bg-white py-4 px-8 rounded-full w-4/5 items-center"
        onPress={navigateToTabs}
      >
        <Text className="text-black text-lg font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}