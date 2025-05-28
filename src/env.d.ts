/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_COLLAB_SERVER_URL?: string;
  }
} 