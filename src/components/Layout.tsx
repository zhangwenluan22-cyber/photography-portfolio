import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { siteConfig } from "../data/siteContent";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/works", label: "Works" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Admin" }
];

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="mobile-header">
        <NavLink to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          {siteConfig.title}
        </NavLink>
        <button
          type="button"
          className="menu-button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          Menu
        </button>
      </header>

      <aside className={`sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="sidebar-inner">
          <NavLink
            to="/"
            end
            className="brand desktop-only"
            onClick={() => setMobileMenuOpen(false)}
          >
            {siteConfig.title}
          </NavLink>
          <p className="sidebar-note">{siteConfig.welcomeLine}</p>

          <nav className="nav-list" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="content-area" onClick={() => setMobileMenuOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
