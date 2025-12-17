import type { InitialData } from "@/App";

declare global {
  interface Window {
    __INITIAL_DATA__: InitialData;
  }
}
