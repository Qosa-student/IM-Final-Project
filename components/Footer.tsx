import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© 2024 D’Bay Samal Beach &amp; Resort. All rights reserved.</p>
      <a href="/terms">Terms &amp; Conditions</a>
      <a href="/privacy">Privacy Policy</a>
      <div className="social">
        <a href="#" aria-label="Facebook">
          <Facebook size={18} />
        </a>
        <a href="#" aria-label="Instagram">
          <Instagram size={18} />
        </a>
      </div>
    </footer>
  );
}
