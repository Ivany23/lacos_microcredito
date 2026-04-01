import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator, Landmark, Calendar, TrendingUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLoans } from "@/hooks/use-loans";
import { useLocation } from "wouter";

export function LoanSimulator() {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(3);
  const [total, setTotal] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  
  const { user } = useAuth();
  const { createLoan, isCreating } = useLoans();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Lógica Financeira Dinâmica Requisitada pelo Usuário:
    // A taxa mensal muda conforme o prazo para garantir que os juros façam sentido.
    let monthlyRate = 0.20; // 20% inicial para 1 mês
    
    if (months === 2) {
      monthlyRate = 0.15; // Reduz a taxa mensal para 15% se o prazo for maior
    } else if (months === 3) {
      monthlyRate = 0.12; // Reduz a taxa mensal para 12% se o prazo for 3 meses
    }
    
    const totalInterest = amount * monthlyRate * months;
    const totalToPay = amount + totalInterest;
    
    setTotal(totalToPay);
    setMonthlyPayment(totalToPay / months);
    setInterestRate(monthlyRate * 100);
  }, [amount, months]);

  const handleAction = () => {
    if (!user) {
      const contactSection = document.getElementById("contacto");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      } else {
        setLocation("/login");
      }
      return;
    }

    createLoan({
      amount,
      months,
      totalPayable: total
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-xl mx-auto"
    >
      <Card className="border-0 shadow-2xl glass-premium overflow-hidden relative group">
        {}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        
        <div className="bg-gradient-to-br from-[#1e3a8a] via-primary to-[#2563eb] p-8 text-white relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-display font-extrabold flex items-center gap-3 tracking-tight">
                <Calculator className="w-8 h-8 text-secondary animate-bounce" />
                Simulador Mais
              </h3>
              <p className="text-blue-100/90 mt-1 font-medium italic">Taxas dinâmicas ajustadas ao seu prazo</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
               <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-10 relative bg-white/80">
          {}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> Capital Requerido
                </label>
                <div className="text-4xl font-display font-extrabold text-gray-900">
                  {amount.toLocaleString()} <span className="text-xl font-normal text-gray-400">MTN</span>
                </div>
              </div>
            </div>
            <Slider
              defaultValue={[10000]}
              max={100000}
              min={1000}
              step={1000}
              value={[amount]}
              onValueChange={(val) => setAmount(val[0])}
              className="py-4"
            />
            <div className="flex justify-between text-[11px] font-bold text-gray-400">
              <span className="px-3 py-1 bg-gray-100 rounded-full">MÍN: 1.000 MTN</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">MÁX: 100.000 MTN</span>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Escolha o Prazo
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`relative py-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 overflow-hidden ${
                    months === m 
                      ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.03]" 
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:border-primary/50"
                  }`}
                >
                  {m} {m === 1 ? 'Mês' : 'Meses'}
                  {months === m && (
                    <motion.div layoutId="activeMonth" className="absolute inset-0 bg-white/10" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="bg-gradient-to-br from-gray-50 to-white p-7 rounded-3xl border border-gray-100 shadow-inner space-y-6">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500 font-semibold italic">
                <Info className="w-4 h-4 text-primary" /> Taxa Mensal Aplicada
              </div>
              <span className="font-extrabold text-primary text-lg">{interestRate}%</span>
            </div>
            
            <div className="h-px bg-gray-100" />
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${amount}-${months}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">Valor Final Acumulado</span>
                  <span className="font-extrabold text-gray-900 text-xl">{total.toLocaleString()} MTN</span>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 shadow-sm">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Prestações de:</span>
                  <div className="text-4xl font-display font-extrabold text-primary">
                    {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    <span className="text-sm ml-1 font-bold">MTN</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleAction}
              disabled={isCreating}
              className="w-full py-8 text-xl font-bold bg-primary hover:bg-blue-700 text-white shadow-2xl shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 rounded-2xl group"
            >
              {isCreating ? "Processando..." : user ? "Confirmar Solicitação" : "Simular e Contactar"}
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-5 font-bold uppercase tracking-[0.2em] opacity-80">
              Taxas ajustadas para o mercado de Moçambique
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>

  );
}


