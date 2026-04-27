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

                    <div id="clerk-captcha" className="flex justify-center w-full min-h-[65px]"></div>

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
