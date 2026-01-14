import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { apiService } from '../services/api';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storage';
import { Todo, Category, Reminder } from '../types';
import { RecurrenceModal } from '../components/RecurrenceModal';
import { CategoryModal } from '../components/CategoryModal';
import { CategoriesScreen } from './CategoriesScreen';
import { CalendarPicker } from '../components/CalendarPicker';
import { TimePicker } from '../components/TimePicker';
import { ReminderPicker } from '../components/ReminderPicker';

interface TaskDetailScreenProps {
  todoId?: number;
  onClose: () => void;
  onSave: () => void;
  isCompleted?: boolean; // Indicates if the task is completed (read-only mode)
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  todoId,
  onClose,
  onSave,
  isCompleted: propIsCompleted,
}) => {
  const [isCompleted, setIsCompleted] = useState(propIsCompleted || false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('Home');
  const [subTasks, setSubTasks] = useState<Array<{ id?: number; title: string; isCompleted: boolean; order: number }>>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<string | null>(null);
  const [nextOccurrence, setNextOccurrence] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [executionTime, setExecutionTime] = useState<Date | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Audio and Image states (arrays to support multiple files)
  const [audioUris, setAudioUris] = useState<string[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const webAudio = useRef<HTMLAudioElement | null>(null); // For web platform
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCategories();
    if (todoId) {
      loadTodo();
    } else {
      // For new tasks, apply default task date preference
      loadDefaultTaskDate();
    }
    
    // Request permissions on mount
    (async () => {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      
      if (imageStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permission needed', 'Camera and media library permissions are required for attachments.');
      }
      if (audioStatus !== 'granted') {
        Alert.alert('Permission needed', 'Audio recording permission is required for audio notes.');
      }
    })();
    
    return () => {
      // Cleanup: stop recording and sound if component unmounts
      if (recording.current) {
        recording.current.stopAndUnloadAsync().catch(() => {});
      }
      if (Platform.OS === 'web') {
        if (webAudio.current) {
          webAudio.current.pause();
          webAudio.current = null;
        }
      } else {
        if (sound.current) {
          sound.current.unloadAsync().catch(() => {});
        }
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [todoId]);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const cats = await apiService.getCategories();
      console.log('Categories loaded:', cats);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
        setCategoryName(cats[0].name);
      } else if (cats.length === 0) {
        console.warn('No categories found in the response');
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Show user-friendly error message
      Alert.alert(
        'Error',
        'Failed to load categories. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadDefaultTaskDate = async () => {
    try {
      const preferences = await apiService.getUserPreferences();
      if (preferences.defaultTaskDate && preferences.defaultTaskDate !== 'none') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (preferences.defaultTaskDate === 'today') {
          setFinishDate(today);
        } else if (preferences.defaultTaskDate === 'tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          setFinishDate(tomorrow);
        }
      }
    } catch (error) {
      console.error('Failed to load default task date preference:', error);
      // Silently fail - not critical
    }
  };

  const loadTodo = async () => {
    if (!todoId) return;
    try {
      const todo = await apiService.getTodo(todoId);
      setTitle(todo.title);
      setDescription(todo.description || '');
      setCategoryId(todo.categoryId || null);
      setCategoryName(todo.categoryName || '');
      if (todo.startDate) setStartDate(new Date(todo.startDate));
      if (todo.executionTime) setExecutionTime(new Date(todo.executionTime));
      if (todo.dueDate) setFinishDate(new Date(todo.dueDate));
      if (todo.recurrencePattern) setRecurrencePattern(todo.recurrencePattern);
      if (todo.nextOccurrence) setNextOccurrence(new Date(todo.nextOccurrence));
      if (todo.subTasks) setSubTasks(todo.subTasks.map((st, idx) => ({ ...st, order: idx })));
      setIsCompleted(todo.isCompleted || false);
      // Parse comma-separated URLs into arrays
      if (todo.audioUrl) {
        setAudioUris(todo.audioUrl.split(',').filter(url => url.trim() !== ''));
      }
      if (todo.imageUrl) {
        setImageUris(todo.imageUrl.split(',').filter(url => url.trim() !== ''));
      }
      
      // Load reminder for this task
      try {
        const reminders = await apiService.getReminders();
        const taskReminder = reminders.find(r => r.todoId === todoId && !r.isCompleted);
        if (taskReminder && taskReminder.reminderTime) {
          const reminderDateTime = new Date(taskReminder.reminderTime);
          // Set reminder date (date part only)
          const reminderDateOnly = new Date(reminderDateTime);
          reminderDateOnly.setHours(0, 0, 0, 0);
          setReminderDate(reminderDateOnly);
          
          // Set reminder time (time part only)
          const reminderTimeOnly = new Date();
          reminderTimeOnly.setHours(reminderDateTime.getHours());
          reminderTimeOnly.setMinutes(reminderDateTime.getMinutes());
          reminderTimeOnly.setSeconds(0);
          reminderTimeOnly.setMilliseconds(0);
          setReminderTime(reminderTimeOnly);
        }
      } catch (error) {
        console.error('Failed to load reminder:', error);
        // Don't fail the entire load if reminder loading fails
      }
      
      // Reload categories to get updated category info
      await loadCategories();
    } catch (error) {
      console.error('Failed to load todo:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Cannot duplicate task without title');
      return;
    }

    setLoading(true);
    try {
      // Create a new task with the same data but mark as incomplete
      const taskData = {
        title: `${title.trim()} (Copy)`,
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        isImportant: false,
        isCompleted: false, // New task is not completed
        startDate: startDate ? startDate.toISOString() : undefined,
        dueDate: finishDate ? finishDate.toISOString() : undefined,
        executionTime: executionTime ? executionTime.toISOString() : undefined,
        recurrencePattern: recurrencePattern || undefined,
        audioUrl: audioUris.length > 0 ? audioUris.join(',') : undefined,
        imageUrl: imageUris.length > 0 ? imageUris.join(',') : undefined,
        subTasks: subTasks.length > 0 ? subTasks.map((st, idx) => ({
          title: st.title,
          isCompleted: false, // Reset subtasks to incomplete
          order: idx,
        })) : undefined,
      };

      await apiService.createTodo(taskData);
      Alert.alert('Success', 'Task duplicated successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to duplicate task:', error);
      Alert.alert('Error', 'Failed to duplicate task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Don't allow saving if task is completed (read-only mode)
    if (isCompleted) {
      Alert.alert('Info', 'Completed tasks cannot be edited. Use "Copy & Create New" to create a new task.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        isImportant: false,
        startDate: startDate ? startDate.toISOString() : undefined,
        dueDate: finishDate ? finishDate.toISOString() : undefined,
        executionTime: executionTime ? executionTime.toISOString() : undefined,
        recurrencePattern: recurrencePattern || undefined,
        audioUrl: audioUris.length > 0 ? audioUris.join(',') : undefined,
        imageUrl: imageUris.length > 0 ? imageUris.join(',') : undefined,
        subTasks: subTasks.length > 0 ? subTasks.map((st, idx) => ({
          title: st.title,
          order: idx,
        })) : undefined,
      };

      let savedTodo: Todo;
      if (todoId) {
        // Cancel existing reminder notifications before updating
        try {
          const existingReminders = await apiService.getReminders();
          const taskReminders = existingReminders.filter(r => r.todoId === todoId);
          for (const reminder of taskReminders) {
            const notificationIds = await NotificationService.getScheduledNotifications();
            for (const notification of notificationIds) {
              if (notification.content.data?.reminderId === reminder.id || 
                  notification.content.data?.todoId === todoId) {
                await NotificationService.cancelNotification(notification.identifier);
              }
            }
            // Delete old reminder
            await apiService.deleteReminder(reminder.id);
          }
        } catch (error) {
          console.error('Error canceling existing reminder notifications:', error);
        }
        savedTodo = await apiService.updateTodo(todoId, taskData);
      } else {
        savedTodo = await apiService.createTodo(taskData);
      }

      // Create reminder if reminder date/time is set
      if (reminderDate && reminderTime) {
        const reminderDateTime = new Date(reminderDate);
        reminderDateTime.setHours(reminderTime.getHours());
        reminderDateTime.setMinutes(reminderTime.getMinutes());
        
        // Check if notification reminders are enabled
        let notificationEnabled = true;
        try {
          const preferences = await apiService.getUserPreferences();
          notificationEnabled = preferences.enableNotificationReminders ?? true;
        } catch (error) {
          console.error('Failed to load user preferences:', error);
          // Default to enabled if we can't check
        }

        const createdReminder = await apiService.createReminder({
          todoId: savedTodo.id,
          title: `Reminder: ${title}`,
          description: description || undefined,
          reminderTime: reminderDateTime.toISOString(),
          recurrencePattern: recurrencePattern || undefined,
        });

        // Schedule local notification if enabled
        if (notificationEnabled) {
          try {
            // Verify permissions again before scheduling
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
              console.warn('Notification permissions not granted. Notification will not be sent.');
              Alert.alert(
                'Notification Permission Required',
                'Please enable notifications in your device settings to receive reminders.',
                [{ text: 'OK' }]
              );
            } else {
              const reminderForNotification: Reminder = {
                id: createdReminder.id,
                todoId: savedTodo.id,
                title: createdReminder.title,
                description: createdReminder.description,
                reminderTime: createdReminder.reminderTime,
                isCompleted: false,
                isSnoozed: false,
                recurrencePattern: createdReminder.recurrencePattern,
                createdAt: createdReminder.createdAt,
                updatedAt: createdReminder.updatedAt,
              };

              if (recurrencePattern) {
                const notificationIds = await NotificationService.scheduleRecurringReminder(reminderForNotification);
                console.log('Recurring notifications scheduled:', notificationIds.length, 'for reminder:', createdReminder.id);
              } else {
                const notificationId = await NotificationService.scheduleReminder(reminderForNotification);
                console.log('Notification scheduled with ID:', notificationId, 'for reminder:', createdReminder.id);
                
                // Verify notification was scheduled
                const isScheduled = await NotificationService.verifyNotificationScheduled(createdReminder.id);
                if (isScheduled) {
                  console.log('✓ Notification verified as scheduled');
                } else {
                  console.warn('⚠ Notification may not have been scheduled correctly');
                }
              }

              // Store notification ID mapping for later cancellation
              await StorageService.setItem(`notification_${createdReminder.id}`, createdReminder.id.toString());
            }
          } catch (error: any) {
            console.error('Failed to schedule notification:', error);
            Alert.alert(
              'Notification Error',
              error.message || 'Failed to schedule notification. Please check your notification settings.',
              [{ text: 'OK' }]
            );
            // Don't fail the task save if notification scheduling fails
          }
        } else {
          console.log('Notifications are disabled in user preferences');
        }
      }

      Alert.alert('Success', todoId ? 'Task updated successfully' : 'Task created successfully');
      onSave();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todoId) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get reminders for this task and cancel their notifications
              try {
                const reminders = await apiService.getReminders();
                const taskReminders = reminders.filter(r => r.todoId === todoId);
                for (const reminder of taskReminders) {
                  // Cancel all scheduled notifications for this reminder
                  const notificationIds = await NotificationService.getScheduledNotifications();
                  for (const notification of notificationIds) {
                    if (notification.content.data?.reminderId === reminder.id || 
                        notification.content.data?.todoId === todoId) {
                      await NotificationService.cancelNotification(notification.identifier);
                    }
                  }
                  // Delete reminder from backend
                  await apiService.deleteReminder(reminder.id);
                }
              } catch (error) {
                console.error('Error canceling reminder notifications:', error);
              }

              await apiService.deleteTodo(todoId);
              onSave();
              onClose();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, { title: '', isCompleted: false, order: subTasks.length }]);
  };

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const updateSubTask = (index: number, title: string) => {
    const updated = [...subTasks];
    updated[index].title = title;
    setSubTasks(updated);
  };

  // Audio Recording Functions
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start audio recording');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      
      if (uri) {
        setAudioUris([...audioUris, uri]);
      }
      
      setIsRecording(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      setRecordingDuration(0);
      recording.current = null;
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop audio recording');
    }
  };

  const playAudio = async (audioIndex: number) => {
    if (audioIndex < 0 || audioIndex >= audioUris.length) return;
    const audioUri = audioUris[audioIndex];

    try {
      // Platform-specific audio playback
      if (Platform.OS === 'web') {
        // Use HTML5 Audio for web
        if (webAudio.current) {
          webAudio.current.pause();
          webAudio.current = null;
        }

        // Use global Audio constructor for web
        const audio = new (window as any).Audio(audioUri);
        webAudio.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          setPlayingAudioIndex(null);
          webAudio.current = null;
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setPlayingAudioIndex(null);
          webAudio.current = null;
          Alert.alert('Error', 'Failed to play audio recording');
        };

        await audio.play();
        setIsPlaying(true);
        setPlayingAudioIndex(audioIndex);
      } else {
        // Use expo-av for native platforms
        // Stop and unload any existing sound
        if (sound.current) {
          try {
            await sound.current.unloadAsync();
          } catch (e) {
            // Ignore errors when unloading
          }
          sound.current = null;
        }

        // Set audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        // Create and play new sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        
        sound.current = newSound;
        setIsPlaying(true);
        setPlayingAudioIndex(audioIndex);

        // Handle playback status
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlayingAudioIndex(null);
              newSound.unloadAsync().then(() => {
                sound.current = null;
              }).catch(() => {
                sound.current = null;
              });
            }
          }
        });
      }
    } catch (err) {
      console.error('Failed to play audio', err);
      setIsPlaying(false);
      setPlayingAudioIndex(null);
      sound.current = null;
      webAudio.current = null;
      Alert.alert('Error', 'Failed to play audio recording');
    }
  };

  const stopAudio = async () => {
    try {
      if (Platform.OS === 'web') {
        if (webAudio.current) {
          webAudio.current.pause();
          webAudio.current = null;
        }
      } else {
        if (sound.current) {
          await sound.current.stopAsync();
          await sound.current.unloadAsync();
          sound.current = null;
        }
      }
      setIsPlaying(false);
      setPlayingAudioIndex(null);
    } catch (err) {
      console.error('Failed to stop audio', err);
    }
  };

  const removeAudio = (index: number) => {
    const newAudioUris = audioUris.filter((_, i) => i !== index);
    setAudioUris(newAudioUris);
    // If removing the currently playing audio, stop it
    if (playingAudioIndex === index) {
      stopAudio();
    }
  };

  // Image Picker Functions
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        setImageUris([...imageUris, ...newImageUris]);
      }
    } catch (err) {
      console.error('Failed to pick image', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    const newImageUris = imageUris.filter((_, i) => i !== index);
    setImageUris(newImageUris);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const isToday = dateOnly.getTime() === today.getTime();
    return isToday ? `${format(date, 'dd/MM/yyyy')}, today` : format(date, 'dd/MM/yyyy');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || (todoId ? 'Edit Task' : 'New Task')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Task Title */}
        <View style={styles.section}>
          <TextInput
            style={[styles.titleInput, isCompleted && styles.titleInputDisabled]}
            placeholder="Task name"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            autoFocus={!todoId && !isCompleted}
            editable={!isCompleted}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => setShowCategoryModal(true)}
            disabled={isCompleted}
          >
            <Ionicons name="folder" size={20} color="#9ca3af" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Category</Text>
              <Text style={styles.rowValue}>
                {categoryId && categoryName ? categoryName : 'Select category'}
              </Text>
            </View>
            {categoryId && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setCategoryId(null);
                  setCategoryName('');
                }}
                disabled={isCompleted}
              >
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          {subTasks.map((subTask, index) => (
            <View key={index} style={styles.subTaskRow}>
              <TouchableOpacity style={styles.subTaskCheckbox}>
                <Ionicons
                  name={subTask.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={subTask.isCompleted ? '#8b5cf6' : '#9ca3af'}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.subTaskInput}
                placeholder="Subtask"
                placeholderTextColor="#9ca3af"
                value={subTask.title}
                onChangeText={(text) => updateSubTask(index, text)}
              />
              <TouchableOpacity onPress={() => removeSubTask(index)}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <Ionicons name="reorder-three" size={20} color="#9ca3af" />
            </View>
          ))}
          <TouchableOpacity style={styles.addRow} onPress={addSubTask} disabled={isCompleted}>
            <Ionicons name="arrow-forward" size={20} color="#9ca3af" />
            <Text style={styles.addRowText}>Add a subtask</Text>
          </TouchableOpacity>
        </View>

        {/* Recurrence */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowRecurrenceModal(true)}
          disabled={isCompleted}
        >
          <Ionicons name="repeat" size={20} color="#9ca3af" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Make it regular</Text>
            {recurrencePattern && (
              <>
                <Text style={styles.rowValue}>
                  {recurrencePattern === 'daily' ? 'Every day' : 
                   recurrencePattern === 'weekly' ? 'Weekly' :
                   recurrencePattern === 'monthly' ? 'Monthly' : recurrencePattern}
                </Text>
                {nextOccurrence && (
                  <Text style={styles.rowValue}>Next task: {format(nextOccurrence, 'dd/MM/yyyy')}</Text>
                )}
              </>
            )}
          </View>
          {recurrencePattern && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setRecurrencePattern(null);
                setNextOccurrence(null);
              }}
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Start of Task Completion */}
        {startDate && (
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowDatePicker('startDate')}
            disabled={isCompleted}
          >
            <Ionicons name="calendar" size={20} color="#9ca3af" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Start of task completion</Text>
              <Text style={styles.rowValue}>
                {formatDate(startDate)}{isToday(startDate) ? ', today' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setStartDate(null);
              }}
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Task Completion Date */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowDatePicker('finishDate')}
          disabled={isCompleted}
        >
          <Ionicons name="calendar" size={20} color="#9ca3af" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Task completion date</Text>
            {finishDate ? (
              <Text style={styles.rowValue}>
                {formatDate(finishDate)}{isToday(finishDate) ? ', today' : ''}
              </Text>
            ) : (
              <Text style={styles.rowValue}>Indefinite</Text>
            )}
          </View>
          {finishDate && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setFinishDate(null);
              }}
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Execution Time */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowTimePicker('executionTime')}
          disabled={isCompleted}
        >
          <Ionicons name="time" size={20} color="#9ca3af" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Task execution time</Text>
            {executionTime && <Text style={styles.rowValue}>{format(executionTime, 'HH:mm')}</Text>}
          </View>
          {executionTime && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setExecutionTime(null);
              }}
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Reminder */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowReminderPicker(true)}
          disabled={isCompleted}
        >
          <Ionicons name="notifications" size={20} color="#9ca3af" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Task reminder</Text>
            {reminderDate && reminderTime && (
              <Text style={styles.rowValue}>
                {format(reminderDate, 'dd/MM/yyyy')}, {format(reminderTime, 'HH:mm')}
              </Text>
            )}
          </View>
          {reminderDate && reminderTime && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setReminderDate(null);
                setReminderTime(null);
              }}
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Description/Note */}
        <View style={styles.section}>
          <View style={styles.noteHeader}>
            <Ionicons name="document-text" size={20} color="#9ca3af" />
            <Text style={styles.rowLabel}>Add a note</Text>
          </View>
          <TextInput
            style={[styles.noteInput, isCompleted && styles.noteInputDisabled]}
            placeholder="Enter note..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isCompleted}
            textAlignVertical="top"
          />
        </View>

        {/* Audio Recording */}
        <View style={styles.attachmentSection}>
          {/* Existing Audio Files */}
          {audioUris.map((audioUri, index) => (
            <View key={index} style={styles.audioItem}>
              <View style={styles.audioItemContent}>
                <Ionicons name="musical-notes" size={20} color="#9ca3af" />
                <Text style={styles.audioItemLabel}>Audio {index + 1}</Text>
                <View style={styles.audioControls}>
                  <TouchableOpacity 
                    onPress={() => playingAudioIndex === index ? stopAudio() : playAudio(index)} 
                    style={styles.audioButton}
                  >
                    <Ionicons 
                      name={playingAudioIndex === index && isPlaying ? "stop" : "play"} 
                      size={16} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => removeAudio(index)} 
                    style={styles.audioButton}
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {/* Add New Audio Button */}
          <TouchableOpacity 
            style={styles.row}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={20} 
              color={isRecording ? "#ef4444" : "#9ca3af"} 
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {isRecording ? `Recording... ${formatDuration(recordingDuration)}` : 'Add an audio recording'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Image Attachments */}
        <View style={styles.attachmentSection}>
          {/* Existing Images */}
          {imageUris.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.attachedImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Add New Image Button */}
          <TouchableOpacity 
            style={styles.row}
            onPress={pickImage}
          >
            <Ionicons name="image" size={20} color="#9ca3af" />
            <Text style={styles.rowLabel}>Add an image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isCompleted ? (
          <>
            <TouchableOpacity 
              style={styles.copyButton} 
              onPress={handleDuplicate} 
              disabled={loading}
            >
              <Ionicons name="copy" size={20} color="#fff" />
              <Text style={styles.copyButtonText}>Copy & Create New</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveUpdateButton} 
              onPress={handleSave} 
              disabled={loading}
            >
              <Text style={styles.saveUpdateButtonText}>
                {todoId ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Categories Modal */}
      <CategoriesScreen
        visible={showCategoriesModal}
        onClose={async () => {
          setShowCategoriesModal(false);
          // Reload categories when modal closes in case new ones were added
          await loadCategories();
        }}
        onSelectCategory={(category) => {
          setCategoryId(category.id);
          setCategoryName(category.name);
        }}
      />

      {/* Calendar Picker */}
      <CalendarPicker
        visible={showDatePicker !== null}
        onClose={() => setShowDatePicker(null)}
        onSelect={(date) => {
          if (showDatePicker === 'startDate') setStartDate(date);
          else if (showDatePicker === 'finishDate') setFinishDate(date);
          setShowDatePicker(null);
        }}
        selectedDate={
          showDatePicker === 'startDate' ? startDate :
          showDatePicker === 'finishDate' ? finishDate : null
        }
      />

      {/* Time Picker */}
      <TimePicker
        visible={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        onSelect={(time) => {
          if (showTimePicker === 'executionTime') setExecutionTime(time);
          setShowTimePicker(null);
        }}
        selectedTime={
          showTimePicker === 'executionTime' ? executionTime : null
        }
      />

      {/* Reminder Picker (Date + Time together) */}
      <ReminderPicker
        visible={showReminderPicker}
        onClose={() => setShowReminderPicker(false)}
        onSelect={(date, time) => {
          setReminderDate(date);
          setReminderTime(time);
        }}
        selectedDate={reminderDate}
        selectedTime={reminderTime}
      />

      {/* Recurrence Modal */}
      <RecurrenceModal
        visible={showRecurrenceModal}
        onClose={() => setShowRecurrenceModal(false)}
        onSelect={(pattern, nextDate) => {
          setRecurrencePattern(pattern);
          setNextOccurrence(nextDate);
        }}
        currentPattern={recurrencePattern}
      />

      {/* Category Modal */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category) => {
          setCategoryId(category.id);
          setCategoryName(category.name);
        }}
        categories={categories}
        selectedCategoryId={categoryId}
        onManageCategories={() => {
          setShowCategoryModal(false);
          setShowCategoriesModal(true);
        }}
      />
    </View>
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
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  titleInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  rowValue: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyCategoriesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategoriesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  categoryPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addIcon: {
    marginLeft: 'auto',
  },
  subTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  subTaskCheckbox: {
    padding: 4,
  },
  subTaskInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  addRowText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  attachmentSection: {
    marginBottom: 8,
  },
  audioItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  audioItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioItemLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 8,
  },
  audioButton: {
    backgroundColor: '#312e81',
    padding: 8,
    borderRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  attachedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#312e81',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  noteInput: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    minHeight: 100,
    maxHeight: 200,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#312e81',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#312e81',
    borderWidth: 1,
    borderColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveUpdateButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveUpdateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleInputDisabled: {
    opacity: 0.6,
    color: '#9ca3af',
  },
  noteInputDisabled: {
    opacity: 0.6,
    color: '#9ca3af',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  pickerButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

