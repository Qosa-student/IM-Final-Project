import Link from "next/link";
import LiveMessages from "@/components/LiveMessages";
import SignOutButton from "@/components/SignOutButton";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin">
      <LiveMessages />
      <header>
        <h1>Admin</h1>
        <AdminNav />
        <div>
          <Link href="/" className="btn sm outline">
            View site
          </Link>{" "}
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
