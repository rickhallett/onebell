import { requireUser } from "@/lib/auth"
import { getUserByClerkId } from "@/db/queries"
import { ProfileForm } from "@/components/profile-form"
import { Avatar } from "@/components/avatar"
import { formatTimezone } from "@/lib/time"

export default async function ProfilePage() {
  const clerkUserId = await requireUser()
  const user = await getUserByClerkId(clerkUserId)

  if (!user) {
    throw new Error("User not found")
  }

  return (
    <div>
      {/* Header with avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar name={user.displayName} size="md" />
        <div>
          <h1 className="font-serif text-2xl font-medium">Profile</h1>
          <p className="mt-0.5 text-sm text-muted">
            {formatTimezone(user.timezone)}
            {user.openToBeginners && (
              <span className="ml-2 text-accent">&middot; open to beginners</span>
            )}
          </p>
        </div>
      </div>

      {/* Bio preview if set */}
      {user.bio && (
        <div className="mt-5 rounded-xl bg-surface/50 p-4">
          <p className="font-serif text-sm italic leading-relaxed text-foreground/60">
            &ldquo;{user.bio}&rdquo;
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="my-8 flex items-center justify-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
      </div>

      <ProfileForm
        initialData={{
          displayName: user.displayName,
          timezone: user.timezone,
          bio: user.bio,
          openToBeginners: user.openToBeginners,
        }}
      />
    </div>
  )
}
