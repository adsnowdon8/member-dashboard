import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function SignOut({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            onSuccess?.();
            router.push("/");
            router.refresh(); // optional: ensures fresh server state
          },
        },
      });
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-black/10 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
