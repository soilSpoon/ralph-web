"use client";

import {
  Brain,
  FolderArchive,
  LayoutDashboard,
  ListTodo,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/routing";

type LinkProps = ComponentProps<typeof Link>;
type RoutePath = LinkProps["href"];

export function AppSidebar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const boardItems: {
    title: string;
    url: RoutePath;
    icon: typeof LayoutDashboard;
  }[] = [
    {
      title: t("dashboard"),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("tasks"),
      url: "/tasks",
      icon: ListTodo,
    },
  ];

  const memoryItems: { title: string; url: RoutePath; icon: typeof Brain }[] = [
    {
      title: t("patterns"),
      url: "/patterns",
      icon: Brain,
    },
    {
      title: t("archive"),
      url: "/archive",
      icon: FolderArchive,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("board")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {boardItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url.toString()}>
                    <Link href={item.url}>
                      <SidebarMenuButton isActive={isActive}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("memory")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memoryItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url.toString()}>
                    <Link href={item.url}>
                      <SidebarMenuButton isActive={isActive}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton isActive={pathname === "/settings"}>
                    <Settings />
                    <span>{t("settings")}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
