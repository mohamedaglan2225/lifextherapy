/** Shown instead of the dashboard until the Supabase environment variables are set. */
export function NotConfigured() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-bronze">Dashboard</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal">Not connected yet</h1>
      <p className="mt-4 text-sm font-light leading-relaxed text-bronze-dark">
        The content dashboard needs a Supabase project. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, then redeploy. Until then the website keeps showing its
        built-in content. See <code>docs/cms-setup.md</code>.
      </p>
    </main>
  )
}
