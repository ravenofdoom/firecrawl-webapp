// In-memory user store (resets on cold start)
// For production, use Vercel KV or a database
export const additionalUsers = new Map<string, { password: string; createdAt: string }>();

// Get users from environment variable
export function getEnvUsers(): Map<string, string> {
  const users = new Map<string, string>();
  const demoUsers = process.env.DEMO_USERS || "admin:admin123";

  demoUsers.split(",").forEach((pair) => {
    const [username, password] = pair.split(":");
    if (username && password) {
      users.set(username.trim(), password.trim());
    }
  });

  return users;
}

// Validate user credentials
export function validateUser(username: string, password: string): boolean {
  // Check ENV users
  const envUsers = getEnvUsers();
  if (envUsers.get(username) === password) {
    return true;
  }

  // Check in-memory users
  const user = additionalUsers.get(username);
  return user?.password === password;
}

// Check if user exists
export function userExists(username: string): boolean {
  const envUsers = getEnvUsers();
  return envUsers.has(username) || additionalUsers.has(username);
}

// Get all users
export function getAllUsers(): Array<{ username: string; createdAt: string }> {
  const users: Array<{ username: string; createdAt: string }> = [];

  // Parse users from environment variable
  const envUsers = getEnvUsers();
  envUsers.forEach((_, username) => {
    users.push({
      username,
      createdAt: "Environment Variable",
    });
  });

  // Add in-memory users
  additionalUsers.forEach((data, username) => {
    users.push({
      username,
      createdAt: data.createdAt,
    });
  });

  return users;
}

// Add user
export function addUser(username: string, password: string): void {
  additionalUsers.set(username, {
    password,
    createdAt: new Date().toISOString(),
  });
}

// Delete user
export function deleteUser(username: string): boolean {
  return additionalUsers.delete(username);
}

// Check if user is from ENV (can't be deleted via API)
export function isEnvUser(username: string): boolean {
  const envUsers = getEnvUsers();
  return envUsers.has(username);
}

// Change password for in-memory users only
export function changePassword(username: string, newPassword: string): boolean {
  // Can only change password for in-memory users
  if (additionalUsers.has(username)) {
    const userData = additionalUsers.get(username)!;
    additionalUsers.set(username, {
      ...userData,
      password: newPassword,
    });
    return true;
  }

  // ENV users cannot have their password changed via API
  return false;
}
