"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/gallery", label: "Gallery" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav">
      {items.map((i) => {
        // Dashboard only matches exactly; Rooms/Messages also match their sub-pages (add, edit)
        const active =
          i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
