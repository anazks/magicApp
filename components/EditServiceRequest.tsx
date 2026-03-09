import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Camera, X, Trash2, Save, MapPin, Phone, User, Plus, CloudUpload, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateServiceRequest, deleteServiceMedia } from '../api/services';
import Constants from 'expo-constants';
import { useToast } from '../context/ToastContext';
import { serviceHistory } from '../api/services';

// For development, use the base URL from Axios config if needed, 
// but usually file paths from API are relative to the server
const API_BASE_URL = 'https://magiclaptest.pythonanywhere.com';

const getFullUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

interface MediaItem {
  id: number;
  file: string;
  file_type: 'image' | 'audio';
}

interface EditServiceRequestProps {
  item: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditServiceRequest({ item, onClose, onUpdate }: EditServiceRequestProps) {
  const { showToast } = useToast();
  // Add a small log to verify rendering
  console.log('Rendering EditServiceRequest for item:', item?.request_id, 'Media count:', item?.media_files?.length);
  const [formData, setFormData] = useState({
    customer_name: item.customer_name || '',
    mobile_number: item.mobile_number || '',
    address: item.address || '',
    description: item.description || '',
    latitude: item.latitude || '',
    longitude: item.longitude || '',
  });

  const [existingMedia, setExistingMedia] = useState<MediaItem[]>(item.media_files || []);
  console.log('Existing Media State:', existingMedia.length);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Permission Denied', 'Sorry, we need camera roll permissions to make this work!', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImages(prev => [...prev, ...result.assets]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingMedia = async (mediaId: number) => {
    Alert.alert(
      'Remove Attachment',
      'Are you sure you want to remove this attachment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeletingMediaId(mediaId);
            try {
              await deleteServiceMedia(mediaId);
              setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
              showToast('Success', 'Attachment removed successfully', 'success');
            } catch (err) {
              showToast('Error', 'Failed to remove attachment', 'error');
            } finally {
              setDeletingMediaId(null);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.mobile_number || !formData.address) {
      showToast('Validation Error', 'Please fill in all required fields', 'error');
      return;
    }

    console.log('Submitting edit request with images:', newImages.length);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('customer_name', formData.customer_name);
      data.append('mobile_number', formData.mobile_number);
      data.append('address', formData.address);
      data.append('service_details', JSON.stringify({ description: formData.description }));
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);

      newImages.forEach((image, index) => {
        const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
        data.append('images', {
          uri,
          name: `upload_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      await updateServiceRequest(item.id, data);
      showToast('Success', 'Changes saved successfully', 'success');
      onUpdate();
      onClose();
    } catch (err) {
      showToast('Error', 'Failed to save changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Edit Request</Text>
          <Text style={styles.subtitle}>ORDER #{item.request_id}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.customer_name}
                onChangeText={(text) => handleChange('customer_name', text)}
                placeholder="Enter customer name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.mobile_number}
                onChangeText={(text) => handleChange('mobile_number', text)}
                placeholder="Enter mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requirement Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder="Describe your service requirements..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deployment Address</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Service address details"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        <View style={styles.mediaSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Uploads</Text>
            {existingMedia.length > 0 && <Text style={styles.badge}>{existingMedia.length} SAVED</Text>}
          </View>
          
          {existingMedia.length > 0 ? (
            <View style={styles.mediaGrid}>
              {existingMedia.map((media) => {
                const imageUrl = getFullUrl(media.file);
                console.log('Rendering media item:', media.id, 'URL:', imageUrl);
                return (
                  <View key={media.id} style={styles.mediaItem}>
                    {media.file_type === 'image' ? (
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.mediaThumb} 
                        resizeMode="cover"
                        onError={(e) => {
                          console.log('❌ Image failed to load:', imageUrl, e.nativeEvent.error);
                        }}
                        onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
                      />
                    ) : (
                      <View style={styles.audioPlaceholder}>
                        <CloudUpload size={24} color="#2563EB" />
                      </View>
                    )}
                    {/* Fallback overlay if image is blank or null */}
                    {!media.file && (
                      <View style={[StyleSheet.absoluteFill, styles.audioPlaceholder]}>
                        <ImageIcon size={20} color="#94A3B8" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteExistingMedia(media.id)}
                      disabled={deletingMediaId === media.id}
                    >
                      {deletingMediaId === media.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Trash2 size={14} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyMediaBox}>
              <ImageIcon size={20} color="#94A3B8" />
              <Text style={styles.emptyMediaText}>No existing attachments</Text>
            </View>
          )}
        </View>

        <View style={styles.mediaSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add New Files</Text>
            <Text style={styles.subLabel}>Max 5MB per file</Text>
          </View>
          <View style={styles.mediaGrid}>
            {newImages.map((image, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: image.uri }} style={styles.mediaThumb} />
                <TouchableOpacity style={styles.removeNewBtn} onPress={() => removeNewImage(index)}>
                  <X size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={[styles.addBtn, { marginBottom: 12 }]} onPress={handlePickImage}>
              <Plus size={24} color="#94A3B8" />
              <Text style={styles.addBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', minHeight: 600 },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginTop: 2, letterSpacing: 0.5 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 24 },
  formSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#1A4FD6', paddingLeft: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, padding: 12, color: '#0F172A', fontSize: 15, fontWeight: '600', minHeight: 48 },
  textArea: { minHeight: 100, textAlignVertical: 'top', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 12 },
  mediaSection: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { fontSize: 10, backgroundColor: '#F1F5F9', color: '#64748B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontWeight: '800' },
  subLabel: { fontSize: 10, color: '#94A3B8', fontStyle: 'italic' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  mediaItem: { width: 75, height: 75, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 12, marginBottom: 12 },
  mediaThumb: { width: '100%', height: '100%' },
  audioPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E7FF' },
  deleteBtn: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(220, 38, 38, 0.8)', justifyContent: 'center', alignItems: 'center' },
  removeNewBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 75, height: 75, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC', flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', alignItems: 'center' },
  cancelBtnText: { color: '#64748B', fontWeight: '800', fontSize: 15 },
  saveBtn: { flex: 2, backgroundColor: '#1A4FD6', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  emptyMediaBox: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyMediaText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
