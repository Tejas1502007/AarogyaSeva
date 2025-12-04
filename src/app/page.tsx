"use client";

import { useState } from "react";
import { RoleSelection } from "@/components/role-selection";
import { AuthForm } from "@/components/auth-form";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | null>(null);

  if (!selectedRole) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-6">
        <RoleSelection onRoleSelect={setSelectedRole} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthForm initialRole={selectedRole} onBack={() => setSelectedRole(null)} />
      </div>
    </main>
  );
}
