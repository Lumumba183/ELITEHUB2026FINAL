import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Wallet,
  User,
  Crown,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("role, is_featured, subscription_status")
    .eq("clerk_id", user.id)
    .single();

  const isAdmin = dbUser?.role === "admin";

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-strong border-r border-white/10 fixed h-full z-30">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="font-display text-2xl font-bold text-gradient-crimson">
            ELITEHUB
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                "text-[#A09B8C] hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[#E11D48] hover:bg-[#E11D48]/10"
            >
              <Crown className="w-5 h-5" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName || user.username || "User"}
              </p>
              <p className="text-xs text-[#A09B8C] capitalize">{dbUser?.role || "client"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-xl font-bold text-gradient-crimson">
            ELITEHUB
          </Link>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
