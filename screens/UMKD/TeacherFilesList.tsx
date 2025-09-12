// components/TeacherFilesList.tsx
import React from 'react';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { View, StyleSheet, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTeacherFiles } from '../../hooks/useTeacherFiles';// Импортируем новый компонент
import { DownloadButton } from './DowloadButton';

type TeacherFilesListProps = {
    studentId: string;
    subjectId: string;
};

export const TeacherFilesList = ({ studentId, subjectId }: TeacherFilesListProps) => {
    const { data, isLoading, error, refetch } = useTeacherFiles({
        studentId,
        subjectId,
    });

    const getFileIcon = (fileName: string) => {
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.pdf')) return { name: 'book-open-variant', color: '#d32f2f' };
        if (lower.endsWith('.doc') || lower.endsWith('.docx'))
            return { name: 'file-word', color: '#2962ff' };
        if (lower.endsWith('.xls') || lower.endsWith('.xlsx'))
            return { name: 'file-excel', color: '#2e7d32' };
        if (lower.endsWith('.ppt') || lower.endsWith('.pptx'))
            return { name: 'file-powerpoint', color: '#e64a19' };
        if (lower.endsWith('.zip') || lower.endsWith('.rar'))
            return { name: 'folder-zip', color: '#ff8f00' };
        return { name: 'file-document-outline', color: '#6200ee' };
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator animating={true} size="large" />
                <Text style={styles.loadingText}>Загрузка файлов...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#d32f2f" />
                <Text style={styles.errorText}>Ошибка загрузки файлов</Text>
                <Button mode="contained" onPress={() => refetch()}>
                    Повторить попытку
                </Button>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="file-cancel" size={48} color="#999" />
                <Text style={styles.emptyText}>Файлы не найдены</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(teacher, index) => `${teacher.teacherName}_${index}`}
            renderItem={({ item: teacher }) => (
                <View style={styles.teacherSection}>
                    <View style={styles.teacherHeader}>
                        <MaterialCommunityIcons name="account-tie" size={22} color="#555" />
                        <Text variant="titleMedium" style={styles.teacherName}>
                            {teacher.teacherName}
                        </Text>
                    </View>
                    <FlatList
                        data={teacher.files}
                        keyExtractor={(file) => file.id.toString()}
                        renderItem={({ item: file }) => {
                            const icon = getFileIcon(file.fileName);
                            return (
                                <Card style={styles.fileCard} mode="elevated">
                                    <Card.Content>
                                        <View style={styles.fileHeader}>
                                            <MaterialCommunityIcons
                                                name={icon.name}
                                                size={28}
                                                color={icon.color}
                                            />
                                            <Text variant="titleMedium" style={styles.fileName}>
                                                {file.fileName}
                                            </Text>
                                        </View>
                                        <Text variant="bodySmall" style={styles.fileDescription}>
                                            {file.description || file.fileType}
                                        </Text>
                                        <View style={styles.fileMeta}>
                                            <Text variant="bodySmall">📦 {file.size}</Text>
                                            <Text variant="bodySmall">⬇ {file.downloads}</Text>
                                            <Text variant="bodySmall">📅 {file.uploadDate}</Text>
                                        </View>
                                        <DownloadButton
                                            studentId={studentId}
                                            subjectId={subjectId}
                                            fileId={file.id}
                                            fileName={file.fileName}
                                        />
                                    </Card.Content>
                                </Card>
                            );
                        }}
                    />
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    teacherSection: {
        marginBottom: 28,
    },
    teacherHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    teacherName: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#333',
    },
    fileCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 2,
    },
    fileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    fileName: {
        marginLeft: 10,
        flex: 1,
        flexWrap: 'wrap',
    },
    fileDescription: {
        marginBottom: 6,
        color: '#666',
    },
    fileMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        color: '#d32f2f',
        marginVertical: 10,
    },
    emptyText: {
        color: '#666',
        marginTop: 10,
    },
});
