import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "TaskMaster",
  slug: "taskmaster",
  owner: "mofauntou",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "taskmaster",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],
  android: {
    package: "com.khozhimatov.taskmaster",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "TaskMaster uses your location to center the map when picking a task location.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "TaskMaster needs photo access to attach images to tasks.",
        cameraPermission:
          "TaskMaster needs the camera to take photos for tasks.",
      },
    ],
    "expo-notifications",
    "expo-document-picker",
    "expo-sharing",
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "e3d8bbad-fdf5-4f92-a2d5-66c72a99514a",
    },
  },
};

export default config;
