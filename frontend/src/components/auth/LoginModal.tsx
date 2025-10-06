import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Chrome,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AccessibleDialogContent } from '@/components/ui/accessible-dialog-content';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    resetPassword,
    googleSignInLoading
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalId] = useState(() => Math.random().toString(36).substr(2, 9)); // Unique ID for this modal instance

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setError('');
    setShowPassword(false);
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode !== 'forgot' && !formData.password) {
      setError('Password is required');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.displayName.trim()) {
        setError('Name is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      switch (mode) {
        case 'signin':
          await loginWithEmail(formData.email, formData.password);
          handleClose();
          break;
        
        case 'signup':
          await registerWithEmail(formData.email, formData.password, formData.displayName);
          handleClose();
          break;
        
        case 'forgot':
          await resetPassword(formData.email);
          setMode('signin');
          resetForm();
          break;
      }
    } catch (err) {
      // Error handling is done in the auth context with toast notifications
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');

    try {
      await loginWithGoogle();
      handleClose();
    } catch (err) {
      const error = err as Error & { code?: string };
      if (error?.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized for Google Sign-In. Please contact support or use email/password authentication.');
      } else if (error?.code === 'auth/timeout') {
        setError('Google sign-in is taking longer than expected. Please try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Join ProfitHive';
      case 'forgot': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to access AI forecasting and tokenization';
      case 'signup': return 'Create your account to start earning with smart retail';
      case 'forgot': return 'Enter your email to receive password reset instructions';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 bg-transparent">
        <AccessibleDialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass border border-primary/20 rounded-2xl backdrop-blur-xl bg-background/95 shadow-2xl"
          >
          {/* Header */}
          <DialogHeader className="p-6 pb-2 text-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-primary rounded-full" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary"
              >
                <Shield className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              
              <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                {getTitle()}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-relaxed">
                {getSubtitle()}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Form */}
          <div className="p-6 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Name field for signup */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        name="displayName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="pl-10 glass border-muted/20 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor={`email-${mode}-${modalId}`} className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`email-${mode}-${modalId}`}
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 glass border-muted/20 focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password fields */}
                {mode !== 'forgot' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`password-${mode}-${modalId}`} className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`password-${mode}-${modalId}`}
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 glass border-muted/20 focus:border-primary/50 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password for signup */}
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor={`confirmPassword-${mode}-${modalId}`} className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`confirmPassword-${mode}-${modalId}`}
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pl-10 glass border-muted/20 focus:border-primary/50 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover-glow text-primary-foreground font-semibold py-3 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'signin' ? 'Signing In...' : 
                       mode === 'signup' ? 'Creating Account...' : 'Sending Email...'}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {mode === 'signin' ? 'Sign In' : 
                       mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Google Sign In */}
            {mode !== 'forgot' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <div className="relative">
                  <Separator className="my-4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={googleSignInLoading || loading}
                  className="w-full glass border-muted/20 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 py-3"
                >
                  {googleSignInLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in with Google...
                    </>
                  ) : (
                    <>
                      <Chrome className="mr-2 h-4 w-4" />
                      Continue with Google
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Mode Switch Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center space-y-2"
            >
              {mode === 'signin' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('signup')}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('signin')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p className="text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('signin')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Back to sign in
                  </button>
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
        </AccessibleDialogContent>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;