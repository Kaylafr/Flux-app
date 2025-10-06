import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckSquare, Calendar, UserPlus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clientes: 0,
    tarefas: 0,
    reunioes: 0,
    onboards: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const [clientes, tarefas, reunioes, onboards] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('tarefas').select('*', { count: 'exact', head: true }),
        supabase.from('reunioes').select('*', { count: 'exact', head: true }),
        supabase.from('onboards').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        clientes: clientes.count || 0,
        tarefas: tarefas.count || 0,
        reunioes: reunioes.count || 0,
        onboards: onboards.count || 0,
      });
    };

    fetchStats();
  }, [user]);

  const cards = [
    { title: 'Clientes', value: stats.clientes, icon: Users, color: 'text-blue-500' },
    { title: 'Tarefas', value: stats.tarefas, icon: CheckSquare, color: 'text-green-500' },
    { title: 'Reuniões', value: stats.reunioes, icon: Calendar, color: 'text-purple-500' },
    { title: 'Onboards', value: stats.onboards, icon: UserPlus, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Sistema de Gestão!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Use o menu lateral para navegar entre as diferentes seções:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Clientes - Gerencie seus clientes</li>
            <li>Acompanhamento - Monitore o progresso</li>
            <li>Tarefas - Organize suas atividades</li>
            <li>Reuniões - Agende e veja reuniões</li>
            <li>Onboards - Gerencie novos clientes</li>
            <li>Equipe - Administre colaboradores</li>
            <li>Relatórios - Visualize estatísticas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
