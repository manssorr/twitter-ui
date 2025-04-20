import { useState, useEffect } from "react"
import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withDelay,
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import Like from "~/assets/svg/like.svg"
import LikeFilled from "~/assets/svg/like-filled.svg"

// Confetti particle component
const ConfettiParticle = ({ 
    delay,
    x, 
    y, 
    size, 
    color, 
    duration = 600,
    show
}: { 
    delay: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration?: number;
    show: boolean;
}) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0);

    useEffect(() => {
        if (show) {
            // Start with a delay based on the white circle expansion
            opacity.value = withDelay(delay + 300, withTiming(1, { duration: 50 }));
            scale.value = withDelay(delay + 300, withTiming(1, { duration: 100 }));
            
            // Move outward from center
            translateX.value = withDelay(delay + 300, withTiming(x, { 
                duration,
                easing: Easing.bezier(0.1, 0.8, 0.2, 1)
            }));
            translateY.value = withDelay(delay + 300, withTiming(y, { 
                duration,
                easing: Easing.bezier(0.1, 0.8, 0.2, 1)
            }));
            
            // Fade out as it moves outward
            opacity.value = withDelay(delay + 300 + 150, withTiming(0, { 
                duration: duration - 150 
            }));
        } else {
            opacity.value = 0;
            translateX.value = 0;
            translateY.value = 0;
            scale.value = 0;
        }
    }, [show]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                animatedStyle,
            ]}
        />
    );
};

function LikeButton({ iconColor, textColor }: { iconColor: string, textColor: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Animation control values
    const unlikedIconScale = useSharedValue(1);
    const redCircleScale = useSharedValue(0);  // Plain red circle
    const whiteCircleScale = useSharedValue(0); // White background circle
    const likedIconScale = useSharedValue(0);   // Heart icon inside white circle
    
    // Define animated styles
    const unlikedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: unlikedIconScale.value }],
        opacity: unlikedIconScale.value,
    }));
    
    const redCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: redCircleScale.value }],
        opacity: redCircleScale.value === 0 ? 0 : 1,
    }));
    
    const whiteCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: whiteCircleScale.value }],
        opacity: whiteCircleScale.value === 0 ? 0 : 1,
    }));
    
    const likedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: likedIconScale.value }],
        opacity: likedIconScale.value,
    }));
    
    const handlePress = () => {
        const willBeLiked = !isLiked;
        setIsLiked(willBeLiked);
        
        if (willBeLiked) {
            // Step 1: Animate the unliked icon scaling down (even faster)
            unlikedIconScale.value = withTiming(0, { 
                duration: 35, // 30% faster than 50ms
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            });
            
            // Step 2: After icon scales down, show and expand the plain red circle
            setTimeout(() => {
                // Use withTiming for a smooth but FAST expansion of red circle
                redCircleScale.value = withTiming(1.05, {
                    duration: 70, // 30% faster than 100ms
                    easing: Easing.bezier(0.2, 0.8, 0.2, 1)
                });
                
                // Step 3: Start white circle animation sooner
                setTimeout(() => {
                    // Trigger confetti
                    setShowConfetti(true);
                    
                    // Show and expand the white circle quickly
                    whiteCircleScale.value = withTiming(1, {
                        duration: 60, // 30% faster than 90ms
                        easing: Easing.bezier(0.1, 0.8, 0.2, 1)
                    });
                    
                    // Show the heart icon very quickly after white circle starts
                    setTimeout(() => {
                        // Heart icon animation - KEEPING THE MAIN PART THE SAME as requested
                        likedIconScale.value = withSequence(
                            withTiming(0.8, { duration: 10 }),  
                            withTiming(1, { duration: 150 }),   // Keep heart animation same speed
                            withTiming(1.05, { duration: 60 }), 
                            withTiming(1, { duration: 80 })     
                        );
                    }, 20); // 30% faster than 30ms
                    
                    // Hide the red circle faster
                    setTimeout(() => {
                        redCircleScale.value = withTiming(0, { duration: 50 }); // 30% faster than 70ms
                        
                        // Reset confetti state after animation completes
                        setTimeout(() => {
                            setShowConfetti(false);
                        }, 140); // 30% faster than 200ms
                    }, 105); // 30% faster than 150ms
                }, 70); // 30% faster than 100ms
            }, 35); // 30% faster than 50ms
        } else {
            // When unliking, quickly transition back
            setShowConfetti(false);
            unlikedIconScale.value = withTiming(1, { duration: 70 }); // 30% faster than 100ms
            likedIconScale.value = 0;
            redCircleScale.value = 0;
            whiteCircleScale.value = 0;
        }
    };
    
    // Confetti data - colors and positions
    const confettiParticles = [
        { delay: 0, x: -20, y: -20, size: 4, color: '#91D2FA' },
        { delay: 20, x: 0, y: -25, size: 5, color: '#9FC7FA' },
        { delay: 10, x: 20, y: -20, size: 4, color: '#F48EA7' },
        { delay: 30, x: 25, y: 0, size: 4, color: '#CC8EF5' },
        { delay: 40, x: 20, y: 20, size: 5, color: '#9CD8C3' },
        { delay: 25, x: 0, y: 25, size: 4, color: '#8CE8C3' },
        { delay: 35, x: -20, y: 20, size: 4, color: '#F48EA7' },
        { delay: 15, x: -25, y: 0, size: 5, color: '#CC8EF5' },
        // Additional particles for more density
        { delay: 5, x: -15, y: -22, size: 3, color: '#9FC7FA' },
        { delay: 22, x: 15, y: -22, size: 3, color: '#F48EA7' },
        { delay: 38, x: 22, y: 15, size: 3, color: '#9CD8C3' },
        { delay: 28, x: -22, y: 15, size: 3, color: '#CC8EF5' },
    ];

    return (
        <TouchableOpacity 
            className="flex-row items-center gap-1.5" 
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                {/* Plain red circle that expands first */}
                <Animated.View style={[styles.circleContainer, redCircleStyle]}>
                    <View style={[styles.circle, { backgroundColor: '#f91880' }]} />
                </Animated.View>
                
                {/* White circle that contains the liked icon */}
                <Animated.View style={[styles.circleContainer, whiteCircleStyle]}>
                    <View style={[styles.circle, { backgroundColor: 'white' }]} />
                </Animated.View>
                
                {/* Confetti particles */}
                {confettiParticles.map((particle, index) => (
                    <ConfettiParticle
                        key={index}
                        delay={particle.delay}
                        x={particle.x}
                        y={particle.y}
                        size={particle.size}
                        color={particle.color}
                        show={showConfetti}
                    />
                ))}
                
                {/* Unliked icon */}
                <Animated.View style={[styles.iconAbsolute, unlikedIconStyle]}>
                    <Like width={18} height={18} fill={iconColor} />
                </Animated.View>
                
                {/* Liked icon */}
                <Animated.View style={[styles.iconAbsolute, likedIconStyle]}>
                    <LikeFilled width={18} height={18} fill={"#f91880"} />
                </Animated.View>
            </View>
            
            <Text 
                className={textColor} 
                style={{ 
                    color: isLiked ? "#f91880" : textColor 
                }}
            >
                100
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        position: 'relative',
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconAbsolute: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleContainer: {
        position: 'absolute',
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    }
});

export default LikeButton