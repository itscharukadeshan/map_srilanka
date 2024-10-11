/** @format */
export interface Overlay {
  key: string;
  color: string;
  strokeWidth: number;
}

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface OverlaySettingsProps {
  overlays: Overlay[];
  onUpdate: (key: string, updatedProperties: Partial<Overlay>) => void;
}
