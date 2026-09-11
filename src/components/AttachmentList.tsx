import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { attachmentExists } from "@/services/attachments";
import { Attachment } from "@/types/task";

type Props = {
  attachments: Attachment[];
  onRemove: (attachment: Attachment) => void;
};

function formatSize(bytes?: number) {
  if (!bytes) {
    return "";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ attachments, onRemove }: Props) {
  const { colors } = useTheme();

  async function open(attachment: Attachment) {
    if (!attachmentExists(attachment)) {
      Alert.alert("File unavailable", "This file is no longer on the device.");
      return;
    }
    try {
      await Sharing.shareAsync(attachment.uri, { mimeType: attachment.mimeType });
    } catch {
      Alert.alert("Could not open file", "No app on this phone can open it.");
    }
  }

  function confirmRemove(attachment: Attachment) {
    Alert.alert("Remove attachment?", attachment.name, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemove(attachment) },
    ]);
  }

  if (attachments.length === 0) {
    return (
      <Text style={[styles.empty, { color: colors.textMuted }]}>
        No attachments yet
      </Text>
    );
  }

  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind === "file");

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <View style={styles.grid}>
          {images.map((attachment) => {
            const exists = attachmentExists(attachment);
            return (
              <Pressable
                key={attachment.id}
                onPress={() => open(attachment)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Open image ${attachment.name}`}
                style={[styles.tile, { backgroundColor: colors.background }]}
              >
                {exists ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={styles.image}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.missing}>
                    <Ionicons name="image-outline" size={26} color={colors.textMuted} />
                    <Text style={[styles.missingText, { color: colors.textMuted }]}>
                      Unavailable
                    </Text>
                  </View>
                )}
                <RemoveButton onPress={() => confirmRemove(attachment)} />
              </Pressable>
            );
          })}
        </View>
      )}

      {files.map((attachment) => {
        const exists = attachmentExists(attachment);
        return (
          <Pressable
            key={attachment.id}
            onPress={() => open(attachment)}
            accessibilityRole="button"
            accessibilityLabel={`Open file ${attachment.name}`}
            style={[styles.fileRow, { borderColor: colors.border }]}
          >
            <Ionicons
              name={exists ? "document-outline" : "alert-circle-outline"}
              size={22}
              color={exists ? colors.primary : colors.textMuted}
            />
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                {exists ? formatSize(attachment.size) : "File unavailable"}
              </Text>
            </View>
            <Pressable
              onPress={() => confirmRemove(attachment)}
              accessibilityLabel={`Remove ${attachment.name}`}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={22} color={colors.textMuted} />
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Remove attachment"
      hitSlop={8}
      style={styles.removeButton}
    >
      <Ionicons name="close" size={16} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  empty: {
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: 96,
    height: 96,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  missingText: {
    fontSize: 12,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
  },
  fileMeta: {
    fontSize: 13,
  },
});
