import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLoans } from "@/hooks/use-loans";
import { Link, useLocation } from "wouter";

export function LoanSimulator() {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(3);
  const [total, setTotal] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const { user } = useAuth();
  const { createLoan, isCreating } = useLoans();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const interest = amount * 0.20; 
    const totalToPay = amount + interest;
    setTotal(totalToPay);
    setMonthlyPayment(totalToPay / months);
  }, [amount, months]);

  const handleSubmit = () => {
    if (!user) {
      setLocation("/login");
      return;
    }

    createLoan({
      amount,
      months,
      totalPayable: total
    });
  };

  return (
    <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
      <div className="bg-primary p-6 text-white text-center">
        <h3 className="text-2xl font-display font-bold flex items-center justify-center gap-2">
          <Calculator className="w-6 h-6" />
          Simulador de Crédito
        </h3>
        <p className="text-primary-foreground/80 mt-2">Calcule suas parcelas agora mesmo</p>
      </div>
      <CardContent className="p-6 md:p-8 space-y-8 bg-white">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">Valor do Empréstimo</label>
            <span className="text-xl font-bold text-primary">{amount.toLocaleString()} MTN</span>
          </div>
          <Slider
            defaultValue={[10000]}
            max={100000}
            min={500}
            step={500}
            value={[amount]}
            onValueChange={(val) => setAmount(val[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>500 MTN</span>
            <span>100.000 MTN</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Prazo de Pagamento</label>
          <Select value={months.toString()} onValueChange={(val) => setMonths(parseInt(val))}>
            <SelectTrigger className="w-full text-base py-6">
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Mês</SelectItem>
              <SelectItem value="2">2 Meses</SelectItem>
              <SelectItem value="3">3 Meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <span className="text-gray-600">Total a Pagar (com 20%)</span>
            <span className="font-bold text-lg text-gray-900">{total.toLocaleString()} MTN</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mensalidade Estimada</span>
            <span className="font-bold text-2xl text-secondary">{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })} MTN</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isCreating}
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {isCreating ? "Processando..." : "Solicitar Crédito"}
          {!isCreating && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        {!user && (
          <p className="text-center text-xs text-gray-500">
            Você será redirecionado para login/registro.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
