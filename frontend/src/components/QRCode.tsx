"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
  size?: number;
  id?: string;
}

export default function QRCode({ value, size = 160, id }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "12px",
        display: "inline-block",
      }}
    >
      <QRCodeSVG
        id={id}
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#08080f"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
