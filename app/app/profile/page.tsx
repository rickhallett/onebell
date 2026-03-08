import { requireUser } from "@/lib/auth"
import { getUserByClerkId } from "@/db/queries"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const clerkUserId = await requireUser()
  const user = await getUserByClerkId(clerkUserId)

  if (!user) {
    throw new Error("User not found")
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">Profile</h1>
      <div className="mt-8">
        <ProfileForm
          initialData={{
            displayName: user.displayName,
            timezone: user.timezone,
            bio: user.bio,
            openToBeginners: user.openToBeginners,
          }}
        />
      </div>
    </div>
  )
}
