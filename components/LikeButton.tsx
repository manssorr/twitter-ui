import { TouchableOpacity, Text, View } from "react-native"
import Like from "~/assets/svg/like.svg"


function LikeButton({ iconColor, textColor }: { iconColor: string, textColor: string }) {
    return (

        <TouchableOpacity className="flex-row items-center gap-1.5">
            <Like width={18} height={18} fill={iconColor} />
            <Text className={textColor}>100</Text>
        </TouchableOpacity>
    )
}

export default LikeButton