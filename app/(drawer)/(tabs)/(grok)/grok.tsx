import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, rightContent, centerContent }) => {
  return (
    <View className="flex-row items-center justify-center px-4 py-3  pb-8">
      <View className="absolute left-4 flex-row items-center">
        <TouchableOpacity className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
          <Text className="text-xs text-gray-600">U</Text>
        </TouchableOpacity>
      </View>

      <View className="center absolute flex-1">{centerContent}</View>

      <View className="absolute right-4 flex-row items-center">{rightContent}</View>
    </View>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <View className="mb-4 rounded-lg bg-[#E5E7EB] p-4">
      <View className="mb-2 flex-row items-center self-start rounded-lg border border-gray-300 px-3 py-0.5">
        {icon}
        <Text className="ml-2 text-base font-bold text-gray-900">{title}</Text>
      </View>
      <Text className="text-[16px] text-gray-700">{description}</Text>
    </View>
  );
};

export default function Grok() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]" style={{ marginBottom: insets.bottom + 50 }}>
      <View className="flex-1">
        <Header
          centerContent={
            <View className="flex-row items-center gap-1">
              <Text className="text-lg font-bold text-black">Grok 3</Text>
              <Text className="items-center justify-center rounded-xl bg-[#e0f5ff] px-2 text-lg font-bold text-[#2999E2]">
                beta
              </Text>
            </View>
          }
          rightContent={
            <View className="flex-row items-center gap-4 space-x-4">
              <TouchableOpacity>
                <Feather name="clock" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Feather name="edit" size={24} color="black" />
              </TouchableOpacity>
            </View>
          }
        />
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
          <Text className="mb-2 text-2xl font-extrabold text-black">Grok 3 is here.</Text>
          <Text className="mb-6 text-base text-gray-600 ">
            Try our new features: DeepSearch, Think, and Edit Image
          </Text>

          <FeatureCard
            icon={<MaterialCommunityIcons name="text-box-search-outline" size={16} color="black" />}
            title="DeepSearch"
            description="Search deeply to deliver detailed, well-reasoned answers with Grok's rapid, agentic search."
          />
          <FeatureCard
            icon={<MaterialCommunityIcons name="lightbulb-outline" size={16} color="black" />}
            title="Think"
            description="Solve the hardest problems in math, science, and coding with our reasoning model."
          />
          <FeatureCard
            icon={<MaterialCommunityIcons name="image-edit-outline" size={16} color="black" />}
            title="Edit Image"
            description="Transform your images with style transfers, edits, and more."
          />
        </ScrollView>

        <View className="border-t border-gray-100  px-4 py-3">
          <View className="flex-row items-center rounded-2xl bg-gray-200 p-2 py-6">
            <View className="flex-1 flex-col">
              <TextInput
                placeholder="Ask anything"
                placeholderTextColor="#6b7280"
                className="min-h-10 w-full flex-1 px-3 pb-5 text-lg text-gray-900"
              />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity className="rounded-xl bg-gray-300 p-1.5">
                    <MaterialCommunityIcons name="paperclip" size={20} color="#4b5563" />
                  </TouchableOpacity>
                  <TouchableOpacity className="rounded-xl bg-gray-300 p-1.5">
                    <View className="h-5 w-5 rounded-full border-2 border-gray-600" />
                  </TouchableOpacity>
                  <TouchableOpacity className="rounded-xl bg-gray-300 p-1.5">
                    <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#4b5563" />
                  </TouchableOpacity>
                  <TouchableOpacity className="rounded-xl bg-gray-300 p-1.5">
                    <MaterialCommunityIcons name="image-edit-outline" size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity className="">
                  <MaterialCommunityIcons name="microphone" size={22} color="#4b5563" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
