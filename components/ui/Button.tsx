import { clsx } from "./clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-brand text-white hover:bg-gray-800",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props} />
  );
}
