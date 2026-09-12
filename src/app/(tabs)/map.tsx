import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

import { DEFAULT_REGION } from "@/constants/app";
import { statusColors, statusLabels } from "@/constants/status";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/store/taskStore";
import { Task } from "@/types/task";

type LocatedTask = Task & { latitude: number; longitude: number };

function hasLocation(task: Task): task is LocatedTask {
  return task.latitude != null && task.longitude != null;
}

export default function MapScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useTasks((state) => state.tasks);
  const mapRef = useRef<MapView>(null);

  const locatedTasks = useMemo(() => tasks.filter(hasLocation), [tasks]);

  const fitToPins = useCallback(() => {
    if (locatedTasks.length === 0) {
      return;
    }
    mapRef.current?.fitToCoordinates(
      locatedTasks.map((task) => ({
        latitude: task.latitude,
        longitude: task.longitude,
      })),
      {
        edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
        animated: true,
      },
    );
  }, [locatedTasks]);

  useFocusEffect(fitToPins);

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onMapReady={fitToPins}
        showsUserLocation
      >
        {locatedTasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            pinColor={statusColors[task.status]}
            accessibilityLabel={`${task.title}, ${statusLabels[task.status]}`}
          >
            <Callout onPress={() => router.push(`/task/${task.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.calloutMeta} numberOfLines={1}>
                  {statusLabels[task.status]} · {task.address}
                </Text>
                <Text style={styles.calloutHint}>Tap to open</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {locatedTasks.length === 0 && (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            No tasks on the map yet
          </Text>
          <Text style={[styles.bannerText, { color: colors.textMuted }]}>
            Add a map pin to a task from its form and it will show up here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 220,
    gap: 2,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#14161A",
  },
  calloutMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  calloutHint: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 2,
  },
  banner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
