export function getLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials") ||
    normalized.includes("email not confirmed")
  ) {
    return "Incorrect email or password.";
  }

  return message;
}

export function getSignupErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("letters only")) {
    return "Full name must contain letters only.";
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }

  if (normalized.includes("password")) {
    return "Password must meet the minimum requirements.";
  }

  return message;
}
