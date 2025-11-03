"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Only show navbar on authenticated app pages
  // Hide on: root (/), auth pages, and onboarding
  const hideNavbar = 
    pathname === "/" || 
    pathname?.startsWith("/auth") || 
    pathname?.startsWith("/onboarding");
  
  if (hideNavbar) return null;
  
  return <BottomNav />;
}
