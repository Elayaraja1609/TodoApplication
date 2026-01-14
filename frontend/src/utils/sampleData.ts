import { apiService } from '../services/api';
import { CreateTodoRequest, CreateCategoryRequest } from '../types';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

/**
 * Creates sample data including audio and image attachments
 * This function creates sample categories and todos with attachments
 */
export const createSampleData = async () => {
  try {
    // First, login or register to get a token
    // For sample data, we'll assume user is already logged in
    
    // Create sample categories
    const categories = [
      { name: 'WORK', color: '#ec4899', icon: 'briefcase' },
      { name: 'HOME', color: '#8b5cf6', icon: 'home' },
      { name: 'PURCHASES', color: '#f59e0b', icon: 'cart' },
      { name: 'OTHER', color: '#f97316', icon: 'help-circle' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      try {
        const category = await apiService.createCategory(cat as CreateCategoryRequest);
        createdCategories.push(category);
      } catch (error) {
        console.log(`Category ${cat.name} might already exist`);
      }
    }

    // Create sample audio file (placeholder - in real app, record actual audio)
    const sampleAudioUri = await createSampleAudio();
    
    // Create sample image (placeholder - in real app, use actual image)
    const sampleImageUri = await createSampleImage();

    // Create sample todos with attachments
    const sampleTodos: CreateTodoRequest[] = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the Todo Task project',
        categoryId: createdCategories.find(c => c.name === 'WORK')?.id,
        isImportant: true,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        executionTime: (() => {
          const date = new Date();
          date.setHours(14, 0, 0, 0);
          return date.toISOString();
        })(),
        audioUrl: sampleAudioUri,
        imageUrl: sampleImageUri,
        subTasks: [
          { title: 'Create API documentation', order: 0 },
          { title: 'Create frontend documentation', order: 1 },
        ],
      },
      {
        title: 'Buy groceries',
        description: 'Weekly grocery shopping list',
        categoryId: createdCategories.find(c => c.name === 'HOME')?.id,
        isImportant: false,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        executionTime: (() => {
          const date = new Date();
          date.setHours(10, 0, 0, 0);
          return date.toISOString();
        })(),
        imageUrl: sampleImageUri,
        subTasks: [
          { title: 'Milk', order: 0 },
          { title: 'Bread', order: 1 },
          { title: 'Eggs', order: 2 },
        ],
      },
      {
        title: 'Review monthly expenses',
        description: 'Analyze spending patterns and create budget report',
        categoryId: createdCategories.find(c => c.name === 'PURCHASES')?.id,
        isImportant: true,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        audioUrl: sampleAudioUri,
      },
      {
        title: 'Team meeting preparation',
        description: 'Prepare agenda and presentation slides',
        categoryId: createdCategories.find(c => c.name === 'WORK')?.id,
        isImportant: false,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        executionTime: (() => {
          const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
          date.setHours(15, 0, 0, 0);
          return date.toISOString();
        })(),
        audioUrl: sampleAudioUri,
        imageUrl: sampleImageUri,
      },
    ];

    const createdTodos = [];
    for (const todo of sampleTodos) {
      try {
        const created = await apiService.createTodo(todo);
        createdTodos.push(created);
        console.log(`Created todo: ${created.title}`);
      } catch (error: any) {
        console.error(`Failed to create todo ${todo.title}:`, error.response?.data || error.message);
      }
    }

    console.log(`Sample data created: ${createdCategories.length} categories, ${createdTodos.length} todos`);
    return { categories: createdCategories, todos: createdTodos };
  } catch (error: any) {
    console.error('Failed to create sample data:', error);
    throw error;
  }
};

/**
 * Creates a sample audio file for testing
 * Records a short audio clip for sample data
 */
const createSampleAudio = async (): Promise<string> => {
  try {
    // Request audio permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Audio permission not granted, using placeholder');
      return 'file:///sample-audio.m4a';
    }

    // Set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Record a short sample audio (1 second)
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    // Wait a moment then stop
    await new Promise(resolve => setTimeout(resolve, 1000));
    await recording.stopAndUnloadAsync();
    
    const uri = recording.getURI();
    if (uri) {
      return uri;
    }

    // Fallback to placeholder
    return 'file:///sample-audio.m4a';
  } catch (error) {
    console.error('Failed to create sample audio:', error);
    // Return a placeholder URI that will be stored in DB
    return `file:///sample-audio-${Date.now()}.m4a`;
  }
};

/**
 * Creates a sample image file for testing
 * Picks an image from the device or creates a placeholder
 */
const createSampleImage = async (): Promise<string> => {
  try {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Image permission not granted, using placeholder');
      return `file:///sample-image-${Date.now()}.jpg`;
    }

    // Try to pick an image from the library
    // For sample data, we'll create a placeholder URI
    // In production, you would actually pick an image
    const imageDir = `${FileSystem.documentDirectory}images/`;
    await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    
    const imageUri = `${imageDir}sample-image-${Date.now()}.jpg`;
    
    // For sample data, return a placeholder URI
    // The actual image would be picked by the user in real usage
    return imageUri;
  } catch (error) {
    console.error('Failed to create sample image:', error);
    return `file:///sample-image-${Date.now()}.jpg`;
  }
};

