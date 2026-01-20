import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Clock, Phone } from "lucide-react";

export default function Locations() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Nossas Localizações</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">Visite nossa sede em Maputo para um atendimento personalizado.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-primary mr-2" /> Sede Principal - Maputo
            </h2>
            
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
                <Clock className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Horário de Atendimento</p>
                  <p className="text-gray-600">Segunda a Sexta: 08:00 - 17:00</p>
                  <p className="text-gray-600">Sábado: 08:00 - 12:00</p>
                  <p className="text-gray-500 text-sm mt-1">Domingos e Feriados: Fechado</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Contatos</p>
                  <p className="text-gray-600">+258 84 123 4567</p>
                  <p className="text-gray-600">geral@microcreditomais.mz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 rounded-2xl h-[400px] overflow-hidden shadow-lg relative">
            {}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Mapa Interativo Indisponível</p>
                <p className="text-gray-500 text-sm">Visualize nossa localização no Google Maps</p>
              </div>
            </div>
            {}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.356720766347!2d32.57317331502476!3d-25.96814498354261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69a8b13c77d5d%3A0x6b83445582962132!2sMaputo%2C%20Mozambique!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen={false} 
              loading="lazy"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
