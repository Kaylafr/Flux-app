import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Relatorios = () => {
  const { user } = useAuth();
  const [tarefasData, setTarefasData] = useState<any[]>([]);
  const [clientesData, setClientesData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [tarefas, clientes] = await Promise.all([
        supabase.from('tarefas').select('status'),
        supabase.from('clientes').select('status'),
      ]);

      // Processar dados de tarefas
      const tarefasCount = {
        pendente: tarefas.data?.filter((t) => t.status === 'pendente').length || 0,
        em_andamento: tarefas.data?.filter((t) => t.status === 'em_andamento').length || 0,
        concluida: tarefas.data?.filter((t) => t.status === 'concluida').length || 0,
      };

      setTarefasData([
        { name: 'Pendente', value: tarefasCount.pendente },
        { name: 'Em Andamento', value: tarefasCount.em_andamento },
        { name: 'Concluída', value: tarefasCount.concluida },
      ]);

      // Processar dados de clientes
      const clientesCount = {
        ativo: clientes.data?.filter((c) => c.status === 'ativo').length || 0,
        inativo: clientes.data?.filter((c) => c.status === 'inativo').length || 0,
      };

      setClientesData([
        { name: 'Ativos', value: clientesCount.ativo },
        { name: 'Inativos', value: clientesCount.inativo },
      ]);
    };

    fetchData();
  }, [user]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Dashboards</h1>
        <p className="text-muted-foreground">Visualize estatísticas e análises</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tarefasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Total de Tarefas</span>
              <span className="font-bold">
                {tarefasData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Total de Clientes</span>
              <span className="font-bold">
                {clientesData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Taxa de Conclusão</span>
              <span className="font-bold">
                {tarefasData.reduce((acc, curr) => acc + curr.value, 0) > 0
                  ? (
                      (tarefasData.find((t) => t.name === 'Concluída')?.value || 0) /
                      tarefasData.reduce((acc, curr) => acc + curr.value, 0) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
