'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { signUploadAction } from '@/lib/actions/admin';

/**
 * Image attachments for a product. Index 0 is the cover.
 *
 * Modelled on shadcn's Attachment: a fixed media slot above a compact action
 * row, with an explicit upload state on the add tile. The actions are icon-only
 * and labelled, because the old text pair ("Make primary" / "Remove") could not
 * fit the card width - "Make primary" wrapped and "Remove" spilled past the
 * border.
 *
 * Still no drag-and-drop: promote to cover, or remove.
 */
export default function ImageUploader({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const picker = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const sig = await signUploadAction();
      const body = new FormData();
      body.append('file', file);
      body.append('api_key', sig.apiKey);
      body.append('timestamp', String(sig.timestamp));
      body.append('folder', sig.folder);
      body.append('signature', sig.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { secure_url: string };
      onChange([...value, json.secure_url]);
    } catch {
      setError('Upload failed. Check the Cloudinary credentials and try again.');
    } finally {
      setBusy(false);
    }
  }

  const promote = (index: number) => onChange([value[index], ...value.filter((_, i) => i !== index)]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const action = 'grid h-8 w-8 place-items-center transition-colors disabled:opacity-60';

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((src, index) => (
          <figure key={src} className={'flex flex-col border bg-paper ' + (index === 0 ? 'border-ink' : 'border-line')}>
            <div className="relative aspect-square overflow-hidden bg-stone">
              <Image
                src={src} alt="" fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] uppercase tracking-label text-paper">
                  Cover
                </span>
              )}
            </div>
            <figcaption className="flex items-center justify-between border-t border-line px-0.5">
              {/* Left slot stays occupied on the cover so both action rows align. */}
              {index === 0 ? (
                <span className="h-8 w-8" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  onClick={() => promote(index)}
                  title="Make cover"
                  aria-label={`Make image ${index + 1} the cover`}
                  className={action + ' text-quiet hover:text-accent'}
                >
                  <Icon name="star" size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                title="Remove"
                aria-label={`Remove image ${index + 1}`}
                className={action + ' text-quiet hover:text-danger'}
              >
                <Icon name="trash" size={15} />
              </button>
            </figcaption>
          </figure>
        ))}

        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={busy}
          className={
            'flex min-h-[152px] flex-col border border-dashed border-line text-quiet transition-colors ' +
            'hover:border-ink hover:text-ink disabled:cursor-wait disabled:hover:border-line disabled:hover:text-quiet'
          }
        >
          <span className="grid flex-1 place-items-center">
            {busy ? (
              <span className="animate-pulse text-[11px] uppercase tracking-label">Uploading&hellip;</span>
            ) : (
              <Icon name="plus" size={22} />
            )}
          </span>
          <span className="border-t border-dashed border-line px-2 py-2 text-[10px] uppercase tracking-label">
            {busy ? 'Uploading' : 'Add image'}
          </span>
        </button>
      </div>

      <input
        ref={picker}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = '';
        }}
      />

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <input type="hidden" name="images" value={JSON.stringify(value)} />
    </div>
  );
}
