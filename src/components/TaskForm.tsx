import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useTheme } from "@/hooks/useTheme";
import { TaskInput } from "@/types/task";
import { formatDate, formatTime } from "@/utils/date";
import { TaskErrors, validateTask } from "@/utils/validateTask";

type Props = {
  initialValues?: TaskInput;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void;
};

type FormValues = {
  title: string;
  description: string;
  address: string;
  dueAt: Date | null;
};

export function TaskForm({ initialValues, submitLabel, onSubmit }: Props) {
  const { colors } = useTheme();

  const [values, setValues] = useState<FormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    address: initialValues?.address ?? "",
    dueAt: initialValues ? new Date(initialValues.dueAt) : null,
  });
  const [errors, setErrors] = useState<TaskErrors>({});
  const [picker, setPicker] = useState<"date" | "time" | null>(null);

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handlePickerChange(date: Date) {
    setPicker(null);
    setField("dueAt", date);
  }

  function handleSubmit() {
    const input: TaskInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      address: values.address.trim(),
      dueAt: values.dueAt ? values.dueAt.toISOString() : "",
      latitude: initialValues?.latitude,
      longitude: initialValues?.longitude,
    };

    const nextErrors = validateTask(input, initialValues?.dueAt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    onSubmit(input);
  }

  const dueIso = values.dueAt?.toISOString();
  const pickerStyle = {
    backgroundColor: colors.card,
    borderColor: errors.dueAt ? colors.danger : colors.border,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Title"
          value={values.title}
          onChangeText={(text) => setField("title", text)}
          placeholder="What needs to be done?"
          error={errors.title}
          maxLength={100}
        />

        <TextField
          label="Description"
          value={values.description}
          onChangeText={(text) => setField("description", text)}
          placeholder="Details for the technician"
          error={errors.description}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Due</Text>
          <View style={styles.dueRow}>
            <Pressable
              onPress={() => setPicker("date")}
              accessibilityRole="button"
              accessibilityLabel="Pick due date"
              style={[styles.pickerButton, pickerStyle]}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.pickerText, { color: dueIso ? colors.text : colors.textMuted }]}>
                {dueIso ? formatDate(dueIso) : "Pick date"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPicker("time")}
              accessibilityRole="button"
              accessibilityLabel="Pick due time"
              style={[styles.pickerButton, pickerStyle]}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.pickerText, { color: dueIso ? colors.text : colors.textMuted }]}>
                {dueIso ? formatTime(dueIso) : "Pick time"}
              </Text>
            </Pressable>
          </View>
          {errors.dueAt && (
            <Text style={[styles.error, { color: colors.danger }]}>{errors.dueAt}</Text>
          )}
        </View>

        <TextField
          label="Address"
          value={values.address}
          onChangeText={(text) => setField("address", text)}
          placeholder="Street, building, city"
          error={errors.address}
        />

        <Button title={submitLabel} onPress={handleSubmit} />
      </ScrollView>

      {picker && (
        <DateTimePicker
          value={values.dueAt ?? new Date()}
          mode={picker}
          onValueChange={(_, date) => handlePickerChange(date)}
          onDismiss={() => setPicker(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  dueRow: {
    flexDirection: "row",
    gap: 10,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  pickerText: {
    fontSize: 16,
  },
  error: {
    fontSize: 13,
  },
});
