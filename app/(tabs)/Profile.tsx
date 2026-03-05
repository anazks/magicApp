import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { profileDetails, updateProfile } from '../../api/auth';
import { router } from 'expo-router';

export default function Profile() {
  const { token, logout } = useAuth();
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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile(formData);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Failed to update profile.');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.nameText}>{fullName}</Text>
            {profile.phone_number && <Text style={styles.phoneText}>{profile.phone_number}</Text>}
          </View>
        </View>

        {/* Actions Container */}
        <View style={styles.actionsBox}>
          {!isEditing ? (
             <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
               <Text style={styles.editBtnText}>Edit Profile</Text>
             </TouchableOpacity>
          ) : (
             <View style={styles.editActions}>
                <TouchableOpacity style={[styles.editBtn, styles.cancelBtn]} onPress={() => { setIsEditing(false); setFormData(profile); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
             </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.label}>First Name *</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.first_name} onChangeText={(v) => handleChange('first_name', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.first_name || '—'}</Text>
          )}

          <Text style={styles.label}>Last Name *</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.last_name} onChangeText={(v) => handleChange('last_name', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.last_name || '—'}</Text>
          )}

          <Text style={styles.label}>Phone Number *</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.phone_number} keyboardType="phone-pad" onChangeText={(v) => handleChange('phone_number', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.phone_number || 'Not set'}</Text>
          )}

          <Text style={styles.label}>Date of Birth</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.date_of_birth} placeholder="YYYY-MM-DD" onChangeText={(v) => handleChange('date_of_birth', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.date_of_birth || 'Not set'}</Text>
          )}

          <Text style={styles.label}>Full Address *</Text>
          {isEditing ? (
             <TextInput style={[styles.input, {height: 80}]} multiline value={formData.address} onChangeText={(v) => handleChange('address', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.address || 'Not set'}</Text>
          )}

          <Text style={styles.label}>District</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.district} onChangeText={(v) => handleChange('district', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.district || '—'}</Text>
          )}

          <Text style={styles.label}>State</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={formData.state} onChangeText={(v) => handleChange('state', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.state || '—'}</Text>
          )}

          <Text style={styles.label}>Pin Code</Text>
          {isEditing ? (
             <TextInput style={styles.input} value={String(formData.pin_code || '')} keyboardType="number-pad" onChangeText={(v) => handleChange('pin_code', v)} />
          ) : (
             <Text style={styles.valueText}>{profile.pin_code || '—'}</Text>
          )}

        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  guestText: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },
  loginBtn: { backgroundColor: '#1A4FD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 16 },
  
  headerCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2, marginBottom: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#64748B' },
  headerInfo: { flex: 1 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  phoneText: { fontSize: 15, color: '#64748B' },

  actionsBox: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#FFF', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05 },
  editActions: { flexDirection: 'row', gap: 10, flex: 1, marginRight: 10 },
  editBtn: { backgroundColor: '#EFF6FF', flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  editBtnText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  cancelBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
  saveBtn: { backgroundColor: '#10B981' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  logoutBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },

  formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6, marginTop: 16 },
  valueText: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC' },
});
