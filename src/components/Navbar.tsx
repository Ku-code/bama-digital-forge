import { useState, useEffect } from "react";
import { Menu, X } from "./ui/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { t, language } = useLanguage();

  // Update scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Find the current active section
      const sections = document.querySelectorAll("section[id]");
      sections.forEach(section => {
        // Use getBoundingClientRect() instead of offsetTop for better TypeScript compatibility
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 300) && window.scrollY < (sectionTop + sectionHeight - 300)) {
          setActiveSection(section.getAttribute("id") || "");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getLogoPath = () => {
    return language === 'bg' 
      ? '/lovable-uploads/BAMAS_Logo_bg.png'
      : '/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png';
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 shadow-md backdrop-blur-sm py-2" : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="#home" className="flex items-center">
          <div className="h-12 w-12">
            <img
              src={getLogoPath()}
              alt="BAMAS Logo"
              style={{ borderRadius: '1rem' }}
              className="w-full h-full object-contain"
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
                    ? "text-[#e62f29]"
                    : "text-[#052e40] hover:text-[#0C9D6A]"
                    }`}
                >
                  {link.name}
                  {activeSection === link.href.substring(1) && (
                    <span className="block h-0.5 mt-1 bg-[#e62f29]"></span>
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
            className="text-[#052e40] p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`block text-lg font-medium transition-colors ${activeSection === link.href.substring(1)
                      ? "text-[#e62f29]"
                      : "text-[#052e40] hover:text-[#0C9D6A]"
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
