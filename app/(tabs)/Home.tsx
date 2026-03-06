import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listServices, makeRequest } from '../../api/services';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../../context/ToastContext';
import { X, ChevronRight, Info, MapPin, User, Phone, Image as ImageIcon, Send, Sparkles, Droplets, Zap } from 'lucide-react-native';

// Interfaces matching Web
// Interfaces matching Web

interface SubCategory {
  id: number;
  category: number;
  name: string;
  image?: string | null;
  service_charge?: string;
  is_active: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string | null;
  image?: string | null;
  service_charge?: string;
  is_active: boolean;
  subcategories: SubCategory[];
}

export default function Home() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Form State
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [location, setLocation] = useState<{lat: string, lng: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubTitleExpanded, setIsSubTitleExpanded] = useState(false);
  const [isBookingTitleExpanded, setIsBookingTitleExpanded] = useState(false);

  useEffect(() => {
    fetchCategories();
    requestLocationPermission();
  }, []);

  const ads = [
    { id: 1, title: 'Professional Cleaning', subtitle: 'Sparkling results for every room', icon: Sparkles, color: '#3B82F6', secondaryColor: '#60A5FA' },
    { id: 2, title: 'Expert Plumbing', subtitle: 'Reliable repairs & installations', icon: Droplets, color: '#1A4FD6', secondaryColor: '#3B82F6' },
    { id: 3, title: 'Elite Electrical', subtitle: 'Safety & quality guaranteed', icon: Zap, color: '#0F172A', secondaryColor: '#1E293B' },
  ];

  const renderAdItem = ({ item }: { item: any }) => (
    <View style={[styles.adCard, { backgroundColor: item.color }]}>
      <View style={styles.adContentBox}>
        <View style={[styles.adIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
           <item.icon size={32} color="#FFF" />
        </View>
        <View style={styles.adTextBox}>
          <Text style={styles.adTitle}>{item.title}</Text>
          <Text style={styles.adSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </View>
  );

  const HomeFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerHeading}>Special Offers</Text>
      <FlatList
        data={ads}
        renderItem={renderAdItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={styles.adList}
      />
      <View style={styles.brandingSection}>
        <Text style={styles.brandingTitle}>Magic Lamp</Text>
        <Text style={styles.brandingInfo}>Premium Home Services • Built for Excellence</Text>
      </View>
      <View style={{ height: 40 }} />
    </View>
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await listServices();
      if (Array.isArray(data)) {
         // Sort by ID or keep as is from web
         setCategories(data);
      } else if (data && data.results) {
         setCategories(data.results);
      } else {
         setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Error', 'Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showToast('Error', 'Permission to access location was denied', 'error');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation({
      lat: String(loc.coords.latitude),
      lng: String(loc.coords.longitude)
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handleCategoryPress = (category: ServiceCategory) => {
    setSelectedCategory(category);
    if (category.subcategories && category.subcategories.length > 0) {
      setIsSubTitleExpanded(false);
      setShowSubModal(true);
    } else {
      setSelectedSubCategory(null);
      setIsBookingTitleExpanded(false);
      setShowBookingModal(true);
    }
  };

  const handleSubCategoryPress = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setShowSubModal(false);
    setIsBookingTitleExpanded(false);
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!mobileNumber || !address || !customerName) {
      showToast('Error', 'Please fill in Name, Mobile, and Address', 'error');
      return;
    }

    if (!location) {
      showToast('Error', 'Location is required. Please wait or enable location services.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('mobile_number', mobileNumber);
      formData.append('customer_name', customerName);
      formData.append('category', String(selectedCategory?.id));
      if (selectedSubCategory) {
        formData.append('subcategory', String(selectedSubCategory.id));
      }
      formData.append('service_details', JSON.stringify({ description }));
      formData.append('address', address);
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);

      images.forEach((img, i) => {
        // @ts-ignore
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `image_${i}.jpg`,
          type: img.mimeType || 'image/jpeg',
        });
      });

      await makeRequest(formData);
      showToast('Success', 'Booking submitted successfully!', 'success');
      
      // Close and reset
      setShowBookingModal(false);
      setDescription('');
      setImages([]);
    } catch (error: any) {
      console.error('Booking failed:', error);
      let errorMessage = 'Failed to submit booking. Try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
           errorMessage = Object.entries(error.response.data)
             .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
             .join('\\n');
        } else {
           errorMessage = String(error.response.data);
        }
      }
      showToast('Booking Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategory = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageWrapper}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.cardOverlay} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.cardPrice}>Service charge starts ₹{item.service_charge || '0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1A4FD6" />
        </View>
      ) : (
        <FlatList
          data={categories.filter(c => c.is_active)}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={renderCategory}
          ListFooterComponent={<HomeFooter />}
        />
      )}

      <Modal visible={showSubModal} animationType="slide" transparent={true} onRequestClose={() => setShowSubModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => setIsSubTitleExpanded(!isSubTitleExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalTitle} numberOfLines={isSubTitleExpanded ? 0 : 1}>Select Service</Text>
                <Text style={styles.modalSubTitle} numberOfLines={isSubTitleExpanded ? 0 : 1}>{selectedCategory?.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtnCircle} onPress={() => setShowSubModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedCategory?.subcategories.filter(s => s.is_active)}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.subItem}
                  onPress={() => handleSubCategoryPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.subImageWrapper}>
                    {item.image ? (
                       <Image source={{ uri: item.image }} style={styles.subImage} />
                    ) : (
                        <View style={[styles.subImage, styles.placeholderImage]}>
                           <Text style={{color: '#1A4FD6', fontWeight: 'bold'}}>{item.name.charAt(0)}</Text>
                        </View>
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.subName}>{item.name}</Text>
                    {item.service_charge ? (
                      <Text style={styles.subPrice}>₹{item.service_charge}</Text>
                    ) : (
                      <Text style={styles.subPrice}>Contact for price</Text>
                    )}
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showBookingModal} animationType="slide" transparent={true} onRequestClose={() => setShowBookingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '92%', backgroundColor: '#F8FAFC' }]}>
             <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={{ flex: 1, marginRight: 10 }} 
                  onPress={() => setIsBookingTitleExpanded(!isBookingTitleExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalTitle} numberOfLines={isBookingTitleExpanded ? 0 : 1}>Book {selectedSubCategory?.name || selectedCategory?.name}</Text>
                  <Text style={styles.modalSubTitle} numberOfLines={isBookingTitleExpanded ? 0 : 1}>Instant Home Service Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtnCircle} onPress={() => setShowBookingModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
             </View>
             
             <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets={true}>
                <View style={styles.inputGroup}>
                   <View style={styles.inputIcon}>
                     <User size={18} color="#1A4FD6" />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={styles.label}>Full Name *</Text>
                     <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Enter your name" placeholderTextColor="#94A3B8" />
                   </View>
                </View>

                <View style={styles.inputGroup}>
                   <View style={styles.inputIcon}>
                     <Phone size={18} color="#1A4FD6" />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={styles.label}>Mobile Number *</Text>
                     <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} placeholderTextColor="#94A3B8" />
                   </View>
                </View>

                <View style={styles.inputGroup}>
                   <View style={styles.inputIcon}>
                     <MapPin size={18} color="#1A4FD6" />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={styles.label}>Service Address *</Text>
                     <TextInput style={[styles.input, { minHeight: 60 }]} value={address} onChangeText={setAddress} placeholder="Enter full service address" multiline placeholderTextColor="#94A3B8" />
                   </View>
                </View>

                <View style={styles.inputGroup}>
                   <View style={styles.inputIcon}>
                     <Info size={18} color="#1A4FD6" />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={styles.label}>Requirement Details</Text>
                     <TextInput 
                       style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                       value={description} 
                       onChangeText={setDescription} 
                       placeholder="Tell us what you need..." 
                       multiline 
                       placeholderTextColor="#94A3B8"
                     />
                   </View>
                </View>

                <TouchableOpacity style={styles.imageBtn} onPress={pickImage} activeOpacity={0.7}>
                  <ImageIcon size={20} color="#3B82F6" />
                  <Text style={styles.imageBtnText}>Add Photos ({images.length}/5)</Text>
                </TouchableOpacity>

                {images.length > 0 && (
                  <View style={styles.imgPreviewContainer}>
                     {images.map((img, i) => (
                        <View key={i} style={styles.previewImgWrapper}>
                           <Image source={{ uri: img.uri }} style={styles.previewImg} />
                           <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
                              <X size={12} color="#FFF" />
                           </TouchableOpacity>
                        </View>
                     ))}
                  </View>
                )}

                <View style={styles.locationBanner}>
                  <MapPin size={16} color={location ? '#10B981' : '#F59E0B'} />
                  <Text style={[styles.locText, { color: location ? '#10B981' : '#F59E0B', marginTop: 0 }]}>
                    {location ? 'Service location captured' : 'Fetching precise location...'}
                  </Text>
                </View>

                <TouchableOpacity 
                   style={[styles.submitBtn, (!location || isSubmitting) && {opacity: 0.7}]} 
                   onPress={submitBooking}
                   disabled={isSubmitting || !location}
                >
                   {isSubmitting ? (
                     <ActivityIndicator color="#FFF" />
                   ) : (
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <Send size={20} color="#FFF" />
                       <Text style={styles.submitBtnText}>Confirm Booking</Text>
                     </View>
                   )}
                </TouchableOpacity>
                <View style={{height: 60}} />
             </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 12 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 130, resizeMode: 'cover' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.02)' },
  placeholderImage: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 36, fontWeight: '800', color: '#CBD5E1' },
  cardContent: { padding: 12, alignItems: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  priceBadge: { marginTop: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cardPrice: { fontSize: 11, color: '#166534', fontWeight: '700' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  modalSubTitle: { fontSize: 14, color: '#64748B', fontWeight: '500', marginTop: 2 },
  closeBtnCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  
  subItem: { flexDirection: 'row', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  subImageWrapper: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#FFF', marginRight: 16, padding: 2, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  subImage: { width: '100%', height: '100%', borderRadius: 10 },
  subName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  subPrice: { fontSize: 14, color: '#1A4FD6', fontWeight: '600', marginTop: 2 },

  formContainer: { paddingVertical: 4 },
  inputGroup: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  inputIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  label: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  
  imageBtn: { flexDirection: 'row', marginTop: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  imageBtnText: { color: '#1A4FD6', fontWeight: '700', fontSize: 15 },
  imgPreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  previewImgWrapper: { position: 'relative' },
  previewImg: { width: 70, height: 70, borderRadius: 12, borderWidth: 2, borderColor: '#FFF' },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  
  locationBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  locText: { fontSize: 14, fontWeight: '600' },
  
  submitBtn: { backgroundColor: '#1A4FD6', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 24, shadowColor: '#1A4FD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },

  footerContainer: { marginTop: 24, paddingBottom: 20 },
  footerHeading: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginLeft: 16, marginBottom: 16 },
  adList: { paddingHorizontal: 16, gap: 16 },
  adCard: { width: 300, height: 160, borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10, marginRight: 16 },
  adContentBox: { flex: 1, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  adIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  adTextBox: { flex: 1 },
  adTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  adSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 },
  
  brandingSection: { alignItems: 'center', marginTop: 48, paddingHorizontal: 40 },
  brandingTitle: { fontSize: 28, fontWeight: '900', color: '#1A4FD6', letterSpacing: -1, opacity: 0.9 },
  brandingInfo: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }
});