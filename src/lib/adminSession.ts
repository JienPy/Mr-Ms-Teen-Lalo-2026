import { dashboardRoleFromRows } from "@/lib/adminAccess";
import { supabase } from "@/integrations/supabase/client";

export async function verifyAuthorizedSession() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);

  return !!dashboardRoleFromRows(roles);
}
