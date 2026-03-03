import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export default function PageWrapper({
  children,
  className = "",
  hasBottomNav = true
}: PageWrapperProps) {
  return (
    <div
      className={`min-h-screen bg-background overflow-x-hidden ${hasBottomNav ? "pb-16 sm:pb-20" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
