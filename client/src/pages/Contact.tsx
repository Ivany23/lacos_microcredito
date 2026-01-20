import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Fale Conosco</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">Estamos aqui para ajudar. Entre em contato por qualquer um dos canais abaixo.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <ContactInfoCard icon={<Phone className="w-6 h-6 text-primary" />} title="Telefone" content="+258 84 123 4567" subContent="Seg-Sex, 8h às 17h" />
          <ContactInfoCard icon={<Mail className="w-6 h-6 text-primary" />} title="Email" content="info@microcreditomais.mz" subContent="Resposta em até 24h" />
          <ContactInfoCard icon={<MapPin className="w-6 h-6 text-primary" />} title="Escritório" content="Av. 24 de Julho, Nº 1500" subContent="Maputo, Moçambique" />
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-gray-100">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Envie uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nome</label>
                    <Input placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Assunto</label>
                  <Input placeholder="Sobre o que você quer falar?" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mensagem</label>
                  <Textarea placeholder="Escreva sua mensagem aqui..." className="min-h-[150px]" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 text-base">
                  Enviar Mensagem <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ContactInfoCard({ icon, title, content, subContent }: any) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-primary font-medium text-lg">{content}</p>
      <p className="text-gray-500 text-sm mt-1">{subContent}</p>
    </div>
  );
}
