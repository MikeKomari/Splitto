import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Fields";
import { Avatar, AVATAR_COUNT } from "@/components/ui/Avatar";
import { useHistory } from "@/store/historyStore";
import type { Person } from "@/features/bill/types";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  inBill: Person[];
  onAdd: (p: Omit<Person, "id"> & { id?: string }) => void;
};

export function AddPersonSheet({ open, onClose, inBill, onAdd }: Props) {
  const friends = useHistory((s) => s.friends).filter((f) => !inBill.some((p) => p.id === f.id));
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setTouched(false);
      setAvatar(Math.floor(Math.random() * AVATAR_COUNT));
    }
  }, [open]);

  const nameTaken = inBill.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
  const error = touched && !name.trim() ? "Enter a name" : nameTaken ? "Someone with this name is already in the bill" : null;

  const submit = () => {
    setTouched(true);
    if (!name.trim() || nameTaken) return;
    onAdd({ name: name.trim().slice(0, 24), avatar });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add person"
      footer={
        <Button size="lg" block onClick={submit}>
          Add {name.trim() || "person"}
        </Button>
      }
    >
      {friends.length > 0 && (
        <>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Recent friends</p>
          <ul className="no-scrollbar -mx-5 mb-5 flex gap-3 overflow-x-auto px-5">
            {friends.slice(0, 12).map((f, i) => (
              <li key={f.id} className="animate-rise-in" style={{ ["--i" as string]: i }}>
                <button
                  onClick={() => {
                    onAdd(f);
                    onClose();
                  }}
                  className="pressable flex w-16 flex-col items-center gap-1 cursor-pointer"
                >
                  <Avatar avatar={f.avatar} name={f.name} size="md" />
                  <span className="w-full truncate text-center text-[12px]">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Someone new</p>
        </>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Name"
          aria-label="Name"
          aria-invalid={!!error}
          maxLength={24}
          enterKeyHint="done"
        />
        {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
      </form>

      <p className="mt-4 mb-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Avatar</p>
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: AVATAR_COUNT }, (_, n) => (
          <button
            key={n}
            onClick={() => setAvatar(n)}
            aria-label={`Avatar ${n + 1}`}
            aria-pressed={avatar === n}
            className="pressable relative flex justify-center cursor-pointer"
          >
            <Avatar avatar={n} size="md" className={cn("transition-all", avatar === n ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : "opacity-90")} />
            {avatar === n && (
              <span className="animate-pop-in absolute -right-0.5 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
