import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Clock,
  CheckSquare,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";
import HistoryContent from "@/components/dashboard/HistoryContent";
import VotesContent from "@/components/dashboard/VotesContent";
import AgendaContent from "@/components/dashboard/AgendaContent";
import DocumentsContent from "@/components/dashboard/DocumentsContent";
import BudgetContent from "@/components/dashboard/BudgetContent";
import NetworkContent from "@/components/dashboard/NetworkContent";

type MenuItem = "history" | "votes" | "agenda" | "documents" | "budget" | "network";

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<MenuItem>("history");

  const menuItems = [
    { id: "history" as MenuItem, icon: Clock, label: t("dashboard.menu.history") || "History" },
    { id: "votes" as MenuItem, icon: CheckSquare, label: t("dashboard.menu.votes") || "Votes" },
    { id: "agenda" as MenuItem, icon: Calendar, label: t("dashboard.menu.agenda") || "Agenda" },
    { id: "documents" as MenuItem, icon: FileText, label: t("dashboard.menu.documents") || "Documents" },
    { id: "budget" as MenuItem, icon: DollarSign, label: t("dashboard.menu.budget") || "Budget" },
    { id: "network" as MenuItem, icon: Users, label: t("dashboard.menu.network") || "Network" },
  ];

  const renderContent = () => {
    switch (activeItem) {
      case "history":
        return <HistoryContent />;
      case "votes":
        return <VotesContent />;
      case "agenda":
        return <AgendaContent />;
      case "documents":
        return <DocumentsContent />;
      case "budget":
        return <BudgetContent />;
      case "network":
        return <NetworkContent />;
      default:
        return <HistoryContent />;
    }
  };

  const logoPath = language === 'bg' 
    ? '/lovable-uploads/BAMAS_Logo_bg.png'
    : '/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png';

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <SidebarProvider collapsible="icon">
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="h-8 w-8 flex-shrink-0">
                <img
                  src={logoPath}
                  alt="BAMAS Logo"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <SidebarTrigger className="ml-auto" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={activeItem === item.id}
                          onClick={() => setActiveItem(item.id)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("dashboard.menu.settings") || "Settings"}
                  onClick={() => navigate("/settings")}
                >
                  <Settings />
                  <span>{t("dashboard.menu.settings") || "Settings"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

