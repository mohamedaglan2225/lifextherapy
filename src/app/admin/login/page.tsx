import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/admin/actions/auth'
import { LoginForm } from '@/components/admin/LoginForm'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { secondaryButton } from '@/components/admin/FormFooter'
import { getAdminSession } from '@/lib/cms/admin'
import { getSupabaseConfig } from '@/lib/cms/config'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
  const config = getSupabaseConfig()
  if (!config) return <NotConfigured />

  if (await getAdminSession()) redirect('/admin')

  // Signed in, but not an admin: say so instead of looping back to the form.
  const supabase = await createSupabaseServerClient()
  const { data } = (await supabase?.auth.getClaims()) ?? { data: null }
  const signedInWithoutAccess = Boolean(data?.claims?.sub)

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-bronze">Life X Therapy</p>
      <h1 className="mb-8 mt-3 font-serif text-4xl text-charcoal">Dashboard sign in</h1>
      {signedInWithoutAccess ? (
        <div className="flex flex-col gap-5">
          <p role="alert" className="text-sm font-medium text-red-800">
            This account does not have dashboard access.
          </p>
          <form action={signOut}>
            <button type="submit" className={secondaryButton}>
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <LoginForm supabaseUrl={config.url} publishableKey={config.publishableKey} />
      )}
    </main>
  )
}
