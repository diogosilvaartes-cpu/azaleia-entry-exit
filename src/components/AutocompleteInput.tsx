import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface AutocompleteInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  required?: boolean;
}

const AutocompleteInput = ({
  id,
  placeholder,
  value,
  onChange,
  suggestions,
  required,
}: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const f = suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(f);
    } else {
      setFiltered(suggestions.slice(0, 5));
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        required={required}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md">
          {filtered.slice(0, 6).map((s) => (
            <li
              key={s}
              className="cursor-pointer rounded px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
