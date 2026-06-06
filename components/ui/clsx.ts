// Mini util para componer clases sin dependencias externas.
export function clsx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
