import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

const subscribe = (listener: () => void) => onlineManager.subscribe(listener);
const isOnline = () => onlineManager.isOnline();

// TanStack Query pauses requests while offline instead of failing them, so the page says why.
export const useOnline = () => useSyncExternalStore(subscribe, isOnline);
