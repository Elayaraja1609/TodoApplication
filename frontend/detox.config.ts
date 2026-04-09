import type { DetoxConfig } from "detox";

const config: DetoxConfig = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e/mobile/jest.config.js",
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/todo-task-app.app",
      build:
        "xcodebuild -workspace ios/todo-task-app.xcworkspace -scheme todo-task-app -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      reversePorts: [5000, 8081],
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 15",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_7_API_34",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
};

export default config;
