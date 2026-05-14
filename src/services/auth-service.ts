import {
  clearLocalAuthSession,
  createEntityId,
  nowIsoString,
  readLocalAuthSession,
  writeLocalAuthSession,
} from "@/data/local-store";
import { localBudgetAppDataService } from "@/services/local-data-service";
import type { AuthSession, Budget, BudgetMember, LoginUserInput, RegisterUserInput, User } from "@/types";

export type AuthResult = {
  session: AuthSession;
  user: User;
};

export async function getLocalAuthState() {
  const session = readLocalAuthSession();

  if (!session) {
    return {
      session: null,
      user: null,
    };
  }

  const data = await localBudgetAppDataService.getData();
  const user = data.users.find((item) => item.id === session.userId) ?? null;

  if (!user) {
    clearLocalAuthSession();
    return {
      session: null,
      user: null,
    };
  }

  return {
    session,
    user,
  };
}

export async function registerLocalUser(input: RegisterUserInput): Promise<AuthResult> {
  validateRegisterInput(input);

  const data = await localBudgetAppDataService.getData();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUser = data.users.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    throw new Error("Cette adresse courriel est deja utilisee.");
  }

  const user = await localBudgetAppDataService.createUser({
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: hashLocalPassword(input.password),
    defaultCurrency: input.defaultCurrency,
    theme: "system",
  });

  const timestamp = nowIsoString();
  const budget: Budget = {
    id: createEntityId("budget"),
    name: "Mon budget",
    type: "personal",
    monthlyLimit: 2500,
    defaultCurrency: input.defaultCurrency,
    ownerId: user.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const budgetMember: BudgetMember = {
    id: createEntityId("member"),
    budgetId: budget.id,
    userId: user.id,
    role: "owner",
    joinedAt: timestamp,
  };

  data.users = data.users.filter((item) => item.id !== user.id).concat(user);
  data.budgets.push(budget);
  data.budgetMembers.push(budgetMember);
  await localBudgetAppDataService.replaceData(data);

  const session = createSession(user.id);
  return {
    session,
    user,
  };
}

export async function loginLocalUser(input: LoginUserInput): Promise<AuthResult> {
  validateLoginInput(input);

  const data = await localBudgetAppDataService.getData();
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = data.users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || user.passwordHash !== hashLocalPassword(input.password)) {
    throw new Error("Courriel ou mot de passe invalide.");
  }

  const session = createSession(user.id);

  return {
    session,
    user,
  };
}

export function logoutLocalUser() {
  clearLocalAuthSession();
}

export function hashLocalPassword(password: string) {
  return `local-auth:${password.trim()}`;
}

function createSession(userId: string) {
  const session: AuthSession = {
    userId,
    loggedInAt: nowIsoString(),
  };

  writeLocalAuthSession(session);
  return session;
}

function validateRegisterInput(input: RegisterUserInput) {
  if (!input.name.trim()) {
    throw new Error("Le nom est requis.");
  }

  validateEmail(input.email);

  if (input.password.trim().length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caracteres.");
  }

  if (!/^[A-Z]{3}$/.test(input.defaultCurrency)) {
    throw new Error("La devise par defaut doit respecter le format ISO a trois lettres.");
  }
}

function validateLoginInput(input: LoginUserInput) {
  validateEmail(input.email);

  if (!input.password.trim()) {
    throw new Error("Le mot de passe est requis.");
  }
}

function validateEmail(email: string) {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw new Error("Le courriel doit etre valide.");
  }
}
