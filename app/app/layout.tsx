import { auth, currentUser } from "@clerk/nextjs/server"
import { ensureUserExists } from "@/lib/user-sync"
import { AppNav } from "@/components/app-nav"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth()

  if (userId) {
    const clerkUser = await currentUser()
    await ensureUserExists(userId, {
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      emailAddress: clerkUser?.emailAddresses?.[0]?.emailAddress,
    })
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-5 pb-20 pt-8">
      {children}
      <AppNav />
    </div>
  )
}
