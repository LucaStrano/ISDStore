export default function LoginPage() {
return (
    <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" />
            <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" />
            <button className="w-full bg-primary text-primary-foreground py-2 rounded">Login</button>
        </form>
        <p className="text-sm text-center">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary underline">
                Register
            </a>
        </p>
    </div>
);
}
