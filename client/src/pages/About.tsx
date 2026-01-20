import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Sobre Nós</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">Conheça a história e a missão por trás da instituição financeira que mais cresce em Moçambique.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
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
              {}
              <img
                src="/about-team.png"
                alt="Nossa missão"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card title="Visão" content="Ser a referência em microcrédito digital em Moçambique, reconhecida pela excelência no atendimento e inovação tecnológica." />
          <Card title="Valores" content="Transparência, Integridade, Inovação, Responsabilidade Social e Foco no Cliente são os pilares que guiam todas as nossas decisões." />
          <Card title="Compromisso" content="Comprometidos em ajudar famílias e pequenos empreendedores moçambicanos a alcançarem seus objetivos financeiros com segurança e transparência." />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-12">Nossa Equipe</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <TeamMember name="João Silva" role="Diretor Geral" />
            <TeamMember name="Maria Machel" role="Gerente de Crédito" />
            <TeamMember name="Paulo Costa" role="Tecnologia" />
            <TeamMember name="Ana Santos" role="Atendimento" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Card({ title, content }: { title: string, content: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}

function TeamMember({ name, role }: { name: string, role: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
          {name.charAt(0)}
        </div>
      </div>
      <h4 className="font-bold text-gray-900">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
}
