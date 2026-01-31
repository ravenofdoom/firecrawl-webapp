import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers, userExists, addUser, deleteUser, isEnvUser } from "@/lib/users";

// GET - List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.name !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.name !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (userExists(username)) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    addUser(username, password);

    return NextResponse.json({ success: true, message: "User created" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// DELETE - Remove user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.name !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (username === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 400 }
      );
    }

    // Can only delete in-memory users, not ENV users
    if (isEnvUser(username)) {
      return NextResponse.json(
        { error: "Cannot delete users defined in environment variables. Update DEMO_USERS in Vercel Dashboard." },
        { status: 400 }
      );
    }

    deleteUser(username);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
