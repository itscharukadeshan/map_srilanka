/** @format */
import * as htmlToImage from "html-to-image";
import { FileDown } from "lucide-react";

interface ScreenshotButtonProps {
  mapRef: React.RefObject<HTMLDivElement>;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ mapRef }) => {
  const takeScreenshot = () => {
    if (!mapRef.current) return;

    htmlToImage
      .toPng(mapRef.current)
      .then((dataUrl: string) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "map-screenshot.png";
        link.click();
      })
      .catch((error: Error) => {
        console.error("Error taking screenshot:", error);
      });
  };

  return (
    <button
      className='btn btn-ghost btn-outline btn-success'
      onClick={takeScreenshot}>
      <FileDown /> Take Screenshot
    </button>
  );
};

export default ScreenshotButton;
