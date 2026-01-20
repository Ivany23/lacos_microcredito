import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <Redirect to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
              <p className="text-gray-500">Bem-vindo, {user.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all active:scale-95"
            >
              Sair da Conta
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center border-dashed">
          <p className="text-gray-500">Os dados detalhados do seu perfil serão exibidos aqui em breve.</p>
        </div>
      </div>
    </div>
  );
}
