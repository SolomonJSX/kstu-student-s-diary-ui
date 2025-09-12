// components/DownloadButton.tsx
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { StyleSheet, Alert } from "react-native";
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
  const [fileUri, setFileUri] = useState<string | null>(null);

  const downloadFile = async () => {
    try {
      setIsDownloading(true);
      const uri = await saveToFiles(fileName, studentId, subjectId, fileId);
      if (uri) setFileUri(uri);
    } catch (error) {
      console.error("Ошибка скачивания файла:", error);
      Alert.alert("Ошибка", "Не удалось скачать файл.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        mode="contained"
        style={styles.downloadButton}
        onPress={downloadFile}
        loading={isDownloading}
        disabled={isDownloading}
      >
        Скачать
      </Button>
      {fileUri && (
        <>
          <OpenButton uri={fileUri} />
          <ShareButton uri={fileUri} />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    marginTop: 12,
    backgroundColor: "#6200ee",
  },
});
