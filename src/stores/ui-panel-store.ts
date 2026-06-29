"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

type PanelName = "invite-admin" | "edit-plan" | null;

interface UiPanelState {
  activePanel: PanelName;
  panelProps: Record<string, unknown> | null;
  openPanel: (name: Exclude<PanelName, null>, props?: Record<string, unknown>) => void;
  closePanel: () => void;
}

export const useUiPanelStore = create<UiPanelState>()(
  devtools(
    (set) => ({
      activePanel: null,
      panelProps: null,
      openPanel: (name, props = {}) => {
        set({ activePanel: name, panelProps: props });
      },
      closePanel: () => {
        set({ activePanel: null, panelProps: null });
      },
    }),
    { name: "ui-panel-store" }
  )
);
