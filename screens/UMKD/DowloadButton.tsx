// components/DownloadButton.tsx
import React, { useEffect, useState } from "react";
import { Button, ProgressBar, Text } from "react-native-paper";
import { StyleSheet, Alert, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { saveToFiles } from "../../utils/fileUtils";
import { ShareButton } from "./ShareButton";
import { OpenButton } from "./OpenButton";

type DownloadButtonProps = {
  studentId: string;
  subjectId: string;
  fileId: number;
  fileName: string;
};

export const DownloadButton = ({
  studentId,
  subjectId,
  fileId,
  fileName,
}: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUri, setFileUri] = useState<string | null>(null);

  // 👇 при монтировании проверяем — а вдруг файл уже есть?
  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const localPath = FileSystem.cacheDirectory + fileName;
        const info = await FileSystem.getInfoAsync(localPath);
        if (info.exists) {
          setFileUri(localPath);
        }
      } catch (e) {
        console.warn("Ошибка при проверке файла:", e);
      }
    };
    checkFileExists();
  }, [fileName]);

  const downloadFile = async () => {
    try {
      setIsDownloading(true);
      setProgress(0);

      const uri = await saveToFiles(
        fileName,
        studentId,
        subjectId,
        fileId,
        setProgress
      );

      if (uri) setFileUri(uri);
    } catch (error) {
      console.error("Ошибка скачивания файла:", error);
      Alert.alert("Ошибка", "Не удалось скачать файл.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Button
        mode="contained"
        style={styles.downloadButton}
        onPress={downloadFile}
        loading={isDownloading}
        disabled={isDownloading}
      >
        {fileUri ? "Перескачать" : "Скачать"}
      </Button>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress}%</Text>
          <ProgressBar
            progress={progress / 100}
            color="#6200ee"
            style={styles.progressBar}
          />
        </View>
      )}

      {/* Если файл есть, показываем кнопки открыть и поделиться */}
      {fileUri && !isDownloading && (
        <>
          <OpenButton uri={fileUri} />
          <ShareButton uri={fileUri} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    backgroundColor: "#6200ee",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    textAlign: "center",
    marginBottom: 4,
    fontSize: 12,
    color: "#555",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
  },
});
