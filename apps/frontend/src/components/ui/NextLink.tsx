"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface NextLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export default function NextLink({
  href,
  children,
  className = "",
}: NextLinkProps) {
  return (
    <Link
      href={href}
      className={`${className} font-jakarta text-(--primary-black) font-semibold text-typo-label`}
    >
      {children}
    </Link>
  );
}
