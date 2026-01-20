import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Início", href: "/#inicio", scroll: true },
    { name: "Sobre Nós", href: "/#sobre", scroll: true },
    { name: "Serviços", href: "/services", scroll: false },
    { name: "Contacto", href: "/#contacto", scroll: true },
    { name: "Localizações", href: "/#localizacoes", scroll: true },
    { name: "Blog", href: "/blog", scroll: false },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, scroll: boolean) => {
    if (scroll && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsOpen(false);
      } else {
        
        window.location.href = href;
      }
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="MicroCrédito Mais Logo" className="h-12 w-auto object-contain" />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.scroll)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive(link.href)
                    ? "text-primary bg-primary/5"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Minha Conta</span>
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => logout()}>
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive(link.href)
                  ? "text-primary bg-primary/5"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                onClick={(e) => {
                  handleNavClick(e, link.href, link.scroll);
                  if (!link.scroll) setIsOpen(false);
                }}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-100 mt-4">
              {user ? (
                <>
                  <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                    Minha Conta
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Login</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
