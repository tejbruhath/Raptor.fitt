"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Don't show navbar on auth pages
  const hideNavbar = pathname?.startsWith("/auth");
  
  if (hideNavbar) return null;
  
  return <BottomNav />;
}
