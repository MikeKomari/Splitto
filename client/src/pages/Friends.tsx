import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useHistory } from "@/store/historyStore";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/date";

export default function Friends() {
  const { friends, removeFriend } = useHistory();
  return (
    <>
      <header className="safe-top pt-4 pb-4">
        <h1 className="text-[28px] leading-9">Friends</h1>
        <p className="text-[13px] text-muted">Everyone you've split with, ready to add in one tap.</p>
      </header>
      {friends.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border p-6 text-center text-[13px] text-muted">
          Friends appear here after your first split.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {friends.map((f, i) => (
            <li key={f.id} className="animate-rise-in flex items-center gap-3 rounded-[16px] border border-border bg-surface p-3" style={{ ["--i" as string]: Math.min(i, 10) }}>
              <Avatar avatar={f.avatar} name={f.name} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{f.name}</span>
                <span className="text-[12px] text-muted">
                  {f.billsCount} bill{f.billsCount === 1 ? "" : "s"} · last {formatDate(f.lastSplitAt.slice(0, 10))}
                </span>
              </span>
              <IconButton
                label={`Remove ${f.name}`}
                className="text-muted hover:text-danger"
                onClick={() => {
                  removeFriend(f.id);
                  toast(`${f.name} removed from friends`);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
