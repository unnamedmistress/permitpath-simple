import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, HelpCircle, UserCircle } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/jobs", icon: ClipboardList, label: "My Jobs" },
  { path: "/help", icon: HelpCircle, label: "Help" },
  { path: "/settings", icon: UserCircle, label: "Account" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on wizard pages (full-screen workflow)
  if (location.pathname.startsWith("/wizard") || location.pathname.startsWith("/preview")) {
    return null;
  }

  const handleNavClick = (path: string) => {
    // Add haptic feedback (safely)
    try {
      navigator.vibrate?.(10);
    } catch {
      // Ignore if not supported
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center z-50" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }} role="navigation" aria-label="Main navigation">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
        return (
          <button
            type="button"
            key={path}
            onClick={() => handleNavClick(path)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-2 px-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${isActive ? "text-primary" : "text-muted-foreground"}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            <span className="text-[10px] sm:text-xs font-medium mt-0.5">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
