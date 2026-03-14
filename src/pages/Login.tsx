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
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 z-0 bg-foreground/50 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <img
            src={logoAzaleia}
            alt="Residencial Azaléia"
            className="mx-auto mb-4 h-36 w-auto drop-shadow-2xl" />
          <p className="text-sm font-medium text-primary-foreground/80 drop-shadow-md tracking-wide">
            Controle de Entrada e Saída
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">{isSignUp ? "Criar Conta" : "Entrar"}</CardTitle>
            <CardDescription className="text-sm">
              {isSignUp ?
              "Crie sua conta para acessar o sistema" :
              "Acesse com suas credenciais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="porteiro@azaleia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl bg-secondary/50" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base btn-glow" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">ou</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold border-2 border-primary/30 hover:bg-primary/5"
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
              }}>
              <UserRound className="mr-2 h-5 w-5" />
              Entrar sem E-mail
            </Button>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
