import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  categories: Category[];
  selectedCategoryId?: number | null;
  onManageCategories?: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSelect,
  categories,
  selectedCategoryId,
  onManageCategories,
}) => {
  const handleSelect = (category: Category) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select Category</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Categories List */}
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {categories.length > 0 ? (
                categories.map((category) => {
                  const isSelected = selectedCategoryId === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.categoryItemSelected
                      ]}
                      onPress={() => handleSelect(category)}
                    >
                      <View style={styles.categoryItemContent}>
                        <View style={[styles.categoryIconContainer, { backgroundColor: category.color || '#8b5cf6' }]}>
                          <Ionicons
                            name={category.icon as any || 'home'}
                            size={20}
                            color="#fff"
                          />
                        </View>
                        <Text style={styles.categoryItemText}>{category.name}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No categories found</Text>
                  <Text style={styles.emptySubtext}>Create your first category to get started</Text>
                </View>
              )}

              {/* Manage Categories Button */}
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  onClose();
                  onManageCategories?.();
                }}
              >
                <Ionicons name="settings" size={20} color="#9ca3af" />
                <Text style={styles.manageButtonText}>
                  {categories.length > 0 ? 'Manage categories' : 'Create categories'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  categoryItemSelected: {
    backgroundColor: '#312e81',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#312e81',
    gap: 12,
  },
  manageButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
});

