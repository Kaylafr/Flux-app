import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, CheckSquare, Calendar, 
  UserPlus, FileText, BarChart, LogOut,
  Menu, X, Moon, Sun, ClipboardList
} from 'lucide-react';
import { useTheme } from 'next-themes';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/acompanhamento', icon: ClipboardList, label: 'Acompanhamento' },
    { path: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
    { path: '/reunioes', icon: Calendar, label: 'Reuniões' },
    { path: '/onboards', icon: UserPlus, label: 'Onboards' },
    { path: '/equipe', icon: FileText, label: 'Equipe' },
    { path: '/relatorios', icon: BarChart, label: 'Relatórios' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-card border-r border-border overflow-hidden`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">Sistema CRM</h1>
        </div>
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="ghost" onClick={() => signOut()}>
              <LogOut size={20} className="mr-2" />
              Sair
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
