import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Reuniao {
  id: string;
  titulo: string;
  descricao: string;
  data_hora: string;
  local: string;
  participantes: string;
}

const Reunioes = () => {
  const { user } = useAuth();
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_hora: '',
    local: '',
    participantes: '',
  });

  const fetchReunioes = async () => {
    const { data, error } = await supabase
      .from('reunioes')
      .select('*')
      .order('data_hora', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar reuniões');
    } else {
      setReunioes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchReunioes();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('reunioes').insert([
      {
        ...formData,
        user_id: user?.id,
      },
    ]);

    if (error) {
      toast.error('Erro ao adicionar reunião');
    } else {
      toast.success('Reunião adicionada com sucesso!');
      setOpen(false);
      setFormData({
        titulo: '',
        descricao: '',
        data_hora: '',
        local: '',
        participantes: '',
      });
      fetchReunioes();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reunioes').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir reunião');
    } else {
      toast.success('Reunião excluída com sucesso!');
      fetchReunioes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reuniões</h1>
          <p className="text-muted-foreground">Agende e gerencie suas reuniões</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Reunião
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Reunião</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_hora">Data e Hora *</Label>
                <Input
                  id="data_hora"
                  type="datetime-local"
                  value={formData.data_hora}
                  onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participantes">Participantes</Label>
                <Input
                  id="participantes"
                  value={formData.participantes}
                  onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                  placeholder="Separe por vírgula"
                />
              </div>
              <Button type="submit" className="w-full">Agendar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando...</p>
        ) : reunioes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Nenhuma reunião agendada ainda.</p>
            </CardContent>
          </Card>
        ) : (
          reunioes.map((reuniao) => (
            <Card key={reuniao.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{reuniao.titulo}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reuniao.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reuniao.descricao && (
                  <p className="text-sm text-muted-foreground">{reuniao.descricao}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(reuniao.data_hora).toLocaleString('pt-BR')}
                </div>
                {reuniao.local && (
                  <p className="text-sm">
                    <span className="font-medium">Local:</span> {reuniao.local}
                  </p>
                )}
                {reuniao.participantes && (
                  <p className="text-sm">
                    <span className="font-medium">Participantes:</span> {reuniao.participantes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Reunioes;
