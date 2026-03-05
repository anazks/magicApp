import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listServices, makeRequest } from '../../api/services';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

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

  useEffect(() => {
    fetchCategories();
    requestLocationPermission();
  }, []);

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
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
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
      setShowSubModal(true);
    } else {
      setSelectedSubCategory(null);
      setShowBookingModal(true);
    }
  };

  const handleSubCategoryPress = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setShowSubModal(false);
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!mobileNumber || !address || !customerName) {
      Alert.alert('Error', 'Please fill in Name, Mobile, and Address');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required. Please wait or enable location services.');
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
      Alert.alert('Success', 'Booking submitted successfully!');
      
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
      Alert.alert('Booking Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategory = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.service_charge && (
          <Text style={styles.cardPrice}>Service charge ₹{item.service_charge}</Text>
        )}
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
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}

      {/* Subcategory Modal */}
      <Modal visible={showSubModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service</Text>
              <TouchableOpacity onPress={() => setShowSubModal(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedCategory?.subcategories.filter(s => s.is_active)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.subItem}
                  onPress={() => handleSubCategoryPress(item)}
                >
                  {item.image ? (
                     <Image source={{ uri: item.image }} style={styles.subImage} />
                  ) : (
                      <View style={[styles.subImage, styles.placeholderImage, {width: 40, height: 40}]}>
                         <Text style={{color: '#1A4FD6'}}>{item.name.charAt(0)}</Text>
                      </View>
                  )}
                  <View style={{flex: 1}}>
                    <Text style={styles.subName}>{item.name}</Text>
                    {item.service_charge && <Text style={styles.subPrice}>Service charge ₹{item.service_charge}</Text>}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" transparent={true} onRequestClose={() => setShowBookingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '90%' }]}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book {selectedCategory?.name}</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Text style={styles.closeBtn}>Cancel</Text>
                </TouchableOpacity>
             </View>
             
             <ScrollView style={styles.formContainer} automaticallyAdjustKeyboardInsets={true}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Your name" />

                <Text style={styles.label}>Mobile *</Text>
                <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />

                <Text style={styles.label}>Address *</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Full address" multiline />

                <Text style={styles.label}>Service Details</Text>
                <TextInput 
                  style={[styles.input, { height: 80 }]} 
                  value={description} 
                  onChangeText={setDescription} 
                  placeholder="Describe your requirement..." 
                  multiline 
                />

                <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                  <Text style={styles.imageBtnText}>Add Images ({images.length})</Text>
                </TouchableOpacity>

                <View style={styles.imgPreviewContainer}>
                   {images.map((img, i) => (
                      <Image key={i} source={{ uri: img.uri }} style={styles.previewImg} />
                   ))}
                </View>

                {location ? (
                  <Text style={styles.locText}>✓ Location captured automatically</Text>
                ) : (
                  <Text style={[styles.locText, {color: 'red'}]}>Getting location...</Text>
                )}

                <TouchableOpacity 
                   style={[styles.submitBtn, isSubmitting && {opacity: 0.7}]} 
                   onPress={submitBooking}
                   disabled={isSubmitting}
                >
                   {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Confirm Booking</Text>}
                </TouchableOpacity>
                <View style={{height: 40}} />
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
  listContainer: { padding: 8, paddingBottom: 180 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  placeholderImage: { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 32, fontWeight: 'bold', color: '#64748B' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  cardPrice: { fontSize: 13, color: '#10B981', marginTop: 4, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  closeBtn: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
  
  subItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  subImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  subName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  subPrice: { fontSize: 13, color: '#10B981', marginTop: 2 },

  formContainer: { paddingVertical: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 12, fontSize: 15, color: '#1E293B' },
  
  imageBtn: { marginTop: 16, backgroundColor: '#EFF6FF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  imageBtnText: { color: '#3B82F6', fontWeight: '600' },
  imgPreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  previewImg: { width: 60, height: 60, borderRadius: 8 },
  
  locText: { marginTop: 20, fontSize: 13, color: '#10B981', textAlign: 'center' },
  
  submitBtn: { backgroundColor: '#1A4FD6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, elevation: 2 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});