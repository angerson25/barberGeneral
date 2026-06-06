import Link from "next/link";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; registered?: string };
}) {
  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Iniciar sesión</h1>

      {searchParams.registered && (
        <p className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-700">
          Cuenta creada. Revisa tu email si requiere confirmación.
        </p>
      )}
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

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-brand">
          Regístrate
        </Link>
      </p>
    </Card>
  );
}
