export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" />
        <button className="w-full bg-primary text-primary-foreground py-2 rounded">Create Account</button>
      </form>
      <p className="text-sm text-center">
            Already have an account?{' '}
            <a href="/login" className="text-primary underline">
                Login
            </a>
        </p>
    </div>
  );
}
