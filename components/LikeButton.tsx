import { useState } from "react"
import { TouchableOpacity, Text, View } from "react-native"
import Like from "~/assets/svg/like.svg"
import LikeFilled from "~/assets/svg/like-filled.svg"


function LikeButton({ iconColor, textColor }: { iconColor: string, textColor: string }) {
    const [isLiked, setIsLiked] = useState(false)
    return (

        <TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => setIsLiked(!isLiked)}>
            {isLiked ? <LikeFilled width={18} height={18} fill={"#f91880"} /> : <Like width={18} height={18} fill={iconColor} />}
            <Text className={textColor} style={{ color: isLiked ? "#f91880" : textColor }}>100</Text>
        </TouchableOpacity>
    )
}

export default LikeButton