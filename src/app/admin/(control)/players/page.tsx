import { redirect } from "next/navigation";

export default function LegacyPlayersRedirect() {
  redirect("/admin/participants");
}
