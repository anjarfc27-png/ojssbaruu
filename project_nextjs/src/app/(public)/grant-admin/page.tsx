import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { grantSiteAdminForCurrentUser } from "@/features/auth/resolve-identity";

export default async function GrantAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    redirect("/login?source=/grant-admin&loginMessage=Silakan login untuk promosi admin.");
  }

  const result = await grantSiteAdminForCurrentUser();
  if (!result.ok) {
    redirect("/login?loginMessage=Gagal menambahkan role admin.");
  }

  redirect("/admin/dashboard");
}