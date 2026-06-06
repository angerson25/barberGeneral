import Link from "next/link";

// Layout compartido por las páginas de autenticación.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-lg font-bold">
          Barber<span className="text-brand-accent">SaaS</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
