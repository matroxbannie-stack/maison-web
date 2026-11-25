import type { InputHTMLAttributes } from 'react';

type Props = { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, error, id, name, ...rest }: Props) {
  const fid = id ?? name;
  return (
    <div>
      <label htmlFor={fid} className="mb-2 block text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      <input
        id={fid}
        name={name}
        aria-invalid={error ? true : undefined}
        className={
          'h-12 w-full border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground ' +
          (error ? 'border-red-600' : 'border-border')
        }
        {...rest}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default Field;