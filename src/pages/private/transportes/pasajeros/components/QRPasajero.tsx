import { type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  pasajeroId: string;
  size?: number;
}

export const QRPasajero: FC<Props> = ({ pasajeroId, size = 128 }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG
        value={pasajeroId}
        size={size}
        level="H"
        includeMargin={true}
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <p className="text-xs text-text-tertiary">Escanear para confirmar</p>
    </div>
  );
};