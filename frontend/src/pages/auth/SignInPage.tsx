import { useSignIn, useAuth } from "@clerk/react"
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SignInPage = () => {
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn()
  const { isLoaded: authLoaded } = useAuth()
  
  // Robust initialization check
  const isLoaded = signInLoaded || authLoaded || !!signIn

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('SignIn DEBUG:', { 
        signInLoaded, 
        authLoaded, 
        hasSignIn: !!signIn,
        finalIsLoaded: isLoaded 
    })
  }, [signInLoaded, authLoaded, signIn, isLoaded])

  const isFormValid = email.includes('@') && password.length >= 8
  const canSubmit = isLoaded && isFormValid && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !signIn) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/')
      } else {
        console.log('SignIn result:', result)
        setError('Please check your credentials and try again.')
      }
    } catch (err: any) {
      console.error('SignIn error:', err)
      setError(err.errors?.[0]?.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple') => {
      if (!isLoaded || !signIn) return
      try {
          await signIn.authenticateWithRedirect({
              strategy,
              redirectUrl: "/sso-callback",
              redirectUrlComplete: "/"
          })
      } catch (err: any) {
          setError(err.errors?.[0]?.message || 'Social login failed.')
      }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]"></div>
        </div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="bg-white border border-primary/10 shadow-[0_32px_64px_-16px_rgba(91,15,46,0.1)] rounded-[40px] p-8 md:p-12">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
                        Welcome Back
                    </h1>
                    <p className="text-primary/40 font-medium text-xs uppercase tracking-[0.2em]">
                        Continue your healthy journey
                    </p>
                </div>

                {!isLoaded && (
                    <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold px-5 py-3 rounded-2xl flex items-center gap-3">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Initializing secure session...</span>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-5 py-4 rounded-2xl text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="email" 
                            placeholder="Email address"
                            className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-14 py-4 rounded-2xl transition-all outline-none font-bold text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-14 py-4 rounded-2xl transition-all outline-none font-bold text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" title="Recover your account" className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!canSubmit}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl transition-all flex items-center justify-center gap-3 ${
                            canSubmit 
                            ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                            : "bg-primary/20 text-white cursor-not-allowed"
                        }`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                        {!loading && isLoaded && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="my-10 flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-primary/5"></div>
                    <span className="text-primary/20 font-black uppercase text-[8px] tracking-[0.3em]">Quick Access</span>
                    <div className="flex-1 h-[1px] bg-primary/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleSocialLogin('oauth_google')}
                        className="flex items-center justify-center gap-3 py-4 bg-white border border-primary/10 hover:border-primary/30 rounded-2xl transition-all group"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Google</span>
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('oauth_apple')}
                        className="flex items-center justify-center gap-3 py-4 bg-white border border-primary/10 hover:border-primary/30 rounded-2xl transition-all group"
                    >
                        <svg className="w-4 h-4 fill-primary" viewBox="0 0 384 512">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-79-115.3-17.7-153.1V268.7zM249.3 90.5c16.3-20.1 27.2-48 24.2-75.9-24 1-52.9 15.6-70.1 35.7-15.4 18.1-28.9 46.2-25.2 73.5 26.6 2.1 55.4-12.8 71.1-33.3V90.5z"/>
                        </svg>
                        <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Apple</span>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest">
                        New taste explorer? <Link to="/sign-up" className="text-primary hover:underline underline-offset-4 transition-colors font-black">Register Now</Link>
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
  )
}

export default SignInPage
