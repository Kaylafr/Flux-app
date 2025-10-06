import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Onboard {
  id: string;
  cliente_nome: string;
  data_inicio: string;
  status: string;
  etapa_atual: string;
  observacoes: string;
}

const Onboards = () => {
  const { user } = useAuth();
  const [onboards, setOnboards] = useState<Onboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    data_inicio: '',
    status: 'em_andamento',
    etapa_atual: '',
    observacoes: '',
  });

  const fetchOnboards = async () => {
    const { data, error } = await supabase
      .from('onboards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar onboards');
    } else {
      setOnboards(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchOnboards();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('onboards').insert([
      {
        ...formData,
        user_id: user?.id,
      },
    ]);

    if (error) {
      toast.error('Erro ao adicionar onboard');
    } else {
      toast.success('Onboard adicionado com sucesso!');
      setOpen(false);
      setFormData({
        cliente_nome: '',
        data_inicio: '',
        status: 'em_andamento',
        etapa_atual: '',
        observacoes: '',
      });
      fetchOnboards();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('onboards').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir onboard');
    } else {
      toast.success('Onboard excluído com sucesso!');
      fetchOnboards();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('onboards')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
      fetchOnboards();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Onboards</h1>
          <p className="text-muted-foreground">Gerencie o onboarding de novos clientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Onboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Onboard</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="etapa_atual">Etapa Atual</Label>
                <Input
                  id="etapa_atual"
                  value={formData.etapa_atual}
                  onChange={(e) => setFormData({ ...formData, etapa_atual: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando...</p>
        ) : onboards.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Nenhum onboard cadastrado ainda.</p>
            </CardContent>
          </Card>
        ) : (
          onboards.map((onboard) => (
            <Card key={onboard.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{onboard.cliente_nome}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(onboard.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">
                    {new Date(onboard.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {onboard.etapa_atual && (
                  <div>
                    <p className="text-sm text-muted-foreground">Etapa Atual</p>
                    <p className="font-medium">{onboard.etapa_atual}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Select
                    value={onboard.status}
                    onValueChange={(value) => handleStatusChange(onboard.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {onboard.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{onboard.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Onboards;
