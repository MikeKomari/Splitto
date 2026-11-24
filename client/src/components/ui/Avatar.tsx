import { cn } from "@/lib/cn";

export const AVATAR_COUNT = 68;
const tiles = ["bg-[var(--tile-1)]", "bg-[var(--tile-2)]", "bg-[var(--tile-3)]", "bg-[var(--tile-4)]", "bg-[var(--tile-5)]"];

export function avatarSrc(n: number) {
  return `${import.meta.env.BASE_URL}profile/profile1/${((n % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT}.png`;
}

type Props = {
  avatar: number;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ring?: boolean;
};

const sizes = { xs: "h-7 w-7 rounded-[8px]", sm: "h-10 w-10 rounded-[12px]", md: "h-14 w-14 rounded-[16px]", lg: "h-16 w-16 rounded-[18px]" };

/** Rounded-square tile on a soft accent tint, as in the reference design. */
export function Avatar({ avatar, name, size = "md", className, ring }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-end justify-center overflow-hidden",
        tiles[avatar % tiles.length],
        sizes[size],
        ring && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
        className
      )}
    >
      <img src={avatarSrc(avatar)} alt={name ? `${name}'s avatar` : ""} className="h-[92%] w-[92%] object-contain" loading="lazy" draggable={false} />
    </span>
  );
}
