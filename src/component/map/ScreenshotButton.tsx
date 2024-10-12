/** @format */
import React, { useState } from "react";
import * as htmlToImage from "html-to-image";
import { FileDown } from "lucide-react";

const ScreenshotButton: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const takeScreenshot = () => {
    const mapContainer: HTMLElement | null =
      document.querySelector(".leaflet-container");

    setLoading(true);
    if (!mapContainer) {
      setLoading(false);
      return;
    } else {
      htmlToImage
        .toPng(mapContainer)
        .then((dataUrl: string) => {
          const randomNum = Math.floor(Math.random() * 10000);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `map_srilanka-${randomNum}.png`;
          link.click();
        })
        .catch((error: Error) => {
          console.error("Error taking screenshot:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <button
      className='btn btn-ghost btn-outline btn-success'
      onClick={takeScreenshot}
      disabled={loading}>
      {loading ? (
        <span className='loading loading-spinner text-success'></span>
      ) : (
        <FileDown />
      )}
    </button>
  );
};

export default ScreenshotButton;
