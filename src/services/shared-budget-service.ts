import { createEntityId, nowIsoString } from "@/data/local-store";
import { localBudgetAppDataService } from "@/services/local-data-service";
import type { Budget, BudgetMember, CreateInvitationInput, EntityId, Invitation, User } from "@/types";

export async function getAccessibleBudgets(userId: EntityId) {
  return localBudgetAppDataService.listAccessibleBudgets(userId);
}

export async function getBudgetMembersWithUsers(budgetId: EntityId) {
  const data = await localBudgetAppDataService.getData();
  const userById = new Map(data.users.map((user) => [user.id, user]));
  const members = await localBudgetAppDataService.listBudgetMembers(budgetId);

  return members.map((member) => ({
    member,
    user: userById.get(member.userId) ?? null,
  }));
}

export async function getPendingInvitationsForEmail(email: string) {
  return localBudgetAppDataService.listInvitations({
    email,
    status: "pending",
  });
}

export async function getBudgetInvitations(budgetId: EntityId) {
  return localBudgetAppDataService.listInvitations({ budgetId });
}

export async function createSharedBudgetInvitation(input: {
  budget: Budget;
  createdBy: User;
  email: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const data = await localBudgetAppDataService.getData();

  if (input.budget.ownerId !== input.createdBy.id) {
    throw new Error("Seul le proprietaire du budget peut inviter une personne dans ce MVP.");
  }

  const existingInvitations = await localBudgetAppDataService.listInvitations({
    budgetId: input.budget.id,
    email: normalizedEmail,
    status: "pending",
  });

  if (existingInvitations.length > 0) {
    throw new Error("Une invitation en attente existe deja pour cette adresse courriel.");
  }

  const existingUser = data.users.find((user) => user.email.toLowerCase() === normalizedEmail);
  const alreadyMember = existingUser
    ? data.budgetMembers.some((member) => member.budgetId === input.budget.id && member.userId === existingUser.id)
    : false;

  if (alreadyMember) {
    throw new Error("Cette personne fait deja partie du budget.");
  }

  const invitation: CreateInvitationInput = {
    budgetId: input.budget.id,
    email: normalizedEmail,
    status: "pending",
    token: createEntityId("invite-token"),
    createdBy: input.createdBy.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  };

  if (input.budget.type !== "shared") {
    await localBudgetAppDataService.updateBudget(input.budget.id, {
      type: "shared",
    });
  }

  return localBudgetAppDataService.createInvitation(invitation);
}

export async function acceptSharedBudgetInvitation(token: string, userId: EntityId) {
  return localBudgetAppDataService.acceptInvitation(token, userId);
}

export function getInvitationShareLink(invitation: Invitation) {
  return `budgetapp://shared-budget/${invitation.token}`;
}

export function formatInvitationExpiry(invitation: Invitation) {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(invitation.expiresAt));
}

export function isBudgetOwner(budget: Budget | undefined, userId: EntityId | undefined) {
  return Boolean(budget && userId && budget.ownerId === userId);
}

export function buildMemberRoleLabel(member: BudgetMember) {
  return member.role === "owner" ? "Proprietaire" : "Membre";
}

export function buildInvitationTokenPreview(invitation: Invitation) {
  return invitation.token.slice(0, 18);
}

export function createJoinedAtNow() {
  return nowIsoString();
}
