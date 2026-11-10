import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ObservationForm from "./ObservationForm";
import ReviewQueue from "./ReviewQueue";
import ReviewHistory from "./ReviewHistory";

export const instant = false;

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin || !admin.is_active || !["owner", "admin"].includes(admin.role)) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#090d13] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-bold tracking-[0.25em] text-yellow-500">CUBA EN CIFRAS</p>
          <h1 className="mt-2 text-3xl font-bold">Panel de administración</h1>
          <p className="mt-3 text-gray-300">Bienvenido, {user.email}</p>
        </header>

        <section className="mb-8 rounded-2xl border border-yellow-500/20 bg-[#11151c] p-6">
          <p className="text-sm text-gray-400">Nivel de acceso</p>
          <p className="mt-1 text-xl font-bold text-yellow-400">
            {admin.role === "owner" ? "Propietario" : "Administrador"}
          </p>
          <p className="mt-3 text-sm text-green-400">Tu acceso ha sido verificado correctamente.</p>
        </section>

        <ObservationForm />
          <ReviewQueue />
          <ReviewHistory />
      </div>
    </main>
  );
}
