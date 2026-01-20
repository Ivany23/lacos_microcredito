import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoanSimulator } from "@/components/LoanSimulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, Users, Building2, Zap, Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {}
      <section id="inicio" className="relative bg-gradient-to-br from-gray-900 to-primary/90 text-white py-20 lg:py-32 overflow-hidden">
        {}
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
        {}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop")' }}
        />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                <span className="text-sm font-medium">Aprovação em até 24h</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-6">
                Financiamento rápido para o futuro de Moçambique
              </h1>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-xl">
                Créditos acessíveis para empreendedores, trabalhadores e jovens visionários.
                Sem burocracia complexa, 100% digital e seguro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contacto">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-secondary/25 text-lg">
                    Fale Conosco
                  </Button>
                </a>
                <a href="#sobre">
                  <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 text-white px-8 py-6 rounded-xl text-lg">
                    Saber Mais
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10"
            >
              <LoanSimulator />
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary font-display mb-1">100K</p>
              <p className="text-gray-600 text-sm">Crédito Máximo</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary font-display mb-1">24h</p>
              <p className="text-gray-600 text-sm">Resposta Rápida</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary font-display mb-1">3</p>
              <p className="text-gray-600 text-sm">Meses Máximo</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary font-display mb-1">100%</p>
              <p className="text-gray-600 text-sm">Digital</p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Soluções Financeiras Sob Medida</h2>
            <p className="text-gray-600">Oferecemos diversos tipos de crédito adaptados às suas necessidades e sonhos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Users className="w-10 h-10 text-primary" />}
              title="Crédito Pessoal"
              description="Para despesas inesperadas, educação ou compras pessoais. Taxas justas e prazos flexíveis."
            />
            <ServiceCard
              icon={<Building2 className="w-10 h-10 text-primary" />}
              title="Microcrédito Negócios"
              description="Impulsione seu pequeno negócio. Capital de giro para comprar estoque ou equipamentos."
            />
            <ServiceCard
              icon={<Zap className="w-10 h-10 text-primary" />}
              title="Crédito Rápido"
              description="Soluções de emergência com aprovação expressa para quem não pode esperar."
            />
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/20 rounded-2xl transform -rotate-3"></div>
              {}
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop"
                alt="Equipe feliz"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Por que escolher o Microcrédito Mais?</h2>
              <div className="space-y-6">
                <BenefitItem title="Transparência Total" description="Sem taxas escondidas. Você sabe exatamente quanto vai pagar desde o início." />
                <BenefitItem title="Segurança Garantida" description="Seus dados são protegidos com a mais alta tecnologia de criptografia." />
                <BenefitItem title="Sem Burocracia" description="Processo 100% online. Adeus às filas e papelada desnecessária." />
                <BenefitItem title="Apoio Local" description="Uma empresa moçambicana que entende a realidade e necessidades do país." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="sobre" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Nossa Missão</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Nossa missão é democratizar o acesso ao crédito em Moçambique, oferecendo soluções financeiras justas, transparentes e ágeis que impulsionem o desenvolvimento econômico e social de nossos clientes.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Acreditamos que cada moçambicano merece a oportunidade de realizar seus sonhos, seja expandir um negócio, reformar a casa ou investir na educação.
                </p>
              </div>
              <div className="relative h-64 md:h-auto">
                <img
                  src="/about-team.png"
                  alt="Nossa missão"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-primary mb-4">Visão</h3>
                <p className="text-gray-600 leading-relaxed">Ser a referência em microcrédito digital em Moçambique, reconhecida pela excelência no atendimento e inovação tecnológica.</p>
              </CardContent>
            </Card>
            <Card className="border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-primary mb-4">Valores</h3>
                <p className="text-gray-600 leading-relaxed">Transparência, Integridade, Inovação, Responsabilidade Social e Foco no Cliente são os pilares que guiam todas as nossas decisões.</p>
              </CardContent>
            </Card>
            <Card className="border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-primary mb-4">Compromisso</h3>
                <p className="text-gray-600 leading-relaxed">Comprometidos em ajudar famílias e pequenos empreendedores moçambicanos a alcançarem seus objetivos financeiros com segurança.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Fale Conosco</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Estamos aqui para ajudar. Entre em contato por qualquer um dos canais abaixo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <ContactInfoCard icon={<Phone className="w-6 h-6 text-primary" />} title="Telefone" content="+258 84 123 4567" subContent="Seg-Sex, 8h às 17h" />
            <ContactInfoCard icon={<Mail className="w-6 h-6 text-primary" />} title="Email" content="info@microcreditomais.mz" subContent="Resposta em até 24h" />
            <ContactInfoCard icon={<MapPin className="w-6 h-6 text-primary" />} title="Escritório" content="Av. 24 de Julho, Nº 1500" subContent="Maputo, Moçambique" />
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="shadow-xl border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Envie uma mensagem</h3>
                <form onSubmit={handleContactSubmit} className="space-y-6">
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
      </section>

      {}
      <section id="localizacoes" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Nossa Localização</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Visite nossa sede em Maputo para um atendimento personalizado.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-6 h-6 text-primary mr-2" /> Sede Principal - Maputo
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Endereço</p>
                    <p className="text-gray-600">Av. 24 de Julho, Nº 1500, 3º Andar</p>
                    <p className="text-gray-600">Maputo, Moçambique</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Telefone</p>
                    <p className="text-gray-600">+258 84 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">geral@microcreditomais.mz</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-200 rounded-2xl h-[400px] overflow-hidden shadow-lg relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.356720766347!2d32.57317331502476!3d-25.96814498354261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69a8b13c77d5d%3A0x6b83445582962132!2sMaputo%2C%20Mozambique!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Pronto para realizar seus sonhos?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Comece sua jornada financeira conosco. Crédito rápido, transparente e acessível.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contacto">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-6 rounded-xl shadow-lg">
                Fale Conosco Agora
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle2 className="w-6 h-6 text-secondary" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
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
