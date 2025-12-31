import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "./ui/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { t, language } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Update scroll state with throttling for performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);

          // Find the current active section (throttled)
          const sections = document.querySelectorAll("section[id]");
          sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionHeight = rect.height;
            if (window.scrollY >= (sectionTop - 300) && window.scrollY < (sectionTop + sectionHeight - 300)) {
              setActiveSection(section.getAttribute("id") || "");
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.mission"), href: "#mission" },
    { name: t("nav.membership"), href: "#membership" },
    { name: t("nav.events"), href: "#events" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const logoPath = useMemo(() => {
    return language === 'bg' 
      ? '/lovable-uploads/BAMAS_Logo_bg.png'
      : '/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png';
  }, [language]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/90 shadow-md backdrop-blur-sm py-2 border-b border-border/40" : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="#home" className="flex items-center">
          <div className="h-12 w-12">
            <img
              src={logoPath}
              alt="BAMAS Logo"
              style={{ borderRadius: '1rem' }}
              className="w-full h-full object-contain"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${activeSection === link.href.substring(1)
                    ? "text-destructive"
                    : "text-foreground hover:text-primary"
                    }`}
                >
                  {link.name}
                  {activeSection === link.href.substring(1) && (
                    <span className="block h-0.5 mt-1 bg-destructive"></span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 ml-6 pl-6 border-l border-border/40">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image} alt={user?.name} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.dashboard") || "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings") || "Settings"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout") || "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm" 
                  className="rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {t("nav.register")}
                </Button>
              </Link>
            </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 rounded-full">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { navigate("/dashboard"); closeMenu(); }}>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.dashboard") || "Dashboard"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate("/settings"); closeMenu(); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("nav.settings") || "Settings"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { handleLogout(); closeMenu(); }} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout") || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
          <div className="flex items-center gap-2 border-l border-border/40 pl-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs rounded-full">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="h-8 px-3 text-xs rounded-full">
                {t("nav.register")}
              </Button>
            </Link>
          </div>
          )}
          <button
            className="text-foreground p-2 ml-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background shadow-lg border-t border-border">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`block text-lg font-medium transition-colors ${activeSection === link.href.substring(1)
                      ? "text-destructive"
                      : "text-foreground hover:text-primary"
                      }`}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/dashboard"
                      className="block text-lg font-medium transition-colors text-foreground hover:text-primary"
                      onClick={closeMenu}
                    >
                      {t("nav.dashboard") || "Dashboard"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      className="block text-lg font-medium transition-colors text-foreground hover:text-primary"
                      onClick={closeMenu}
                    >
                      {t("nav.settings") || "Settings"}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => { handleLogout(); closeMenu(); }}
                      className="block text-lg font-medium transition-colors text-foreground hover:text-destructive w-full text-left"
                    >
                      {t("nav.logout") || "Logout"}
                    </button>
                  </li>
                </>
              ) : (
                <>
              <li>
                <Link
                  to="/login"
                  className="block text-lg font-medium transition-colors text-foreground hover:text-primary"
                  onClick={closeMenu}
                >
                  {t("nav.login")}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block text-lg font-medium transition-colors text-foreground hover:text-primary"
                  onClick={closeMenu}
                >
                  {t("nav.register")}
                </Link>
              </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
