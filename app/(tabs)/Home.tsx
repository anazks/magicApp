import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const WISHES = [
  { id: '1', emoji: '✨', title: 'Daily Magic', desc: 'Your morning ritual', tag: 'Popular', color: '#2563EB' }, // Blue
  { id: '2', emoji: '🌙', title: 'Night Spells', desc: 'Wind down in peace', tag: 'New', color: '#2563EB' },
  { id: '3', emoji: '🔥', title: 'Power Wish', desc: 'Amplify your intent', tag: 'Hot', color: '#EAB308' }, // Yellow
  { id: '4', emoji: '💧', title: 'Flow State', desc: 'Enter deep focus', tag: null, color: '#2563EB' },
  { id: '5', emoji: '🌿', title: 'Calm Aura', desc: 'Restore your energy', tag: 'Calm', color: '#2563EB' },
  { id: '6', emoji: '⚡', title: 'Spark Mode', desc: 'Ignite creativity', tag: 'Trending', color: '#EAB308' },
  { id: '7', emoji: '🌸', title: 'Bloom Wish', desc: 'Open your heart', tag: null, color: '#2563EB' },
  { id: '8', emoji: '🪐', title: 'Cosmic Ask', desc: 'Think beyond limits', tag: 'New', color: '#2563EB' },
]

const CATEGORIES = ['All', 'Energy', 'Focus', 'Rest', 'Growth']

function WishCard({ item, index }: { item: typeof WISHES[0]; index: number }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 80,
      useNativeDriver: true,
    }).start()
  }, [])

  const opacity = anim
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] })

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        {/* Colored top bar */}
        <View style={[styles.cardBar, { backgroundColor: item.color }]} />

        <View style={styles.cardBody}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          {item.tag && (
            <View style={[styles.tag, { backgroundColor: item.color + '15' }]}>
              <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.cardCta, { color: item.color === '#2563EB' ? '#2563EB' : '#EAB308' }]}>
            Explore →
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function Home() {
  const [activeCategory, setActiveCategory] = React.useState('All')
  const headerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start()
  }, [])

  const headerOpacity = headerAnim
  const headerSlide = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })

  // Pair items into rows of 2
  const rows = []
  for (let i = 0; i < WISHES.length; i += 2) {
    rows.push(WISHES.slice(i, i + 2))
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        
       
         
        

        {/* Search bar */}
    

        {/* Category pills */}
    

        {/* Section label */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured Wishes</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* 2-column grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item, colIndex) => (
                <WishCard key={item.id} item={item} index={rowIndex * 2 + colIndex} />
              ))}
            </View>
          ))}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    color: '#2563EB', // Blue
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#1F2937', // Dark gray for better contrast on white
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAB308', // Yellow
    borderWidth: 1.5,
    borderColor: '#2563EB', // Blue
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
    color: '#FFFFFF', // White
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Light gray
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
    marginBottom: 20,
    gap: 10,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchPlaceholder: {
    color: '#9CA3AF', // Gray
    fontSize: 15,
    fontWeight: '400',
  },

  // Categories
  categoryScroll: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // Light gray
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
  },
  pillActive: {
    backgroundColor: '#2563EB', // Blue
    borderColor: '#2563EB',
  },
  pillText: {
    color: '#6B7280', // Gray
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF', // White
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F2937', // Dark gray
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionLink: {
    color: '#2563EB', // Blue
    fontSize: 13,
    fontWeight: '600',
  },

  // Grid
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF', // White
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardBar: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    paddingBottom: 12,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#1F2937', // Dark gray
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDesc: {
    color: '#6B7280', // Gray
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', // Light gray
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardCta: {
    fontSize: 13,
    fontWeight: '600',
  },
})