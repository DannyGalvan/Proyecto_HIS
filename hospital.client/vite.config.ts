/// <reference types="vitest" />
import { env } from "node:process";
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import compress from "vite-plugin-compression";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ""
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;

const certificateName = "hospital.client";
const certFilePath = join(baseFolder, `${certificateName}.pem`);
const keyFilePath = join(baseFolder, `${certificateName}.key`);

console.log(baseFolder);

if (!existsSync(baseFolder)) {
  mkdirSync(baseFolder, { recursive: true });
}

if (!existsSync(certFilePath) || !existsSync(keyFilePath)) {
  if (
    0 !==
    spawnSync(
      "dotnet",
      [
        "dev-certs",
        "https",
        "--export-path",
        certFilePath,
        "--format",
        "Pem",
        "--no-password",
      ],
      { stdio: "inherit" },
    ).status
  ) {
    throw new Error("Could not create certificate.");
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), compress(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/",
  envDir: "./",
  envPrefix: "VITE_",
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress annotation warnings from @microsoft/signalr
        if (warning.code === "INVALID_ANNOTATION") return;
        warn(warning);
      },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router"],
          "vendor-query": [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
          ],
          "vendor-heroui": ["@heroui/react", "@heroui/theme"],
          "vendor-signalr": ["@microsoft/signalr"],
          "vendor-calendar": [
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
            "@fullcalendar/timegrid",
          ],
          "vendor-utils": ["axios", "zustand", "zod", "framer-motion"],
        },
      },
    },
    cssMinify: "lightningcss",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "src/utils/**",
        "src/validations/**",
        "src/hooks/**",
        "src/stores/useAuthStore.ts",
        "src/stores/usePatientAuthStore.ts",
        "src/stores/useRangeOfDatesStore.ts",
        "src/stores/useErrorsStore.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/test-setup.*",
        "**/node_modules/**",
        "src/test-utils/**",
        "src/utils/tts.ts",
        "src/utils/viewTransition.ts",
        "src/hooks/useAppointmentHub.ts",
        "src/hooks/useAdminAppointmentHub.ts",
        "src/hooks/usePatientAppointmentHub.ts",
        "src/hooks/usePermissions.ts",
        "src/hooks/useAuth.ts",
        "src/hooks/useForm.ts",
        "src/hooks/useAuthorizationRoutes.tsx",
        "src/hooks/RootIndex.tsx",
        "src/routes/**",
      ],
      thresholds: {
        lines: 90,
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7266/api",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/hubs": {
        target: "https://localhost:7266",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    port: 60263,
    https: {
      key: readFileSync(keyFilePath),
      cert: readFileSync(certFilePath),
    },
  },
});
