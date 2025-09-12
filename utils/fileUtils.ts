import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/hosts";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";

const UMKD_FOLDER_KEY = "UMKD_FOLDER_URI";

const getOrRequestFolderUri = async (): Promise<string | null> => {
  try {
    const savedUri = await AsyncStorage.getItem(UMKD_FOLDER_KEY);
    if (savedUri) return savedUri;

    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted && permissions.directoryUri) {
      await AsyncStorage.setItem(UMKD_FOLDER_KEY, permissions.directoryUri);
      return permissions.directoryUri;
    } else {
      Alert.alert("Ошибка", "Вы не выбрали папку для сохранения файлов.");
      return null;
    }
  } catch (err) {
    console.error("Ошибка выбора папки:", err);
    Alert.alert("Ошибка", "Не удалось получить доступ к папке");
    return null;
  }
};

export const saveToFiles = async (
  fileName: string,
  studentId: string,
  subjectId: string,
  fileId: number
): Promise<string | null> => {
  try {
    const url = `${BASE_URL}/umkd/download-file?studentId=${studentId}&subjectId=${subjectId}&fileId=${fileId}`;
    console.log("Downloading from:", url);

    const tempPath = FileSystem.cacheDirectory + fileName;
    const downloadResult = await FileSystem.downloadAsync(url, tempPath);

    if (downloadResult.status !== 200) {
      throw new Error(`HTTP error: ${downloadResult.status}`);
    }
    console.log("File downloaded to:", downloadResult.uri);

    if (Platform.OS === "android") {
      const folderUri = await getOrRequestFolderUri();
      if (!folderUri) return null;

      try {
        // 🔹 Проверяем файлы в папке
        const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(folderUri);

        // 🔹 Ищем файл с таким же именем
        const existingFile = files.find(f => decodeURIComponent(f).endsWith(fileName));
        if (existingFile) {
          console.log("Deleting existing file:", existingFile);
          await FileSystem.StorageAccessFramework.deleteAsync(existingFile);
        }

        // 🔹 Создаём файл заново
        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          folderUri,
          fileName,
          "application/octet-stream"
        );

        // 🔹 Читаем скачанный файл и пишем
        const fileContent = await FileSystem.readAsStringAsync(downloadResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(destUri, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("File saved to:", destUri);
        return destUri;

      } catch (safError) {
        console.error("SAF error:", safError);
        return downloadResult.uri; // fallback: вернём временный файл
      }
    } else {
      // iOS → documentDirectory
      const destUri = FileSystem.documentDirectory + fileName;

      // Если файл уже есть → удаляем
      const fileInfo = await FileSystem.getInfoAsync(destUri);
      if (fileInfo.exists) {
        console.log("Deleting existing iOS file:", destUri);
        await FileSystem.deleteAsync(destUri, { idempotent: true });
      }

      await FileSystem.moveAsync({
        from: downloadResult.uri,
        to: destUri,
      });

      console.log("File moved to:", destUri);
      return destUri;
    }
  } catch (error: any) {
    console.error("Ошибка сохранения файла:", error);
    Alert.alert("Ошибка", "Не удалось сохранить файл: " + error.message);
    return null;
  }
};

const ensureFileUri = async (uri: string): Promise<string> => {
  if (uri.startsWith("file://")) return uri;

  if (uri.startsWith("content://")) {
    const fileName = uri.split("/").pop() || "file";
    const localUri = FileSystem.cacheDirectory + fileName;
    await FileSystem.copyAsync({ from: uri, to: localUri });
    return localUri;
  }

  throw new Error(`Неизвестный формат URI: ${uri}`);
};

// 👉 «Открыть файл» — системное меню, где юзер выберет Word / PDF viewer / и т.д.
export const openFile = async (uri: string) => {
  try {
    if (Platform.OS === "android") {
      // SAF URI или file:// → оба подхватываются
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: uri,
        flags: 1,
      });
    } else {
      // на iOS проще использовать sharing, он откроет встроенные вьюверы
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("iOS", "Открытие файла недоступно");
      }
    }
  } catch (err) {
    console.error("Ошибка открытия файла:", err);
    Alert.alert("Ошибка", "Не удалось открыть файл");
  }
};

// 👉 «Поделиться файлом» — системное меню для отправки в Telegram, WhatsApp и т.д.
export const shareFile = async (uri: string) => {
  try {
    const fileUri = await ensureFileUri(uri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { dialogTitle: "Поделиться файлом" });
    } else {
      Alert.alert("Ошибка", "Поделиться файлом недоступно");
    }
  } catch (err) {
    console.error("Ошибка при шаринге:", err);
    Alert.alert("Ошибка", "Не удалось поделиться файлом");
  }
};