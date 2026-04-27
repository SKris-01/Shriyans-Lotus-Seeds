import { useSignUp, useAuth } from "@clerk/react"
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, CheckCircle2, Loader2, AlertCircle, Tag, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SignUpPage = () => {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp()
  const { isLoaded: authLoaded } = useAuth()
  
  const isLoaded = signUpLoaded || authLoaded || !!signUp
  


  // Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const isFormValid = 
    email.includes('@') && 
    password.length >= 8 && 
    firstName.trim() !== '' && 
    lastName.trim() !== '' && 
    (!verifying || code.length === 6)

  const canSubmit = isLoaded && isFormValid && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !signUp) return
    setLoading(true)
    setError('')

    try {
      // Step 1: Create the sign-up attempt
      await signUp.create({
        emailAddress: email,
        password,
        username: username || undefined,
        firstName,
        lastName,
      })

      // Step 2: Send verification email - USE THE DISCOVERED METHOD FOR V6
      await signUp.sendEmailCode()

      setVerifying(true)
    } catch (err: any) {
      console.error('SignUp Error Detail:', err)
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!signUp) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Use the discovered method
      await signUp.sendEmailCode()
      setSuccess('Code resent successfully! Check your inbox.')
    } catch (err: any) {
      setError('Failed to resend code. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }



  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !code || !signUp) return
    setLoading(true)
    setError('')

    try {
      // Use the discovered verification method
      const completeSignUp = await signUp.verifyEmailCode({ code })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        navigate('/')
      } else {
        throw new Error('Verification failed. Status: ' + completeSignUp.status)
      }
    } catch (err: any) {
      console.error('Verification Error:', err)
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white relative overflow-hidden font-outfit">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]"></div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg relative z-10"
        >
            <div className="bg-white border border-primary/10 shadow-[0_32px_64px_-16px_rgba(91,15,46,0.1)] rounded-[40px] p-8 md:p-12">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
                        {verifying ? "Verify Email" : "Create Account"}
                    </h1>
                    <p className="text-primary/40 font-medium text-[10px] uppercase tracking-[0.2em]">
                        {verifying ? `Code sent to ${email}` : "Complete your profile to join Shriyans"}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold px-5 py-4 rounded-2xl text-center shadow-sm"
                        >
                            <AlertCircle className="w-3 h-3 inline-block mr-2 mb-0.5" />
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold px-5 py-4 rounded-2xl text-center shadow-sm"
                        >
                            <CheckCircle2 className="w-3 h-3 inline-block mr-2 mb-0.5" />
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!verifying ? (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="First Name"
                                        className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-14 py-4 rounded-2xl transition-all outline-none font-bold text-sm"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        placeholder="Last Name"
                                        className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-6 py-4 rounded-2xl transition-all outline-none font-bold text-sm"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Username (Unique ID)"
                                    className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-14 py-4 rounded-2xl transition-all outline-none font-bold text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="email" 
                                    placeholder="Email Address"
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
                                    placeholder="Password (Min 8 chars)"
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
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                                {!loading && isLoaded && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>


                    </>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="relative group">
                            <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="6-digit code"
                                className="w-full bg-gray-50/50 border border-primary/5 focus:border-primary/20 focus:bg-white text-primary placeholder:text-primary/20 px-14 py-4 rounded-2xl transition-all outline-none font-bold text-sm text-center tracking-[0.5em]"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || code.length !== 6 || !isLoaded}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl transition-all flex items-center justify-center gap-3 ${
                                (code.length === 6 && isLoaded)
                                ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                                : "bg-primary/20 text-white cursor-not-allowed"
                            }`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Start"}
                        </button>
                        
                        <div className="text-center pt-4">
                            <button 
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                Resend Verification Code
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-12 text-center">
                    <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest">
                        Already part of us? <Link to="/sign-in" className="text-primary hover:underline underline-offset-4 transition-colors font-black">Login Back</Link>
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
  )
}

export default SignUpPage
