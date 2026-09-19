import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DEFAULT_REGION } from "@/constants/app";
import { useTheme } from "@/hooks/useTheme";
import {
  Coordinates,
  getCurrentPosition,
  PickedLocation,
} from "@/services/location";

type Props = {
  initial?: Coordinates;
  onConfirm: (location: PickedLocation) => void;
  onCancel: () => void;
};

const PIN_ZOOM = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function LocationPicker({ initial, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [pin, setPin] = useState<PickedLocation | null>(initial ?? null);
  const [locating, setLocating] = useState(false);

  // no pins => user's location, pins => pins locations
  useEffect(() => {
    if (initial) {
      return;
    }
    getCurrentPosition()
      .then((coords) =>
        mapRef.current?.animateToRegion({ ...coords, ...PIN_ZOOM }),
      )
      .catch(() => {});
  }, [initial]);

  async function useMyLocation() {
    setLocating(true);
    try {
      const coords = await getCurrentPosition();
      setPin(coords);
      mapRef.current?.animateToRegion({ ...coords, ...PIN_ZOOM });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("location.unavailableMessage");
      Alert.alert(t("location.unavailableTitle"), message);
    } finally {
      setLocating(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 8,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {t("location.pickLocation")}
          </Text>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            hitSlop={8}
          >
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initial ? { ...initial, ...PIN_ZOOM } : DEFAULT_REGION}
          onPress={(event) => setPin(event.nativeEvent.coordinate)}
          onPoiClick={(event) =>
            setPin({
              ...event.nativeEvent.coordinate,
              name: event.nativeEvent.name,
            })
          }
          showsUserLocation
        >
          {pin && (
            <Marker
              coordinate={pin}
              draggable
              onDragEnd={(event) => setPin(event.nativeEvent.coordinate)}
            />
          )}
        </MapView>

        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {pin
              ? (pin.name ??
                `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`)
              : t("location.hint")}
          </Text>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <Button
                title={
                  locating ? t("location.locating") : t("location.useMyLocation")
                }
                icon="locate-outline"
                variant="secondary"
                onPress={useMyLocation}
                disabled={locating}
              />
            </View>
            <View style={styles.button}>
              <Button
                title={t("location.confirm")}
                icon="checkmark"
                onPress={() => pin && onConfirm(pin)}
                disabled={!pin}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  bottomBar: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  hint: {
    fontSize: 14,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
  },
});
