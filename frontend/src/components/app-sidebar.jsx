import { NavMain } from '@/components/nav-main';
import { SidebarOptInForm } from '@/components/sidebar-opt-in-form';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { BrandLogo } from './customs/BrandLogo';

const MENU_BY_ROLE = {
  customer: {
    label: 'MENU UTAMA',
    homeUrl: '/',
    items: [
      { title: 'Beranda', url: '/' },
      { title: 'Isi Saldo', url: '/topup' },
      { title: 'Transfer', url: '/transfer' },
      { title: 'Aktivitas', url: '/activity' },
      { title: 'Pengaturan', url: '/settings' },
      { title: 'Keluar', url: '' },
    ],
  },
  admin: {
    label: 'PENGELOLAAN',
    homeUrl: '/admin',
    items: [
      { title: 'Ringkasan', url: '/admin' },
      { title: 'Pengguna', url: '/admin/users' },
      { title: 'Profil', url: '/admin/profile' },
      { title: 'Keluar', url: '' },
    ],
  },
};

export function AppSidebar({ role = 'CUSTOMER', ...props }) {
  const menuConfig = MENU_BY_ROLE[role.toLowerCase()] || MENU_BY_ROLE.customer;

  return (
    <Sidebar className="border-r border-[#E8EFEC] bg-white" {...props}>
      <SidebarHeader className="px-7 pt-7 pb-4">
        <BrandLogo to={menuConfig.homeUrl} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain label={menuConfig.label} items={menuConfig.items} />
      </SidebarContent>

      <SidebarFooter className="p-5">
        <SidebarOptInForm />
      </SidebarFooter>
    </Sidebar>
  );
}
