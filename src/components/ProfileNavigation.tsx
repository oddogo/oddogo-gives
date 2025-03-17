
import { useState, useEffect } from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Heart, List, Award, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const navItems = [
  { name: "About", icon: <Heart className="w-4 h-4" />, href: "#about", id: "about" },
  { name: "Allocations", icon: <List className="w-4 h-4" />, href: "#allocations", id: "allocations" },
  { name: "Campaign", icon: <Award className="w-4 h-4" />, href: "#campaign", id: "campaign" },
  { name: "Donation History", icon: <History className="w-4 h-4" />, href: "#payment-history", id: "payment-history" }
];

export const ProfileNavigation = () => {
  const [activeSection, setActiveSection] = useState<string>("about");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Find which section is currently in view
      const sections = navItems.map(item => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { id: item.id, top: rect.top + scrollPosition - 100 }; // -100 offset for navbar
        }
        return { id: item.id, top: 0 };
      });
      
      // Sort sections by their position and find the active one
      sections.sort((a, b) => a.top - b.top);
      const currentSection = sections.find(section => section.top > scrollPosition);
      
      if (currentSection) {
        setActiveSection(currentSection.id);
      } else if (sections.length > 0) {
        setActiveSection(sections[sections.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="gap-1 md:gap-3">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.id}>
                <NavigationMenuLink
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "cursor-pointer transition-colors flex items-center gap-2",
                    activeSection === item.id
                      ? "bg-teal-50 text-teal-900"
                      : "hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.name}</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};
