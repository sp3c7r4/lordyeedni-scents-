'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signUploadAction } from '@/lib/actions/admin';

/** First image is the primary. No drag-and-drop: move to front, or remove. */
export default function ImageUploader({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {value.map((src, index) => (
          <figure key={src} className={'w-[120px] border ' + (index === 0 ? 'border-ink' : 'border-line')}>
            <div className="relative aspect-square bg-stone">
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </div>
            <figcaption className="flex justify-between gap-2 border-t border-line px-2 py-1.5">
              {index === 0 ? (
                <span className="text-[10px] uppercase tracking-wide text-accent">Primary</span>
              ) : (
                <button type="button" onClick={() => promote(index)} className="ul-reveal text-[10px] uppercase tracking-wide">Make primary</button>
              )}
              <button type="button" onClick={() => remove(index)} className="ul-reveal text-[10px] uppercase tracking-wide text-muted">Remove</button>
            </figcaption>
          </figure>
        ))}
      </div>
      <input
        type="file" accept="image/*" disabled={busy}
        onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); event.target.value = ''; }}
        className="text-sm"
      />
      {busy && <p className="text-sm text-muted">Uploading…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <input type="hidden" name="images" value={JSON.stringify(value)} />
    </div>
  );
}
