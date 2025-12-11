/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUBMIT_ENDPOINT: string;
    readonly VITE_TELEGRAM_CHANNEL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
