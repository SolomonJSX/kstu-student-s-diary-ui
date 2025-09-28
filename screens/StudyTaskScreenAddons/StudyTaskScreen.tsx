// StudyTasksScreen.tsx - исправленная версия
import React, { useEffect, useState } from 'react';
import { 
    View, 
    FlatList, 
    StyleSheet, 
    RefreshControl, 
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    Modal as RNModal
} from 'react-native';
import { 
    Appbar, 
    Card, 
    Text, 
    FAB, 
    Portal, 
    IconButton, 
    Chip,
    Badge,
    Menu,
    Button,
    ActivityIndicator,
} from 'react-native-paper';
import { useStudyTasks } from '../../hooks/useStudyTask';
import { useToggleTaskCompletion } from '../../hooks/useToggleTaskCompletion';
import { useDeleteStudyTask } from '../../hooks/useDeleteStudTask';
import { StudyTaskDto, TaskAttachment } from '../../types/studyTaskType';
import { AddTaskModal } from './AddTaskModal';
import { getData, STUDENT_ID_STORAGE_KEY } from '../../utils/storage';
import { useDeleteAttachment, useDownloadAttachment, useTaskAttachments } from '../../hooks/useStudyTaskAttachments';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StudyTasksScreen = () => {
    const [studentId, setStudentId] = useState<number | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
    const [menuVisible, setMenuVisible] = useState<{ [key: number]: boolean }>({});
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<TaskAttachment | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageList, setImageList] = useState<TaskAttachment[]>([]);

    const { mutate: toggleCompletion } = useToggleTaskCompletion();
    const { mutate: deleteTask } = useDeleteStudyTask();
    const downloadAttachment = useDownloadAttachment();
    const deleteAttachment = useDeleteAttachment();

    const pageSize = 10;
    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, refetch } = useStudyTasks(
        pageSize,
        studentId || undefined
    );

    useEffect(() => {
        const loadStudentId = async () => {
            const id = await getData(STUDENT_ID_STORAGE_KEY);
            if (id) setStudentId(Number(id));
        };
        loadStudentId();
    }, []);

    const allTasks = data?.pages.flatMap(page => page.data) || [];

    const loadMore = () => {
        if (hasNextPage) fetchNextPage();
    };

    const toggleTaskExpand = (taskId: number) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    const toggleMenu = (taskId: number) => {
        setMenuVisible(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const openImageViewer = (image: TaskAttachment, images: TaskAttachment[]) => {
        setImageList(images);
        setSelectedImage(image);
        setCurrentImageIndex(images.findIndex(img => img.id === image.id));
        setImageViewerVisible(true);
    };

    const closeImageViewer = () => {
        setImageViewerVisible(false);
        setSelectedImage(null);
        setCurrentImageIndex(0);
        setImageList([]);
    };

    const goToNextImage = () => {
        if (currentImageIndex < imageList.length - 1) {
            const nextIndex = currentImageIndex + 1;
            setCurrentImageIndex(nextIndex);
            setSelectedImage(imageList[nextIndex]);
        }
    };

    const goToPrevImage = () => {
        if (currentImageIndex > 0) {
            const prevIndex = currentImageIndex - 1;
            setCurrentImageIndex(prevIndex);
            setSelectedImage(imageList[prevIndex]);
        }
    };

    const handleDownload = async (attachment: TaskAttachment) => {
        downloadAttachment.mutate(attachment.id, {
            onSuccess: (blob: Blob) => {
                console.log(`Скачан файл ${attachment.fileName}`, blob);
            },
            onError: (err: any) => {
                console.error("Ошибка при скачивании файла:", err);
            },
        });
    };

    const handleDeleteAttachment = (attachment: TaskAttachment, taskId: number) => {
        deleteAttachment.mutate(attachment.id, {
            onSuccess: () => {
                console.log(`Файл ${attachment.fileName} удален`);
            },
            onError: (err: any) => {
                console.error("Ошибка при удалении файла:", err);
            },
        });
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            return 'image';
        } else if (['pdf'].includes(ext || '')) {
            return 'file-pdf-box';
        } else if (['doc', 'docx'].includes(ext || '')) {
            return 'file-word-box';
        } else if (['xls', 'xlsx'].includes(ext || '')) {
            return 'file-excel-box';
        } else if (['zip', 'rar'].includes(ext || '')) {
            return 'folder-zip';
        } else {
            return 'file-document';
        }
    };

    const getFileIconColor = (fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            return '#4caf50';
        } else if (['pdf'].includes(ext || '')) {
            return '#f44336';
        } else if (['doc', 'docx'].includes(ext || '')) {
            return '#2196f3';
        } else if (['xls', 'xlsx'].includes(ext || '')) {
            return '#4caf50';
        } else {
            return '#757575';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImageFile = (fileName: string) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const ext = fileName?.split('.').pop()?.toLowerCase();
        return imageExtensions.includes(ext || '');
    };

    const ImageViewerModal = () => (
        <RNModal
            visible={imageViewerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeImageViewer}
        >
            <View style={styles.imageViewerContainer}>
                <View style={styles.imageViewerHeader}>
                    <Text style={styles.imageViewerTitle} numberOfLines={1}>
                        {selectedImage?.fileName || ''}
                    </Text>
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor="white"
                        onPress={closeImageViewer}
                    />
                </View>
                
                <View style={styles.imageViewerContent}>
                    {imageList.length > 1 && (
                        <TouchableOpacity 
                            style={[styles.navButton, styles.prevButton]}
                            onPress={goToPrevImage}
                            disabled={currentImageIndex === 0}
                        >
                            <IconButton
                                icon="chevron-left"
                                size={32}
                                iconColor={currentImageIndex === 0 ? '#666' : 'white'}
                            />
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                        style={styles.imageContainer}
                        activeOpacity={0.9}
                        onPress={closeImageViewer}
                    >
                        {selectedImage && (
                            <Image
                                source={{ 
                                    uri: `http://10.0.2.2:5204/api/tasks/attachments/${selectedImage.id}/download`
                                }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        )}
                    </TouchableOpacity>

                    {imageList.length > 1 && (
                        <TouchableOpacity 
                            style={[styles.navButton, styles.nextButton]}
                            onPress={goToNextImage}
                            disabled={currentImageIndex === imageList.length - 1}
                        >
                            <IconButton
                                icon="chevron-right"
                                size={32}
                                iconColor={currentImageIndex === imageList.length - 1 ? '#666' : 'white'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.imageViewerFooter}>
                    <Text style={styles.imageCounter}>
                        {imageList.length > 0 ? `${currentImageIndex + 1} / ${imageList.length}` : ''}
                    </Text>
                    <View style={styles.imageViewerActions}>
                        {selectedImage && (
                            <IconButton
                                icon="download"
                                size={24}
                                iconColor="white"
                                onPress={() => handleDownload(selectedImage)}
                            />
                        )}
                        <IconButton
                            icon="share-variant"
                            size={24}
                            iconColor="white"
                            onPress={() => {}}
                        />
                    </View>
                </View>
            </View>
        </RNModal>
    );

    const TaskAttachments = ({ taskId }: { taskId: number }) => {
        const { data: attachments, isLoading, error } = useTaskAttachments(taskId);
        
        if (isLoading) {
            return (
                <View style={styles.attachmentsLoading}>
                    <ActivityIndicator size="small" />
                    <Text variant="bodySmall">Загрузка вложений...</Text>
                </View>
            );
        }
        
        if (error) {
            return (
                <View style={styles.attachmentsError}>
                    <Text variant="bodySmall" style={styles.errorText}>
                        Ошибка загрузки вложений
                    </Text>
                </View>
            );
        }
        
        if (!attachments || attachments.length === 0) {
            return (
                <View style={styles.noAttachments}>
                    <Text variant="bodySmall" style={styles.noAttachmentsText}>
                        Вложения не найдены
                    </Text>
                </View>
            );
        }

        const imageAttachments = attachments.filter(att => isImageFile(att.fileName));
        const otherAttachments = attachments.filter(att => !isImageFile(att.fileName));

        return (
            <View style={styles.attachmentsContainer}>
                {imageAttachments.length > 0 && (
                    <View style={styles.imagesSection}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>
                            📷 Изображения ({imageAttachments.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.imagesContainer}>
                                {imageAttachments.map((attachment) => (
                                    <TouchableOpacity 
                                        key={attachment.id} 
                                        style={styles.imageAttachment}
                                        onPress={() => openImageViewer(attachment, imageAttachments)}
                                    >
                                        <Image 
                                            source={{ 
                                                uri: `http://10.0.2.2:5204/api/tasks/attachments/${attachment.id}/download`
                                            }}
                                            style={styles.imagePreview}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.imageOverlay}>
                                            <Text style={styles.imageName} numberOfLines={1}>
                                                {attachment.fileName || ''}
                                            </Text>
                                            <IconButton
                                                icon="magnify"
                                                size={16}
                                                iconColor="white"
                                                onPress={() => openImageViewer(attachment, imageAttachments)}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {otherAttachments.length > 0 && (
                    <View style={styles.documentsSection}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>
                            📄 Документы ({otherAttachments.length})
                        </Text>
                        <View style={styles.documentsList}>
                            {otherAttachments.map((attachment) => (
                                <View key={attachment.id} style={styles.documentItem}>
                                    <IconButton 
                                        icon={getFileIcon(attachment.fileName)} 
                                        size={20}
                                        iconColor={getFileIconColor(attachment.fileName)}
                                    />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentName} numberOfLines={1}>
                                            {attachment.fileName || ''}
                                        </Text>
                                        <Text style={styles.documentSize}>
                                            {formatFileSize(attachment.fileSize)}
                                        </Text>
                                    </View>
                                    <View style={styles.documentActions}>
                                        <IconButton
                                            icon="download"
                                            size={16}
                                            onPress={() => handleDownload(attachment)}
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={16}
                                            iconColor="#d32f2f"
                                            onPress={() => handleDeleteAttachment(attachment, taskId)}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderTaskItem = ({ item }: { item: StudyTaskDto & { attachmentsCount?: number } }) => {
        const isExpanded = expandedTaskId === item.id;
        const hasAttachments = item.attachmentsCount && item.attachmentsCount > 0;

        return (
            <Card style={[
                styles.taskCard,
                item.isCompleted && styles.completedTask
            ]}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.taskHeader}>
                        <View style={styles.taskMainInfo}>
                            <View style={styles.subjectRow}>
                                <Text variant="titleMedium" style={[
                                    styles.subjectText,
                                    item.isCompleted && styles.completedText
                                ]}>
                                    {item.subject || ''}
                                </Text>
                                {hasAttachments && (
                                    <Badge style={styles.attachmentBadge}>
                                        {item.attachmentsCount || 0}
                                    </Badge>
                                )}
                            </View>
                            
                            <Text 
                                variant="bodyMedium" 
                                style={[
                                    styles.descriptionText,
                                    item.isCompleted && styles.completedText
                                ]}
                                numberOfLines={isExpanded ? undefined : 2}
                            >
                                {item.description ? String(item.description) : ''}
                            </Text>
                        </View>

                        <Menu
                            visible={menuVisible[item.id] || false}
                            onDismiss={() => toggleMenu(item.id)}
                            anchor={
                                <IconButton
                                    icon="dots-vertical"
                                    size={20}
                                    onPress={() => toggleMenu(item.id)}
                                />
                            }
                            style={styles.menu}
                        >
                            <Menu.Item
                                leadingIcon={item.isCompleted ? "undo" : "check"}
                                onPress={() => {
                                    toggleCompletion(item.id);
                                    toggleMenu(item.id);
                                }}
                                title={item.isCompleted ? "Отметить невыполненной" : "Отметить выполненной"}
                            />
                            <Menu.Item
                                leadingIcon="delete"
                                onPress={() => {
                                    deleteTask(item.id);
                                    toggleMenu(item.id);
                                }}
                                title="Удалить задачу"
                                titleStyle={{ color: '#d32f2f' }}
                            />
                        </Menu>
                    </View>

                    <View style={styles.taskMeta}>
                        {item.deadline && (
                            <Chip 
                                icon="calendar" 
                                mode="outlined"
                                style={[
                                    styles.deadlineChip,
                                    new Date(item.deadline) < new Date() && !item.isCompleted && styles.overdueChip
                                ]}
                            >
                                {new Date(item.deadline).toLocaleDateString('ru-RU')}
                            </Chip>
                        )}
                        
                        <Chip 
                            icon={item.isCompleted ? "check-circle" : "clock"}
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                item.isCompleted ? styles.completedChip : styles.pendingChip
                            ]}
                        >
                            {item.isCompleted ? "Выполнено" : "В процессе"}
                        </Chip>
                    </View>

                    {hasAttachments && (
                        <View style={styles.attachmentsSection}>
                            <TouchableOpacity 
                                style={styles.attachmentsHeader}
                                onPress={() => toggleTaskExpand(item.id)}
                            >
                                <Text variant="bodyMedium" style={styles.attachmentsTitle}>
                                    Вложения ({item.attachmentsCount || 0})
                                </Text>
                                <IconButton
                                    icon={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <TaskAttachments taskId={item.id} />
                            )}
                        </View>
                    )}

                    <Text variant="bodySmall" style={styles.createdAtText}>
                        Создано: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
                    </Text>
                </Card.Content>
            </Card>
        );
    };

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="headlineMedium" style={styles.errorText}>
                    Ошибка загрузки задач
                </Text>
                <Text variant="bodyMedium" style={styles.errorDescription}>
                    {error?.message || ''}
                </Text>
                <Button 
                    mode="contained" 
                    icon="refresh" 
                    onPress={() => refetch()}
                    style={styles.retryButton}
                >
                    Попробовать снова
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content 
                    title="Мои задачи" 
                    titleStyle={styles.headerTitle}
                />
                <Appbar.Action 
                    icon="refresh" 
                    onPress={() => refetch()} 
                    disabled={isLoading}
                />
            </Appbar.Header>

            <FlatList
                data={allTasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl 
                        refreshing={isLoading} 
                        onRefresh={refetch}
                        colors={['#1976d2']}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Text variant="headlineMedium" style={styles.emptyTitle}>
                                📝
                            </Text>
                            <Text variant="titleMedium" style={styles.emptyText}>
                                Задач пока нет
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtext}>
                                Создайте первую задачу, нажав на кнопку ниже
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    hasNextPage ? (
                        <View style={styles.loadMoreContainer}>
                            <Button 
                                mode="outlined" 
                                onPress={loadMore}
                                loading={isLoading}
                            >
                                Загрузить еще
                            </Button>
                        </View>
                    ) : null
                }
            />

            <FAB
                style={styles.fab}
                icon="plus"
                label="Новая задача"
                onPress={() => setAddModalVisible(true)}
                color="white"
            />

            <Portal>
                <AddTaskModal
                    visible={addModalVisible}
                    studentId={studentId || 0}
                    onDismiss={() => setAddModalVisible(false)}
                />
                
                <ImageViewerModal />
            </Portal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    headerTitle: {
        fontWeight: '600',
        fontSize: 20,
    },
    listContent: { 
        padding: 16,
        paddingBottom: 100 
    },
    taskCard: { 
        backgroundColor: 'white', 
        elevation: 3,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    completedTask: {
        opacity: 0.7,
        backgroundColor: '#f8f9fa',
    },
    cardContent: {
        paddingVertical: 16,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskMainInfo: {
        flex: 1,
        marginRight: 8,
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    subjectText: {
        fontWeight: '600',
        fontSize: 18,
        color: '#1a1a1a',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#666',
    },
    descriptionText: {
        color: '#555',
        lineHeight: 20,
    },
    attachmentBadge: {
        backgroundColor: '#1976d2',
        marginLeft: 8,
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    deadlineChip: {
        backgroundColor: '#fff3e0',
    },
    overdueChip: {
        backgroundColor: '#ffebee',
        borderColor: '#d32f2f',
    },
    statusChip: {
        backgroundColor: '#f5f5f5',
    },
    completedChip: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
    },
    pendingChip: {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
    },
    attachmentsSection: {
        marginBottom: 12,
    },
    attachmentsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    attachmentsTitle: {
        fontWeight: '500',
        color: '#1976d2',
    },
    attachmentsContainer: {
        gap: 16,
    },
    attachmentsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    attachmentsError: {
        padding: 16,
        alignItems: 'center',
    },
    noAttachments: {
        padding: 16,
        alignItems: 'center',
    },
    noAttachmentsText: {
        color: '#999',
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    imagesSection: {
        gap: 8,
    },
    imagesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    imageAttachment: {
        position: 'relative',
        width: 120,
        height: 120,
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
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageName: {
        flex: 1,
        color: 'white',
        fontSize: 10,
        marginRight: 4,
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
        marginLeft: 12,
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
    documentActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createdAtText: {
        color: '#999',
        fontSize: 12,
        fontStyle: 'italic',
    },
    menu: {
        marginTop: 40,
    },
    fab: { 
        position: 'absolute', 
        margin: 16, 
        right: 0, 
        bottom: 0, 
        backgroundColor: '#1976d2',
        borderRadius: 28,
    },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    errorText: { 
        color: '#d32f2f', 
        marginBottom: 8,
        textAlign: 'center',
    },
    errorDescription: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#1976d2',
    },
    emptyContainer: { 
        padding: 40, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        color: '#999',
        textAlign: 'center',
    },
    loadMoreContainer: {
        padding: 20,
        alignItems: 'center',
    },
    // Стили для полноэкранного просмотра изображений
    imageViewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
    },
    imageViewerHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        zIndex: 10,
    },
    imageViewerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 16,
    },
    imageViewerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.7,
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        padding: 16,
        zIndex: 10,
    },
    prevButton: {
        left: 10,
    },
    nextButton: {
        right: 10,
    },
    imageViewerFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 16,
    },
    imageCounter: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    imageViewerActions: {
        flexDirection: 'row',
        gap: 8,
    },
});

export default StudyTasksScreen;