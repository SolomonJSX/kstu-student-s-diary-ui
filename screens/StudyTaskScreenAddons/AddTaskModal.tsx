// AddTaskModal.tsx - исправленная версия
import React, { useState, useMemo } from "react";
import { 
    View, 
    StyleSheet, 
    Alert, 
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions 
} from "react-native";
import { 
    Portal, 
    Modal, 
    Text, 
    TextInput, 
    Button, 
    Divider, 
    HelperText, 
    Menu,
    Chip,
    IconButton 
} from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from 'expo-image-picker';
import { useSemesterSchedule } from "../../hooks/useSemesterSchedule";
import { useCreateStudyTask } from "../../hooks/useCreateStudyTask";
import { StudyTaskCreateDto } from "../../types/studyTaskType";
import { useUploadMultipleAttachments } from "../../hooks/useStudyTaskAttachments";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTaskModalProps {
    visible: boolean;
    onDismiss: () => void;
    studentId: number;
}

interface SelectedFile {
    name: string;
    uri: string;
    size: number;
    mimeType: string | null;
    type: 'image' | 'document' | 'other';
}

// Функция для создания FormData совместимого с React Native
const createFormData = (files: SelectedFile[]): FormData => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
        // Создаем объект файла совместимый с React Native
        const fileObject = {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name,
        };
        
        formData.append('files', fileObject as any);
    });
    
    return formData;
};

export function AddTaskModal({ visible, onDismiss, studentId }: AddTaskModalProps) {
    const { data: schedule } = useSemesterSchedule(String(studentId));
    const { mutate: createTask, isPending: isCreating } = useCreateStudyTask();
    const { mutate: uploadMultipleAttachments, isPending: isUploading } = useUploadMultipleAttachments();

    const [form, setForm] = useState({ 
        subject: "", 
        description: "", 
        deadline: "" 
    });
    const [menuVisible, setMenuVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const subjects = useMemo(() => {
        if (!schedule) return [];
        const allSubjects = Object.values(schedule).flat().map(s => s.subject);
        return Array.from(new Set(allSubjects)).sort();
    }, [schedule]);

    const getFileType = (mimeType: string | null): 'image' | 'document' | 'other' => {
        if (!mimeType) return 'other';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) 
            return 'document';
        return 'other';
    };

    const getFileIcon = (type: 'image' | 'document' | 'other') => {
        switch (type) {
            case 'image': return 'image';
            case 'document': return 'file-document';
            default: return 'file';
        }
    };

    const getFileIconColor = (type: 'image' | 'document' | 'other') => {
        switch (type) {
            case 'image': return '#4caf50';
            case 'document': return '#2196f3';
            default: return '#757575';
        }
    };

    const handlePickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Ошибка', 'Разрешение на доступ к галерее требуется для выбора изображений');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets) {
                const newFiles: SelectedFile[] = result.assets.map(asset => ({
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    uri: asset.uri,
                    size: asset.fileSize || 0,
                    mimeType: asset.mimeType || 'image/jpeg',
                    type: 'image'
                }));
                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать изображения');
        }
    };

    const handlePickDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain'
                ],
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets) {
                const newFiles: SelectedFile[] = result.assets.map(asset => ({
                    name: asset.name || 'unknown',
                    uri: asset.uri,
                    size: asset.size || 0,
                    mimeType: asset.mimeType || 'application/octet-stream',
                    type: getFileType(asset.mimeType ?? null)
                }));
                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('Error picking documents:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать файл');
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            setForm({ ...form, deadline: selectedDate.toISOString() });
        }
    };

    // Альтернативная функция загрузки файлов (совместимая с React Native)
    const uploadFilesWithProgress = async (taskId: number): Promise<void> => {
        if (selectedFiles.length === 0) return;

        try {
            setUploadProgress(0);

            const formData = createFormData(selectedFiles);

            const xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        setUploadProgress(Math.round(progress));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200 || xhr.status === 207) {
                        setUploadProgress(100);
                        resolve();
                    } else {
                        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });

                // Используем правильный URL (замените на ваш базовый URL)
                xhr.open('POST', `http://10.0.2.2:5204/api/tasks/${taskId}/attachments/multiple`);
                
                // Не устанавливаем Content-Type - браузер установит его автоматически с boundary
                xhr.send(formData as any);
            });

        } catch (error) {
            setUploadProgress(0);
            throw error;
        }
    };

    const handleAddTask = async () => {
        if (!form.subject || !form.description) return;

        const taskData: StudyTaskCreateDto = {
            studentId,
            subject: form.subject,
            description: form.description,
            deadline: form.deadline || undefined,
        };

        createTask(taskData, {
            onSuccess: async (task) => {
                if (selectedFiles.length > 0) {
                    try {
                        // Используем альтернативный метод загрузки
                        await uploadFilesWithProgress(task.id);
                        Alert.alert('Успех', 'Задача и файлы успешно созданы');
                        onDismiss();
                        resetForm();
                    } catch (error: any) {
                        console.error("Failed to upload files:", error);
                        Alert.alert(
                            'Частичный успех', 
                            'Задача создана, но файлы не загружены. Ошибка: ' + error.message
                        );
                        onDismiss();
                        resetForm();
                    }
                } else {
                    Alert.alert('Успех', 'Задача успешно создана');
                    onDismiss();
                    resetForm();
                }
            },
            onError: (error) => {
                console.error("Failed to create task:", error);
                Alert.alert('Ошибка', 'Не удалось создать задачу');
            },
        });
    };

    const resetForm = () => {
        setForm({ subject: "", description: "", deadline: "" });
        setSelectedFiles([]);
        setUploadProgress(0);
    };

    const showError = !form.subject || !form.description;
    const totalFileSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const isUploadingWithProgress = uploadProgress > 0 && uploadProgress < 100;

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const imageFiles = selectedFiles.filter(file => file.type === 'image');
    const documentFiles = selectedFiles.filter(file => file.type !== 'image');

    if (!visible) return null;

    return (
        <Portal>
            <Modal 
                visible={visible} 
                onDismiss={onDismiss}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.modalTitle}>
                        Новая задача
                    </Text>
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={onDismiss}
                        disabled={isCreating || isUploadingWithProgress}
                    />
                </View>
                
                <Divider style={styles.divider} />

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Выбор предмета */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Предмет *
                        </Text>
                        <TouchableOpacity 
                            style={styles.subjectSelector}
                            onPress={() => setMenuVisible(true)}
                            disabled={isCreating || isUploadingWithProgress}
                        >
                            <Text style={[
                                styles.subjectText,
                                !form.subject && styles.placeholderText
                            ]}>
                                {form.subject || "Выберите предмет"}
                            </Text>
                            <IconButton icon="menu-down" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Описание */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Описание задачи *
                        </Text>
                        <TextInput
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.textArea}
                            placeholder="Опишите задачу подробно..."
                            disabled={isCreating || isUploadingWithProgress}
                        />
                    </View>

                    {/* Дедлайн */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Дедлайн (необязательно)
                        </Text>
                        <TouchableOpacity 
                            style={styles.dateSelector}
                            onPress={() => setShowDatePicker(true)}
                            disabled={isCreating || isUploadingWithProgress}
                        >
                            <IconButton icon="calendar" size={20} />
                            <Text style={[
                                styles.dateText,
                                !form.deadline && styles.placeholderText
                            ]}>
                                {form.deadline 
                                    ? new Date(form.deadline).toLocaleDateString('ru-RU')
                                    : "Выберите дату"
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Прикрепление файлов */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Прикрепленные файлы
                        </Text>
                        
                        <View style={styles.fileButtons}>
                            <Button
                                mode="outlined"
                                onPress={handlePickImages}
                                style={styles.fileButton}
                                icon="image"
                                disabled={isCreating || isUploadingWithProgress}
                            >
                                Фото
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handlePickDocuments}
                                style={styles.fileButton}
                                icon="file-document"
                                disabled={true}
                            >
                                Документы
                            </Button>
                        </View>

                        {/* Прогресс загрузки */}
                        {isUploadingWithProgress && (
                            <View style={styles.progressContainer}>
                                <Text variant="bodySmall" style={styles.progressText}>
                                    Загрузка файлов: {uploadProgress}%
                                </Text>
                                <View style={styles.progressBar}>
                                    <View 
                                        style={[
                                            styles.progressFill,
                                            { width: `${uploadProgress}%` }
                                        ]} 
                                    />
                                </View>
                            </View>
                        )}

                        {/* Превью изображений */}
                        {imageFiles.length > 0 && (
                            <View style={styles.imagesSection}>
                                <Text style={styles.filesSectionTitle}>
                                    📷 Изображения ({imageFiles.length})
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.imagesContainer}>
                                        {imageFiles.map((file, index) => (
                                            <View key={index} style={styles.imageItem}>
                                                <Image 
                                                    source={{ uri: file.uri }} 
                                                    style={styles.imagePreview}
                                                    resizeMode="cover"
                                                />
                                                <View style={styles.imageOverlay}>
                                                    <Text style={styles.imageName} numberOfLines={1}>
                                                        {file.name}
                                                    </Text>
                                                    <TouchableOpacity 
                                                        style={styles.removeImageButton}
                                                        onPress={() => removeFile(
                                                            selectedFiles.findIndex(f => f.uri === file.uri)
                                                        )}
                                                        disabled={isCreating || isUploadingWithProgress}
                                                    >
                                                        <Text style={styles.removeImageText}>×</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {/* Список документов */}
                        {documentFiles.length > 0 && (
                            <View style={styles.documentsSection}>
                                <Text style={styles.filesSectionTitle}>
                                    📄 Документы ({documentFiles.length})
                                </Text>
                                <View style={styles.documentsList}>
                                    {documentFiles.map((file, index) => (
                                        <View key={index} style={styles.documentItem}>
                                            <IconButton 
                                                icon={getFileIcon(file.type)} 
                                                size={20}
                                                iconColor={getFileIconColor(file.type)}
                                            />
                                            <View style={styles.documentInfo}>
                                                <Text style={styles.documentName} numberOfLines={1}>
                                                    {file.name}
                                                </Text>
                                                <Text style={styles.documentSize}>
                                                    {formatFileSize(file.size)}
                                                </Text>
                                            </View>
                                            <IconButton
                                                icon="close"
                                                size={16}
                                                onPress={() => removeFile(
                                                    selectedFiles.findIndex(f => f.uri === file.uri)
                                                )}
                                                disabled={isCreating || isUploadingWithProgress}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Общая информация о файлах */}
                        {selectedFiles.length > 0 && (
                            <View style={styles.filesInfo}>
                                <Chip icon="information" style={styles.infoChip}>
                                    Всего файлов: {selectedFiles.length} • {formatFileSize(totalFileSize)}
                                </Chip>
                                <HelperText type="info" style={styles.uploadInfo}>
                                    Файлы будут загружены автоматически после создания задачи
                                </HelperText>
                            </View>
                        )}
                    </View>

                    {showError && (
                        <HelperText type="error" style={styles.errorHelper}>
                            Заполните обязательные поля (предмет и описание)
                        </HelperText>
                    )}
                </ScrollView>

                {/* Кнопки */}
                <View style={styles.footer}>
                    <Button
                        mode="outlined"
                        onPress={onDismiss}
                        style={styles.cancelButton}
                        disabled={isCreating || isUploadingWithProgress}
                    >
                        Отмена
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleAddTask}
                        disabled={isCreating || showError || isUploadingWithProgress}
                        style={styles.addButton}
                        loading={isCreating}
                    >
                        {isUploadingWithProgress 
                            ? `Загрузка ${uploadProgress}%` 
                            : isCreating 
                                ? "Создание..." 
                                : "Создать задачу"
                        }
                    </Button>
                </View>

                {/* DateTimePicker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={form.deadline ? new Date(form.deadline) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                {/* Menu для выбора предмета */}
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={{ x: 0, y: 0 }}
                    style={styles.menuContainer}
                >
                    <ScrollView style={styles.menuScrollView}>
                        {subjects.map((subject) => (
                            <Menu.Item
                                key={subject}
                                onPress={() => {
                                    setForm({ ...form, subject });
                                    setMenuVisible(false);
                                }}
                                title={String(subject)}
                            />
                        ))}
                    </ScrollView>
                </Menu>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 16,
        maxHeight: SCREEN_HEIGHT * 0.85,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    modalTitle: {
        fontWeight: '600',
        fontSize: 20,
        color: '#1a1a1a',
    },
    divider: {
        marginHorizontal: 20,
        marginVertical: 8,
    },
    scrollView: {
        flexGrow: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 20,
        paddingBottom: 10,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    subjectSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
    },
    subjectText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    textArea: {
        fontSize: 16,
        minHeight: 100,
        backgroundColor: '#fff',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
    },
    fileButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    fileButton: {
        flex: 1,
    },
    progressContainer: {
        gap: 8,
        marginVertical: 8,
    },
    progressText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4caf50',
        borderRadius: 3,
    },
    imagesSection: {
        gap: 8,
    },
    filesSectionTitle: {
        fontWeight: '500',
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    imagesContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
    },
    imageItem: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageName: {
        flex: 1,
        color: 'white',
        fontSize: 10,
        marginRight: 4,
    },
    removeImageButton: {
        padding: 2,
    },
    removeImageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    documentsSection: {
        gap: 8,
    },
    documentsList: {
        gap: 8,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    documentInfo: {
        flex: 1,
        marginLeft: 8,
        gap: 2,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    documentSize: {
        fontSize: 12,
        color: '#666',
    },
    filesInfo: {
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    infoChip: {
        backgroundColor: '#e3f2fd',
    },
    uploadInfo: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
    },
    errorHelper: {
        textAlign: 'center',
        fontSize: 14,
        color: '#d32f2f',
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    cancelButton: {
        flex: 1,
        borderColor: '#666',
    },
    addButton: {
        flex: 2,
        backgroundColor: '#1976d2',
    },
    menuContainer: {
        marginTop: 50,
        width: SCREEN_WIDTH * 0.7,
        maxHeight: 200,
    },
    menuScrollView: {
        maxHeight: 200,
    },
});