import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/login-bg.jpg";
import logoAzaleia from "@/assets/logo_azaleia.png";
import logoFlor from "@/assets/logo_azaleia_flor.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        toast({
          title: "Conta criada",
          description: "Verifique seu e-mail para confirmar o cadastro."
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: `url(${loginBg})` }} />

      <div className="absolute inset-0 z-0 bg-foreground/40" />

      <div className="relative z-10 w-full max-w-md animate-fade-in rounded-2xl bg-black/50 backdrop-blur-md p-6">
        <div className="mb-6 text-center">
          




          <img
            src={logoAzaleia}
            alt="Residencial Azaléia"
            className="mx-auto mb-3 h-36 w-auto drop-shadow-lg" />

          <p className="text-sm text-primary-foreground/80 drop-shadow">Controle de Entrada e Saída</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{isSignUp ? "Criar Conta" : "Entrar"}</CardTitle>
            <CardDescription>
              {isSignUp ?
              "Crie sua conta para acessar o sistema" :
              "Acesse com suas credenciais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="porteiro@azaleia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />

              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6} />

              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full text-base font-semibold border-2 border-primary/50 hover:bg-primary/10"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase.auth.signInAnonymously();
                  if (error) throw error;
                  navigate("/dashboard");
                } catch (error: any) {
                  toast({ title: "Erro", description: error.message, variant: "destructive" });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <UserRound className="mr-2 h-5 w-5" />
              Entrar sem E-mail
            </Button>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default Login;