import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbería",
  description: "Reserva tu turno online en nuestra barbería.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
