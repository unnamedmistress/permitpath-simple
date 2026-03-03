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
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
        return (
          <button
            type="button"
            key={path}
            onClick={() => handleNavClick(path)}
            className={`bottom-nav-item ${isActive ? "active" : ""} focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            <span className="text-xs font-medium mt-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
