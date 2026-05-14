"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import { useAuth } from "@/features/auth/auth-provider";

type AuthPageMode = "login" | "register";

export function AuthPage({ mode }: { mode: AuthPageMode }) {
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "gabriel@example.com" : "");
  const [password, setPassword] = useState(mode === "login" ? "demo1234" : "");
  const [defaultCurrency, setDefaultCurrency] = useState("CAD");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password, defaultCurrency });
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Une erreur d'authentification est survenue.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
        <section className="hidden rounded-xl border bg-background p-8 lg:block">
          <div className="flex items-center gap-3">
            <AppLogo />
            <Badge variant="outline">Local auth</Badge>
          </div>
          <div className="mt-10 max-w-md space-y-4">
            <h1 className="text-4xl font-semibold tracking-normal">BudgetApp</h1>
            <p className="text-base text-muted-foreground">
              Authentification locale temporaire pour simuler inscription, connexion et session utilisateur, avec une couche de service remplaçable plus tard par un backend.
            </p>
          </div>
          <div className="mt-10 grid gap-4">
            <InfoCard
              title="Compte demo"
              description="Courriel: gabriel@example.com"
              detail="Mot de passe: demo1234"
            />
            <InfoCard
              title="Persistance locale"
              description="La session et les utilisateurs sont stockes localement."
              detail="Le remplacement futur par API / PostgreSQL reste isole dans les services."
            />
          </div>
        </section>

        <Card className="border bg-background shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <AppLogo />
              <Badge variant="secondary">{mode === "login" ? "Connexion" : "Inscription"}</Badge>
            </div>
            <div>
              <CardTitle className="text-2xl">{mode === "login" ? "Connexion locale" : "Creer un compte local"}</CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Accede a ton espace BudgetApp avec une session temporaire locale."
                  : "Cree un utilisateur local, son budget personnel et une session immediate."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <Field label="Nom">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ton nom complet" />
                </Field>
              ) : null}

              <Field label="Courriel">
                <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="nom@exemple.com" />
              </Field>

              <Field label="Mot de passe">
                <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Minimum 6 caracteres" />
              </Field>

              {mode === "register" ? (
                <Field label="Devise par defaut">
                  <select className={selectClassName} value={defaultCurrency} onChange={(event) => setDefaultCurrency(event.target.value)}>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {mode === "login" ? <LockKeyhole className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
                {isSubmitting ? "Chargement..." : mode === "login" ? "Se connecter" : "Creer mon compte"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {mode === "login" ? "Pas encore de compte ?" : "Tu as deja un compte ?"}
              </span>
              <Link className="inline-flex items-center gap-1 font-medium text-primary" href={mode === "login" ? "/inscription" : "/connexion"}>
                {mode === "login" ? "S'inscrire" : "Se connecter"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function InfoCard({
  description,
  detail,
  title,
}: {
  description: string;
  detail: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
