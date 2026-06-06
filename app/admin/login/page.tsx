import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

// Página de acceso al panel (solo administradores). No hay registro público.
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-sm text-gray-500">
          ← Volver a la web
        </Link>
        <Card>
          <h1 className="mb-4 text-xl font-semibold">Acceso al panel</h1>

          {searchParams.error && (
            <p className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
              {searchParams.error}
            </p>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Solo para administradores autorizados.
          </p>
        </Card>
      </div>
    </div>
  );
}
