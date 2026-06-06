import Link from "next/link";
import { registerAction } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>

      {searchParams.error && (
        <p className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={registerAction} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input id="full_name" name="full_name" type="text" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" minLength={6} required />
        </div>
        <Button type="submit" className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
