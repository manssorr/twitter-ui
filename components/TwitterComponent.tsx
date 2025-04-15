import React, { forwardRef, useMemo, useImperativeHandle } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  SectionList,
  StyleProp,
  ViewStyle,
  SectionListProps,
  LayoutChangeEvent,
  DefaultSectionT, // Keep standard types
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useAnimatedRef,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---

// Type for pointer events on Animated.View
type AnimatedViewInteractionEvents = React.ComponentProps<typeof Animated.View>['pointerEvents'];

// Props for the view that fades in/out
type OpacityTransitionViewProps = {
  customStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  visibilityLevel: Animated.SharedValue<number>; // Renamed from opacity
  visibilityThresholdForInteraction?: number; // Renamed from opacityThresholdToEnablePointerEvents
  children?: React.ReactNode;
  dynamicProps?: object; // Renamed from animatedProps
} & React.ComponentProps<typeof Animated.View>; // Keep base props

// Props for the expanded header section
interface ExpandedHeaderProps {
  children?: React.ReactNode;
}

// Props for the main navigation bar (top header)
interface TopNavigationBarProps {
  navBarVisibility?: Animated.SharedValue<number>; // Renamed from showNavBar
  leftContent?: React.ReactNode; // Renamed from headerLeft
  centerContent?: React.ReactNode; // Renamed from headerCenter
  rightContent?: React.ReactNode; // Renamed from headerRight
  ignoreTopPadding?: boolean; // Renamed from ignoreTopSafeArea
  BackgroundLayer?: (props: { navBarVisibility?: Animated.SharedValue<number> }) => React.ReactElement | null; // Renamed from SurfaceComponent
  scrollOffset?: Animated.SharedValue<number>; // Renamed from scrollY
}

// Props for the main scrolling list component
interface ScrollingListProps<ItemT, SectionT = DefaultSectionT> {
  // Function components for headers, passing renamed props
  NavigationBarComponent: (props: { scrollOffset: Animated.SharedValue<number>; navBarVisibility: Animated.SharedValue<number>; }) => React.ReactElement;
  ExpandedHeaderComponent?: (props: { scrollOffset: Animated.SharedValue<number>; navBarVisibility: Animated.SharedValue<number>; }) => React.ReactElement;
  wrapperStyle?: StyleProp<ViewStyle>; // Renamed from containerStyle
  ignoreLeftPadding?: boolean; // Renamed from ignoreLeftSafeArea
  ignoreRightPadding?: boolean; // Renamed from ignoreRightSafeArea
  listContentWrapperStyle?: StyleProp<ViewStyle>; // Renamed from contentContainerStyle
  expandedHeaderCollapseThreshold?: number; // Renamed from largeHeaderFadeThreshold
}

// --- Components ---

/**
 * A view container that animates its opacity and controls pointer events based on visibility.
 */
const OpacityTransitionView = forwardRef<Animated.View, OpacityTransitionViewProps>(
  (
    {
      children,
      customStyle,
      visibilityLevel, // Use renamed prop
      dynamicProps = {}, // Use renamed prop
      visibilityThresholdForInteraction = 1, // Use renamed prop
      ...rest
    },
    ref
  ) => {
    // Calculate pointer events based on visibility level
    const animatedInteractionProps = useAnimatedProps(() => {
      const interactionEvents: AnimatedViewInteractionEvents =
        visibilityLevel.value >= visibilityThresholdForInteraction ? 'auto' : 'none';
      return { pointerEvents: interactionEvents };
    }, [visibilityLevel, visibilityThresholdForInteraction]);

    // Style for fading effect
    const transitionStyle = useAnimatedStyle(() => ({ opacity: visibilityLevel.value }));

    return (
      <Animated.View
        ref={ref}
        style={[opacityTransitionStyles.base, customStyle, transitionStyle]} // Use renamed style object
        animatedProps={{ ...animatedInteractionProps, ...dynamicProps }}
        {...rest}
      >
        {children}
      </Animated.View>
    );
  }
);

// Styles for OpacityTransitionView
const opacityTransitionStyles = StyleSheet.create({
  base: { opacity: 0 }, // Renamed style key
});

// Constants for ExpandedHeader padding
const EXPANDED_VERTICAL_PADDING = 6;
const EXPANDED_HORIZONTAL_PADDING = 12;

/**
 * A simple container for the content of the large, expandable header section.
 */
const ExpandedHeader: React.FC<ExpandedHeaderProps> = ({ children }) => (
  <View style={expandedHeaderStyles.wrapper}>{children}</View> // Use renamed style object
);

// Styles for ExpandedHeader
const expandedHeaderStyles = StyleSheet.create({
  wrapper: { // Renamed style key
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: EXPANDED_VERTICAL_PADDING,
    paddingHorizontal: EXPANDED_HORIZONTAL_PADDING,
  },
});

// Minimum width percentage for the center section of the top navigation bar
const MIN_CENTER_SECTION_WIDTH_PERCENTAGE = 0.4;

/**
 * The main top navigation bar component, handling layout for left, center, and right content.
 */
const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  navBarVisibility, // Use renamed prop
  leftContent = null, // Use renamed prop
  centerContent = null, // Use renamed prop
  rightContent = null, // Use renamed prop
  ignoreTopPadding = false, // Use renamed prop
  BackgroundLayer, // Use renamed prop
  // scrollOffset is not directly used here but passed to BackgroundLayer if needed
}) => {
  // Get safe area insets, especially the top padding
  const { top: topInset } = useSafeAreaInsets();
  // Get window dimensions for calculating widths
  const dimensions = useWindowDimensions();
  // Use provided visibility or create a default shared value (fully visible)
  const internalNavBarVisibility = navBarVisibility ?? useSharedValue(1);

  // Check if center content exists
  const centerSectionExists = !!centerContent;

  // Calculate widths for center and side sections
  const { calculatedCenterWidth, minimumSideWidth } = useMemo(() => {
    const centerW = centerSectionExists ? MIN_CENTER_SECTION_WIDTH_PERCENTAGE * dimensions.width : 0;
    const sideW = (dimensions.width - centerW) / 2;
    return { calculatedCenterWidth: centerW, minimumSideWidth: sideW };
  }, [centerSectionExists, dimensions]);

  // Determine if both left and right content are absent
  const noSideContent = !leftContent && !rightContent;

  // Helper function to render side sections (left/right)
  const renderSideSection = (
    content: React.ReactNode,
    sectionStyle: StyleProp<ViewStyle>,
    alignment: 'flex-start' | 'flex-end' // Added alignment parameter
  ) => {
    return (
      <View
        style={[
          sectionStyle, // Base style for the section
          noSideContent && topNavBarStyles.hideFlex, // Hide if no side content
          { width: minimumSideWidth, justifyContent: alignment }, // Apply calculated width and alignment
        ]}
      >
        {content}
      </View>
    );
  };

  return (
    <View>
      {/* Render the background layer if provided */}
      {BackgroundLayer && BackgroundLayer({ navBarVisibility: internalNavBarVisibility })}

      {/* Main container for the navigation bar */}
      <View style={[topNavBarStyles.navContainer, !ignoreTopPadding && { paddingTop: topInset }]}>
        {/* Render left section */}
        {renderSideSection(leftContent, topNavBarStyles.sideSectionBase, 'flex-start')}

        {/* Render center section (only if content exists) */}
        {centerContent &&
          (
            <OpacityTransitionView // Use renamed component
              visibilityLevel={internalNavBarVisibility} // Pass renamed prop
              customStyle={[topNavBarStyles.centerSection, { minWidth: calculatedCenterWidth }]} // Use renamed style object
            >
              {centerContent}
            </OpacityTransitionView>
          )
        }

        {/* Render right section */}
        {renderSideSection(rightContent, topNavBarStyles.sideSectionBase, 'flex-end')}
      </View>
    </View>
  );
};

// Styles for TopNavigationBar
const topNavBarStyles = StyleSheet.create({
  navContainer: { // Renamed style key
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSectionBase: { // Renamed style key for common side styles
    flexDirection: 'row', // Default to row, content might change this
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  centerSection: { // Renamed style key
    flex: 1, // Allow center to take remaining space if needed
    flexDirection: 'row',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hideFlex: { display: 'none' }, // Renamed style key
});


// Type merging SectionList base props with our custom ones
// Omit 'onScroll' as we handle it internally
type ScrollingListWithHeaderProps<ItemT, SectionT = DefaultSectionT> =
  Omit<SectionListProps<ItemT, SectionT>, 'onScroll'>
  & ScrollingListProps<ItemT, SectionT>; // Use renamed props interface

// Create an animated version of SectionList
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList) as React.ComponentClass<
  Animated.AnimateProps<SectionListProps<any, any>>, // Use standard types
  any
>;

/**
 * The core component: A SectionList that integrates collapsible large header
 * and a fixed top navigation bar, animating based on scroll position.
 */
const ScrollingListWithHeaderInternal = <
  ItemT extends any = any, // Keep generic types
  SectionT extends DefaultSectionT = DefaultSectionT // Keep generic types
>(
  {
    NavigationBarComponent, // Use renamed prop
    ExpandedHeaderComponent, // Use renamed prop
    wrapperStyle, // Use renamed prop
    ignoreLeftPadding, // Use renamed prop
    ignoreRightPadding, // Use renamed prop
    listContentWrapperStyle, // Use renamed prop
    expandedHeaderCollapseThreshold = 1, // Use renamed prop
    ...rest // Pass remaining SectionList props
  }: ScrollingListWithHeaderProps<ItemT, SectionT>,
  ref: React.Ref<Animated.ScrollView> // Use standard ref type
) => {
  // Get safe area insets for padding
  const safeAreaInsets = useSafeAreaInsets();
  // Create a ref for the underlying SectionList
  const listRef = useAnimatedRef<SectionList<ItemT, SectionT>>();
  // Expose the listRef's current value via the forwarded ref
  useImperativeHandle(ref, () => listRef.current as any);

  // Shared value to track vertical scroll position
  const scrollOffset = useSharedValue(0);
  // Shared value to store the measured height of the expanded header
  const expandedHeaderHeight = useSharedValue(0);

  // Derived value to calculate the visibility of the top navigation bar
  // It transitions from 0 (hidden) to 1 (visible) as the user scrolls past the expanded header
  const navBarVisibility = useDerivedValue(() => {
    if (expandedHeaderHeight.value === 0) return 0; // Avoid division by zero
    // Interpolate based on scroll offset relative to expanded header height and threshold
    return interpolate(
      scrollOffset.value,
      [expandedHeaderHeight.value * (expandedHeaderCollapseThreshold - 0.01), expandedHeaderHeight.value * expandedHeaderCollapseThreshold],
      [0, 1], // Output range: 0 (hidden) to 1 (visible)
      Extrapolate.CLAMP // Clamp the output to the 0-1 range
    );
  }, [expandedHeaderHeight, expandedHeaderCollapseThreshold]); // Dependencies

  // Animated scroll handler to update the scrollOffset shared value
  const scrollEventHandler = useAnimatedScrollHandler({
    onScroll: (event, context) => {
      scrollOffset.value = event.contentOffset.y; // Update shared value with current scroll position
    },
  });

  return (
    // Outer container view applying custom styles and safe area padding
    <View
      style={[
        scrollingListStyles.outerWrapper, // Use renamed style object
        wrapperStyle, // Apply user-provided wrapper style
        !ignoreLeftPadding && { paddingLeft: safeAreaInsets.left }, // Apply left safe area padding if not ignored
        !ignoreRightPadding && { paddingRight: safeAreaInsets.right }, // Apply right safe area padding if not ignored
      ]}
    >
      {/* Render the fixed top navigation bar */}
      <NavigationBarComponent scrollOffset={scrollOffset} navBarVisibility={navBarVisibility} />

      {/* Render the animated SectionList */}
      <AnimatedSectionList
        ref={listRef} // Attach the animated ref
        scrollEventThrottle={16} // Standard throttle for smooth scroll events
        overScrollMode="auto" // Standard overscroll behavior
        onScroll={scrollEventHandler} // Attach the scroll handler
        automaticallyAdjustContentInsets={false} // We handle insets manually
        contentContainerStyle={listContentWrapperStyle} // Apply user-provided content container style
        {...rest} // Spread the rest of the SectionList props
        // Render the Expanded Header within the ListHeaderComponent
        ListHeaderComponent={
          <>
            {ExpandedHeaderComponent && ( // Only render if provided
              <View
                // Measure the layout of the expanded header to get its height
                onLayout={(e: LayoutChangeEvent) => {
                  expandedHeaderHeight.value = e.nativeEvent.layout.height;
                }}
              >
                {/* Render the actual expanded header content */}
                <ExpandedHeaderComponent scrollOffset={scrollOffset} navBarVisibility={navBarVisibility} />
              </View>
            )}
          </>
        }
      />
    </View>
  );
};

// Forward the ref to the internal component and define the final component type
const ScrollingListWithHeader = React.forwardRef(ScrollingListWithHeaderInternal) as <
  ItemT = any, // Keep generic types
  SectionT = DefaultSectionT // Keep generic types
>(
  // Define the props type for the final component, including the optional ref
  props: ScrollingListWithHeaderProps<ItemT, SectionT> & {
    ref?: React.Ref<Animated.ScrollView>; // Use standard ref type
  }
) => React.ReactElement; // Return type

// Styles for ScrollingListWithHeader
const scrollingListStyles = StyleSheet.create({
  outerWrapper: { flex: 1 }, // Renamed style key
  refreshIndicatorContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    width: '100%',
    height: 40,
  },
});

// Export the refactored components with new names
export { OpacityTransitionView, TopNavigationBar, ExpandedHeader, ScrollingListWithHeader };
