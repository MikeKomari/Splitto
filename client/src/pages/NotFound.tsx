import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="animate-page-in flex min-h-dvh flex-col items-center justify-center bg-bg px-8 text-center">
      <p className="font-display text-[64px] font-semibold leading-none text-primary">404</p>
      <h1 className="mt-4 text-[22px]">Lost in orbit</h1>
      <p className="mt-2 text-[14px] text-muted">This page doesn't exist.</p>
      <Link to="/app" className="mt-6">
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
