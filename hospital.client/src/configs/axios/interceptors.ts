import axios from "axios";

import {
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "../../types/errors";
import type { InitialAuth } from "../../types/InitialAuth";
import { API_URL } from "../constants";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    common: {
      Accept: "application/json",
      Authorization: "",
      "Content-Type": "application/json",
    },
    Authorization: "",
  },
});

export const authorization = api.interceptors.response.use(
  async (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;

    if (response.status === 401) {
      throw new UnauthorizedError(
        "Tu sesión ha expirado vuelve a iniciar sesión",
      );
    } else if (response.status == 400) {
      return response.data;
    } else if (response.status == 403) {
      throw new ForbiddenError(
        "No tienes permisos para realizar esta acción contacta con el administrador",
      );
    } else if (response.status == 500) {
      throw new InternalServerError(
        "Hubo un error en el servidor, Notifica al desarrollador",
      );
    }

    return response.data;
  },
);

api.interceptors.request.use((config) => {
  if (
    config.headers.Authorization === undefined ||
    config.headers.Authorization === "" ||
    config.headers.Authorization === null ||
    config.headers.Authorization === "Bearer " ||
    config.headers.Authorization === "Bearer undefined"
  ) {
    // Determine context: if the current URL is in the portal, prefer patient auth
    const isPortalContext = window.location.pathname.startsWith("/portal");

    if (isPortalContext) {
      // In portal context, try patient auth first
      const storedPatient = window.localStorage.getItem("@patient-auth");
      if (storedPatient) {
        try {
          const parsed = JSON.parse(storedPatient) as { state?: { token?: string }; token?: string };
          const token = parsed?.state?.token ?? parsed?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          }
        } catch {
          // Ignore malformed storage
        }
      }
    }

    // Default: try admin auth
    const storedAdmin = window.localStorage.getItem("@auth");
    if (storedAdmin) {
      try {
        const { token }: InitialAuth = JSON.parse(storedAdmin);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch {
        // Ignore malformed storage
      }
    }

    // Fallback: try patient auth (for non-portal pages that still need patient token)
    if (!isPortalContext) {
      const storedPatient = window.localStorage.getItem("@patient-auth");
      if (storedPatient) {
        try {
          const parsed = JSON.parse(storedPatient) as { state?: { token?: string }; token?: string };
          const token = parsed?.state?.token ?? parsed?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Ignore malformed storage
        }
      }
    }
  }

  return config;
});

export const setAuthorization = (token: string) => {
  if (token !== undefined && token !== null && token !== "") {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    api.defaults.headers.common["Authorization"] = "";
    api.defaults.headers.Authorization = "";
  }
};
