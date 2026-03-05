import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceHistory } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

interface ServiceHistoryItem {
  id: number;
  request_id: string;
  category_name: string;
  subcategory_name: string | null;
  date: string;
  status: string;
  description?: string;
  address: string;
  latitude: string;
  longitude: string;
  mobile_number: string;
  customer_name: string;
  category_icon?: string | null;
  admin_notes?: string;
}

export default function History() {
  const { token } = useAuth();
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ServiceHistoryItem | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await serviceHistory();
      const transformed = data.map((item: any) => ({
        id: item.id,
        request_id: item.request_id,
        category_name: item.category_name,
        subcategory_name: item.subcategory_name,
        date: item.created_at,
        status: item.status,
        description: item.service_details?.description,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        mobile_number: item.mobile_number,
        customer_name: item.customer_name,
        category_icon: item.category_icon,
        admin_notes: item.admin_notes,
      }));
      setHistory(transformed);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase().trim();
    if (s === "completed") return { bg: '#D1FAE5', text: '#065F46' };
    if (s === "accepted") return { bg: '#DBEAFE', text: '#1E40AF' };
    if (s === "pending") return { bg: '#FEF3C7', text: '#92400E' };
    if (s === "cancelled" || s === "rejected") return { bg: '#FEE2E2', text: '#991B1B' };
    return { bg: '#F3F4F6', text: '#1F2937' };
  };

  const openMap = (lat: string, lng: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestText}>Please login to view your service history.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ServiceHistoryItem }) => {
    const colors = getStatusColor(item.status);
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.title}>{item.category_name}</Text>
            {item.subcategory_name && <Text style={styles.subtitle}>{item.subcategory_name}</Text>}
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>

        {item.admin_notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Admin Note:</Text>
            <Text style={styles.notesText} numberOfLines={2}>{item.admin_notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
           <ActivityIndicator size="large" color="#1A4FD6" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
           <Text style={styles.emptyText}>No service requests yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Details Modal */}
      <Modal visible={!!selectedItem} animationType="fade" transparent={true}>
        {selectedItem && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Request #{selectedItem.request_id}</Text>
                 <TouchableOpacity onPress={() => setSelectedItem(null)}>
                   <Text style={styles.closeBtn}>Close</Text>
                 </TouchableOpacity>
               </View>

               <ScrollView style={styles.detailsScroll}>
                 <Text style={styles.detailLabel}>Service</Text>
                 <Text style={styles.detailValue}>{selectedItem.category_name} {selectedItem.subcategory_name ? `- ${selectedItem.subcategory_name}` : ''}</Text>

                 <Text style={styles.detailLabel}>Status</Text>
                 <Text style={[styles.detailValue, {color: getStatusColor(selectedItem.status).text, fontWeight: 'bold'}]}>{selectedItem.status.toUpperCase()}</Text>

                 {selectedItem.admin_notes && (
                    <View style={styles.adminNotesArea}>
                      <Text style={styles.detailLabel}>Admin Notes</Text>
                      <Text style={styles.detailValue}>{selectedItem.admin_notes}</Text>
                    </View>
                 )}

                 <Text style={styles.detailLabel}>Customer</Text>
                 <Text style={styles.detailValue}>{selectedItem.customer_name}</Text>
                 <Text style={styles.detailValue}>{selectedItem.mobile_number}</Text>

                 <Text style={styles.detailLabel}>Address</Text>
                 <Text style={styles.detailValue}>{selectedItem.address}</Text>

                 {selectedItem.description && (
                   <>
                     <Text style={styles.detailLabel}>Description</Text>
                     <Text style={styles.detailValue}>{selectedItem.description}</Text>
                   </>
                 )}

                 {(selectedItem.latitude && selectedItem.longitude) ? (
                   <TouchableOpacity style={styles.mapBtn} onPress={() => openMap(selectedItem.latitude, selectedItem.longitude)}>
                      <Text style={styles.mapBtnText}>Open in Google Maps</Text>
                   </TouchableOpacity>
                 ) : null}
               </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  guestText: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#64748B' },
  loginBtn: { backgroundColor: '#1A4FD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  list: { padding: 16 },
  
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  dateText: { fontSize: 13, color: '#94A3B8', marginBottom: 6 },
  addressText: { fontSize: 14, color: '#475569' },
  notesBox: { marginTop: 12, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7' },
  notesTitle: { fontSize: 12, fontWeight: '700', color: '#D97706', marginBottom: 2 },
  notesText: { fontSize: 13, color: '#92400E' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, width: '100%', maxHeight: '80%', overflow: 'hidden' },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  closeBtn: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
  detailsScroll: { padding: 16 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 12, marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#1E293B' },
  adminNotesArea: { backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, marginTop: 12 },
  
  mapBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  mapBtnText: { color: '#3B82F6', fontWeight: '700', fontSize: 15 }
});