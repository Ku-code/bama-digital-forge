
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Update scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Find the current active section
      const sections = document.querySelectorAll("section[id]");
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
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
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Mission", href: "#mission" },
    { name: "Objectives", href: "#objectives" },
    { name: "Membership", href: "#membership" },
    { name: "Events", href: "#events" },
    { name: "Partner", href: "#partner" },
    { name: "Contact", href: "#contact" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glassmorphism py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="#home" className="flex items-center">
          <Logo className="h-10 w-10" />
          <span className="ml-2 text-white font-bold text-lg">BAMA</span>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === link.href.substring(1)
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {activeSection === link.href.substring(1) && (
                    <span className="block h-0.5 mt-1 bama-gradient"></span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glassmorphism">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`block text-lg font-medium transition-colors ${
                      activeSection === link.href.substring(1)
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
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
