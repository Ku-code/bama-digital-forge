import { useState, useEffect, useMemo, useCallback } from "react";
import { Menu, X } from "./ui/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { t, language } = useLanguage();

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
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <button
            className="text-foreground p-2"
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
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
