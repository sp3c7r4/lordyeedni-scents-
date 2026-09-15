interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
  rows?: number;
  className?: string;
  name?: string;
}

/** Labelled input / textarea with an invalid state driven from the parent form. */
export default function Field({
  label, value, onChange, placeholder, type = 'text', invalid, rows, className = '', name,
}: Props) {
  const border = invalid ? 'border-danger' : 'border-line';
  const shared = 'w-full border bg-paper px-4 ' + border;
  return (
    <label className={'flex flex-col gap-2 ' + className}>
      <span className="label text-quiet">{label}</span>
      {rows ? (
        <textarea
          name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          aria-invalid={invalid} className={shared + ' resize-y py-3 font-sans'}
        />
      ) : (
        <input
          type={type} name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          aria-invalid={invalid} className={shared + ' h-[50px]'}
        />
      )}
    </label>
  );
}
