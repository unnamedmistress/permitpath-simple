import { useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Settings, FileText } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/new", icon: Plus, label: "New Job" },
  { path: "/demo", icon: FileText, label: "Demo" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on wizard and preview pages
  if (location.pathname.startsWith("/wizard") || location.pathname.startsWith("/preview")) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
