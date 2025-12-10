import React, { useContext, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { AuthContext } from '../App';
import { Button } from '../components/Button';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const QRView: React.FC = () => {
  const { user } = useContext(AuthContext);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // IMPORTANT: This constructs the URL to the public emergency page
  const emergencyUrl = `${window.location.origin}${window.location.pathname}#/emergency/${user.id}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `qr-emergencia-${user.name.split(' ')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Tu Código QR</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
        <div ref={qrRef} className="bg-white p-4 rounded-xl border-4 border-slate-900 mb-6">
          <QRCodeCanvas 
            value={emergencyUrl} 
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">Escanea en caso de emergencia</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          Este código dirige a tu perfil médico actualizado. Imprímelo y llévalo en tu billetera, pégalo en tu celular o úsalo como collar.
        </p>

        <div className="flex flex-col w-full gap-3">
          <Button onClick={downloadQR} variant="primary" className="gap-2">
            <Download className="w-5 h-5" /> Descargar Imagen PNG
          </Button>
          <p className="text-xs text-slate-400 mt-2">
             El enlace de destino es dinámico. Puedes actualizar tu información en el panel y este código QR seguirá funcionando.
          </p>
          <div className="bg-slate-100 p-2 rounded text-xs font-mono text-slate-500 break-all">
            {emergencyUrl}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRView;