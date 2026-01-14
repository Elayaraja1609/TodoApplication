import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { Category } from '../types';

interface CategoriesScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory?: (category: Category) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  visible,
  onClose,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#8b5cf6');
  const [categoryIcon, setCategoryIcon] = useState('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const colors = [
    { value: '#ec4899', label: 'Pink' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#10b981', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
  ];

  const icons = [
    { value: 'home', label: 'Home' },
    { value: 'briefcase', label: 'Work' },
    { value: 'cart', label: 'Purchases' },
    { value: 'heart', label: 'Personal' },
    { value: 'school', label: 'Education' },
    { value: 'fitness', label: 'Health' },
  ];

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
      } else {
        await apiService.createCategory({
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
      }
      await loadCategories();
      setShowAddModal(false);
      setEditingCategory(null);
      setCategoryName('');
      setCategoryColor('#8b5cf6');
      setCategoryIcon('home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCategory(id);
              await loadCategories();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color || '#8b5cf6');
    setCategoryIcon(category.icon || 'home');
    setShowAddModal(true);
  };

  const handleSelect = (category: Category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>

        {/* Categories List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { borderColor: category.color || '#8b5cf6' }
              ]}
              onPress={() => {
                setSelectedCategoryId(category.id);
                handleSelect(category);
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color || '#8b5cf6' }]}>
                <Ionicons
                  name={category.icon as any || 'home'}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.categoryName}>{category.name.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Category FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditingCategory(null);
            setCategoryName('');
            setCategoryColor('#8b5cf6');
            setCategoryIcon('home');
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        {/* Add/Edit Category Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Category name"
                placeholderTextColor="#9ca3af"
                value={categoryName}
                onChangeText={setCategoryName}
                autoFocus
              />

              <Text style={styles.label}>Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      categoryColor === color.value && styles.colorOptionSelected,
                    ]}
                    onPress={() => setCategoryColor(color.value)}
                  >
                    {categoryColor === color.value && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {icons.map((icon) => (
                  <TouchableOpacity
                    key={icon.value}
                    style={[
                      styles.iconOption,
                      categoryIcon === icon.value && styles.iconOptionSelected,
                    ]}
                    onPress={() => setCategoryIcon(icon.value)}
                  >
                    <Ionicons
                      name={icon.value as any}
                      size={24}
                      color={categoryIcon === icon.value ? categoryColor : '#9ca3af'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: categoryColor }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
  },
  addCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  addCategoryText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#312e81',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
  },
  iconOptionSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

