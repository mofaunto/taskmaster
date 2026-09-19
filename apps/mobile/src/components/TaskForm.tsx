import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { LocationPicker } from "@/components/LocationPicker";
import { TextField } from "@/components/TextField";
import { DEMO_SECONDS, REMINDER_MINUTES } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
import { Coordinates, getAddress, PickedLocation } from "@/services/location";
import { useSettings } from "@/store/settingsStore";
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
  location: Coordinates | null;
};

export function TaskForm({ initialValues, submitLabel, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const demoReminders = useSettings((state) => state.demoReminders);

  const [values, setValues] = useState<FormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    address: initialValues?.address ?? "",
    dueAt: initialValues ? new Date(initialValues.dueAt) : null,
    location:
      initialValues?.latitude != null && initialValues.longitude != null
        ? {
            latitude: initialValues.latitude,
            longitude: initialValues.longitude,
          }
        : null,
  });
  const [errors, setErrors] = useState<TaskErrors>({});
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [lookingUpAddress, setLookingUpAddress] = useState(false);
  const [addressFromPin, setAddressFromPin] = useState(false);

  function setField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handlePickerChange(date: Date) {
    setPicker(null);
    setField("dueAt", date);
  }

  async function handleLocationPicked(location: PickedLocation) {
    setMapOpen(false);
    setField("location", {
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (values.address.trim() !== "" && !addressFromPin) {
      return;
    }

    setLookingUpAddress(true);
    const street = await getAddress(location);
    setLookingUpAddress(false);

    const address = [location.name, street].filter(Boolean).join(", ");
    if (address) {
      setField("address", address);
      setAddressFromPin(true);
    }
  }

  function handleSubmit() {
    const input: TaskInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      address: values.address.trim(),
      dueAt: values.dueAt ? values.dueAt.toISOString() : "",
      latitude: values.location?.latitude,
      longitude: values.location?.longitude,
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

  const minutesUntilDue = values.dueAt
    ? (values.dueAt.getTime() - Date.now()) / 60000
    : null;
  const reminderNote = demoReminders
    ? t("form.demoNote", { seconds: DEMO_SECONDS })
    : minutesUntilDue !== null &&
        minutesUntilDue > 0 &&
        minutesUntilDue < REMINDER_MINUTES
      ? t("form.dueSoonNote", { minutes: REMINDER_MINUTES })
      : null;

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
          label={t("form.title")}
          value={values.title}
          onChangeText={(text) => setField("title", text)}
          placeholder={t("form.titlePlaceholder")}
          error={errors.title && t(errors.title)}
          maxLength={100}
        />

        <TextField
          label={t("form.description")}
          value={values.description}
          onChangeText={(text) => setField("description", text)}
          placeholder={t("form.descriptionPlaceholder")}
          error={errors.description && t(errors.description)}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.due")}
          </Text>
          <View style={styles.dueRow}>
            <Pressable
              onPress={() => setPicker("date")}
              accessibilityRole="button"
              accessibilityLabel={t("form.pickDateLabel")}
              style={[styles.pickerButton, pickerStyle]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.pickerText,
                  { color: dueIso ? colors.text : colors.textMuted },
                ]}
              >
                {dueIso ? formatDate(dueIso, i18n.language) : t("form.pickDate")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPicker("time")}
              accessibilityRole="button"
              accessibilityLabel={t("form.pickTimeLabel")}
              style={[styles.pickerButton, pickerStyle]}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.pickerText,
                  { color: dueIso ? colors.text : colors.textMuted },
                ]}
              >
                {dueIso ? formatTime(dueIso, i18n.language) : t("form.pickTime")}
              </Text>
            </Pressable>
          </View>
          {errors.dueAt && (
            <Text style={[styles.error, { color: colors.danger }]}>
              {t(errors.dueAt)}
            </Text>
          )}
          {!errors.dueAt && reminderNote && (
            <Text style={[styles.note, { color: colors.warning }]}>
              {reminderNote}
            </Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("form.mapPin")}
          </Text>
          {values.location ? (
            <View
              style={[
                styles.pinRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.pinText, { color: colors.text }]}>
                {values.location.latitude.toFixed(5)},{" "}
                {values.location.longitude.toFixed(5)}
              </Text>
              <Pressable
                onPress={() => setMapOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={t("form.changePin")}
                hitSlop={8}
              >
                <Text style={[styles.pinAction, { color: colors.primary }]}>
                  {t("common.change")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setField("location", null)}
                accessibilityRole="button"
                accessibilityLabel={t("form.removePin")}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          ) : (
            <Button
              title={t("form.pickOnMap")}
              icon="map-outline"
              variant="secondary"
              onPress={() => setMapOpen(true)}
            />
          )}
        </View>

        <TextField
          label={t("form.address")}
          value={values.address}
          onChangeText={(text) => {
            setField("address", text);
            setAddressFromPin(false);
          }}
          placeholder={
            lookingUpAddress
              ? t("form.lookingUpAddress")
              : t("form.addressPlaceholder")
          }
          error={errors.address && t(errors.address)}
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

      {mapOpen && (
        <LocationPicker
          initial={values.location ?? undefined}
          onConfirm={handleLocationPicked}
          onCancel={() => setMapOpen(false)}
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
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  pinText: {
    flex: 1,
    fontSize: 15,
  },
  pinAction: {
    fontSize: 15,
    fontWeight: "600",
  },
});
