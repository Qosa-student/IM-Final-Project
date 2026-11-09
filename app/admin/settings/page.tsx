import SettingsForm from "@/components/admin/SettingsForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();
  return (
    <>
      <h2>Account settings</h2>
      <SettingsForm email={user?.email ?? ""} name={profile?.full_name ?? ""} />
    </>
  );
}
