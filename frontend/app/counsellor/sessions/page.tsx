import { redirect } from "next/navigation";

export default function PreviewRouteRedirect() {
  redirect("/counsellor/dashboard#sessions");
}
