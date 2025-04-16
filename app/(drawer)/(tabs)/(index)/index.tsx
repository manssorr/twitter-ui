import { View, Text } from 'react-native';
import { Link } from "expo-router"

export default function Home() {
    return (
        <View className="mt-20">
            <Link href="/profile/123">Profile</Link>
        </View>
    );
}
