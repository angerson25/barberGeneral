import { clsx } from "./clsx";

export const Input = (
  props: React.InputHTMLAttributes<HTMLInputElement>
) => (
  <input
    {...props}
    className={clsx(
      "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
      props.className
    )}
  />
);

export const Textarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea
    {...props}
    className={clsx(
      "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
      props.className
    )}
  />
);

export const Select = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) => (
  <select
    {...props}
    className={clsx(
      "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand",
      props.className
    )}
  />
);

export const Label = (
  props: React.LabelHTMLAttributes<HTMLLabelElement>
) => (
  <label
    {...props}
    className={clsx("mb-1 block text-sm font-medium text-gray-700", props.className)}
  />
);
