/** @format */
import React from "react";
import * as htmlToImage from "html-to-image";
import { FileDown } from "lucide-react";

const ScreenshotButton: React.FC = () => {
  const takeScreenshot = () => {
    const mapContainer: HTMLElement | null =
      document.querySelector(".leaflet-container");

    if (!mapContainer) {
      return;
    } else {
      htmlToImage
        .toPng(mapContainer)
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "map-screenshot.png";
          link.click();
        })
        .catch((error: Error) => {
          console.error("Error taking screenshot:", error);
        });
    }
  };

  return (
    <button
      className='btn btn-ghost btn-outline btn-success'
      onClick={takeScreenshot}>
      <FileDown />
    </button>
  );
};

export default ScreenshotButton;
