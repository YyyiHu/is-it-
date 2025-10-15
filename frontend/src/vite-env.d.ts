/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Vue 3 global types
declare module "vue" {
  export * from "@vue/runtime-dom";
}

// Lucide Vue Next types
declare module "lucide-vue-next" {
  import { DefineComponent } from "vue";
  export const X: DefineComponent;
  export const Edit: DefineComponent;
  export const Trash2: DefineComponent;
  export const Calendar: DefineComponent;
  export const Eye: DefineComponent;
  export const Clock: DefineComponent;
  export const Settings: DefineComponent;
  export const User: DefineComponent;
  export const LogOut: DefineComponent;
  export const RotateCcw: DefineComponent;
  export const Loader2: DefineComponent;
  export const Plus: DefineComponent;
  export const Save: DefineComponent;
  export const ChevronLeft: DefineComponent;
  export const ChevronRight: DefineComponent;
  export const History: DefineComponent;
  export const Send: DefineComponent;
  export const PenTool: DefineComponent;
  export const PencilLine: DefineComponent;
  export const LogIn: DefineComponent;
  export const UserPlus: DefineComponent;
}

// TanStack Vue Query types
declare module "@tanstack/vue-query" {
  import { Ref } from "vue";

  export function useInfiniteQuery(options: any): any;
  export function useMutation(options: any): any;
  export function useQuery(options: any): any;
  export const queryClient: any;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
