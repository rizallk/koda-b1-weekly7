import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router';

export function NavMain({ label = 'MENU UTAMA', items }) {
  const { logout } = useAuth();

  const { isMobile, setOpenMobile } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup className="px-4 py-2">
      <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => {
          const isActive = location.pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                render={
                  item?.url ? (
                    <Link to={item.url} onClick={handleLinkClick} />
                  ) : null
                }
                className={cn(
                  'h-11 rounded-xl px-3.5 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#F3F6F5] hover:text-[#111827]',
                  isActive &&
                    'bg-[#EAF3F0] font-semibold text-[#136C63] hover:bg-[#EAF3F0] hover:text-[#136C63]',
                )}
                onClick={() =>
                  item.title === 'Keluar' ? handleLogout() : null
                }
              >
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
