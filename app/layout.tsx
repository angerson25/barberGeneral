import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberSaaS — Gestión para barberías",
  description: "SaaS multi-tenant para gestionar barberías, citas y clientes.",
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
