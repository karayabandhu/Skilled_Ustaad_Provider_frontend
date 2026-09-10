import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CameraOff, AlertTriangle, RefreshCw } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanFailure, onClose, darkMode }) => {
  const [cameraState, setCameraState] = useState('initializing'); // 'initializing' | 'active' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const html5QrcodeRef = useRef(null);

  const startScanning = async () => {
    setCameraState('initializing');
    setErrorMessage('');

    try {
      if (html5QrcodeRef.current) {
        const scanner = html5QrcodeRef.current;
        if (scanner.isScanning) {
          await scanner.stop();
        }
        html5QrcodeRef.current = null;
      }

      // Check if element exists in DOM before building
      const container = document.getElementById("reader");
      if (!container) {
        console.warn("Reader container element not found yet.");
        return;
      }

      const html5Qrcode = new Html5Qrcode("reader");
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          if (html5Qrcode.isScanning) {
            html5Qrcode.stop().catch(err => console.error("Error stopping scanner:", err));
          }
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );

      setCameraState('active');
    } catch (err) {
      console.error("Scanner initialization failed:", err);
      const errMsg = String(err);
      if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission denied") || errMsg.includes("PermissionDeniedError")) {
        setCameraState('denied');
      } else if (errMsg.includes("NotFoundError") || errMsg.includes("Requested device not found")) {
        setCameraState('error');
        setErrorMessage("No camera detected on this device. Please use manual OTP verification.");
      } else {
        setCameraState('error');
        setErrorMessage(err.message || "Failed to access camera. Please check your browser permissions.");
      }
    }
  };

  useEffect(() => {
    // Small delay to ensure container element '#reader' is fully rendered and available in the DOM
    const timer = setTimeout(() => {
      startScanning();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (html5QrcodeRef.current) {
        const scanner = html5QrcodeRef.current;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => console.log("Scanner stopped on unmount"))
            .catch(err => console.error("Failed to stop scanner on unmount:", err));
        }
      }
    };
  }, []);

  const handleRetry = () => {
    // Attempt to invoke media device prompt directly to refresh permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop());
          startScanning();
        })
        .catch((err) => {
          console.warn("Direct getUserMedia retry failed:", err);
          startScanning();
        });
    } else {
      startScanning();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 0.9; }
        }
        .scanner-laser {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, transparent, #818cf8, #a78bfa, #818cf8, transparent);
          box-shadow: 0 0 10px 2px rgba(167, 139, 250, 0.7);
          animation: scan 2.5s linear infinite;
        }
        .viewfinder-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #818cf8;
          border-width: 4px;
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.5rem !important;
        }
      `}</style>

      <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-lg dark:text-white">Scan Customer QR Code</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[340px]">
          {(cameraState === 'initializing' || cameraState === 'active') && (
            <div className="relative w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden border-2 border-indigo-500/30 bg-slate-950 flex items-center justify-center">
              {/* Loader Overlay */}
              {cameraState === 'initializing' && (
                <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Initializing camera stream...</p>
                </div>
              )}

              {/* Viewfinder Target Scan Area */}
              {cameraState === 'active' && (
                <div className="absolute z-10 w-[220px] h-[220px] pointer-events-none">
                  <div className="viewfinder-corner border-t-4 border-l-4 rounded-tl-xl top-0 left-0" />
                  <div className="viewfinder-corner border-t-4 border-r-4 rounded-tr-xl top-0 right-0" />
                  <div className="viewfinder-corner border-b-4 border-l-4 rounded-bl-xl bottom-0 left-0" />
                  <div className="viewfinder-corner border-b-4 border-r-4 rounded-br-xl bottom-0 right-0" />
                  <div className="scanner-laser" />
                </div>
              )}

              {/* The html5-qrcode renderer container - MUST ALWAYS BE MOUNTED FOR SCANNER TO FIND IT */}
              <div id="reader" className="w-full h-full"></div>
            </div>
          )}

          {cameraState === 'denied' && (
            <div className="flex flex-col items-center text-center p-2 space-y-5">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-600 dark:text-rose-400">
                <CameraOff size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Camera Permission Blocked</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Access to the camera is required to scan customer QR codes. To fix this, please update your browser settings:
                </p>
              </div>

              {/* Browser Instructions Box */}
              <div className="w-full p-4 rounded-2xl text-left bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span>🔒</span> How to enable:
                </p>
                <ul className="list-decimal pl-4 space-y-1.5 leading-relaxed font-medium">
                  <li>Click the **Site Settings** (padlock icon) in the browser address bar.</li>
                  <li>Find **Camera** in the list and set it to **Allow**.</li>
                  <li>Click **Try Again** below or refresh the page.</li>
                </ul>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-xs"
                >
                  Enter OTP Manually
                </button>
              </div>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="flex flex-col items-center text-center p-2 space-y-5">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-full text-amber-600 dark:text-amber-400">
                <AlertTriangle size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Camera Access Error</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-xs"
                >
                  Enter OTP Manually
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(cameraState === 'active' || cameraState === 'initializing') && (
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center space-y-3">
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              If scanning fails, you can close this window and enter the code manually.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 w-full bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600/80 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all text-xs"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
