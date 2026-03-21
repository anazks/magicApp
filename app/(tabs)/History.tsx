import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, Linking, Platform, Image } from 'react-native';
import { Search, Filter, Calendar, MapPin, ChevronRight, X, Clock, CheckCircle2, AlertCircle, Package, User, Phone, Trash2, ArrowUpDown, ClipboardList, Type, Activity, MessageSquare, XCircle, FileText } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceHistory, cancelServiceRequest } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { router, useFocusEffect } from 'expo-router';
import EditServiceRequest from '../../components/EditServiceRequest';
import ConfirmationModal from '../../components/ConfirmationModal';

const API_BASE_URL = 'https://magiclaptest.pythonanywhere.com';

// --- Helper Components ---
const DetailRow = ({ icon: Icon, label, value, color = "#64748B" }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconBox}>
      <Icon size={18} color={color} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  </View>
);

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
  media_files?: any[];
}

export default function History() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ServiceHistoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

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
        media_files: item.media_files,
      }));
      setHistory(transformed);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        fetchHistory();
      }
    }, [token])
  );

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];
    if (activeTab !== 'All') {
      result = result.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
    }
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [history, activeTab, sortOrder]);

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase().trim();
    if (s === "completed") return <CheckCircle2 size={14} color="#059669" />;
    if (s === "accepted") return <Clock size={14} color="#2563EB" />;
    if (s === "pending") return <AlertCircle size={14} color="#D97706" />;
    return <XCircle size={14} color="#DC2626" />;
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
      <SafeAreaView style={styles.container}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        
        <View style={styles.center}>
          <View style={styles.guestIconContainer}>
            <FileText size={48} color="#1A4FD6" />
          </View>
          <Text style={styles.guestTitle}>Track Your Requests</Text>
          <Text style={styles.guestSubtitle}>
            Login to view your service history, track active requests, 
            and manage your home maintenance effortlessly.
          </Text>
          
          <TouchableOpacity 
            style={styles.guestLoginBtn} 
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.guestLoginBtnText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = async (id: number) => {
    console.log('handleCancel triggered for id:', id);
    setCancelId(id);
    setShowConfirmModal(true);
  };

  const confirmCancel = async () => {
    console.log('confirmCancel triggered for cancelId:', cancelId);
    if (!cancelId) return;
    try {
      setLoading(true);
      setShowConfirmModal(false);
      await cancelServiceRequest(cancelId);
      showToast('Success', 'Request cancelled successfully', 'success');
      setSelectedItem(null);
      fetchHistory();
    } catch (error) {
      showToast('Error', 'Failed to cancel request', 'error');
    } finally {
      setLoading(false);
      setCancelId(null);
    }
  };

  const renderItem = ({ item }: { item: ServiceHistoryItem }) => {
    const colors = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setSelectedItem(item)} 
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <FileText size={20} color="#1A4FD6" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{item.category_name}</Text>
              <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                {getStatusIcon(item.status)}
                <Text style={[styles.badgeText, { color: colors.text }]}> {item.status}</Text>
              </View>
            </View>
            {item.subcategory_name && <Text style={styles.subtitle} numberOfLines={1}>{item.subcategory_name}</Text>}
            {item.status.toLowerCase() === 'pending' && (
              <View style={styles.editableBadge}>
                <FileText size={10} color="#16A34A" />
                <Text style={styles.editableBadgeText}>Editable or Cancelable</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Calendar size={14} color="#94A3B8" />
            <Text style={styles.footerText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.footerItem}>
             <MapPin size={14} color="#94A3B8" />
             <Text style={styles.footerText} numberOfLines={1}>{item.address.split(',')[0]}...</Text>
          </View>
          <ChevronRight size={16} color="#CBD5E1" />
        </View>

        {item.admin_notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesText} numberOfLines={1}>Note: {item.admin_notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.filterContainer}>
        <ScrollView 
          style={{ flex: 1, marginRight: 8 }}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScroll}
        >
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity 
          style={styles.sortBtn} 
          onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
        >
          <ArrowUpDown size={18} color="#1A4FD6" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
           <ActivityIndicator size="large" color="#1A4FD6" />
        </View>
      ) : filteredAndSortedHistory.length === 0 ? (
        <View style={styles.center}>
           <View style={styles.emptyIconContainer}>
             <Clock size={48} color="#CBD5E1" />
           </View>
           <Text style={styles.emptyText}>No {activeTab.toLowerCase() !== 'all' ? activeTab.toLowerCase() : ''} requests found</Text>
           <Text style={styles.emptySubText}>Your service requests will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal for Details and Editing */}
      <Modal 
        visible={!!selectedItem} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={() => {
          if (isEditing) {
            setIsEditing(false);
          } else {
            setSelectedItem(null);
          }
        }}
      >
        {selectedItem && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isEditing ? { height: '95%', maxHeight: '95%' } : { maxHeight: '90%' }]}>
              {isEditing ? (
                <EditServiceRequest 
                  item={selectedItem} 
                  onClose={() => setIsEditing(false)} 
                  onUpdate={() => {
                    fetchHistory();
                    setSelectedItem(null);
                    setIsEditing(false);
                  }} 
                />
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Request Details</Text>
                      <Text style={styles.modalSubtitle}>Reference #{selectedItem.request_id}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedItem(null);
                        setIsEditing(false);
                      }} 
                      style={styles.modalCloseBtn}
                    >
                      <X size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.detailSection}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={styles.sectionTitle}>Service Information</Text>
                        {selectedItem.status.toLowerCase() === 'pending' && (
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity 
                              style={styles.editButtonSmall} 
                              onPress={() => {
                                console.log('Edit button pressed. Current isEditing:', isEditing);
                                setIsEditing(true);
                              }}
                            >
                              <FileText size={14} color="#1A4FD6" />
                              <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.cancelButtonSmall} 
                              onPress={() => handleCancel(selectedItem.id)}
                            >
                              <XCircle size={14} color="#DC2626" />
                              <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <DetailRow icon={ClipboardList} label="Category" value={selectedItem.category_name} />
                      {selectedItem.subcategory_name && <DetailRow icon={Type} label="Subcategory" value={selectedItem.subcategory_name} />}
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                          <Activity size={18} color="#64748B" />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Current Status</Text>
                          <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedItem.status).bg }]}>
                            <Text style={[styles.statusBadgeTextLarge, { color: getStatusColor(selectedItem.status).text }]}>
                              {selectedItem.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {selectedItem.admin_notes && (
                      <View style={styles.notesCard}>
                        <View style={styles.notesHeader}>
                          <MessageSquare size={16} color="#1A4FD6" />
                          <Text style={styles.notesTitle}>Admin Notes</Text>
                        </View>
                        <Text style={styles.modalNotesText}>{selectedItem.admin_notes}</Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Customer & Location</Text>
                      <DetailRow icon={User} label="Customer Name" value={selectedItem.customer_name} />
                      <DetailRow icon={Phone} label="Contact Number" value={selectedItem.mobile_number} />
                      <DetailRow icon={MapPin} label="Service Address" value={selectedItem.address} />
                    </View>

                    {selectedItem.description && (
                      <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Problem Description</Text>
                        <View style={styles.descriptionBox}>
                          <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                        </View>
                      </View>
                    )}

                    {selectedItem.media_files && selectedItem.media_files.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Uploads</Text>
                      <View style={styles.mediaGrid}>
                        {selectedItem.media_files.map((media: any) => {
                          const fileUrl = media.file.startsWith('http') 
                            ? media.file 
                            : `${API_BASE_URL}${media.file.startsWith('/') ? '' : '/'}${media.file}`;
                          return (
                            <View key={media.id} style={styles.mediaItemSmall}>
                              {media.file_type === 'image' ? (
                                <Image 
                                  source={{ uri: fileUrl }} 
                                  style={styles.mediaThumb} 
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.audioPlaceholder}>
                                  <Activity size={18} color="#2563EB" />
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {(selectedItem.latitude && selectedItem.longitude) ? (
                    <TouchableOpacity 
                      style={styles.premiumMapBtn} 
                      onPress={() => openMap(selectedItem.latitude, selectedItem.longitude)}
                      activeOpacity={0.8}
                    >
                      <MapPin size={18} color="#FFF" />
                      <Text style={styles.premiumMapBtnText}>Open in Google Maps</Text>
                    </TouchableOpacity>
                  ) : null}
                    <View style={{ height: 20 }} />
                  </ScrollView>
                </>
              )}
            </View>

            <ConfirmationModal
              visible={showConfirmModal}
              title="Cancel Request"
              message="Are you sure you want to cancel this service request? This action cannot be undone."
              confirmLabel="Yes, Cancel"
              cancelLabel="No, Keep It"
              onConfirm={confirmCancel}
              onCancel={() => setShowConfirmModal(false)}
              type="danger"
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F8FAFC',
    opacity: 0.5,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1 },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
    marginBottom: 40,
    fontWeight: '500',
  },
  guestLoginBtn: {
    backgroundColor: '#1A4FD6',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#1A4FD6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  guestLoginBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#475569', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  loginBtn: { backgroundColor: '#1A4FD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  filterContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFF' },
  tabScroll: { paddingLeft: 16, paddingRight: 16, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', minWidth: 80, alignItems: 'center' },
  activeTab: { backgroundColor: '#1A4FD6' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFF' },
  sortBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: '#EFF6FF', borderRadius: 12 },

  list: { padding: 16, paddingBottom: 100 },
  
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  notesBox: { marginTop: 12, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#1A4FD6' },
  notesText: { fontSize: 12, color: '#475569', fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, width: '100%', maxHeight: '90%', overflow: 'hidden', paddingBottom: 40 },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  detailsScroll: { padding: 24 },
  
  detailSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#1A4FD6', paddingLeft: 10 },
  
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  detailIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#334155', fontWeight: '700', lineHeight: 22 },
  
  statusBadgeLarge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  statusBadgeTextLarge: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  notesCard: { backgroundColor: '#F0F9FF', borderRadius: 20, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#BAE6FD' },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  notesTitle: { fontSize: 14, fontWeight: '800', color: '#1A4FD6' },
  modalNotesText: { fontSize: 14, color: '#0C4A6E', lineHeight: 20, fontWeight: '500' },

  descriptionBox: { backgroundColor: '#F8FAFC', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22 },

  premiumMapBtn: { flexDirection: 'row', backgroundColor: '#1A4FD6', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, gap: 10, shadowColor: '#1A4FD6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  premiumMapBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  editButtonSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  editButtonText: { fontSize: 12, fontWeight: '700', color: '#1A4FD6' },
  cancelButtonSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4, marginLeft: 8 },
  cancelButtonText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  editableBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#DCFCE7', flexDirection: 'row', alignItems: 'center', gap: 4 },
  editableBadgeText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  mediaItemSmall: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  mediaThumb: { width: '100%', height: '100%' },
  audioPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E7FF' },
});