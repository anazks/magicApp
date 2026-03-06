import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { User, Phone, Calendar, MapPin, Mail, LogOut, Edit3, Save, X, ChevronRight, Globe, Building } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { profileDetails, updateProfile } from '../../api/auth';
import { router } from 'expo-router';
import { useToast } from '../../context/ToastContext';

export default function Profile() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileDetails();
      setProfile(data);
      setFormData(data);
    } catch (error) {
       console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number || !formData.address) {
      showToast('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile(formData);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      showToast('Success', 'Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update failed:', error);
      showToast('Error', 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestText}>Please login to view your profile.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
         <ActivityIndicator size="large" color="#1A4FD6" />
      </View>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';

  const InfoRow = ({ icon: Icon, label, value, isEditing, onChange, keyName, placeholder, keyboardType, multiline }: any) => (
    <View style={styles.infoRowContainer}>
      <View style={styles.infoIconWrapper}>
        <Icon size={20} color="#64748B" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.infoInput, multiline && { height: 80, textAlignVertical: 'top' }]}
            value={value || ''}
            onChangeText={(v) => onChange(keyName, v)}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType={keyboardType || 'default'}
            multiline={multiline}
          />
        ) : (
          <Text style={styles.infoValue}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Edit3 size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{fullName}</Text>
          <View style={styles.phoneBadge}>
            <Phone size={14} color="#1A4FD6" />
            <Text style={styles.phoneBadgeText}>{profile.phone_number || 'No phone set'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {!isEditing ? (
            <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setIsEditing(true)}>
              <Edit3 size={18} color="#FFF" />
              <Text style={styles.primaryActionText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => { setIsEditing(false); setFormData(profile); }}>
                <X size={18} color="#64748B" />
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#FFF" /> : <><Save size={18} color="#FFF" /><Text style={styles.primaryActionText}>Save</Text></>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* info Cards */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Personal Information</Text>
          <InfoRow icon={User} label="First Name" value={isEditing ? formData.first_name : profile.first_name} isEditing={isEditing} onChange={handleChange} keyName="first_name" placeholder="Enter first name" />
          <InfoRow icon={User} label="Last Name" value={isEditing ? formData.last_name : profile.last_name} isEditing={isEditing} onChange={handleChange} keyName="last_name" placeholder="Enter last name" />
          <InfoRow icon={Calendar} label="Date of Birth" value={isEditing ? formData.date_of_birth : profile.date_of_birth} isEditing={isEditing} onChange={handleChange} keyName="date_of_birth" placeholder="YYYY-MM-DD" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Address & Contact</Text>
          <InfoRow icon={Phone} label="Phone Number" value={isEditing ? formData.phone_number : profile.phone_number} isEditing={isEditing} onChange={handleChange} keyName="phone_number" placeholder="Enter phone number" keyboardType="phone-pad" />
          <InfoRow icon={MapPin} label="Full Address" value={isEditing ? formData.address : profile.address} isEditing={isEditing} onChange={handleChange} keyName="address" placeholder="Enter full address" multiline />
          <InfoRow icon={Building} label="District" value={isEditing ? formData.district : profile.district} isEditing={isEditing} onChange={handleChange} keyName="district" placeholder="Enter district" />
          <InfoRow icon={Globe} label="State" value={isEditing ? formData.state : profile.state} isEditing={isEditing} onChange={handleChange} keyName="state" placeholder="Enter state" />
          <InfoRow icon={MapPin} label="Pin Code" value={isEditing ? String(formData.pin_code || '') : profile.pin_code} isEditing={isEditing} onChange={handleChange} keyName="pin_code" placeholder="Enter pin code" keyboardType="number-pad" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Logout from Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  guestText: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },
  loginBtn: { backgroundColor: '#1A4FD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 20 },
  
  headerSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, borderWidth: 4, borderColor: '#FFF' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#1A4FD6' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1A4FD6', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  
  nameText: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  phoneBadgeText: { fontSize: 14, color: '#1A4FD6', fontWeight: '600', marginLeft: 6 },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  primaryActionBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#1A4FD6', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#1A4FD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryActionText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  secondaryActionBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryActionText: { color: '#64748B', fontWeight: '700', fontSize: 16 },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { fontSize: 14, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  
  infoRowContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
  infoLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  infoInput: { fontSize: 16, color: '#1E293B', fontWeight: '600', padding: 0 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, marginTop: 10, marginBottom: 30 },
  logoutBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
