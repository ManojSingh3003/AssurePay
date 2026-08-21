import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import ProfileDashboardView from "../../../components/ProfileDashboardView";
import ProfileOnboardingWizard from "../../../components/ProfileOnboardingWizard";
import { getNotifications, markNotificationsAsRead } from "../../../lib/actions/notifications";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch full user data including any demographics
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) }
  });

  if (!user) {
    redirect("/api/auth/signin");
  }

  // Decide which view to render
  if (!user?.isProfileComplete) {
    return <ProfileOnboardingWizard />;
  }

  // Mark all unread as read immediately since user visited the page
  await markNotificationsAsRead();
  
  // Fetch their notifications
  const { notifications = [] } = await getNotifications();

  return (
    <div className="w-full">
      <ProfileDashboardView userData={user} initialNotifications={notifications} />
    </div>
  );
}