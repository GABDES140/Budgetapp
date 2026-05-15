"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Download,
  FileSpreadsheet,
  FileUp,
  FileWarning,
  Files,
  Link2,
  MailPlus,
  ShieldCheck,
  Users,
  Upload,
} from "lucide-react";

import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-provider";
import {
  buildTemplateWorkbook,
  buildTransactionsExport,
  confirmImport,
  getImportSummaryText,
  IMPORT_TEMPLATE_COLUMNS,
  listExportTransactions,
  parseImportFile,
  validateImportRows,
  type ImportPreview,
} from "@/services/import-service";
import { localBudgetAppDataService } from "@/services/local-data-service";
import {
  acceptSharedBudgetInvitation,
  buildInvitationTokenPreview,
  buildMemberRoleLabel,
  createSharedBudgetInvitation,
  formatInvitationExpiry,
  getAccessibleBudgets,
  getBudgetInvitations,
  getBudgetMembersWithUsers,
  getInvitationShareLink,
  getPendingInvitationsForEmail,
  isBudgetOwner,
} from "@/services/shared-budget-service";
import type { Budget, Category, EntityId, Subcategory, User } from "@/types";

export function SettingsPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [budgetInvitations, setBudgetInvitations] = useState<Awaited<ReturnType<typeof getBudgetInvitations>>>([]);
  const [budgetMembers, setBudgetMembers] = useState<Awaited<ReturnType<typeof getBudgetMembersWithUsers>>>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Awaited<ReturnType<typeof getPendingInvitationsForEmail>>>([]);
  const [activeBudgetId, setActiveBudgetId] = useState<EntityId>("");
  const [activeUserId, setActiveUserId] = useState<EntityId>("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sharedBudgetError, setSharedBudgetError] = useState<string | null>(null);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBudget = budgets.find((budget) => budget.id === activeBudgetId);
  const activeUser = users.find((user) => user.id === activeUserId);

  async function loadData(nextBudgetId?: EntityId) {
    const data = await localBudgetAppDataService.getData();
    const preferredUserId = activeUserId || session?.userId;
    const user = data.users.find((item) => item.id === preferredUserId) ?? data.users[0];
    const accessibleBudgets = user ? await getAccessibleBudgets(user.id) : [];
    const budget =
      accessibleBudgets.find((item) => item.id === nextBudgetId) ??
      accessibleBudgets.find((item) => item.id === activeBudgetId) ??
      accessibleBudgets[0];

    if (!user || !budget) {
      setIsReady(true);
      return;
    }

    setUsers(data.users);
    setBudgets(accessibleBudgets);
    setCategories(data.categories);
    setSubcategories(data.subcategories);
    setActiveUserId(user.id);
    setActiveBudgetId(budget.id);
    setBudgetMembers(await getBudgetMembersWithUsers(budget.id));
    setBudgetInvitations(await getBudgetInvitations(budget.id));
    setPendingInvitations(await getPendingInvitationsForEmail(user.email));
    setIsReady(true);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setStatusMessage(null);
    setImportError(null);

    if (!file || !activeBudgetId || !activeUserId) {
      return;
    }

    try {
      const parsed = await parseImportFile(file);
      const missingColumns = IMPORT_TEMPLATE_COLUMNS.filter((column) => !parsed.columns.includes(column));
      const allowedMissingColumns = ["subcategory", "description", "notes"];
      const blockingMissingColumns = missingColumns.filter((column) => !allowedMissingColumns.includes(column));

      if (blockingMissingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${blockingMissingColumns.join(", ")}`);
      }

      const nextPreview = validateImportRows({
        budgetId: activeBudgetId,
        userId: activeUserId,
        rows: parsed.rows,
        categories,
        subcategories,
      });

      setPreview(nextPreview);
      setStatusMessage(getImportSummaryText(nextPreview));
    } catch (error) {
      setPreview(null);
      setImportError(error instanceof Error ? error.message : "Le fichier n'a pas pu etre traite.");
    }
  }

  async function handleConfirmImport() {
    if (!preview || preview.validRows.length === 0) {
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const importedCount = await confirmImport(preview);
      await loadData(activeBudgetId);
      setPreview(null);
      setStatusMessage(`${importedCount} transaction(s) importee(s).`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "L'import n'a pas pu etre confirme.");
    } finally {
      setIsImporting(false);
    }
  }

  function handleDownloadTemplate(format: "csv" | "xlsx") {
    const file = buildTemplateWorkbook(format);
    downloadBlob(file.blob, file.filename);
    setStatusMessage(`Template ${format.toUpperCase()} telecharge.`);
  }

  async function handleExport(format: "csv" | "xlsx") {
    if (!activeBudgetId) {
      return;
    }

    const data = await localBudgetAppDataService.getData();
    const transactions = listExportTransactions(data, activeBudgetId);
    const file = buildTransactionsExport({
      transactions,
      categories,
      subcategories,
      format,
    });

    downloadBlob(file.blob, file.filename);
    setStatusMessage(`Export ${format.toUpperCase()} genere avec ${transactions.length} transaction(s).`);
  }

  async function handleCreateInvitation() {
    if (!activeBudget || !activeUser) {
      return;
    }

    setSharedBudgetError(null);
    setStatusMessage(null);
    setIsSubmittingInvite(true);

    try {
      const invitation = await createSharedBudgetInvitation({
        budget: activeBudget,
        createdBy: activeUser,
        email: inviteEmail,
      });
      setInviteEmail("");
      await loadData(activeBudget.id);
      setStatusMessage(`Invitation creee. Token local: ${buildInvitationTokenPreview(invitation)}`);
    } catch (error) {
      setSharedBudgetError(error instanceof Error ? error.message : "L'invitation n'a pas pu etre creee.");
    } finally {
      setIsSubmittingInvite(false);
    }
  }

  async function handleAcceptInvitation(token: string) {
    if (!activeUser) {
      return;
    }

    setSharedBudgetError(null);
    setStatusMessage(null);

    try {
      await acceptSharedBudgetInvitation(token, activeUser.id);
      await loadData();
      setStatusMessage("Invitation acceptee. Le budget partage est maintenant accessible.");
    } catch (error) {
      setSharedBudgetError(error instanceof Error ? error.message : "L'invitation n'a pas pu etre acceptee.");
    }
  }

  if (!isReady) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement de l&apos;import / export...</CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">Budget partage</CardTitle>
                  <CardDescription>Invitation locale simple, rattachement au budget et consultation commune des donnees.</CardDescription>
                </div>
                <Badge variant={activeBudget?.type === "shared" ? "secondary" : "outline"}>
                  {activeBudget?.type === "shared" ? "Partage actif" : "Personnel"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="grid gap-1.5 text-sm font-medium">
                  <span>Inviter par courriel</span>
                  <Input
                    type="email"
                    value={inviteEmail}
                    placeholder="personne@exemple.com"
                    onChange={(event) => setInviteEmail(event.target.value)}
                    disabled={!isBudgetOwner(activeBudget, activeUserId)}
                  />
                </label>
                <Button
                  className="md:self-end"
                  type="button"
                  onClick={() => void handleCreateInvitation()}
                  disabled={!isBudgetOwner(activeBudget, activeUserId) || !inviteEmail.trim() || isSubmittingInvite}
                >
                  <MailPlus className="h-4 w-4" aria-hidden="true" />
                  {isSubmittingInvite ? "Envoi..." : "Inviter"}
                </Button>
              </div>
              {!isBudgetOwner(activeBudget, activeUserId) ? (
                <p className="text-sm text-muted-foreground">
                  Seul le proprietaire du budget peut envoyer une invitation dans ce MVP.
                </p>
              ) : null}
              {sharedBudgetError ? <p className="text-sm text-destructive">{sharedBudgetError}</p> : null}
              <div className="grid gap-3 lg:grid-cols-2">
                <SharedBudgetPanel
                  icon={Users}
                  title="Membres"
                  description="Structure deja compatible avec les roles owner / member pour de futures permissions."
                >
                  <div className="space-y-2">
                    {budgetMembers.length > 0 ? (
                      budgetMembers.map(({ member, user }) => (
                        <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{user?.name ?? member.userId}</p>
                            <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Utilisateur local"}</p>
                          </div>
                          <Badge variant={member.role === "owner" ? "secondary" : "outline"}>
                            {buildMemberRoleLabel(member)}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun membre rattache a ce budget.</p>
                    )}
                  </div>
                </SharedBudgetPanel>

                <SharedBudgetPanel
                  icon={Link2}
                  title="Invitations"
                  description="Simulation locale par email et token, sans envoi reel."
                >
                  <div className="space-y-2">
                    {budgetInvitations.length > 0 ? (
                      budgetInvitations.map((invitation) => (
                        <div key={invitation.id} className="rounded-md border p-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{invitation.email}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                Token: {buildInvitationTokenPreview(invitation)}
                              </p>
                            </div>
                            <Badge variant={invitation.status === "pending" ? "outline" : "secondary"}>
                              {invitation.status === "pending" ? "En attente" : invitation.status === "accepted" ? "Acceptee" : "Expiree"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Expire le {formatInvitationExpiry(invitation)}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            Lien local: {getInvitationShareLink(invitation)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune invitation pour ce budget.</p>
                    )}
                  </div>
                </SharedBudgetPanel>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Invitations recues</CardTitle>
                  <CardDescription>
                    Si ton courriel correspond a une invitation en attente, tu peux rejoindre un budget partage.
                  </CardDescription>
                </div>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingInvitations.length > 0 ? (
                pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{invitation.email}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">Token: {buildInvitationTokenPreview(invitation)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Expire le {formatInvitationExpiry(invitation)}</p>
                      </div>
                      <Button type="button" variant="outline" onClick={() => void handleAcceptInvitation(invitation.token)}>
                        Rejoindre
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Aucune invitation en attente pour ce compte.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Import / Export</CardTitle>
              <CardDescription>Template standardise, validation simple, apercu avant confirmation et export du budget actif.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ActionButton icon={Download} label="Template CSV" onClick={() => handleDownloadTemplate("csv")} />
              <ActionButton icon={FileSpreadsheet} label="Template Excel" onClick={() => handleDownloadTemplate("xlsx")} />
              <ActionButton icon={Files} label="Export CSV" onClick={() => void handleExport("csv")} />
              <ActionButton icon={Download} label="Export Excel" onClick={() => void handleExport("xlsx")} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contexte actif</CardTitle>
              <CardDescription>Le budget choisi sert a la validation des categories et a l&apos;export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="grid gap-1.5 text-sm font-medium">
                <span>Budget</span>
                <select
                  className={selectClassName}
                  value={activeBudgetId}
                  onChange={(event) => {
                    const nextBudgetId = event.target.value;
                    setActiveBudgetId(nextBudgetId);
                    setPreview(null);
                    setImportError(null);
                    setStatusMessage(null);
                    setSharedBudgetError(null);
                    void loadData(nextBudgetId);
                  }}
                >
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{activeBudget?.defaultCurrency ?? "CAD"}</Badge>
                <Badge variant="secondary">{users.find((user) => user.id === activeUserId)?.name ?? "Utilisateur local"}</Badge>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                Colonnes attendues: {IMPORT_TEMPLATE_COLUMNS.join(", ")}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Importer un fichier</CardTitle>
              <CardDescription>CSV ou Excel, sans mapping intelligent additionnel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-6 py-8 text-center transition-colors hover:bg-accent">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">Choisir un CSV ou un fichier Excel</p>
                  <p className="mt-1 text-xs text-muted-foreground">Premiere feuille uniquement, colonnes standardisees.</p>
                </div>
                <Input className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
              </label>
              {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}
              {importError ? <p className="text-sm text-destructive">{importError}</p> : null}
              {preview ? (
                <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{preview.validRows.length} valides</Badge>
                    <Badge
                      variant={preview.invalidRows.length > 0 ? "outline" : "secondary"}
                      className={preview.invalidRows.length > 0 ? "border-destructive/30 bg-destructive/10 text-destructive" : undefined}
                    >
                      {preview.invalidRows.length} a corriger
                    </Badge>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    L&apos;import ajoute uniquement les lignes valides lors de la confirmation.
                  </p>
                  <Button className="mt-4" type="button" onClick={() => void handleConfirmImport()} disabled={isImporting || preview.validRows.length === 0}>
                    <FileUp className="h-4 w-4" aria-hidden="true" />
                    {isImporting ? "Import en cours..." : "Confirmer l'import"}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Validation</CardTitle>
              <CardDescription>Controle des colonnes et des lignes avant toute ecriture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ValidationItem label="Colonnes requises" value="date, type, amount, currency, category" />
              <ValidationItem label="Colonnes optionnelles" value="subcategory, description, notes" />
              <ValidationItem label="Regles verifiees" value="type, devise ISO, montant positif, categorie, sous-categorie, date" />
              <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                Les categories doivent deja exister dans le budget actif. Aucun mapping automatique complexe n&apos;est applique.
              </div>
            </CardContent>
          </Card>
        </section>

        <PreviewCard preview={preview} />
      </div>
    </PageTransition>
  );
}

function PreviewCard({ preview }: { preview: ImportPreview | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Apercu avant import</CardTitle>
        <CardDescription>Lecture des premieres lignes avec erreurs eventuelles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview ? (
          preview.rows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <PreviewHeading>#</PreviewHeading>
                    <PreviewHeading>Date</PreviewHeading>
                    <PreviewHeading>Type</PreviewHeading>
                    <PreviewHeading>Montant</PreviewHeading>
                    <PreviewHeading>Devise</PreviewHeading>
                    <PreviewHeading>Categorie</PreviewHeading>
                    <PreviewHeading>Description</PreviewHeading>
                    <PreviewHeading>Etat</PreviewHeading>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.rows.slice(0, 8).map((row) => (
                    <tr key={row.rowNumber} className="bg-background">
                      <PreviewCell>{row.rowNumber}</PreviewCell>
                      <PreviewCell>{row.values.date || "-"}</PreviewCell>
                      <PreviewCell>{row.values.type || "-"}</PreviewCell>
                      <PreviewCell>{row.values.amount || "-"}</PreviewCell>
                      <PreviewCell>{row.values.currency || "-"}</PreviewCell>
                      <PreviewCell>{row.values.category || "-"}</PreviewCell>
                      <PreviewCell>{row.values.description || "-"}</PreviewCell>
                      <PreviewCell>
                        {row.errors.length > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                              Erreur
                            </Badge>
                            <ul className="space-y-1 text-xs text-destructive">
                              {row.errors.map((error) => (
                                <li key={error}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <Badge variant="secondary">Valide</Badge>
                        )}
                      </PreviewCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyPreview />
          )
        ) : (
          <EmptyPreview />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyPreview() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      <FileWarning className="mx-auto mb-3 h-5 w-5" aria-hidden="true" />
      Aucun apercu disponible pour le moment.
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" className="justify-start" onClick={onClick}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

function ValidationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function SharedBudgetPanel({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Users;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function PreviewHeading({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-muted-foreground">{children}</th>;
}

function PreviewCell({ children }: { children: ReactNode }) {
  return <td className="px-3 py-3 align-top">{children}</td>;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
