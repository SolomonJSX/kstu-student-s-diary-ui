import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Modal, Text, TextInput, Button, Divider, HelperText, Menu } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { useSemesterSchedule } from "../../hooks/useSemesterSchedule";
import { useCreateStudyTask } from "../../hooks/useCreateStudyTask";
import { StudyTaskCreateDto } from "../../types/studyTaskType";

interface AddTaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  studentId: number;
}

export function AddTaskModal({ visible, onDismiss, studentId }: AddTaskModalProps) {
  const { data: schedule } = useSemesterSchedule(String(studentId));
  const { mutate: createTask, isPending } = useCreateStudyTask();

  const [form, setForm] = useState({
    subject: "",
    description: "",
    deadline: "", // ISO-строка или пусто
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const subjects = useMemo(() => {
    if (!schedule) return [];
    const allSubjects = Object.values(schedule).flat().map(s => s.subject);
    return Array.from(new Set(allSubjects));
  }, [schedule]);

  const handleAddTask = () => {
    if (!form.subject || !form.description) return;
    const taskData: StudyTaskCreateDto = {
      studentId,
      subject: form.subject,
      description: form.description,
      deadline: form.deadline || undefined, // ISO или undefined
    };
    createTask(taskData, {
      onSuccess: () => {
        onDismiss();
        setForm({ subject: "", description: "", deadline: "" });
      },
      onError: (error) => {
        console.error("Failed to create task:", error);
      }
    });
  };

  const showError = !form.subject || !form.description;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.modalTitle}>Новая задача</Text>
          <Divider style={styles.divider} />

          {/* Выбор предмета */}
          <View>
            <TextInput
              label="Предмет"
              value={form.subject}
              onFocus={() => setMenuVisible(true)}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="menu-down" onPress={() => setMenuVisible(true)} />}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
            >
              {subjects.map((subject) => (
                <Menu.Item
                  key={subject}
                  onPress={() => {
                    setForm({ ...form, subject });
                    setMenuVisible(false);
                  }}
                  title={subject}
                />
              ))}
            </Menu>
          </View>

          {/* Описание */}
          <TextInput
            label="Описание"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {/* Выбор дедлайна через календарь */}
          <TextInput
            label="Дедлайн (необязательно)"
            value={form.deadline ? new Date(form.deadline).toLocaleDateString() : ""}
            mode="outlined"
            style={styles.input}
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setDatePickerVisible(true)} />}
          />

          <DatePickerModal
            locale="ru"
            mode="single"
            visible={datePickerVisible}
            date={form.deadline ? new Date(form.deadline) : undefined}
            onDismiss={() => setDatePickerVisible(false)}
            onConfirm={({ date }) => {
              setDatePickerVisible(false);
              if (date) {
                setForm({ ...form, deadline: date.toISOString() });
              }
            }}
          />

          {showError && (
            <HelperText type="error" visible={showError}>
              Заполните предмет и описание
            </HelperText>
          )}

          {/* Кнопки */}
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Отмена
            </Button>
            <Button
              mode="contained"
              onPress={handleAddTask}
              disabled={isPending || showError}
              style={styles.addButton}
              loading={isPending}
            >
              Добавить
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  modalContent: {
    gap: 12,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  input: {
    marginVertical: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: { flex: 1, marginRight: 8 },
  addButton: { flex: 1, marginLeft: 8 },
});
