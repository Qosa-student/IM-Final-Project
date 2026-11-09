import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const head = { count: "exact", head: true } as const;
  const [m, b, r] = await Promise.all([
    supabase.from("messages").select("*", head).eq("is_read", false),
    supabase.from("bookings").select("*", head).eq("status", "pending"),
    supabase.from("reviews").select("*", head).eq("approved", false),
  ]);

  return (
    <AdminShell
      name={profile.full_name || "Admin"}
      initial={{
        messages: m.count ?? 0,
        bookings: b.count ?? 0,
        reviews: r.count ?? 0,
      }}
    >
      {children}
    </AdminShell>
  );
}
