interface GifViewerProps {
  /** URL of the GIF to play, e.g. "/assets/seal.gif". */
  src: string;
}

export function GifViewer({ src }: GifViewerProps) {
  return (
    <div className="image-viewer">
      <img src={src} alt="" draggable={false} />
    </div>
  );
}
