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
  fileId: number,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  try {
    const folderUri = await getOrRequestFolderUri();
    if (!folderUri) return null;

    const url = `${BASE_URL}/umkd/download-file?studentId=${studentId}&subjectId=${subjectId}&fileId=${fileId}`;
    console.log("Downloading from:", url);

    // ⬇️ сначала качаем во временный файл
    const tempPath = FileSystem.cacheDirectory + fileName;
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      tempPath,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;

        if (onProgress) {
          onProgress(Math.max(0, Math.round(progress * 100)));
        }
      }
    );

    const res = await downloadResumable.downloadAsync();
    if (!res || res.status !== 200) {
      throw new Error("Ошибка скачивания");
    }

    // ⬆️ читаем временный файл в base64
    const base64Content = await FileSystem.readAsStringAsync(res.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 📂 создаём файл в выбранной папке SAF
    const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
      folderUri,
      fileName,
      "application/octet-stream"
    );

    // ✍ пишем в content:// файл
    await FileSystem.writeAsStringAsync(destUri, base64Content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("✅ File saved to:", destUri);
    return destUri; // теперь у нас content://
  } catch (error: any) {
    console.error("❌ Ошибка скачивания:", error);
    Alert.alert("Ошибка", error.message || "Не удалось скачать файл");
    return null;
  }
};



const ensureFileUri = async (uri: string): Promise<string> => {
  if (uri.startsWith("content://")) {
    return uri; // всё ок
  }

  if (uri.startsWith("file://")) {
    // 📂 сохраняем во временный SAF файл, чтобы получить content://
    const folderUri = await getOrRequestFolderUri();
    if (!folderUri) throw new Error("Нет доступа к папке для сохранения файлов");

    const fileName = uri.split("/").pop() || "file.pdf";
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
      folderUri,
      fileName,
      "application/pdf"
    );

    await FileSystem.writeAsStringAsync(destUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return destUri; // теперь content://
  }

  throw new Error(`Неизвестный формат URI: ${uri}`);
};


// 👉 «Открыть файл» — системное меню, где юзер выберет Word / PDF viewer / и т.д.
export const openFile = async (uri: string) => {
  try {
    const safeUri = await ensureFileUri(uri); // теперь всегда content://

    if (Platform.OS === "android") {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: safeUri,
        flags: 1,
      });
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(safeUri);
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
    let fileUri = uri;

    // Expo Sharing принимает только file://
    if (uri.startsWith("content://")) {
      const fileName = uri.split("/").pop() || "file";
      const tempPath = FileSystem.cacheDirectory + fileName;

      // копируем из SAF → cache
      await FileSystem.copyAsync({ from: uri, to: tempPath });
      fileUri = tempPath;
    }

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
