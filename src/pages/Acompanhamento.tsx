import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Acompanhamento = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tarefasPendentes: 0,
    tarefasEmAndamento: 0,
    tarefasConcluidas: 0,
    onboardsAtivos: 0,
    proximasReunioes: [] as any[],
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [tarefas, onboards, reunioes] = await Promise.all([
        supabase.from('tarefas').select('status'),
        supabase.from('onboards').select('status'),
        supabase
          .from('reunioes')
          .select('*')
          .gte('data_hora', new Date().toISOString())
          .order('data_hora', { ascending: true })
          .limit(5),
      ]);

      const tarefasPendentes = tarefas.data?.filter((t) => t.status === 'pendente').length || 0;
      const tarefasEmAndamento = tarefas.data?.filter((t) => t.status === 'em_andamento').length || 0;
      const tarefasConcluidas = tarefas.data?.filter((t) => t.status === 'concluida').length || 0;
      const onboardsAtivos = onboards.data?.filter((o) => o.status === 'em_andamento').length || 0;

      setStats({
        tarefasPendentes,
        tarefasEmAndamento,
        tarefasConcluidas,
        onboardsAtivos,
        proximasReunioes: reunioes.data || [],
      });
    };

    fetchData();
  }, [user]);

  const totalTarefas = stats.tarefasPendentes + stats.tarefasEmAndamento + stats.tarefasConcluidas;
  const progressoTarefas = totalTarefas > 0 ? (stats.tarefasConcluidas / totalTarefas) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Acompanhamento</h1>
        <p className="text-muted-foreground">Monitore o progresso das suas atividades</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progresso Geral</span>
                <span className="text-sm font-medium">{progressoTarefas.toFixed(0)}%</span>
              </div>
              <Progress value={progressoTarefas} />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats.tarefasPendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{stats.tarefasEmAndamento}</p>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.tarefasConcluidas}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboards Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-primary">{stats.onboardsAtivos}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Processos de onboarding em andamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Reuniões</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.proximasReunioes.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma reunião agendada.</p>
          ) : (
            <div className="space-y-4">
              {stats.proximasReunioes.map((reuniao) => (
                <div
                  key={reuniao.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{reuniao.titulo}</p>
                    {reuniao.descricao && (
                      <p className="text-sm text-muted-foreground">{reuniao.descricao}</p>
                    )}
                    {reuniao.local && (
                      <p className="text-sm text-muted-foreground">Local: {reuniao.local}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(reuniao.data_hora).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reuniao.data_hora).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Acompanhamento;
