import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { t } from "i18next";
import { cn } from "@root/lib/utils";

import { Home, Users, MapPin, Settings, Moon } from "lucide-react";
import { UpdateButton } from "@/components/layout/update-button";
import React from "react";
import { SheetClose } from "@/components/ui/sheet";
import logo from "@/assets/image/logo.png";

const menuItems = [
  { title: "Label-Home", url: "/home", icon: Home },
  { title: "Label-Proxies", url: "/proxies", icon: MapPin },
  { title: "Label-Profiles", url: "/profile", icon: Users },
  { title: "Label-Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { isMobile } = useSidebar();

  return (
    <Sidebar
      variant="sidebar"
      className="border-none bg-slate-800 dark:bg-slate-900"
    >
      <SidebarContent className="group-data-[state=expanded]:p-4 group-data-[state=collapsed]:p-4 space-y-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isCurrentlyActive = location.pathname === item.url;
                const linkElement = (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={cn(
                      "flex items-center transition-all duration-200 rounded-lg",
                      "group-data-[state=expanded]:gap-3 group-data-[state=expanded]:w-full group-data-[state=expanded]:px-4 group-data-[state=expanded]:py-3",
                      "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:p-2",
                      "text-sm font-medium",
                      isCurrentlyActive
                        ? "bg-slate-700 dark:bg-slate-600 text-white border border-slate-600 dark:border-slate-500"
                        : "text-slate-300 dark:text-slate-400 hover:bg-slate-700/50 dark:hover:bg-slate-600/50 hover:text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="group-data-[state=collapsed]:hidden">
                      {t(item.title)}
                    </span>
                  </Link>
                );
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentlyActive}
                      tooltip={t(item.title)}
                      className="p-0 h-auto hover:bg-transparent w-full"
                    >
                      {isMobile ? (
                        <SheetClose asChild>{linkElement}</SheetClose>
                      ) : (
                        linkElement
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
