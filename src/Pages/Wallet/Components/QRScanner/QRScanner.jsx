import { Camera } from "lucide-react";
import './QRScanner.css';

function QRScanner({ open, onOpenChange }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2 className="modal-title">Сканировать QR-код</h2>

        <div className="space-y-4">
          <div className="qr-scanner">
            <div className="flex items-center justify-center w-full h-full">
              <Camera size={64} style={{ color: '#636366' }} />
            </div>
            
            <div className="qr-frame">
              <div className="qr-corner qr-corner-tl" />
              <div className="qr-corner qr-corner-tr" />
              <div className="qr-corner qr-corner-bl" />
              <div className="qr-corner qr-corner-br" />
            </div>
          </div>

          <p className="text-center text-muted text-sm">
            Наведите камеру на QR-код
          </p>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;