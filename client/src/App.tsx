import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";


import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Locations from "@/pages/Locations";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Login from "@/pages/Auth/Login";
import LoginAdmin from "@/pages/Auth/LoginAdmin";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminClients from "@/pages/Admin/Clients";
import ClientDetail from "@/pages/Admin/ClientDetail/index";
import AdminLoans from "@/pages/Admin/Loans";
import AdminPayments from "@/pages/Admin/Payments";
import AdminSettings from "@/pages/Admin/Settings";
import BlogPost1 from "@/pages/BlogPost1";
import BlogPost2 from "@/pages/BlogPost2";
import BlogPost3 from "@/pages/BlogPost3";
import { LoanSimulator } from "@/components/LoanSimulator";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

function SimulatorPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <LoanSimulator />
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Router() {
    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/locations" component={Locations} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/post1" component={BlogPost1} />
            <Route path="/blog/post2" component={BlogPost2} />
            <Route path="/blog/post3" component={BlogPost3} />
            <Route path="/contact" component={Contact} />
            <Route path="/simulator" component={SimulatorPage} />

            {}
            <Route path="/login" component={Login} />
            <Route path="/login-admin" component={LoginAdmin} />

            {}
            <Route path="/profile" component={Profile} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/clients" component={AdminClients} />
            <Route path="/admin/clients/:id" component={ClientDetail} />
            <Route path="/admin/loans" component={AdminLoans} />
            <Route path="/admin/payments" component={AdminPayments} />
            <Route path="/admin/settings" component={AdminSettings} />

            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Router />
            </TooltipProvider>
        </AuthProvider>
    );
}

export default App;
