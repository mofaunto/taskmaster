import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AttachmentList } from "@/components/AttachmentList";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { HistoryItem } from "@/components/HistoryItem";
import { Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { SyncBadge } from "@/components/SyncBadge";
import { useTheme } from "@/hooks/useTheme";
import { pickFile, pickImage, takePhoto } from "@/services/attachments";
import { useHistory } from "@/store/historyStore";
import { useTasks } from "@/store/taskStore";
import { Attachment, TaskStatus } from "@/types/task";
import { formatDateTime } from "@/utils/date";

type StatusAction = {
  label: string;
  status: TaskStatus;
  variant: "primary" | "secondary";
};

const statusActions: Record<TaskStatus, StatusAction[]> = {
  new: [
    { label: "Start", status: "in_progress", variant: "primary" },
    { label: "Cancel", status: "cancelled", variant: "secondary" },
  ],
  in_progress: [
    { label: "Complete", status: "completed", variant: "primary" },
    { label: "Cancel", status: "cancelled", variant: "secondary" },
  ],
  completed: [{ label: "Reopen", status: "new", variant: "secondary" }],
  cancelled: [{ label: "Reopen", status: "new", variant: "secondary" }],
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const task = useTasks((state) => state.tasks.find((item) => item.id === id));
  const setStatus = useTasks((state) => state.setStatus);
  const deleteTask = useTasks((state) => state.deleteTask);
  const addAttachment = useTasks((state) => state.addAttachment);
  const removeAttachment = useTasks((state) => state.removeAttachment);
  const entries = useHistory((state) => state.entries);

  if (!task) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Task not found"
          message="It may have been deleted."
        />
      </View>
    );
  }

  const taskHistory = entries.filter((entry) => entry.taskId === task.id);
  const isOpen = task.status === "new" || task.status === "in_progress";
  const overdue = isOpen && new Date(task.dueAt) < new Date();

  const attach = async (pick: () => Promise<Attachment | null>) => {
    try {
      const attachment = await pick();
      if (attachment) {
        addAttachment(task.id, attachment);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      Alert.alert("Could not add attachment", message);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTask(task.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/task/${task.id}/edit`)}
              accessibilityRole="button"
              accessibilityLabel="Edit task"
              hitSlop={8}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color={colors.primary}
              />
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
        <View style={styles.badges}>
          <StatusBadge status={task.status} />
          <SyncBadge status={task.syncStatus} />
        </View>
      </View>

      <Section title="Details">
        <DetailRow
          icon="calendar-outline"
          text={formatDateTime(task.dueAt) + (overdue ? " · Overdue" : "")}
          color={overdue ? colors.danger : colors.text}
        />
        <DetailRow
          icon="location-outline"
          text={task.address}
          color={colors.text}
        />
        {task.latitude != null && task.longitude != null && (
          <DetailRow
            icon="navigate-outline"
            text={`${task.latitude.toFixed(5)}, ${task.longitude.toFixed(5)}`}
            color={colors.textMuted}
          />
        )}
      </Section>

      <Section title="Description">
        <Text style={[styles.description, { color: colors.text }]}>
          {task.description}
        </Text>
      </Section>

      <Section title="Attachments">
        <AttachmentList
          attachments={task.attachments}
          onRemove={(attachment) => removeAttachment(task.id, attachment.id)}
        />
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              title="Camera"
              icon="camera-outline"
              variant="secondary"
              onPress={() => attach(takePhoto)}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              title="Gallery"
              icon="images-outline"
              variant="secondary"
              onPress={() => attach(pickImage)}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              title="File"
              icon="document-attach-outline"
              variant="secondary"
              onPress={() => attach(pickFile)}
            />
          </View>
        </View>
      </Section>

      <Section title="Status">
        <View style={styles.actions}>
          {statusActions[task.status].map((action) => (
            <View key={action.status} style={styles.actionButton}>
              <Button
                title={action.label}
                variant={action.variant}
                onPress={() => setStatus(task.id, action.status)}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section title="History">
        {taskHistory.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </Section>

      <Button
        title="Delete task"
        variant="danger"
        icon="trash-outline"
        onPress={confirmDelete}
      />
    </ScrollView>
  );
}

function DetailRow({
  icon,
  text,
  color,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  text: string;
  color: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.detailText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  header: {
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 16,
    flexShrink: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
