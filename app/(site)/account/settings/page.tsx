import { redirect } from "next/navigation";
import PageHero from "@/components/PageHero";
import UserSettingsForm from "@/components/UserSettingsForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings | D’Bay Samal" };

export default async function AccountSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <PageHero title="Settings">
        Manage your name, email and password.
      </PageHero>
      <section className="section">
        <UserSettingsForm
          email={user.email ?? ""}
          name={profile?.full_name ?? ""}
        />
      </section>
    </>
  );
}
