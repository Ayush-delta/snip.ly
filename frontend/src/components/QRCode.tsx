"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
  size?: number;
}

export default function QRCode({ value, size = 160 }: Props) {
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
