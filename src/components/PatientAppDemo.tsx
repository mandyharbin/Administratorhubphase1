import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from '../imports/svg-0h23uza1ix';
import svgPathsMfa from '../imports/svg-hxm54nvael';
import svgPathsMfaVerify from '../imports/svg-1yjc1qxzm9';
import svgPathsFaceId from '../imports/svg-e5suguodc5';
import svgPathsVerification from '../imports/svg-ydrrgvay9f';
import svgPathsSuccess from '../imports/svg-zjkaw0e9gb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  MessageCircle, 
  Send, 
  User, 
  Calendar, 
  Bell, 
  FileText, 
  ChevronLeft,
  ArrowLeft,
  Bot,
  UserCircle2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Shield,
  ShieldCheck,
  QrCode,
  Scan,
  Search,
  Navigation,
  Image,
  Camera,
  Paperclip,
  Cake,
  Info,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Edit,
  Save,
  Check,
  LogOut,
  Smartphone,
  Fingerprint,
  Building2,
  Monitor,
  Sparkles,
  MessageSquare,
  Eye,
  EyeOff,
  KeyRound,
  IdCard
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChatSummary } from './ChatSummary';
import type { ChatMessage } from '../api/summary-agent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { messageQueue, StaffReply } from '../utils/sharedMessages';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { knowledgeBaseFAQs } from '../utils/knowledgeBase';
import { PatientMatchingFlow, type MatchedPatient } from './PatientMatchingFlow';
import { ProxyRegistrationFlow, type ProxyRegistrationData } from './ProxyRegistrationFlow';
import { HealthSummary } from './HealthSummary';
import { LabResults } from './LabResults';
import { MedicalHistory } from './MedicalHistory';
import { AppointmentHistory } from './AppointmentHistory';
import { VisitDetail } from './VisitDetail';
import { greenwayOtpApi } from '../utils/greenwayOtpApi';

type DemoScreen = 
  | 'app-download'
  | 'qr-download-page'
  | 'registration'
  | 'qr-scan'
  | 'location-verify'
  | 'practice-search'
  | 'registration-type'
  | 'patient-matching'
  | 'proxy-registration'
  | 'auth-rep-verify'
  | 'identity-verify'
  | 'verify-info'
  | 'tcpa-consent'
  | 'email-verification'
  | 'pin-code'
  | 'email-confirmation'
  | 'mfa-setup'
  | 'mfa-verification'
  | 'mfa-success'
  | 'terms-of-use'
  | 'create-password'
  | 'biometrics'
  | 'disclaimer'
  | 'sign-in'
  | 'home'
  | 'chat'
  | 'notifications'
  | 'messages'
  | 'survey'
  | 'profile'
  | 'health-summary'
  | 'lab-results'
  | 'medical-history'
  | 'appointment-history'
  | 'visit-detail'
  | 'todo-checklist'
  | 'registration-link-sent';

interface Message {
  id: string;
  sender: 'patient' | 'bot' | 'staff';
  senderName: string;
  content: string;
  timestamp: string;
  isRouted?: boolean;
  detectedIntent?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: any;
}

interface Appointment {
  id: string;
  type: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface Practice {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  distance?: string;
  discoverable: boolean;
}

// Mobile App Interface Component
const MobileFrame = ({ children, viewMode }: { children: React.ReactNode; viewMode: 'mobile' | 'web' }) => {
  if (viewMode === 'web') {
    return (
      <div className="w-full h-screen overflow-hidden bg-white">
        {children}
      </div>
    );
  }
  
  return (
    <div className="max-w-[390px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 rounded-t-[2.5rem] px-6 pt-3 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="text-white text-sm">9:41</div>
          <div className="w-20 h-6 bg-gray-800 rounded-full" />
          <div className="flex items-center gap-1">
            <div className="text-white text-xs">100%</div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white border-x-2 border-b-2 border-gray-900 rounded-b-[2.5rem] overflow-hidden shadow-2xl relative" 
        style={{ height: '844px' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// View Mode Toggle Component
const ViewModeToggle = ({ viewMode, onViewModeChange }: { viewMode: 'mobile' | 'web', onViewModeChange: (mode: 'mobile' | 'web') => void }) => (
  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => onViewModeChange('mobile')}
      className={`px-3 py-1.5 rounded text-sm transition-colors ${
        viewMode === 'mobile'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Smartphone className="w-4 h-4 inline mr-1" />
      Mobile
    </button>
    <button
      onClick={() => onViewModeChange('web')}
      className={`px-3 py-1.5 rounded text-sm transition-colors ${
        viewMode === 'web'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Monitor className="w-4 h-4 inline mr-1" />
      Web
    </button>
  </div>
);

// Animation variants for screen transitions
const screenVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 }
};

interface PatientAppDemoProps {
  initialScreen?: DemoScreen;
}

export function PatientAppDemo({ initialScreen = 'app-download' }: PatientAppDemoProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [showDisclosureToast, setShowDisclosureToast] = useState(false);
  
  useEffect(() => {
    if (showDisclosureToast) {
      const timer = setTimeout(() => setShowDisclosureToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showDisclosureToast]);

  const [currentScreen, setCurrentScreen] = useState<DemoScreen>(initialScreen);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [waitingForNotificationPreference, setWaitingForNotificationPreference] = useState(false);
  const [waitingForSendConfirmation, setWaitingForSendConfirmation] = useState(false);
  const [selectedNotificationMethod, setSelectedNotificationMethod] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [qrPractice, setQrPractice] = useState<Practice | null>(null);
  const [isAuthRep, setIsAuthRep] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState<MatchedPatient | null>(null);
  const [proxyRegistrationData, setProxyRegistrationData] = useState<ProxyRegistrationData | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showSwitchAccountDialog, setShowSwitchAccountDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<'mandy' | 'ava' | 'noah'>('mandy');
  const [settingsTab, setSettingsTab] = useState<'personal' | 'contact' | 'preferences' | 'security'>('personal');
  const [showAiChatDisclaimer, setShowAiChatDisclaimer] = useState(false);
  const [verificationMismatch, setVerificationMismatch] = useState<{ entered: string; ehr: string } | null>(null);
  const [contactMethod, setContactMethod] = useState<'sms' | 'email'>('sms');
  const [contactInfo, setContactInfo] = useState('');
  const [registrationRouted, setRegistrationRouted] = useState(false);
  const [insuranceCardFiles, setInsuranceCardFiles] = useState<File[]>([]);
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  const insuranceCardInputRef = useRef<HTMLInputElement>(null);
  const photoIdInputRef = useRef<HTMLInputElement>(null);
  const [isQRCodeFlow, setIsQRCodeFlow] = useState(false);
  const [showSmsPreview, setShowSmsPreview] = useState(false);
  
  // Greenway OTP API states
  const [otpRequestId, setOtpRequestId] = useState('');
  const [otpRemainingAttempts, setOtpRemainingAttempts] = useState(5);
  const [otpLockoutExpires, setOtpLockoutExpires] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Account creation states
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [accountTermsAccepted, setAccountTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Sign-in form states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Password creation states
  const [createPasswordValue, setCreatePasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  
  // Pending attachment states
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{url: string; name: string; type: string; size: string} | null>(null);

  const [authRepData, setAuthRepData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    address: '',
    zipCode: '',
    phone: '',
    relationship: ''
  });
  const [patientData, setPatientData] = useState({
    firstName: 'David',
    lastName: 'Johnson',
    dob: '1985-03-15',
    zipCode: '95653',
    identifierType: 'patientId',
    patientId: '',
    billingAccountNumber: '67890'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [certifyChecked, setCertifyChecked] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [contactMethodType, setContactMethodType] = useState<'email' | 'phone'>('email');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [pinCode, setPinCode] = useState<string>('');
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email'>('sms');
  const [phoneNumber, setPhoneNumber] = useState<string>('(123) 456-7890');
  const [alwaysRequireVerification, setAlwaysRequireVerification] = useState<boolean>(true);
  const [verificationCode, setVerificationCode] = useState<string[]>(['2', '2', '1', '5', '5', '9']);
  const [inAppNotification, setInAppNotification] = useState<string | null>(null);
  const [showPinSentModal, setShowPinSentModal] = useState<boolean>(false);
  const [showMfaSuccessModal, setShowMfaSuccessModal] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [surveyResponses, setSurveyResponses] = useState({
    scheduleEase: '',
    convenientTime: '',
    cleanliness: '',
    waitingArea: '',
    waitTime: '',
    waitTimeReasonable: ''
  });
  
  const [profileData, setProfileData] = useState({
    firstName: 'Mandy',
    middleName: 'Marie',
    lastName: 'Johnson',
    preferredName: 'Mandy',
    dob: '1989-06-15',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'Madison',
    state: 'CA',
    zip: '95653',
    country: 'United States',
    primaryPhone: '9165550123',
    workPhone: '9165550124',
    cellPhone: '9165550125',
    email: 'mandy.johnson@email.com',
    emergencyFirstName: 'John',
    emergencyLastName: 'Johnson',
    emergencyPhone: '9165550126',
    emergencyEmail: 'emergency.contact@email.com',
    username: 'mandy.johnson',
    loginEmail: 'mandy.johnson@email.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingLoginEmail, setIsEditingLoginEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [tempUsername, setTempUsername] = useState({ new: '', confirm: '' });
  const [usernameError, setUsernameError] = useState('');
  const [tempLoginEmail, setTempLoginEmail] = useState({ new: '', confirm: '' });
  const [loginEmailError, setLoginEmailError] = useState('');
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState({ current: '', new: '', confirm: '' });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaEmail, setMfaEmail] = useState('mandy.johnson@email.com');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  // MFA workflow states
  const [mfaFlow, setMfaFlow] = useState<'idle' | 'enabling' | 'selecting-factor' | 'adding-factor' | 'otp-verification' | 'disabling'>('idle');
  const [mfaFactors, setMfaFactors] = useState([
    { id: 1, type: 'email', value: 'mandy.johnson@email.com', primary: true },
    { id: 2, type: 'sms', value: '+1 (916) 555-0123', primary: false }
  ]);
  const [selectedFactor, setSelectedFactor] = useState<number | null>(null);
  const [mfaOtp, setMfaOtp] = useState('');
  const [mfaOtpError, setMfaOtpError] = useState('');
  const [addingFactorType, setAddingFactorType] = useState<'email' | 'sms' | null>(null);
  const [newFactorValue, setNewFactorValue] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);
  
  // Biometric workflow states
  const [biometricFlow, setBiometricFlow] = useState<'idle' | 'enabling' | 'platform-select' | 'android-setup' | 'iphone-setup' | 'disabling'>('idle');
  const [biometricPlatform, setBiometricPlatform] = useState<'android' | 'iphone' | null>(null);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  
  // Simulate existing usernames database
  const existingUsernames = ['mandy_j', 'john_doe', 'jane_smith', 'testuser'];
  
  const validateUsername = (username: string) => {
    if (!username) {
      return 'Username is required';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be no more than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (existingUsernames.includes(username.toLowerCase())) {
      return 'This username is already taken';
    }
    return '';
  };
  
  const accounts = {
    mandy: {
      firstName: 'Mandy',
      lastName: 'Johnson',
      role: 'Primary Account',
      initials: 'MJ',
      dob: '1989-06-15',
      medications: [
        { name: 'Lisinopril 10mg', status: 'Active', nextRefillDate: '2025-12-01' },
        { name: 'Metformin 500mg', status: 'Active', nextRefillDate: '2025-11-20' }
      ]
    },
    ava: {
      firstName: 'Ava',
      lastName: 'Johnson',
      role: 'Child',
      initials: 'AJ',
      dob: '2015-08-22',
      medications: []
    },
    noah: {
      firstName: 'Noah',
      lastName: 'Johnson',
      role: 'Child',
      initials: 'NJ',
      dob: '2018-03-10',
      medications: []
    }
  };
  
  const [practices] = useState<Practice[]>([
    {
      id: '1',
      name: 'Madison Medical Center P.A.',
      address: '34 Sycamore Street Suite 3',
      city: 'Madison',
      state: 'CA',
      zip: '95653',
      phone: '(916) 555-7654',
      distance: '0.5 mi',
      discoverable: true
    },
    {
      id: '2',
      name: 'Riverside Family Practice',
      address: '890 River Road',
      city: 'Madison',
      state: 'CA',
      zip: '95653',
      phone: '(916) 555-8901',
      distance: '1.2 mi',
      discoverable: true
    },
    {
      id: '3',
      name: 'Greenwood Health Clinic',
      address: '456 Greenwood Avenue',
      city: 'Sacramento',
      state: 'CA',
      zip: '95814',
      phone: '(916) 555-2345',
      distance: '5.3 mi',
      discoverable: true
    },
    {
      id: '4',
      name: 'Valley Medical Group',
      address: '123 Valley Drive',
      city: 'Sacramento',
      state: 'CA',
      zip: '95816',
      phone: '(916) 555-6789',
      distance: '7.1 mi',
      discoverable: true
    },
    {
      id: '5',
      name: 'Northside Urgent Care',
      address: '789 North Street',
      city: 'Madison',
      state: 'CA',
      zip: '95654',
      phone: '(916) 555-4321',
      distance: '2.8 mi',
      discoverable: true
    },
    {
      id: '6',
      name: 'Elmwood Pediatrics',
      address: '321 Elm Street',
      city: 'Sacramento',
      state: 'CA',
      zip: '95815',
      phone: '(916) 555-1111',
      distance: '6.4 mi',
      discoverable: true
    }
  ]);
  
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      senderName: 'AI Assistant',
      content: 'Hello! I\'m your AI medical assistant. How can I help you today? I can help with appointment inquiries, general health questions, prescription refills, and more.',
      timestamp: '2025-01-13T10:00:00'
    },
    {
      id: '2',
      sender: 'patient',
      senderName: 'You',
      content: 'Hi! I was wondering about my upcoming appointment with Dr. Smith. What time is it again?',
      timestamp: '2025-01-13T10:02:15'
    },
    {
      id: '3',
      sender: 'bot',
      senderName: 'AI Assistant',
      content: 'Let me check your appointment details. You have an appointment with Dr. Sarah Smith on January 14 at 2:00 PM at Main Campus Medical Center. Would you like directions or need to make any changes?',
      timestamp: '2025-01-13T10:02:30'
    },
    {
      id: '4',
      sender: 'patient',
      senderName: 'You',
      content: 'Thanks! That helps. Also, I need to refill my blood pressure medication.',
      timestamp: '2025-01-13T10:05:42'
    },
    {
      id: '5',
      sender: 'bot',
      senderName: 'AI Assistant',
      content: 'I can help with that. I\'ve forwarded your prescription refill request to our pharmacy team. They typically process refills within 24-48 hours. You\'ll receive a notification once it\'s ready for pickup.',
      timestamp: '2025-01-13T10:05:55'
    },
    {
      id: '6',
      sender: 'patient',
      senderName: 'You',
      content: 'Perfect! One more thing - I\'ve been having some mild headaches for the past few days. Should I be concerned?',
      timestamp: '2025-01-13T14:22:18'
    },
    {
      id: '7',
      sender: 'bot',
      senderName: 'AI Assistant',
      content: 'I\'m unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. How do you want to be notified?',
      timestamp: '2025-01-13T14:22:35',
      isRouted: true,
      detectedIntent: 'medical_symptom'
    },
    {
      id: '8',
      sender: 'staff',
      senderName: 'Dr. Williams',
      content: 'Hello David! I\'ve reviewed your message about the headaches. A few questions: How severe are they on a scale of 1-10? Are you experiencing any other symptoms like vision changes, nausea, or sensitivity to light?',
      timestamp: '2025-01-13T15:45:22'
    },
    {
      id: '9',
      sender: 'patient',
      senderName: 'You',
      content: 'They\'re about a 4-5. No vision changes or nausea, just a dull ache mainly in the afternoon.',
      timestamp: '2025-01-13T16:10:08'
    },
    {
      id: '10',
      sender: 'staff',
      senderName: 'Dr. Williams',
      content: 'Thank you for the details. Based on what you\'ve described, this sounds like tension headaches. Try staying well-hydrated, taking regular breaks if you work at a computer, and over-the-counter ibuprofen as needed. If they persist beyond a week or worsen, please schedule a visit. We can discuss this more at your appointment tomorrow.',
      timestamp: '2025-01-13T16:15:33'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Subscribe to staff replies
  useEffect(() => {
    console.log('[PatientAppDemo] Setting up subscription to staff replies');
    const unsubscribe = messageQueue.subscribeToReplies((replies) => {
      console.log('[PatientAppDemo] Received replies:', replies);
      if (replies.length > 0) {
        const latestReply = replies[replies.length - 1];
        console.log('[PatientAppDemo] Latest reply:', latestReply);
        
        // Add staff reply to chat messages
        setChatMessages(prev => {
          // Check if this reply was already added
          const existingReplyIndex = prev.findIndex(
            msg => msg.content === latestReply.staffMessage && 
                   msg.sender === 'staff' &&
                   msg.timestamp === latestReply.timestamp
          );
          
          if (existingReplyIndex !== -1) {
            console.log('[PatientAppDemo] Reply already exists, skipping');
            return prev;
          }
          
          console.log('[PatientAppDemo] Adding new staff reply to chat');
          return [...prev, {
            id: `staff-reply-${Date.now()}`,
            sender: 'staff',
            senderName: latestReply.staffName,
            content: latestReply.staffMessage,
            timestamp: latestReply.timestamp
          }];
        });

        // Add notification for staff reply
        setNotifications(prev => {
          // Check if notification already exists
          const existingNotif = prev.find(
            notif => notif.type === 'staff-reply' && 
                     notif.timestamp === latestReply.timestamp
          );
          
          if (existingNotif) {
            console.log('[PatientAppDemo] Notification already exists, skipping');
            return prev;
          }
          
          console.log('[PatientAppDemo] Adding new staff reply notification');
          const newNotification: Notification = {
            id: `staff-reply-notif-${Date.now()}`,
            type: 'staff-reply',
            title: `Message from ${latestReply.staffName}`,
            message: latestReply.staffMessage,
            timestamp: latestReply.timestamp,
            read: false,
            icon: MessageCircle
          };
          
          return [newNotification, ...prev];
        });
      }
    });

    return unsubscribe;
  }, []);

  // Show AI disclaimer when entering chat screen or when staff replies
  useEffect(() => {
    if (currentScreen === 'chat') {
      // Temporarily disabled - hiding AI chat disclaimer
      // setShowAiChatDisclaimer(true);
    }
  }, [currentScreen]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'recall',
      title: 'Annual Wellness Exam Due',
      message: 'You are due for your annual wellness exam. Contact the practice or use the chat to send us a message.',
      timestamp: '2025-01-15T09:00:00',
      read: false,
      icon: CalendarClock
    },
    {
      id: '2',
      type: 'survey',
      title: 'Patient Satisfaction Survey',
      message: 'Help us improve! Please take a moment to complete our patient satisfaction survey.',
      timestamp: '2025-01-15T10:00:00',
      read: false,
      icon: ClipboardList
    },
    {
      id: '3',
      type: 'birthday',
      title: 'Happy Birthday! 🎉',
      message: 'Wishing you a wonderful birthday from everyone at Main Campus Medical Center!',
      timestamp: '2025-01-15T08:00:00',
      read: false,
      icon: Cake
    },
    {
      id: '4',
      type: 'staff-response',
      title: 'Staff Response Received',
      message: 'Dr. Williams has responded to your message about lab results',
      timestamp: '2025-01-12T16:30:00',
      read: false,
      icon: MessageCircle
    },
    {
      id: '5',
      type: 'prescription',
      title: 'Prescription Ready',
      message: 'Your prescription is ready for pickup at Main Street Pharmacy',
      timestamp: '2025-01-12T14:15:00',
      read: true,
      icon: FileText
    },
    {
      id: '6',
      type: 'appointment-notice',
      title: 'Appointment No-Show Notice',
      message: 'You missed your appointment on Jan 08. Please contact us to reschedule',
      timestamp: '2025-01-11T11:00:00',
      read: true,
      icon: AlertCircle
    }
  ]);

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.type === 'survey') {
      setCurrentScreen('survey');
    } else if (notification.type === 'staff-reply') {
      setCurrentScreen('chat');
      // Show toast when clicking on staff reply notification
      toast.success('Navigated to chat', {
        description: 'You can now reply to the staff message'
      });
    }
  };

  const handleSendConfirmation = (confirmed: boolean) => {
    // Add the Yes or No as a patient message
    const selectionMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      content: confirmed ? 'Yes' : 'No',
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, selectionMessage]);
    
    // Clear the waiting flag
    setWaitingForSendConfirmation(false);
    
    // If Yes, show the toast notification
    if (confirmed) {
      // Show toast notification for 8 seconds
      setInAppNotification('This is a confirmation that your message has been received. Someone from our office will be in touch. If this is an emergency please dial 911. Thank you.');
      
      // Auto-hide notification after 8 seconds
      setTimeout(() => {
        setInAppNotification(null);
      }, 8000);
      
      // Also show a quick success toast
      toast.success('Message sent to practice', {
        description: 'You will receive a response soon'
      });
    }
  };

  const handleNotificationMethodSelect = (method: string) => {
    setSelectedNotificationMethod(method);
    setWaitingForNotificationPreference(false);
    
    // Add the selected method as a patient message
    const selectionMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      content: method,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, selectionMessage]);
    
    // Show toast notification for 8 seconds
    setInAppNotification('This is a confirmation that your message has been received. Someone from our office will be in touch. If this is an emergency please dial 911. Thank you.');
    
    // Auto-hide notification after 8 seconds
    setTimeout(() => {
      setInAppNotification(null);
    }, 8000);
  };

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      type: 'Annual Physical',
      provider: 'Dr. Sarah Smith',
      date: '2025-01-14',
      time: '2:00 PM',
      location: 'Main Campus Medical Center',
      status: 'upcoming'
    },
    {
      id: '2',
      type: 'Follow-up Visit',
      provider: 'Dr. Michael Williams',
      date: '2025-01-20',
      time: '10:30 AM',
      location: 'North Clinic',
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'Dental Cleaning',
      provider: 'Dr. Emily Chen',
      date: '2025-01-08',
      time: '3:00 PM',
      location: 'Dental Center',
      status: 'completed'
    }
  ]);

  const handleQrScan = () => {
    setQrScanned(true);
    setIsQRCodeFlow(true);
    // Select the first practice by default from QR scan
    setSelectedPractice(practices[0]);
    setTimeout(() => setCurrentScreen('location-verify'), 1000);
  };

  const handleLocationVerify = () => {
    if (qrPractice) {
      toast.success(`Practice verified! Continuing registration with ${qrPractice.name}`);
    }
    setTimeout(() => setCurrentScreen('registration-type'), 1000);
  };

  const handleSearchPractices = () => {
    setShowSearchResults(true);
  };

  const handleSelectPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setTimeout(() => setCurrentScreen('registration-type'), 500);
  };

  const handleNearMe = () => {
    // Simulate geolocation search
    setShowSearchResults(true);
  };

  const handleRegistrationTypeSelect = (type: 'patient' | 'auth-rep') => {
    setIsAuthRep(type === 'auth-rep');
    
    if (type === 'auth-rep') {
      // Skip patient matching for auth-rep, go directly to identity verification
      setTimeout(() => setCurrentScreen('auth-rep-verify'), 500);
    } else {
      // Skip patient matching for patient, go directly to identity verification
      setTimeout(() => setCurrentScreen('identity-verify'), 500);
    }
  };

  const handlePatientMatchConfirmed = (patient: MatchedPatient) => {
    setMatchedPatient(patient);
    toast.success('Patient record matched successfully!');
    
    if (isAuthRep) {
      // Go to proxy registration flow
      setTimeout(() => setCurrentScreen('proxy-registration'), 500);
    } else {
      // Go to regular identity verification for patient
      setPatientData({
        firstName: patient.name?.[0]?.given?.[0] || '',
        lastName: patient.name?.[0]?.family || '',
        dob: patient.birthDate || '',
        zipCode: '',
        identifierType: 'patientId',
        patientId: patient.id,
        billingAccountNumber: ''
      });
      setTimeout(() => setCurrentScreen('verify-info'), 500);
    }
  };

  const handleProxyRegistrationComplete = (data: ProxyRegistrationData) => {
    setProxyRegistrationData(data);
    toast.success('Proxy registration completed!');
    // Continue to email verification or account setup
    setTimeout(() => setCurrentScreen('email-verification'), 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAuthRepVerify = () => {
    setTimeout(() => setCurrentScreen('email-verification'), 1000);
  };

  const handleIdentityVerify = () => {
    setTimeout(() => setCurrentScreen('verify-info'), 1000);
  };

  const handleVerifyInfo = async () => {
    try {
      // Validate required fields
      if (!patientData.firstName || !patientData.lastName || !patientData.dob || !patientData.zipCode || !patientData.billingAccountNumber) {
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('====== PATIENT VERIFICATION START ======');
      console.log('[Verify] Patient Data Entered:', patientData);

      setIsVerifying(true);
      toast.loading('Verifying your information...');

      const requestBody = {
        healthlakeBase: 'https://demo-healthlake.example.com/fhir',
        identifiers: [
          {
            system: 'http://hospital.example.org/billing-account',
            value: patientData.billingAccountNumber
          }
        ],
        family: patientData.lastName,
        given: patientData.firstName,
        birthDate: patientData.dob,
      };

      console.log('[Verify] API Request Body:', requestBody);

      // Call patient matching API
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/matchPatient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('[Verify] API Response Status:', response.status);

      const data = await response.json();
      console.log('[Verify] API Response Data:', data);
      
      toast.dismiss();
      setIsVerifying(false);

      if (data.matchType === 'deterministic' && data.matches?.length > 0) {
        // Exact match found
        const match = data.matches[0];
        const ehrFirstName = match.name?.[0]?.given?.[0] || '';
        
        console.log('[Verify] Deterministic Match Found');
        console.log('[Verify] Full Match Object:', match);
        console.log('[Verify] EHR First Name:', ehrFirstName);
        console.log('[Verify] Entered First Name:', patientData.firstName);
        console.log('[Verify] Names Match?', ehrFirstName.toLowerCase() === patientData.firstName.toLowerCase());
        
        // Check if first name matches (case insensitive)
        if (ehrFirstName.toLowerCase() !== patientData.firstName.toLowerCase()) {
          // Name mismatch detected!
          console.log('❌ [Patient Match] Name mismatch detected:', { entered: patientData.firstName, ehr: ehrFirstName });
          toast.error(`Name mismatch: EHR shows "${ehrFirstName}" but you entered "${patientData.firstName}"`);
          
          // Store mismatch info for displaying help options
          setVerificationMismatch({ entered: patientData.firstName, ehr: ehrFirstName });
          setMatchedPatient(match);
          
          console.log('[Verify] Mismatch state set:', { entered: patientData.firstName, ehr: ehrFirstName });
          console.log('[Verify] STOPPING - Not proceeding to next screen');
          // Show error message and don't proceed
          return;
        }
        
        setMatchedPatient(match);
        toast.success('Patient record found and verified!');
        console.log('✅ [Patient Match] Found deterministic match:', match);
      } else if (data.matchType === 'fuzzy' && data.candidates?.length > 0) {
        // Potential matches found
        const topCandidate = data.candidates[0];
        const ehrFirstName = topCandidate.patient.name?.[0]?.given?.[0] || '';
        
        console.log('[Verify] Fuzzy Match Found');
        console.log('[Verify] Full Candidate Object:', topCandidate);
        console.log('[Verify] EHR First Name:', ehrFirstName);
        console.log('[Verify] Entered First Name:', patientData.firstName);
        console.log('[Verify] Names Match?', ehrFirstName.toLowerCase() === patientData.firstName.toLowerCase());
        
        // Check if first name matches (case insensitive)
        if (ehrFirstName.toLowerCase() !== patientData.firstName.toLowerCase()) {
          // Name mismatch detected!
          console.log('❌ [Patient Match] Name mismatch detected in fuzzy match:', { entered: patientData.firstName, ehr: ehrFirstName });
          toast.error(`Name mismatch: EHR shows "${ehrFirstName}" but you entered "${patientData.firstName}"`);
          
          // Store mismatch info for displaying help options
          setVerificationMismatch({ entered: patientData.firstName, ehr: ehrFirstName });
          setMatchedPatient(topCandidate.patient);
          
          console.log('[Verify] Mismatch state set:', { entered: patientData.firstName, ehr: ehrFirstName });
          console.log('[Verify] STOPPING - Not proceeding to next screen');
          // Show error message and don't proceed
          return;
        }
        
        setMatchedPatient(topCandidate.patient);
        toast.success(`Patient record matched (${topCandidate.confidence} confidence)`);
        console.log('✅ [Patient Match] Found fuzzy match:', topCandidate);
      } else {
        // No match found - this is a new patient
        console.log('ℹ️ [Patient Match] No match found - new patient registration');
        toast.success('Information verified - creating new account');
      }

      console.log('[Verify] Proceeding to TCPA consent screen');
      // Continue to TCPA consent before OTP
      setTimeout(() => setCurrentScreen('tcpa-consent'), 1000);
    } catch (error) {
      console.error('[Patient Match] Error during verification:', error);
      toast.dismiss();
      setIsVerifying(false);
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleRouteToStaff = async () => {
    if (!contactInfo.trim()) {
      toast.error('Please enter your contact information');
      return;
    }

    try {
      // Create a message in the staff workflow
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: 'conv-001',
        senderId: 'system',
        senderName: 'Registration System',
        recipientId: 'staff',
        content: `REGISTRATION MISMATCH ALERT\n\nPatient attempted registration but identity verification failed.\n\nEntered Information:\n- Name: ${patientData.firstName} ${patientData.lastName}\n- DOB: ${patientData.dob}\n- ZIP: ${patientData.zipCode}\n- Billing Account: ${patientData.billingAccountNumber}\n\nEHR Match Found:\n- Name: ${verificationMismatch?.ehr} ${patientData.lastName}\n- DOB: ${patientData.dob}\n\nPreferred Contact Method: ${contactMethod.toUpperCase()}\nContact Info: ${contactInfo}\n\nPlease reach out to verify identity and assist with registration.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        priority: 'high'
      };

      // Send to message queue
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(newMessage),
        }
      );

      setRegistrationRouted(true);
      toast.success('Your request has been sent to the practice');
    } catch (error) {
      console.error('Error routing to staff:', error);
      toast.error('Failed to send request. Please try again.');
    }
  };

  const handleDisclaimerAccept = () => {
    if (disclaimerAccepted) {
      setRegistrationComplete(true);
      setTimeout(() => setCurrentScreen('home'), 500);
    }
  };

  const handleSendMessage = async (quickMessage?: string | React.MouseEvent) => {
    // Use quickMessage if provided and it's a string, otherwise use chatInput
    const messageText = (typeof quickMessage === 'string' ? quickMessage : null) || chatInput;
    
    console.log('[handleSendMessage] quickMessage:', quickMessage);
    console.log('[handleSendMessage] chatInput:', chatInput);
    console.log('[handleSendMessage] messageText:', messageText);
    console.log('[handleSendMessage] chatMessages.length:', chatMessages.length);
    
    // Allow sending if there's text or an attachment
    if (!messageText.trim() && !pendingImage && !pendingFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      senderName: 'You',
      content: messageText || (pendingImage ? 'Shared an image' : pendingFile ? `Attached: ${pendingFile.name}` : ''),
      timestamp: new Date().toISOString(),
      imageUrl: pendingImage || undefined,
      fileUrl: pendingFile?.url,
      fileName: pendingFile?.name,
      fileType: pendingFile?.type,
      fileSize: pendingFile?.size
    };

    // Store the input before clearing it
    const userInput = messageText || (pendingImage ? 'Shared an image' : pendingFile ? `Attached: ${pendingFile.name}` : '');

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    setPendingImage(null);
    setPendingFile(null);

    // Check if we're replying DIRECTLY to a staff message (the last message was from staff)
    // This handles cases like staff asking "Which time slot works?" and patient replying "2pm"
    // OR patient sending attachments in response to staff requests
    const lastMessage = chatMessages[chatMessages.length - 1];
    const isLastMessageFromStaff = lastMessage && lastMessage.sender === 'staff';
    
    // Determine if this is a direct reply to staff vs a new question
    // Direct reply indicators:
    // 1. Has an attachment (image/file) - likely responding to staff request for documents
    // 2. Short response (< 50 chars) after staff message - likely answering a specific question
    // 3. Message contains common reply patterns (yes/no, time, dates, etc.)
    const hasAttachment = !!(pendingImage || pendingFile || newMessage.imageUrl || newMessage.fileUrl);
    const isShortResponse = messageText.length < 50;
    const containsReplyPattern = /^(yes|no|ok|okay|sure|thanks|thank you|morning|afternoon|evening|\d+:?\d*\s*(am|pm)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(messageText.trim());
    
    // Only bypass AI if it's truly a direct reply (has attachment OR is a short/patterned response to staff)
    const isDirectReplyToStaff = isLastMessageFromStaff && (hasAttachment || (isShortResponse && containsReplyPattern));

    console.log('[handleSendMessage] lastMessage sender:', lastMessage?.sender);
    console.log('[handleSendMessage] isLastMessageFromStaff:', isLastMessageFromStaff);
    console.log('[handleSendMessage] hasAttachment:', hasAttachment);
    console.log('[handleSendMessage] isShortResponse:', isShortResponse);
    console.log('[handleSendMessage] containsReplyPattern:', containsReplyPattern);
    console.log('[handleSendMessage] isDirectReplyToStaff:', isDirectReplyToStaff);

    // If directly replying to staff (appointment slot, insurance request, etc.), just send to staff queue
    if (isDirectReplyToStaff) { // Direct replies to staff bypass AI processing
      console.log('[handleSendMessage] REPLYING TO STAFF - showing toast and skipping AI');
      // Show confirmation toast
      setInAppNotification('Message sent to staff successfully');
      setTimeout(() => setInAppNotification(null), 3000);

      // Send to message queue without AI processing
      const currentConversation = [...chatMessages, newMessage].map(msg => ({
        sender: msg.sender,
        senderName: msg.senderName,
        content: msg.content,
        timestamp: msg.timestamp,
        imageUrl: msg.imageUrl,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        fileSize: msg.fileSize
      }));

      // Generate a summary of the conversation
      let conversationSummary = 'Patient reply to staff: ';
      
      if (lastMessage && lastMessage.sender === 'staff') {
        const staffContent = lastMessage.content.substring(0, 100);
        conversationSummary += `Staff asked: "${staffContent}${lastMessage.content.length > 100 ? '...' : ''}" | `;
      }
      
      if (newMessage.imageUrl) {
        conversationSummary += `Patient responded with image`;
      } else if (newMessage.fileUrl) {
        conversationSummary += `Patient responded with file: ${newMessage.fileName}`;
      } else {
        conversationSummary += `Patient: "${userInput.substring(0, 100)}${userInput.length > 100 ? '...' : ''}"`;
      }

      messageQueue.addMessage({
        id: `reply-${Date.now()}`,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientMessage: userInput,
        aiSummary: conversationSummary,
        detectedIntent: 'staff_reply',
        conversationHistory: currentConversation.map(msg => ({
          sender: msg.sender,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp,
          imageUrl: msg.imageUrl,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize
        })),
        timestamp: new Date().toISOString(),
        urgency: 'normal'
      });

      return; // Skip AI response
    }

    console.log('[handleSendMessage] Message sent - no AI auto-reply');
  };

  // Helper function to send a quick message from buttons
  const sendQuickMessage = (message: string) => {
    // Pass the message directly to handleSendMessage
    handleSendMessage(message);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Create a URL for the image and set as pending
    const imageUrl = URL.createObjectURL(file);
    setPendingImage(imageUrl);

    // Reset the input
    e.target.value = '';
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Get file extension and name
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const fileSize = (file.size / 1024).toFixed(1); // KB
    
    // Determine file type icon
    let fileTypeLabel = 'Document';
    if (['pdf'].includes(fileExtension)) {
      fileTypeLabel = 'PDF';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileTypeLabel = 'Word Document';
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      fileTypeLabel = 'Excel';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileTypeLabel = 'Image';
    }

    // Set as pending file
    setPendingFile({
      url: URL.createObjectURL(file),
      name: fileName,
      type: fileTypeLabel,
      size: fileSize
    });

    // Reset the input
    e.target.value = '';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    // If today, just show time
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      return timeStr;
    }
    
    // If yesterday
    if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
      return `Yesterday ${timeStr}`;
    }
    
    // Otherwise show date in "Jan 13" format + time
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateStr} ${timeStr}`;
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // If today
    if (diffDays === 0 && date.getDate() === now.getDate()) {
      return 'Today';
    }
    
    // If yesterday
    if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
      return 'Yesterday';
    }
    
    // Otherwise show date in "Jan 13" format
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // App Download Landing Page
  if (currentScreen === 'app-download') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2>Patient App Demo</h2>
                <p className="text-gray-600 mt-1">
                  Download landing page experience
                </p>
              </div>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
            <Card className="mt-4 p-4 bg-teal-50 border-teal-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>Try the QR Code Flow</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Click "Simulate QR Code Scan" to see what happens when a patient scans a QR code from your practice materials.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <MobileFrame viewMode={viewMode}>
            <div className="h-full flex flex-col bg-gradient-to-b from-teal-50 to-white overflow-y-auto">
              {/* Demo QR Scan Button */}
              <div className="p-4 bg-white border-b border-gray-200">
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    // Simulate scanning a QR code from Madison Medical Center
                    setQrPractice(practices[0]);
                    setCurrentScreen('qr-download-page');
                  }}
                >
                  <QrCode className="w-4 h-4" />
                  Simulate QR Code Scan
                </Button>
              </div>

              {/* Hero Section */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-8 text-center">
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-12 h-12 text-teal-600" />
                  </div>
                </div>
                <h1 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
                  HealthConnect
                </h1>
                <p className="text-teal-100 text-sm mb-6">
                  Your healthcare, simplified
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">Secure messaging with your care team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">AI-powered 24/7 assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">Easy appointment management</span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="p-6 space-y-4">
                <h3 className="text-center text-lg" style={{ fontWeight: 500 }}>
                  Everything You Need
                </h3>

                <div className="space-y-3">
                  {/* Feature 1 */}
                  <Card className="p-4 border-gray-200">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1" style={{ fontWeight: 500 }}>
                          Secure Messaging
                        </h4>
                        <p className="text-xs text-gray-600">
                          Chat directly with your healthcare team. Share photos, documents, and get quick responses.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Feature 2 */}
                  <Card className="p-4 border-gray-200">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1" style={{ fontWeight: 500 }}>
                          AI Assistant
                        </h4>
                        <p className="text-xs text-gray-600">
                          Get instant answers about appointments, prescriptions, and general health questions.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Feature 3 */}
                  <Card className="p-4 border-gray-200">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm mb-1" style={{ fontWeight: 500 }}>
                          HIPAA Compliant
                        </h4>
                        <p className="text-xs text-gray-600">
                          Your health information is protected with enterprise-grade security.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Download Buttons */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-center text-sm text-gray-600">
                    Download the app
                  </h4>
                  
                  {/* App Store Button */}
                  <Button 
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
                    onClick={() => toast.success('Redirecting to App Store...')}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-[10px] opacity-75">Download on the</div>
                        <div className="text-sm" style={{ fontWeight: 500 }}>App Store</div>
                      </div>
                    </div>
                  </Button>

                  {/* Google Play Button */}
                  <Button 
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
                    onClick={() => toast.success('Redirecting to Google Play...')}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-[10px] opacity-75">GET IT ON</div>
                        <div className="text-sm" style={{ fontWeight: 500 }}>Google Play</div>
                      </div>
                    </div>
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-gray-500">or continue in browser</span>
                    </div>
                  </div>

                  {/* Continue to Registration */}
                  <Button 
                    className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-full"
                    onClick={() => setCurrentScreen('registration')}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // QR Code Download Page (Practice-specific)
  if (currentScreen === 'qr-download-page' && qrPractice) {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2>Patient App Demo</h2>
                <p className="text-gray-600 mt-1">
                  QR code landing page experience
                </p>
              </div>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
            <Card className="mt-4 p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm" style={{ fontWeight: 500 }}>QR Code Scanned Successfully!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    The patient is now seeing a personalized download page with {qrPractice.name}'s information. After downloading, their practice will be pre-selected.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <MobileFrame viewMode={viewMode}>
            <div className="h-full flex flex-col bg-gradient-to-b from-teal-50 to-white overflow-y-auto">
              {/* Header with Practice Info */}
              <div className="bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">You've been invited by</div>
                    <h3 className="text-base" style={{ fontWeight: 500 }}>{qrPractice.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {qrPractice.address}, {qrPractice.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-8 text-center">
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-12 h-12 text-teal-600" />
                  </div>
                </div>
                <h1 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
                  Download HealthConnect
                </h1>
                <p className="text-teal-100 text-sm mb-6">
                  Stay connected with your care team
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">Message your provider securely</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">Get instant AI assistance 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-200 flex-shrink-0" />
                    <span className="text-sm">Manage appointments easily</span>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="p-6 space-y-4">
                <h3 className="text-center" style={{ fontWeight: 500 }}>
                  Get the app to continue
                </h3>
                
                {/* App Store Button */}
                <Button 
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
                  onClick={() => {
                    toast.success('Redirecting to App Store...');
                    setTimeout(() => {
                      toast.success('App installed! Opening...');
                      setTimeout(() => {
                        // Simulate app installed and opened with practice context
                        setSelectedPractice(qrPractice);
                        setCurrentScreen('registration');
                      }, 1000);
                    }, 1500);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-[10px] opacity-75">Download on the</div>
                      <div className="text-sm" style={{ fontWeight: 500 }}>App Store</div>
                    </div>
                  </div>
                </Button>

                {/* Google Play Button */}
                <Button 
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
                  onClick={() => {
                    toast.success('Redirecting to Google Play...');
                    setTimeout(() => {
                      toast.success('App installed! Opening...');
                      setTimeout(() => {
                        // Simulate app installed and opened with practice context
                        setSelectedPractice(qrPractice);
                        setCurrentScreen('registration');
                      }, 1000);
                    }, 1500);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-[10px] opacity-75">GET IT ON</div>
                      <div className="text-sm" style={{ fontWeight: 500 }}>Google Play</div>
                    </div>
                  </div>
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 space-y-3">
                  <Card className="p-4 border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs" style={{ fontWeight: 500 }}>HIPAA Compliant & Secure</p>
                        <p className="text-xs text-gray-600">Your health data is protected</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs" style={{ fontWeight: 500 }}>Trusted by {qrPractice.name}</p>
                        <p className="text-xs text-gray-600">Recommended by your healthcare provider</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Sign In Screen
  if (currentScreen === 'sign-in') {
    const canSignIn = signInEmail.trim() !== '' && signInPassword.trim() !== '';

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2>Patient App Demo</h2>
              <p className="text-gray-600 mt-1">
                Sign in to your account
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-teal-700 p-2 -ml-2"
                onClick={() => setCurrentScreen('registration')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base flex-1 text-center -ml-10">Sign In</h3>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex-1 space-y-6">
                {/* Username or Email */}
                <div className="space-y-2">
                  <label className="text-sm">Username or Email</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username or Email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full px-5 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm">Password</label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full px-5 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-teal-600"
                    >
                      {showSignInPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Trouble signing in link */}
                <a
                  href="#"
                  className="text-sm text-teal-600 underline inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Password reset functionality coming soon');
                  }}
                >
                  Trouble signing in?
                </a>
              </div>

              {/* Buttons */}
              <div className="space-y-4 mt-6">
                <Button
                  size="lg"
                  className={`w-full rounded-full ${
                    canSignIn
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!canSignIn}
                  onClick={() => {
                    if (canSignIn) {
                      // Sign in successful - show success toast and go to home
                      toast.success('Signed in successfully!');
                      setTimeout(() => setCurrentScreen('home'), 500);
                    }
                  }}
                >
                  Sign In
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => setCurrentScreen('practice-search')}
                >
                  Create an Account
                </Button>
              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Registration Screen - Auto-navigate if practice already selected from QR code
  if (currentScreen === 'registration') {
    // If practice is pre-selected from QR code, skip to location verification
    if (selectedPractice) {
      setTimeout(() => setCurrentScreen('location-verify'), 100);
      return (
        <>
          <Toaster />
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2>Patient App Demo</h2>
              <p className="text-gray-600 mt-1">
                Loading your practice information...
              </p>
            </motion.div>
            <MobileFrame viewMode={viewMode}>
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Building2 className="w-8 h-8 text-teal-600" />
                  </motion.div>
                  <p className="text-sm text-gray-600">Setting up your account...</p>
                </div>
              </div>
            </MobileFrame>
          </div>
        </>
      );
    }

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Interactive demonstration of the patient-facing application experience
          </p>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 text-center">
              <h3 className="text-base">Welcome</h3>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center p-6">
              <motion.div 
                className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Shield className="w-8 h-8 text-teal-600" />
              </motion.div>
              
              <h3 className="text-center mb-2">Welcome to BASE Health</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Secure patient portal with AI-powered assistance
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  To get started, scan the QR code provided by your healthcare provider.
                </p>
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    setIsQRCodeFlow(true);
                    setCurrentScreen('qr-scan');
                  }}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>

                <div className="flex gap-3 items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setIsQRCodeFlow(false);
                    setCurrentScreen('practice-search');
                  }}
                >
                  Create Account
                </Button>

                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => setCurrentScreen('sign-in')}
                >
                  Sign In
                </Button>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>HIPAA Compliant & Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>End-to-End Encrypted Messaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // QR Scan Screen
  if (currentScreen === 'qr-scan') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('registration')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Scan QR Code</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Position the QR code within the frame
              </p>
              <motion.div 
                className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {!qrScanned ? (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="w-64 h-64 border-4 border-white/30 rounded-lg relative"
                          animate={{ 
                            boxShadow: [
                              '0 0 0px rgba(59, 130, 246, 0.5)',
                              '0 0 20px rgba(59, 130, 246, 0.5)',
                              '0 0 0px rgba(59, 130, 246, 0.5)',
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <motion.div 
                            className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <motion.div 
                            className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
                          />
                          <motion.div 
                            className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                          />
                          <motion.div 
                            className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
                          />
                        </motion.div>
                      </div>
                      <div className="absolute inset-x-0 bottom-8 text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Scan className="w-12 h-12 text-white/70 mx-auto mb-2" />
                        </motion.div>
                        <p className="text-white/70 text-sm">Scanning...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="verified"
                      className="absolute inset-0 bg-green-600 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <div className="text-center text-white">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                        </motion.div>
                        <motion.p 
                          className="text-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          QR Code Verified!
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {!qrScanned && (
                <Button className="w-full" onClick={handleQrScan}>
                  Simulate Successful Scan
                </Button>
              )}
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Location Verify Screen
  if (currentScreen === 'location-verify') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => {
                  // If came from QR code, go back to QR download page
                  if (qrPractice) {
                    setCurrentScreen('qr-download-page');
                  } else {
                    setCurrentScreen('qr-scan');
                  }
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Confirm Location</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-teal-600" />
              </div>
              
              <h3 className="text-center mb-2">Confirm Your Location</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {qrPractice 
                  ? `You're registering with ${qrPractice.name}`
                  : 'Verify this is your healthcare practice'
                }
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Practice Information</Label>
                  <div className="mt-2 p-4 bg-teal-50 border-l-4 border-teal-600 rounded">
                    <div className="mb-2">
                      {selectedPractice?.name || 'Madison Medical Center P.A.'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedPractice 
                        ? `${selectedPractice.address}, ${selectedPractice.city}, ${selectedPractice.state}, ${selectedPractice.zip}, US`
                        : '34 Sycamore Street Suite 3, Madison, CA, 95653, US'
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedPractice?.phone || '(916) 555-7654'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleLocationVerify}
                  >
                    Confirm Location
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                      setCurrentScreen('practice-search');
                    }}
                  >
                    This isn't my practice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Practice Search Screen
  if (currentScreen === 'practice-search') {
    const filteredPractices = showSearchResults
      ? practices.filter(practice => {
          if (!searchQuery) return practice.discoverable;
          const query = searchQuery.toLowerCase();
          return practice.discoverable && (
            practice.name.toLowerCase().includes(query) ||
            practice.city.toLowerCase().includes(query) ||
            practice.zip.includes(query)
          );
        })
      : [];

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('location-verify')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Find Your Practice</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                Search by practice name, city, or ZIP code
              </p>

              <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="flex gap-2">
                  <Input 
                    id="search"
                    placeholder="Practice name, city, or ZIP"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPractices()}
                  />
                  <Button onClick={handleSearchPractices}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full"
                onClick={handleNearMe}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location (Near Me)
              </Button>
            </div>

            {showSearchResults && (
              <>
                <div className="border-t pt-4">
                  <Label className="text-sm">
                    {filteredPractices.length} practice(s) found
                  </Label>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredPractices.map((practice) => (
                      <Card 
                        key={practice.id}
                        className="cursor-pointer hover:border-teal-600 transition-colors"
                        onClick={() => handleSelectPractice(practice)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-sm">{practice.name}</div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {practice.address}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {practice.city}, {practice.state} {practice.zip}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {practice.phone}
                                  </div>
                                </div>
                                {practice.distance && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                                    {practice.distance}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Registration Type Selection Screen
  if (currentScreen === 'registration-type') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('practice-search')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Registration</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center p-6">
              <motion.div 
                className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <UserCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-center mb-2">Who are you registering for?</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Select the type of registration
              </p>

              <div className="space-y-4">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:border-teal-600 hover:bg-teal-50 transition-colors"
                  onClick={() => handleRegistrationTypeSelect('patient')}
                >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-1">Myself (Patient)</h3>
                    <p className="text-sm text-gray-600">
                      I am registering for my own healthcare access
                    </p>
                  </div>
                </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-colors"
                onClick={() => handleRegistrationTypeSelect('auth-rep')}
              >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base mb-1">Authorized Representative</h3>
                    <p className="text-sm text-gray-600">
                      I am registering on behalf of another person (family member, guardian, power of attorney)
                    </p>
                  </div>
                </div>
                </CardContent>
              </Card>
            </motion.div>
              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Patient Matching Screen
  if (currentScreen === 'patient-matching') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <PatientMatchingFlow 
            onBack={() => setCurrentScreen('registration-type')}
            onMatchConfirmed={handlePatientMatchConfirmed}
            isAuthRep={isAuthRep}
          />
        </MobileFrame>
        </div>
      </>
    );
  }

  // Proxy Registration Screen
  if (currentScreen === 'proxy-registration' && matchedPatient) {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <ProxyRegistrationFlow 
            onBack={() => setCurrentScreen('patient-matching')}
            onRegistrationComplete={handleProxyRegistrationComplete}
            matchedPatient={matchedPatient}
          />
        </MobileFrame>
        </div>
      </>
    );
  }

  // Auth Rep Verify Screen
  if (currentScreen === 'auth-rep-verify') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-purple-700 -ml-2"
                onClick={() => setCurrentScreen('registration-type')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Identity Verification</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authFirstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="authFirstName"
                    placeholder="Mary"
                    value={authRepData.firstName}
                    onChange={(e) => setAuthRepData({ ...authRepData, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authLastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="authLastName"
                    placeholder="Johnson"
                    value={authRepData.lastName}
                    onChange={(e) => setAuthRepData({ ...authRepData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authEmail">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="authEmail"
                  type="email"
                  placeholder="mary.johnson@email.com"
                  value={authRepData.email}
                  onChange={(e) => setAuthRepData({ ...authRepData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authDob">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="authDob"
                  type="date"
                  value={authRepData.dob}
                  onChange={(e) => setAuthRepData({ ...authRepData, dob: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authAddress">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="authAddress"
                  placeholder="456 Oak Avenue"
                  value={authRepData.address}
                  onChange={(e) => setAuthRepData({ ...authRepData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authZipCode">
                    ZIP Code <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="authZipCode"
                    placeholder="95653"
                    maxLength={5}
                    value={authRepData.zipCode}
                    onChange={(e) => setAuthRepData({ ...authRepData, zipCode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authPhone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="authPhone"
                    type="tel"
                    placeholder="(916) 555-6876"
                    value={authRepData.phone}
                    onChange={(e) => setAuthRepData({ ...authRepData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship to Patient <span className="text-red-500">*</span>
                </Label>
                <select
                  id="relationship"
                  value={authRepData.relationship}
                  onChange={(e) => setAuthRepData({ ...authRepData, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="">Select relationship</option>
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="guardian">Legal Guardian</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Adult Child</option>
                  <option value="power-of-attorney">Power of Attorney</option>
                  <option value="other">Other Authorized Representative</option>
                </select>
              </div>
            </div>

            {/* Patient Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base mb-1 text-teal-600">Patient Information</h3>
              <p className="text-sm text-gray-600 mb-6">
                Please provide the information of the patient you are requesting access for
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientFirstName">
                      Patient First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="patientFirstName"
                      placeholder="John"
                      value={patientData.firstName}
                      onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientLastName">
                      Patient Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="patientLastName"
                      placeholder="Smith"
                      value={patientData.lastName}
                      onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientDob">
                    Patient Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="patientDob"
                    type="date"
                    value={patientData.dob}
                    onChange={(e) => setPatientData({ ...patientData, dob: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAccountNumber">
                    Billing Account Number <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="billingAccountNumber"
                    placeholder="Enter Billing Account Number"
                    value={patientData.billingAccountNumber}
                    onChange={(e) => setPatientData({ ...patientData, billingAccountNumber: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the billing account number from the patient's medical records
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Documentation Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base mb-4 text-gray-700">
                Legal Documentation <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md inline-block mb-2 transition-colors">
                      Choose File
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                  </label>
                  
                  {uploadedFile && (
                    <p className="text-sm text-gray-700 mb-2">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    DOC, PDF, PNG, Max. 10MB
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mt-3">
                If available, you may upload supporting documentation such as Power of Attorney (Healthcare), Legal Guardianship Papers, Court Orders, or HIPAA Authorization Forms.
              </p>
            </div>

            {/* Information Alert */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-900">
                  <strong>As an authorized representative, you are requesting access to this patient's protected health information.</strong> By submitting this form, you confirm your legal authority to access this information.
                </div>
              </div>
            </div>

            {/* Certification Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="certify"
                checked={certifyChecked}
                onChange={(e) => setCertifyChecked(e.target.checked)}
                className="mt-1 mr-3 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
              />
              <label htmlFor="certify" className="text-sm text-gray-700">
                I certify that I am legally authorized to access this patient's protected health information and that all information provided is accurate and complete. I understand that unauthorized access to protected health information may result in legal consequences.
              </label>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAuthRepVerify}
                disabled={!certifyChecked}
              >
                Submit Request
              </Button>
            </div>
            </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Identity Verify Screen
  if (currentScreen === 'identity-verify') {
    const backScreen = isAuthRep ? 'auth-rep-verify' : 'registration-type';
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen(backScreen)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Identity Verification</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center p-6">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-center mb-2">
                {isAuthRep 
                  ? 'Patient Identity Verification' 
                  : isQRCodeFlow 
                    ? `Hi ${patientData.firstName || 'there'},` 
                    : 'Identity Verification'}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {isAuthRep ? 'Verify the patient information' : 'Confirm your identity to continue'}
              </p>

              <div className="space-y-4">
            {qrPractice && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-green-900 mb-1">
                    Your information has been verified
                  </div>
                  <div className="text-sm text-green-700">
                    We've confirmed you visited {selectedPractice?.name || 'Madison Medical Center P.A.'}.
                  </div>
                </div>
              </div>
            </div>
            )}

            <div className="text-sm text-gray-700">
              {isAuthRep 
                ? 'Please proceed to verify the patient information.' 
                : 'To complete your portal registration, please verify your information.'}
            </div>

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleIdentityVerify}
                >
                  Continue
                </Button>
              </div>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Verify Info Screen
  if (currentScreen === 'verify-info') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => {
                  setCurrentScreen('identity-verify');
                  setVerificationMismatch(null);
                  setRegistrationRouted(false);
                  setContactInfo('');
                  setContactMethod('sms');
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Verify Information</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
            {isAuthRep && (
              <div className="bg-purple-50 border-l-4 border-purple-600 rounded p-4">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-purple-900 mb-1">
                      Authorized Representative: {authRepData.firstName} {authRepData.lastName}
                    </div>
                    <div className="text-sm text-purple-700">
                      Relationship: {authRepData.relationship || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {isAuthRep ? 'Patient ' : ''}First Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name"
                  value={patientData.firstName}
                  onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {isAuthRep ? 'Patient ' : ''}Last Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name"
                  value={patientData.lastName}
                  onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">
                  {isAuthRep ? 'Patient ' : ''}Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="dob" 
                  type="date"
                  value={patientData.dob}
                  onChange={(e) => setPatientData({ ...patientData, dob: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">
                  {isAuthRep ? 'Patient ' : ''}ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="zipCode" 
                  placeholder="Enter ZIP code"
                  value={patientData.zipCode}
                  onChange={(e) => setPatientData({ ...patientData, zipCode: e.target.value })}
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAccountNumber">
                  {isAuthRep ? 'Patient ' : ''}Billing Account Number <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="billingAccountNumber" 
                  placeholder="Enter billing account number"
                  value={patientData.billingAccountNumber}
                  onChange={(e) => setPatientData({ ...patientData, billingAccountNumber: e.target.value })}
                />
              </div>
            </div>

            {isAuthRep && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-900">
                    <strong>Important:</strong> As an authorized representative, you confirm that you have legal authority to access this patient's protected health information. Unauthorized access may result in legal consequences.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleVerifyInfo}
                disabled={isVerifying || registrationRouted}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              
              {verificationMismatch && !registrationRouted && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-900">
                      <strong>Unable to Verify Registration</strong>
                      <p className="mt-1">
                        We're unable to complete your registration at this time. This has been routed to the practice. Select your preferred contact method below and they will reach out if there are questions.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setContactMethod('sms')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          contactMethod === 'sms'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Phone className="w-5 h-5" />
                          <span className="text-sm font-medium">SMS</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setContactMethod('email')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          contactMethod === 'email'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Mail className="w-5 h-5" />
                          <span className="text-sm font-medium">Email</span>
                        </div>
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder={contactMethod === 'sms' ? 'Enter your phone number' : 'Enter your email address'}
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <Button 
                      className="w-full" 
                      onClick={handleRouteToStaff}
                    >
                      Submit Contact Information
                    </Button>
                  </div>
                </div>
              )}

              {registrationRouted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <strong>Request Submitted</strong>
                      <p className="mt-1">
                        Your information has been sent to the practice. They will contact you via {contactMethod === 'sms' ? 'SMS' : 'email'} at {contactInfo} to verify your identity and complete registration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            </ScrollArea>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // TCPA Consent Screen
  if (currentScreen === 'tcpa-consent') {
    const phoneNumber = matchedPatient?.telecom?.find(t => t.system === 'phone')?.value || '+1 (555) 123-4567';
    
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Patient App Demo</h2>
            <p className="text-gray-600 mt-1">
              Navigate through the patient experience
            </p>
          </motion.div>

          <MobileFrame>
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-teal-700 -ml-2"
                  onClick={() => setCurrentScreen('verify-info')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-base">SMS Consent</h3>
                <div className="w-8"></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6 pb-6">
                  {/* Demo helper */}
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong className="text-purple-900">Demo Mode</strong>
                        <p className="text-purple-700 mt-1">
                          After accepting consent, the OTP code will be shown in a toast message and logged to the browser console for testing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4">
                    <div className="flex gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong className="text-blue-900">SMS Verification Required</strong>
                        <p className="text-blue-700 mt-1">
                          To verify your identity and secure your account, we'll send a verification code via SMS to {phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TCPA Consent */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Text Message Consent</h4>
                      <p className="text-sm text-gray-600">
                        By providing your phone number and checking the box below, you consent to receive text messages from Madison Medical Center P.A. and BASE Health, including:
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Account verification codes</span>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Appointment reminders</span>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Important health updates</span>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Service notifications</span>
                      </div>
                    </div>

                    {/* Legal text */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong>TCPA Compliance:</strong> You understand that:
                      </p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4">
                        <li>• Consent is not a condition of purchase</li>
                        <li>• Message and data rates may apply</li>
                        <li>• Message frequency varies</li>
                        <li>• You can opt-out anytime by replying STOP</li>
                        <li>• Reply HELP for assistance</li>
                      </ul>
                    </div>

                    {/* Checkbox consent */}
                    <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
                      <Checkbox 
                        id="sms-consent"
                        checked={consentGiven}
                        onCheckedChange={(checked) => setConsentGiven(checked === true)}
                      />
                      <label 
                        htmlFor="sms-consent"
                        className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                      >
                        I consent to receive text messages from Madison Medical Center P.A. and BASE Health at <strong>{phoneNumber}</strong>. I understand I can opt-out at any time.
                      </label>
                    </div>

                    {/* Privacy policy link */}
                    <div className="text-center">
                      <button 
                        className="text-xs text-teal-600 hover:text-teal-700 underline"
                        onClick={() => toast.info('Privacy policy would open here')}
                      >
                        View Privacy Policy & Terms
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t space-y-2">
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!consentGiven}
                  onClick={async () => {
                    try {
                      toast.loading('Recording consent...');
                      
                      // Capture consent via Greenway API
                      await greenwayOtpApi.captureConsent({
                        phone: phoneNumber,
                        userId: matchedPatient?.id,
                        consentGiven: true,
                        consentMethod: 'in-app',
                        ip: '192.168.1.1', // Would be real IP in production
                        userAgent: navigator.userAgent
                      });

                      toast.dismiss();
                      toast.success('Consent recorded!');
                      
                      // Request OTP
                      setTimeout(async () => {
                        try {
                          toast.loading('Sending verification code...');
                          
                          const otpResponse = await greenwayOtpApi.requestOtp({
                            phone: phoneNumber,
                            userId: matchedPatient?.id,
                            purpose: 'registration',
                            channel: 'sms',
                            correlationId: crypto.randomUUID()
                          });

                          setOtpRequestId(otpResponse.requestId);
                          setOtpRemainingAttempts(5);
                          
                          toast.dismiss();
                          
                          // Log the OTP code for demo purposes
                          const demoCode = greenwayOtpApi.getOtpCode(otpResponse.requestId);
                          console.log(`[DEMO] OTP Code: ${demoCode}`);
                          console.log(`%c🔐 DEMO OTP CODE: ${demoCode}`, 'background: #0d9488; color: white; padding: 8px 16px; font-size: 16px; font-weight: bold; border-radius: 4px;');
                          
                          // Show multiple toasts to ensure visibility
                          toast.success('Verification code sent to ' + phoneNumber);
                          setTimeout(() => {
                            toast.info(`Your verification code is: ${demoCode}`, { duration: 15000 });
                          }, 500);
                          
                          setCurrentScreen('pin-code');
                        } catch (error: any) {
                          toast.dismiss();
                          if (error.status === 429) {
                            toast.error(`Rate limited. Please wait ${error.retryAfter} seconds.`);
                          } else {
                            toast.error(error.error || 'Failed to send OTP');
                          }
                        }
                      }, 1000);
                    } catch (error: any) {
                      toast.dismiss();
                      toast.error(error.error || 'Failed to record consent');
                    }
                  }}
                >
                  Accept & Send Verification Code
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast.error('SMS consent is required to continue registration');
                  }}
                >
                  Decline
                </Button>
              </div>
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Create Account Screen
  if (currentScreen === 'create-account') {
    const passwordStrength = () => {
      if (!accountPassword) return { score: 0, label: '', color: '' };
      let score = 0;
      if (accountPassword.length >= 8) score++;
      if (/[a-z]/.test(accountPassword) && /[A-Z]/.test(accountPassword)) score++;
      if (/\d/.test(accountPassword)) score++;
      if (/[^a-zA-Z\d]/.test(accountPassword)) score++;
      
      if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
      if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500' };
      if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500' };
      return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const strength = passwordStrength();
    const passwordsMatch = accountPassword && accountConfirmPassword && accountPassword === accountConfirmPassword;
    const canSubmit = accountUsername && accountPassword && passwordsMatch && accountTermsAccepted && strength.score >= 2;

    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Patient App Demo</h2>
            <p className="text-gray-600 mt-1">
              Navigate through the patient experience
            </p>
          </motion.div>

          <MobileFrame>
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-teal-700 -ml-2"
                  onClick={() => setCurrentScreen('pin-code')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-base">Create Account</h3>
                <div className="w-8"></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6 pb-6">
                  {/* Success banner */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded p-4">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong className="text-green-900">Phone Verified</strong>
                        <p className="text-green-700 mt-1">
                          Your phone number has been verified. Now create your account to get started.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Username field */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username or email"
                      value={accountUsername}
                      onChange={(e) => setAccountUsername(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      This will be used to sign in to your account
                    </p>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {accountPassword && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                level <= strength.score ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          strength.score <= 1 ? 'text-red-600' :
                          strength.score === 2 ? 'text-orange-600' :
                          strength.score === 3 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Password strength: {strength.label}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 space-y-1">
                      <p className="font-semibold">Password must include:</p>
                      <ul className="space-y-0.5 ml-3">
                        <li className={accountPassword.length >= 8 ? 'text-green-600' : ''}>
                          • At least 8 characters
                        </li>
                        <li className={/[a-z]/.test(accountPassword) && /[A-Z]/.test(accountPassword) ? 'text-green-600' : ''}>
                          • Upper and lowercase letters
                        </li>
                        <li className={/\d/.test(accountPassword) ? 'text-green-600' : ''}>
                          • At least one number
                        </li>
                        <li className={/[^a-zA-Z\d]/.test(accountPassword) ? 'text-green-600' : ''}>
                          • At least one special character
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Confirm password field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={accountConfirmPassword}
                        onChange={(e) => setAccountConfirmPassword(e.target.value)}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {accountConfirmPassword && (
                      <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  {/* Terms acceptance */}
                  <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
                    <Checkbox 
                      id="terms-consent"
                      checked={accountTermsAccepted}
                      onCheckedChange={(checked) => setAccountTermsAccepted(checked === true)}
                    />
                    <label 
                      htmlFor="terms-consent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      I agree to the{' '}
                      <button 
                        className="text-teal-600 hover:text-teal-700 underline"
                        onClick={() => toast.info('Terms of Service would open here')}
                      >
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button 
                        className="text-teal-600 hover:text-teal-700 underline"
                        onClick={() => toast.info('Privacy Policy would open here')}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!canSubmit}
                  onClick={() => {
                    toast.loading('Creating your account...');
                    setTimeout(() => {
                      toast.dismiss();
                      toast.success('Account created successfully!');
                      setTimeout(() => setCurrentScreen('home'), 500);
                    }, 1500);
                  }}
                >
                  Create Account
                </Button>
              </div>
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Registration Link Sent Screen
  if (currentScreen === 'registration-link-sent') {
    const contactMethod = matchedPatient?.telecom?.find(t => t.system === 'phone') ? 'SMS' : 'Email';
    const contactDestination = matchedPatient?.telecom?.find(t => t.system === 'phone')?.value || 
                               matchedPatient?.telecom?.find(t => t.system === 'email')?.value ||
                               'your contact method';

    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Patient App Demo</h2>
            <p className="text-gray-600 mt-1">
              Navigate through the patient experience
            </p>
          </motion.div>

          <MobileFrame>
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="bg-teal-600 text-white p-4 text-center">
                <h3 className="text-base">Registration Complete</h3>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center p-6">
                <motion.div 
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </motion.div>
                
                <h3 className="text-center mb-2">Identity Verified!</h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  We've sent you a secure link to complete your registration
                </p>

                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4">
                    <div className="flex gap-2">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong className="text-blue-900">Check Your {contactMethod}</strong>
                        <p className="text-blue-700 mt-1">
                          We've sent a registration link to <strong>{contactDestination}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="text-sm text-gray-700 font-medium">Next Steps:</div>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                        <span>Click the link in your {contactMethod.toLowerCase()}</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                        <span>Create your username and password</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                        <span>Start using your patient portal</span>
                      </li>
                    </ol>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs text-gray-500 text-center">
                      The link will expire in 24 hours for security
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowSmsPreview(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View {contactMethod}
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast.success('Registration link resent!');
                        }}
                      >
                        Resend Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => setCurrentScreen('app-download')}
                >
                  Return to Home
                </Button>
              </div>
            </div>

            {/* SMS/Email Preview Modal */}
            <AnimatePresence>
              {showSmsPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowSmsPreview(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Demo {contactMethod} Message</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSmsPreview(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {contactMethod === 'SMS' ? (
                      <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Smartphone className="w-4 h-4" />
                          <span>To: {contactDestination}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            <strong>BASE Health</strong>
                            {'\n\n'}
                            Hi {patientData.firstName},
                            {'\n\n'}
                            Welcome to BASE Health! Your identity has been verified.
                            {'\n\n'}
                            Complete your registration here:
                            {'\n'}
                            https://base.health/register/a8f3k9x2
                            {'\n\n'}
                            This link expires in 24 hours.
                            {'\n\n'}
                            - Madison Medical Center P.A.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>To: {contactDestination}</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                          <div className="text-sm">
                            <strong>Subject:</strong> Complete Your BASE Health Registration
                          </div>
                          <div className="border-t pt-3 text-sm text-gray-800 space-y-2">
                            <p>Hi {patientData.firstName},</p>
                            <p>Welcome to BASE Health! Your identity has been verified at Madison Medical Center P.A.</p>
                            <p>Click the button below to complete your registration and create your secure account:</p>
                            <div className="bg-teal-600 text-white text-center py-2 px-4 rounded my-3">
                              Complete Registration
                            </div>
                            <p className="text-xs text-gray-600">Or copy this link: https://base.health/register/a8f3k9x2</p>
                            <p className="text-xs text-gray-500 mt-4">This link expires in 24 hours for your security.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => setShowSmsPreview(false)}
                    >
                      Close
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Email Verification Screen
  if (currentScreen === 'email-verification') {
    const backScreen = isAuthRep ? 'auth-rep-verify' : 'verify-info';
    
    // Format email to show first letter, 5 asterisks, last 2 letters before @, then domain
    const formatEmail = (email: string) => {
      const [localPart, domain] = email.split('@');
      if (localPart.length <= 3) {
        return email; // Too short to mask properly
      }
      const firstLetter = localPart[0];
      const lastTwoLetters = localPart.slice(-2);
      return `${firstLetter}*****${lastTwoLetters}@${domain}`;
    };
    
    const emailOptions = [
      { email: 'johnson.mary@email.com' },
      { email: 'mary_johnson123@gmail.com' },
      { email: 'maryjohnson@yahoo.com' },
      { email: isAuthRep ? 'mary.johnson@email.com' : 'david.smith@email.com' }
    ];

    const phoneOptions = [
      { phone: '(***) ***-3012' },
      { phone: '(***) ***-3456' },
      { phone: '(***) ***-5678' },
      { phone: '(***) ***-5678' }
    ];

    const handleEmailSelection = (email: string) => {
      setSelectedEmail(email);
      setSelectedPhone('');
    };

    const handlePhoneSelection = (phone: string) => {
      setSelectedPhone(phone);
      setSelectedEmail('');
    };

    const handleContinueWithContact = () => {
      if (selectedEmail || selectedPhone) {
        console.log('Setting showPinSentModal to true');
        setShowPinSentModal(true);
      }
    };

    const handleModalClose = () => {
      setShowPinSentModal(false);
      setTimeout(() => setCurrentScreen('pin-code'), 300);
    };

    const handleCancelRegistration = () => {
      if (confirm('Are you sure you want to cancel registration?')) {
        setCurrentScreen('app-download');
      }
    };

    const handleManualVerificationRequest = () => {
      toast.success('Manual verification request submitted to practice');
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen(backScreen)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Contact Verification</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Security Notice */}
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="mb-2"><strong>Security Notice</strong></p>
                    <p>For your protection, we display multiple contact options. Only select the method that belongs to you.</p>
                  </div>
                </div>
              </div>

              {/* Tabs for Email/Phone */}
              <Tabs value={contactMethodType} onValueChange={(value) => setContactMethodType(value as 'email' | 'phone')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email Addresses</TabsTrigger>
                  <TabsTrigger value="phone">Phone Numbers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-3 mt-4">
                  {emailOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleEmailSelection(option.email)}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedEmail === option.email
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-300 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm">{formatEmail(option.email)}</div>
                          <div className="text-xs text-gray-500 mt-1">Email verification</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedEmail === option.email
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedEmail === option.email && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="phone" className="space-y-3 mt-4">
                  {phoneOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handlePhoneSelection(option.phone)}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedPhone === option.phone
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-300 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm">{option.phone}</div>
                          <div className="text-xs text-gray-500 mt-1">SMS verification</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPhone === option.phone
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedPhone === option.phone && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Can't Access Section */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h4 className="text-sm mb-3">Can't Access These Contact Methods?</h4>
                <div className="bg-red-50 border-l-4 border-red-500 rounded p-4">
                  <div className="flex gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm space-y-2">
                      <p className="text-red-900">None of these contact methods are accessible to me</p>
                      <button 
                        onClick={handleManualVerificationRequest}
                        className="text-red-600 underline hover:text-red-700"
                      >
                        Submit request to practice for manual verification
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelRegistration}
                >
                  Cancel Registration
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700" 
                  onClick={handleContinueWithContact}
                  disabled={!selectedEmail && !selectedPhone}
                >
                  Send PIN
                </Button>
              </div>
            </div>
            </div>
          </div>

          {/* PIN Sent Success Modal - Inside Mobile Frame */}
          {console.log('showPinSentModal state:', showPinSentModal)}
          <AnimatePresence>
            {showPinSentModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                onClick={(e) => {
                  console.log('Modal overlay clicked');
                  e.stopPropagation();
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-sm relative"
                >
                  {/* Close Button */}
                  <button
                    onClick={handleModalClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col items-center justify-center p-6">
                    {/* Success Label */}
                    <div className="flex gap-2 items-center mb-4">
                      <div className="h-[26px] relative shrink-0 w-[32px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 26">
                          <g clipPath="url(#clip0_92_34)">
                            <path clipRule="evenodd" d={svgPathsSuccess.p1878e480} fill="#0D870D" fillRule="evenodd" />
                          </g>
                          <defs>
                            <clipPath id="clip0_92_34">
                              <rect fill="white" height="26" width="32" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <p className="font-['Roboto:Light',sans-serif] text-[32px] text-[#0d870d]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Success
                      </p>
                    </div>

                    {/* Body Copy */}
                    <div className="flex flex-col gap-2 items-center justify-center text-center w-full text-[#333333] mb-4">
                      <p className="font-['Roboto:Regular',sans-serif] text-base" style={{ fontVariationSettings: "'wdth' 100" }}>
                        {selectedEmail ? (
                          <>
                            <span>We just sent a confirmation email and </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>PIN Code</span>
                            <span> to </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>{selectedEmail}</span>
                            <span>. You will need the </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>PIN Code</span>
                            <span> to continue the process.</span>
                          </>
                        ) : (
                          <>
                            <span>We just sent a confirmation text message and </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>PIN Code</span>
                            <span> to </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>{selectedPhone}</span>
                            <span>. You will need the </span>
                            <span className="font-['Roboto:Bold',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>PIN Code</span>
                            <span> to continue the process.</span>
                          </>
                        )}
                      </p>
                      <p className="font-['Roboto:Regular',sans-serif] text-base" style={{ fontVariationSettings: "'wdth' 100" }}>
                        {selectedEmail ? 'The email may take up to 30 minutes to arrive.' : 'The text message may take up to 5 minutes to arrive.'}
                      </p>
                    </div>

                    {/* OK Button */}
                    <Button 
                      onClick={handleModalClose}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      OK
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </MobileFrame>
      </div>
      </>
    );
  }

  // PIN Code Entry Screen
  if (currentScreen === 'pin-code') {
    const phoneNumber = matchedPatient?.telecom?.find(t => t.system === 'phone')?.value || '+1 (555) 123-4567';
    
    const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPinCode(e.target.value);
    };

    const handleContinueWithPin = async () => {
      if (pinCode.trim().length === 0) return;
      
      try {
        toast.loading('Verifying code...');
        
        const verifyResponse = await greenwayOtpApi.verifyOtp({
          phone: phoneNumber,
          requestId: otpRequestId,
          code: pinCode,
          correlationId: crypto.randomUUID()
        });

        toast.dismiss();
        
        if (verifyResponse.verified) {
          toast.success('Phone verified successfully!');
          console.log('[OTP] Proof token:', verifyResponse.proofToken);
          setTimeout(() => setCurrentScreen('create-account'), 500);
        } else {
          setOtpRemainingAttempts(verifyResponse.remainingAttempts || 0);
          toast.error(`Incorrect code. ${verifyResponse.remainingAttempts} attempts remaining.`);
          setPinCode('');
        }
      } catch (error: any) {
        toast.dismiss();
        
        if (error.status === 423) {
          // Account locked
          setOtpLockoutExpires(error.lockoutExpires);
          const lockoutTime = new Date(error.lockoutExpires);
          toast.error(`Too many failed attempts. Account locked until ${lockoutTime.toLocaleTimeString()}`);
          setPinCode('');
        } else if (error.status === 410) {
          // OTP expired
          toast.error('Verification code expired. Please request a new one.');
        } else {
          toast.error(error.error || 'Verification failed');
        }
      }
    };

    const handleResendCode = async () => {
      try {
        toast.loading('Sending new verification code...');
        
        const otpResponse = await greenwayOtpApi.requestOtp({
          phone: phoneNumber,
          userId: matchedPatient?.id,
          purpose: 'registration',
          channel: 'sms',
          correlationId: crypto.randomUUID()
        });

        setOtpRequestId(otpResponse.requestId);
        setOtpRemainingAttempts(5);
        setPinCode('');
        
        toast.dismiss();
        toast.success('New verification code sent!');
        
        // Log the OTP code for demo purposes
        const demoCode = greenwayOtpApi.getOtpCode(otpResponse.requestId);
        console.log(`[DEMO] New OTP Code: ${demoCode}`);
        toast.info(`Demo OTP: ${demoCode}`, { duration: 10000 });
      } catch (error: any) {
        toast.dismiss();
        if (error.status === 429) {
          toast.error(`Rate limited. Please wait ${error.retryAfter} seconds.`);
        } else if (error.status === 403) {
          toast.error('SMS consent required. Please go back and accept consent.');
          setTimeout(() => setCurrentScreen('tcpa-consent'), 2000);
        } else {
          toast.error(error.error || 'Failed to send code');
        }
      }
    };

    const isPinValid = pinCode.trim().length === 6;

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('tcpa-consent')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Verify Phone</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Title and Description */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-[#333333] text-[28px]" style={{ fontWeight: 500 }}>
                    Enter Verification Code
                  </h2>
                  <p className="text-[#333333] text-sm">
                    We sent a 6-digit code to {phoneNumber}. Enter it below to verify your phone number.
                  </p>
                </div>

                {/* Remaining attempts warning */}
                {otpRemainingAttempts < 5 && otpRemainingAttempts > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        {otpRemainingAttempts} {otpRemainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                      </p>
                    </div>
                  </div>
                )}

                {/* Lockout warning */}
                {otpLockoutExpires && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <strong>Account Locked</strong>
                        <p className="mt-1">Too many failed attempts. Please try again after {new Date(otpLockoutExpires).toLocaleTimeString()}.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PIN Code Input */}
                <div className="bg-[rgba(255,255,255,0.7)] rounded-[20px] border border-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.15)] p-4">
                  <div className="flex flex-col gap-6">
                    {/* Input Field */}
                    <div className="flex flex-col gap-[27px]">
                      <div>
                        <label className="text-[#333333] text-sm mb-[5px] block" style={{ fontWeight: 500 }}>
                          <span>Enter 6-Digit Code </span>
                          <span className="text-[#b50000]">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="000000"
                            value={pinCode}
                            onChange={handlePinCodeChange}
                            maxLength={6}
                            disabled={!!otpLockoutExpires}
                            className="w-full h-[40px] rounded-[20px] border-[#e4e4e4] bg-white px-5 text-sm placeholder:text-[#877f7f] text-center tracking-widest"
                            style={{ fontSize: '18px', letterSpacing: '0.5em' }}
                          />
                        </div>
                      </div>

                      {/* Resend SMS Link */}
                      <button
                        onClick={handleResendCode}
                        disabled={!!otpLockoutExpires}
                        className="text-[#007cbe] text-sm underline text-left disabled:text-gray-400 disabled:no-underline"
                      >
                        Resend Code via SMS
                      </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-4">
                      <Button
                        className={`w-full h-[40px] rounded-[20px] ${
                          isPinValid && !otpLockoutExpires
                            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                            : 'bg-[#e8e6e6] text-[#877f7f] cursor-not-allowed'
                        }`}
                        onClick={handleContinueWithPin}
                        disabled={!isPinValid || !!otpLockoutExpires}
                      >
                        Continue
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full h-[40px] rounded-[20px] border-2 border-[#007cbe] bg-white text-[#007cbe] hover:bg-gray-50"
                        onClick={() => setCurrentScreen('tcpa-consent')}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // MFA Setup Screen
  if (currentScreen === 'mfa-setup') {
    const handleSendVerificationCode = () => {
      toast.success(`Verification code sent to ${mfaMethod === 'sms' ? phoneNumber : selectedEmail}`);
      setTimeout(() => setCurrentScreen('mfa-verification'), 500);
    };

    const handleCancel = () => {
      setCurrentScreen('pin-code');
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('pin-code')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">MFA Setup</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Icon and Title */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-teal-600" />
                  </div>
                  <h2 className="text-xl text-center">Multi-Factor Authentication</h2>
                </div>

                {/* Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    We'll only ask for a verification code when something seems unusual to keep your account secure without slowing you down.
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  Select a contact method to receive verification codes:
                </p>

                {/* MFA Method Options */}
                <div className="space-y-3">
                  {/* SMS Option */}
                  <div
                    onClick={() => setMfaMethod('sms')}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      mfaMethod === 'sms'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          mfaMethod === 'sms'
                            ? 'border-teal-600 bg-teal-600'
                            : 'border-gray-300'
                        }`}>
                          {mfaMethod === 'sms' && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <span>Text Message (SMS)</span>
                        </div>
                        <p className="text-xs text-gray-500">Receive a code via text message</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Option */}
                  <div
                    onClick={() => setMfaMethod('email')}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      mfaMethod === 'email'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          mfaMethod === 'email'
                            ? 'border-teal-600 bg-teal-600'
                            : 'border-gray-300'
                        }`}>
                          {mfaMethod === 'email' && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span>Email</span>
                        </div>
                        <p className="text-xs text-gray-500">Receive a code via email</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input */}
                {mfaMethod === 'sms' && (
                  <div className="space-y-2">
                    <label className="text-sm">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full"
                    />
                  </div>
                )}

                {/* Always Require Verification Toggle */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm mb-1">Always require verification</p>
                      <p className="text-xs text-gray-500">
                        Require verification every time you sign in for added protection
                      </p>
                    </div>
                    <button
                      onClick={() => setAlwaysRequireVerification(!alwaysRequireVerification)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        alwaysRequireVerification ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          alwaysRequireVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSendVerificationCode}
                    disabled={mfaMethod === 'sms' && !phoneNumber}
                  >
                    Send Verification Code
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // MFA Verification Screen
  if (currentScreen === 'mfa-verification') {
    const handleVerificationCodeChange = (index: number, value: string) => {
      if (value.length <= 1 && /^\d*$/.test(value)) {
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        
        // Auto-focus next input
        if (value && index < 5) {
          const nextInput = document.getElementById(`code-input-${index + 1}`);
          nextInput?.focus();
        }
      }
    };

    const handleContinueWithVerification = () => {
      if (verificationCode.every(digit => digit !== '')) {
        setShowMfaSuccessModal(true);
      }
    };

    const handleResendCode = () => {
      toast.success(`Verification code resent to ${mfaMethod === 'sms' ? phoneNumber : selectedEmail}`);
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('mfa-setup')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">MFA Verification</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Icon and Title */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-teal-600" />
                  </div>
                  <h2 className="text-xl text-center">Verify Your Identity</h2>
                </div>

                {/* Description */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Enter the verification code sent via {mfaMethod === 'sms' ? 'text to' : 'email to'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {mfaMethod === 'sms' ? phoneNumber : selectedEmail}
                  </p>
                </div>

                {/* Code Input Section */}
                <div className="space-y-4">
                  <label className="text-sm text-center block">
                    Enter Security Code
                  </label>
                  
                  {/* Code Input Boxes */}
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            const prevInput = document.getElementById(`code-input-${index - 1}`);
                            prevInput?.focus();
                          }
                        }}
                        className="w-12 h-12 bg-white rounded-lg border-2 border-gray-300 text-center text-lg focus:outline-none focus:border-teal-600 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Link */}
                <div className="text-center">
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-teal-600 hover:text-teal-700 underline"
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleContinueWithVerification}
                    disabled={!verificationCode.every(digit => digit !== '')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* MFA Success Modal - Inside Mobile Frame */}
          <AnimatePresence>
            {showMfaSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-sm relative"
                >
                  <button
                    onClick={() => {
                      setShowMfaSuccessModal(false);
                      setTimeout(() => setCurrentScreen('terms-of-use'), 300);
                    }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col items-center justify-center p-6">
                    {/* Success Icon */}
                    <div className="flex gap-2 items-center mb-4">
                      <div className="h-[26px] relative shrink-0 w-[32px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 26">
                          <g clipPath="url(#clip0_mfa_success)">
                            <path clipRule="evenodd" d={svgPathsSuccess.p1878e480} fill="#0D870D" fillRule="evenodd" />
                          </g>
                          <defs>
                            <clipPath id="clip0_mfa_success">
                              <rect fill="white" height="26" width="32" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <p className="font-['Roboto:Light',sans-serif] text-[32px] text-[#0d870d]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Success
                      </p>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2 items-center justify-center text-center w-full text-[#333333] mb-4">
                      <p className="font-['Roboto:Regular',sans-serif] text-base" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Your identity has been verified successfully!
                      </p>
                      <p className="font-['Roboto:Regular',sans-serif] text-base" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Please review and accept the Terms of Service to continue.
                      </p>
                    </div>

                    {/* OK Button */}
                    <Button 
                      onClick={() => {
                        setShowMfaSuccessModal(false);
                        setTimeout(() => setCurrentScreen('terms-of-use'), 300);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Terms of Use Screen
  if (currentScreen === 'terms-of-use') {
    const handleAcceptTerms = () => {
      if (acceptedTerms) {
        setCurrentScreen('create-password');
      }
    };

    const handleDeclineTerms = () => {
      if (confirm('Declining the terms will cancel your registration. Are you sure?')) {
        setCurrentScreen('app-download');
      }
    };

    return (
      <>
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('mfa-verification')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Terms of Use</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-[rgba(255,255,255,0.7)] relative rounded-[20px] border border-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.15)]">
                <div className="box-border content-stretch flex flex-col gap-12 items-start p-4">
                  {/* Header Section */}
                  <div className="content-stretch flex flex-col gap-1 items-start w-full">
                    <p className="font-['Roboto:Light',sans-serif] text-[24px] text-[#007cbe] tracking-[0.432px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Patient App
                    </p>
                    <p className="font-['Roboto:Medium',sans-serif] text-base text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Registration Disclaimer
                    </p>
                    <div className="pt-2">
                      <p className="font-['Roboto:Regular',sans-serif] text-sm text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Please acknowledge the following documents:
                      </p>
                    </div>
                  </div>

                  {/* Document Links */}
                  <div className="content-stretch flex flex-col gap-3 items-start w-full">
                    <ul className="list-disc pl-5 space-y-2">
                      <li className="font-['Roboto:Regular',sans-serif] text-sm text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span>My Health Record </span>
                        <a href="#" className="font-['Roboto:Medium',sans-serif] text-[#007cbe] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Terms of Service
                        </a>
                      </li>
                      <li className="font-['Roboto:Regular',sans-serif] text-sm text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span>My Health Record </span>
                        <a href="#" className="font-['Roboto:Medium',sans-serif] text-[#007cbe] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Privacy Policy
                        </a>
                      </li>
                    </ul>

                    <p className="font-['Roboto:Regular',sans-serif] text-sm text-[#333333] pt-2" style={{ fontVariationSettings: "'wdth' 100" }}>
                      The My Health Record Terms of Service and Privacy Policy are posted in the app and made available for you to review at any time.
                    </p>
                  </div>

                  {/* Notice Box */}
                  <div className="w-full">
                    <div className="bg-[#e6f2f8] rounded-[20px] p-4">
                      <p className="font-['Roboto:Regular',sans-serif] text-sm text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        By clicking 'I Accept' below, you agree to the My Health Record Terms of Service above.
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-start gap-3 w-full">
                    <div 
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <div className={`size-6 border-2 rounded flex items-center justify-center ${
                        acceptedTerms ? 'border-[#007cbe] bg-white' : 'border-[#007cbe] bg-white'
                      }`}>
                        {acceptedTerms && (
                          <CheckCircle2 className="w-4 h-4 text-[#007cbe]" />
                        )}
                      </div>
                      <p className="font-['Roboto:Regular',sans-serif] text-base text-[#333333]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        I Accept<span className="text-[#b50000]">*</span>
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="content-stretch flex flex-col gap-4 items-start w-full">
                    <button
                      onClick={handleAcceptTerms}
                      disabled={!acceptedTerms}
                      className={`w-full h-10 rounded-[20px] px-5 py-2 ${
                        acceptedTerms 
                          ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                          : 'bg-[#e8e6e6] text-[#877f7f] cursor-not-allowed'
                      }`}
                    >
                      <p className="font-['Roboto:Medium',sans-serif] text-base text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Continue
                      </p>
                    </button>

                    <button
                      onClick={handleDeclineTerms}
                      className="w-full h-10 rounded-[20px] px-5 py-2 bg-white border-2 border-[#007cbe] hover:bg-gray-50"
                    >
                      <p className="font-['Roboto:Medium',sans-serif] text-base text-[#007cbe] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
                        I Decline
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Create Password Screen
  if (currentScreen === 'create-password') {
    const handleContinueWithPassword = () => {
      // Allow continuing without password for demo purposes
      toast.success('Password created successfully!');
      setTimeout(() => setCurrentScreen('email-confirmation'), 500);
    };

    const handleBackToMFA = () => {
      setCurrentScreen('mfa-verification');
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={handleBackToMFA}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Create Password</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="content-stretch flex flex-col gap-[24px] items-end relative">
                {/* Title and Requirements */}
                <div className="content-stretch flex flex-col font-['Roboto:Medium',sans-serif] font-medium gap-[8px] items-start relative shrink-0 text-[#333333] w-full">
                  <p className="leading-[normal] relative shrink-0 text-[28px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Create Password
                  </p>
                  <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[0px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <ul className="list-disc">
                      <li className="leading-[normal] mb-0 ms-[calc(1.5*1*var(--list-marker-font-size,0))] text-[16px]">
                        <span className="font-['Roboto:Regular',sans-serif] font-normal" style={{ fontVariationSettings: "'wdth' 100" }}>{`Must be `}</span>
                        <span className="font-['Roboto:Bold',sans-serif] font-bold" style={{ fontVariationSettings: "'wdth' 100" }}>
                          14 to 64 characters
                        </span>
                      </li>
                      <li className="leading-[normal] mb-0 ms-[calc(1.5*1*var(--list-marker-font-size,0))] text-[16px]">
                        <span className="font-['Roboto:Regular',sans-serif] font-normal" style={{ fontVariationSettings: "'wdth' 100" }}>{`May include `}</span>
                        <span className="font-['Roboto:Bold',sans-serif] font-bold" style={{ fontVariationSettings: "'wdth' 100" }}>
                          special characters
                        </span>
                        <span className="font-['Roboto:Regular',sans-serif] font-normal" style={{ fontVariationSettings: "'wdth' 100" }}>{` (e.g., ~ ! @ + # $ % & * - _ ? , .)`}</span>
                      </li>
                      <li className="ms-[calc(1.5*1*var(--list-marker-font-size,0))]">
                        <span className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Avoid reusing or slightly modifying a recent password
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-[rgba(255,255,255,0.7)] relative rounded-[20px] shrink-0 w-full">
                  <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[20px] shadow-[0px_0px_6px_0px_rgba(0,0,0,0.15)]" />
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col gap-[24px] items-start p-[16px] relative w-full">
                      
                      {/* Create Password Field */}
                      <div className="h-[67px] relative shrink-0 w-full">
                        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[normal] left-0 text-[#333333] text-[16px] top-0 w-[294px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          <span>{`Create Password `}</span>
                          <span className="text-[#b50000]">*</span>
                        </p>
                        <div className="absolute bg-white box-border content-stretch flex h-[40px] items-center justify-between left-0 px-[20px] py-[10.5px] rounded-[20px] top-[27px] w-full">
                          <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none rounded-[20px]" />
                          <input
                            type={showCreatePassword ? "text" : "password"}
                            value={createPasswordValue}
                            onChange={(e) => setCreatePasswordValue(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none font-['Roboto:Regular',sans-serif] font-normal text-[#333333] text-[16px]"
                            placeholder="**************"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          />
                          <button
                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                            className="font-['Inter:Bold',sans-serif] font-bold text-[#007cbe] text-[12px] ml-2"
                          >
                            {showCreatePassword ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="h-[67px] relative shrink-0 w-full">
                        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[normal] left-0 text-[#333333] text-[16px] top-0 w-[294px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          <span>{`Confirm Password `}</span>
                          <span className="text-[#b50000]">*</span>
                        </p>
                        <div className="absolute bg-white box-border content-stretch flex h-[40px] items-center justify-between left-0 px-[20px] py-[10.5px] rounded-[20px] top-[27px] w-full">
                          <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none rounded-[20px]" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPasswordValue}
                            onChange={(e) => setConfirmPasswordValue(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none font-['Roboto:Regular',sans-serif] font-normal text-[#333333] text-[16px]"
                            placeholder="**************"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="font-['Inter:Bold',sans-serif] font-bold text-[#007cbe] text-[12px] ml-2"
                          >
                            {showConfirmPassword ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                        {/* Continue Button */}
                        <button
                          onClick={handleContinueWithPassword}
                          className="bg-[#007cbe] box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center min-w-[100px] px-[20px] py-[8px] relative rounded-[20px] shrink-0 w-full"
                        >
                          <p className="basis-0 font-['Roboto:Medium',sans-serif] font-medium grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[16px] text-center text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Continue
                          </p>
                        </button>

                        {/* Back Button */}
                        <button
                          onClick={handleBackToMFA}
                          className="bg-white box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center min-w-[100px] px-[20px] py-[8px] relative rounded-[20px] shrink-0 w-full"
                        >
                          <div aria-hidden="true" className="absolute border-2 border-[#007cbe] border-solid inset-0 pointer-events-none rounded-[20px]" />
                          <p className="basis-0 font-['Roboto:Medium',sans-serif] font-medium grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#007cbe] text-[16px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Back
                          </p>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Email Confirmation Success Screen
  if (currentScreen === 'email-confirmation') {
    const handleContinueToSignIn = () => {
      setTimeout(() => setCurrentScreen('sign-in'), 500);
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('pin-code')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Email Confirmation</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="bg-white rounded-[20px] border border-gray-300 p-6 max-w-sm w-full">
                <div className="flex flex-col gap-4 items-center justify-center">
                  {/* Success Icon and Label */}
                  <div className="flex gap-2 items-center">
                    <div className="h-[26px] w-[32px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 26">
                        <g clipPath="url(#clip0_75_117)">
                          <path 
                            clipRule="evenodd" 
                            d={svgPaths.p1878e480} 
                            fill="#0D870D" 
                            fillRule="evenodd" 
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_75_117">
                            <rect fill="white" height="26" width="32" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-[#0d870d] text-[32px]" style={{ fontWeight: 300 }}>
                      Success
                    </p>
                  </div>

                  {/* Body Copy */}
                  <div className="flex flex-col gap-2 text-center text-[#333333]">
                    <p className="font-['Roboto:Regular',sans-serif] text-base" style={{ fontVariationSettings: "'wdth' 100" }}>
                      You have completed registration and may now log into the mobile app.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full mt-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContinueToSignIn}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Biometrics Screen
  if (currentScreen === 'biometrics') {
    const handleEnableFaceId = () => {
      toast.success('Face ID enabled successfully!');
      setTimeout(() => setCurrentScreen('home'), 500);
    };

    const handleRemindLater = () => {
      toast.info('We\'ll remind you next time');
      setTimeout(() => setCurrentScreen('home'), 500);
    };

    const handleDontShowAgain = () => {
      toast.info('Face ID setup skipped');
      setTimeout(() => setCurrentScreen('home'), 500);
    };

    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <div className="w-8"></div>
              <h3 className="text-base">Biometric Sign In</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-[rgba(255,255,255,0.7)] relative rounded-[20px] h-full">
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[20px] shadow-[0px_0px_6px_0px_rgba(0,0,0,0.15)]" />
                <div className="size-full">
                  <div className="box-border content-stretch flex flex-col gap-[56px] items-start p-[16px] relative size-full">
                    
                    {/* Face ID Icon and Text */}
                    <div className="content-stretch flex flex-col gap-[16px] items-center leading-[0] relative shrink-0 w-full">
                      {/* Icon */}
                      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
                        <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 relative rounded-[100px] size-[120px]">
                          <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none rounded-[100px]" />
                        </div>
                        <div className="[grid-area:1_/_1] ml-[28px] mt-[28px] relative size-[64px]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
                            <g>
                              <g clipPath="url(#clip0_80_388)">
                                <path d={svgPathsFaceId.p3b55ba80} fill="#007CBE" />
                              </g>
                              <rect height="63" stroke="white" width="63" x="0.5" y="0.5" />
                            </g>
                            <defs>
                              <clipPath id="clip0_80_388">
                                <rect fill="white" height="64" width="64" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="font-['Roboto:Light',sans-serif] font-light leading-[normal] min-w-full relative shrink-0 text-[#333333] text-[20px] text-center w-[min-content]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span>{`You can save time and increase security by signing in with `}</span>
                        <span className="font-['Roboto:Bold',sans-serif] font-bold" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Face ID
                        </span>
                        .
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                      {/* Enable Face ID Button */}
                      <button
                        onClick={handleEnableFaceId}
                        className="bg-[#007cbe] box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center min-w-[100px] px-[20px] py-[8px] relative rounded-[20px] shrink-0 w-full"
                      >
                        <p className="basis-0 font-['Roboto:Medium',sans-serif] font-medium grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[16px] text-center text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Enable Face ID Sign In
                        </p>
                      </button>

                      {/* Remind Later Button */}
                      <button
                        onClick={handleRemindLater}
                        className="bg-white h-[40px] min-w-[100px] relative rounded-[20px] shrink-0 w-full"
                      >
                        <div aria-hidden="true" className="absolute border-2 border-[#007cbe] border-solid inset-0 pointer-events-none rounded-[20px]" />
                        <div className="flex flex-row items-center justify-center min-w-inherit size-full">
                          <div className="box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center min-w-inherit px-[20px] py-[8px] relative w-full">
                            <p className="basis-0 font-['Roboto:Medium',sans-serif] font-medium grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#007cbe] text-[16px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
                              Not Now, Remind Me Later
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Don't Show Again Link */}
                      <button
                        onClick={handleDontShowAgain}
                        className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Roboto:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#007cbe] text-[16px] text-center underline w-[min-content]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        Don't show this again
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileFrame>
        </div>
      </>
    );
  }

  // Disclaimer Screen
  if (currentScreen === 'disclaimer') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Patient App Demo</h2>
          <p className="text-gray-600 mt-1">
            Navigate through the patient experience
          </p>
        </motion.div>

        <MobileFrame>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 -ml-2"
                onClick={() => setCurrentScreen('email-verification')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base">Terms & Privacy</h3>
              <div className="w-8"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <ScrollArea className="border rounded-lg p-4 mb-4 h-[380px]">
                <div className="text-sm text-gray-800">
                  <h2 className="text-[#2c6e91] text-xl font-bold mb-3">Welcome to Our Patient App</h2>
                  <p className="mb-4">
                    Thank you for using our patient communication platform. Your privacy, security, 
                    and safety are important to us. Please review the Terms of Service and Privacy Policy below.
                  </p>

                  <div className="bg-[#ffe4e4] border-l-4 border-[#cc0000] p-4 mb-6 rounded-r-sm">
                    <strong className="text-[#cc0000] block mb-1">Important Safety Notice:</strong>
                    This service does <strong>not</strong> provide emergency medical care. 
                    <strong>If you are experiencing a medical emergency, call 911 immediately.</strong>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-[#2c6e91] text-lg font-bold mb-4 border-b pb-2">Terms of Service</h2>
                    
                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">1. Business Hours & Message Review</h3>
                    <p className="mb-3">
                      Messages submitted through this platform are reviewed only during our regular business hours:
                      <br/>Messages submitted outside of business hours will be reviewed on the next business day.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">2. AI-Assisted Messaging</h3>
                    <p className="mb-3">
                      This platform uses an <strong>AI-assisted chat system</strong> to help gather information and route 
                      your message appropriately. The responses you receive may be generated by artificial intelligence 
                      and <strong>are not written by a human in real time.</strong>
                    </p>
                    <p className="mb-3">
                      AI responses are intended to support communication—not replace medical advice, diagnosis, 
                      or treatment provided by your healthcare provider.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">3. Not an Instantaneous Service</h3>
                    <p className="mb-3">
                      Although this platform is secure, it is <strong>not a real-time messaging tool.</strong> 
                      Response times may vary, and you should not rely on this service for urgent needs.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">4. SMS Messaging Rates</h3>
                    <p className="mb-3">
                      If SMS text messaging is used, <strong>standard carrier messaging rates may apply.</strong>
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">5. Acceptable Use</h3>
                    <p className="mb-3">
                      By using this service, you agree to provide accurate information and to use the platform 
                      only for lawful, appropriate medical communication.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h2 className="text-[#2c6e91] text-lg font-bold mb-4 border-b pb-2">Privacy Policy</h2>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">1. HIPAA Compliance & Data Protection</h3>
                    <p className="mb-3">
                      Your messages are <strong>encrypted</strong> and protected in accordance with 
                      <strong>HIPAA requirements</strong>. We are committed to safeguarding your health information.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">2. Information We Collect</h3>
                    <p className="mb-2">
                      When using this service, you may provide personal or medical information such as:
                    </p>
                    <ul className="list-disc pl-5 mb-3 space-y-1">
                      <li>Name and contact information</li>
                      <li>Symptoms or medical concerns</li>
                      <li>Appointment or medication questions</li>
                      <li>Other information you provide through the chat</li>
                    </ul>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">3. How We Use Your Information</h3>
                    <p className="mb-2">
                      Your information is used solely for:
                    </p>
                    <ul className="list-disc pl-5 mb-3 space-y-1">
                      <li>Routing your message to the appropriate clinical team</li>
                      <li>Supporting communication with your healthcare provider</li>
                      <li>Improving the quality of our messaging service</li>
                    </ul>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">4. AI Processing</h3>
                    <p className="mb-3">
                      Messages may be analyzed by AI systems to assist with categorization and routing.  
                      These systems are designed to protect your data and operate within HIPAA guidelines.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">5. Data Sharing</h3>
                    <p className="mb-3">
                      We do not share your personal or medical information with third parties except as required 
                      by law or as necessary to support your care within HIPAA regulations.
                    </p>

                    <h3 className="text-[#2c6e91] font-semibold mt-4 mb-2">6. Your Rights</h3>
                    <p className="mb-2">
                      You have the right to:
                    </p>
                    <ul className="list-disc pl-5 mb-3 space-y-1">
                      <li>Access your information</li>
                      <li>Request corrections</li>
                      <li>Request limited use or disclosure of your information</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>

              <div className="space-y-3">
                <div className="text-xs">
                  <p className="text-gray-600 mb-2">Please review our policies:</p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="#" 
                      className="text-blue-600 hover:underline flex items-center gap-1" 
                      onClick={(e) => { e.preventDefault(); toast.info('Privacy Policy would open here'); }}
                    >
                      <FileText className="w-3 h-3" />
                      Privacy Policy
                    </a>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:underline flex items-center gap-1" 
                      onClick={(e) => { e.preventDefault(); toast.info('Terms of Service would open here'); }}
                    >
                      <FileText className="w-3 h-3" />
                      Terms of Service
                    </a>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:underline flex items-center gap-1" 
                      onClick={(e) => { e.preventDefault(); toast.info('HIPAA Notice would open here'); }}
                    >
                      <FileText className="w-3 h-3" />
                      HIPAA Notice
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="disclaimer" 
                    checked={disclaimerAccepted}
                    onCheckedChange={(checked) => setDisclaimerAccepted(checked as boolean)}
                  />
                  <Label htmlFor="disclaimer" className="text-xs leading-relaxed cursor-pointer">
                    I have read and agree to the Terms of Use and Privacy Notice. I understand that 
                    this service is not for emergencies and that my messages may be reviewed by AI 
                    and healthcare staff.
                  </Label>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!disclaimerAccepted}
                  onClick={handleDisclaimerAccept}
                >
                  Accept & Continue
                </Button>
              </div>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Home Screen
  if (currentScreen === 'home') {
    const unreadNotifications = notifications.filter(n => !n.read).length;
    
    console.log('Home Screen Render - showCallDialog:', showCallDialog);
    
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Patient App Demo</h2>
              <p className="text-gray-600 mt-1">
                Navigate through the patient experience
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-gray-50 relative">
            {/* Header with Gradient */}
            <motion.div 
              className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 pb-8"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  className="text-white"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  BASE Health
                </motion.h3>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                    onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  
                  {/* Menu Dropdown */}
                  {showMenuDropdown && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-2 min-w-[240px] z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-xs text-gray-500">Logged in as</div>
                        <div className="font-medium text-sm bg-[rgba(0,0,0,0.01)] text-[rgb(16,16,16)]">{accounts[currentUser].firstName} {accounts[currentUser].lastName}</div>
                      </div>
                      
                      {/* Account Actions */}
                      <div className="py-1">
                        <button 
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowMenuDropdown(false);
                            setCurrentScreen('profile');
                          }}
                        >
                          <UserCircle2 className="w-4 h-4" />
                          Account Settings
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowMenuDropdown(false);
                            setShowSwitchAccountDialog(true);
                          }}
                        >
                          <User className="w-4 h-4" />
                          Switch Account
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowMenuDropdown(false);
                            setShowSignOutDialog(true);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>

                      {/* My Practices */}
                      <div className="border-t border-gray-200 pt-1">
                        <div className="px-4 py-2 text-xs text-gray-500 font-medium">My Practices</div>
                        <button 
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowMenuDropdown(false);
                            toast.info('Switching to Health Partners Medical Group');
                          }}
                        >
                          <div className="text-sm">Health Partners Medical Group</div>
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowMenuDropdown(false);
                            toast.info('Switching to Madison Main Pediatrics');
                          }}
                        >
                          <div className="text-sm">Madison Main Pediatrics</div>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Avatar className="w-16 h-16 border-3 border-white/30 shadow-lg">
                  <AvatarFallback className="bg-teal-500 text-white text-lg">
                    {accounts[currentUser].initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-teal-100">Hello,</p>
                  <p className="text-white text-xl">{accounts[currentUser].firstName} {accounts[currentUser].lastName}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* AI Assistant - Enhanced & Featured */}
            <motion.div 
              className="px-4 -mt-6 pb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-200 border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-blue-600"
                  onClick={() => {
                    setShowDisclosureToast(true);
                    setCurrentScreen('chat');
                  }}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-9 h-9 text-white" />
                    </div>
                    <div className="flex-1 text-white">
                      <p className="font-semibold mb-1">AI Assistant</p>
                      <p className="text-sm text-white/90">Get instant help with appointments, lab results, and more</p>
                    </div>
                    <Bot className="w-6 h-6 text-white/70" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Health Summary Card */}
            <motion.div 
              className="px-4 pb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200"
                  onClick={() => setCurrentScreen('health-summary')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-0.5">Health Summary</p>
                      <p className="text-sm text-gray-600">View your medical information, insurance, and allergies</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Recent Activity - Enhanced */}
            <ScrollArea className="flex-1 px-4">
              <motion.div 
                className="pb-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm">Recent Activity</h4>
                  <Button 
                    variant="link" 
                    size="sm"
                    className="text-teal-600 h-auto p-0 text-xs"
                    onClick={() => setCurrentScreen('notifications')}
                  >
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Pre-Visit Forms To-Do */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Card 
                      className="border-2 border-blue-200 bg-blue-50/50 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setCurrentScreen('todo-checklist')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <ClipboardList className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-900 mb-1 flex items-center gap-2">
                              Pre-Visit Forms Required
                              <Badge className="bg-orange-500 text-white text-[10px] px-1.5">2 Pending</Badge>
                            </p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                              Complete your intake forms before your appointment on Nov 30, 2025
                            </p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-blue-700">4 of 6 complete</span>
                                <span className="text-xs text-blue-700">67%</span>
                              </div>
                              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '67%' }}></div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs mt-3 w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentScreen('todo-checklist');
                              }}
                            >
                              <ClipboardList className="w-3 h-3 mr-1" />
                              Complete Forms
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Annual Wellness Exam Reminder */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="border-2 border-teal-200 bg-teal-50/50 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <CalendarClock className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-teal-900 mb-1">Annual Wellness Exam Due</p>
                            <p className="text-xs text-teal-700 leading-relaxed">
                              You are due for your annual wellness exam. Contact the practice or use the chat to send us a message.
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs"
                                onClick={() => {
                                  setShowDisclosureToast(true);
                                  setCurrentScreen('chat');
                                }}
                              >
                                Send Message
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-teal-600 text-teal-700 hover:bg-teal-50 h-8 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Call Practice clicked');
                                  console.log('Current showCallDialog state:', showCallDialog);
                                  setShowCallDialog(true);
                                  console.log('Setting showCallDialog to true');
                                }}
                              >
                                Call Practice
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {notifications.slice(0, 3).map((notif, index) => {
                    const Icon = notif.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer hover:shadow-md transition-all duration-200 border ${
                            !notif.read 
                              ? 'border-teal-200 bg-teal-50/50 shadow-sm' 
                              : 'border-gray-200 bg-white'
                          }`}
                          onClick={() => {
                            // Navigate to notifications screen to see full details
                            setCurrentScreen('notifications');
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex gap-3 items-center">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                !notif.read ? 'bg-teal-500 shadow-sm' : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-4 h-4 ${!notif.read ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm flex items-center gap-2">
                                  <span className="truncate">{notif.title}</span>
                                  {!notif.read && (
                                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {formatNotificationTime(notif.timestamp)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </ScrollArea>
            
            {/* Call Practice Dialog - Inside MobileFrame on Home Screen */}
            {showCallDialog && (
              <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
                <div className="bg-gray-100 p-6 rounded-2xl max-w-[340px] w-full shadow-xl">
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        window.location.href = 'tel:+19165557654';
                        toast.success('Calling practice...');
                        setShowCallDialog(false);
                      }}
                    >
                      Call (916) 555-7654
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-gray-300 hover:bg-gray-400 border-0"
                      onClick={() => setShowCallDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Switch Account Modal - Custom overlay within mobile frame */}
            {showSwitchAccountDialog && (
              <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-[350px] w-full max-h-[90%] overflow-y-auto">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="font-medium">Switch Account</h3>
                      </div>
                      <button 
                        onClick={() => setShowSwitchAccountDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Select an account to view</p>
                  </div>
                  
                  {/* Account List */}
                  <div className="space-y-2 p-6">
                    {/* Mandy - Primary Account */}
                    <button
                      onClick={() => {
                        setCurrentUser('mandy');
                        setShowSwitchAccountDialog(false);
                        toast.success(`Switched to ${accounts.mandy.firstName}'s account`);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        currentUser === 'mandy'
                          ? 'border-teal-500 bg-teal-50 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={currentUser === 'mandy' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}>
                          {accounts.mandy.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{accounts.mandy.firstName} {accounts.mandy.lastName}</div>
                        <div className="text-xs text-gray-600">{accounts.mandy.role}</div>
                      </div>
                      {currentUser === 'mandy' && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Ava - Child */}
                    <button
                      onClick={() => {
                        setCurrentUser('ava');
                        setShowSwitchAccountDialog(false);
                        toast.success(`Switched to ${accounts.ava.firstName}'s account`);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        currentUser === 'ava'
                          ? 'border-teal-500 bg-teal-50 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={currentUser === 'ava' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}>
                          {accounts.ava.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{accounts.ava.firstName} {accounts.ava.lastName}</div>
                        <div className="text-xs text-gray-600">{accounts.ava.role}</div>
                      </div>
                      {currentUser === 'ava' && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Noah - Child */}
                    <button
                      onClick={() => {
                        setCurrentUser('noah');
                        setShowSwitchAccountDialog(false);
                        toast.success(`Switched to ${accounts.noah.firstName}'s account`);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        currentUser === 'noah'
                          ? 'border-teal-500 bg-teal-50 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={currentUser === 'noah' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}>
                          {accounts.noah.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{accounts.noah.firstName} {accounts.noah.lastName}</div>
                        <div className="text-xs text-gray-600">{accounts.noah.role}</div>
                      </div>
                      {currentUser === 'noah' && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-end p-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSwitchAccountDialog(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Out Confirmation Modal - Custom overlay within mobile frame */}
            {showSignOutDialog && (
              <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-[350px] w-full">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="font-medium">Sign Out</h3>
                      </div>
                      <button 
                        onClick={() => setShowSignOutDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to sign out? You'll need to sign back in to access your account.
                    </p>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex gap-3 p-6 pt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSignOutDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowSignOutDialog(false);
                        toast.success('Signed out successfully');
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Chat Screen
  if (currentScreen === 'chat') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>AI Assistant Chat</h2>
              <p className="text-gray-600 mt-1">
                Secure messaging with AI-powered routing
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          {/* Disclosure Toast */}
          <AnimatePresence>
            {showDisclosureToast && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50 text-sm"
              >
                <p className="mb-2 text-gray-700">This chat uses an AI-powered assistant to help answer questions and provide guidance. You are interacting with AI, not a human.</p>
                <p className="text-gray-600">For your reference, you can review our <button className="text-teal-600 underline font-medium" onClick={() => toast.info('Privacy Policy')}>Privacy Policy</button> and <button className="text-teal-600 underline font-medium" onClick={() => toast.info('Terms of Use')}>Terms of Use</button>.</p>
                <button onClick={() => setShowDisclosureToast(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-full flex flex-col overflow-hidden">
            {/* Chat Header - Enhanced */}
            <motion.div 
              className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-4 flex items-center gap-3 shadow-lg flex-shrink-0"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                  onClick={() => setCurrentScreen('home')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div 
                className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Bot className="w-6 h-6" />
              </motion.div>
              <motion.div 
                className="flex-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-white">AI Assistant</div>
                <div className="text-xs text-teal-100 flex items-center gap-1">
                  <motion.span 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.span>
                  Always available
                </div>
              </motion.div>
            </motion.div>

            {/* Messages - Enhanced */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 bg-gray-50 space-y-4 pb-2">
                  <AnimatePresence initial={false}>
                  {chatMessages.map((message, index) => {
                    const previousMessage = index > 0 ? chatMessages[index - 1] : null;
                    const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
                    
                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <motion.div 
                            className="flex justify-center my-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
                              {getDateLabel(message.timestamp)}
                            </div>
                          </motion.div>
                        )}
                        <motion.div 
                          className={`flex gap-2 ${message.sender === 'patient' ? 'flex-row-reverse' : ''}`}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                    {message.sender !== 'patient' && (
                      <Avatar className="w-9 h-9 flex-shrink-0 shadow-sm">
                        <AvatarFallback className={
                          message.sender === 'bot' ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                        }>
                          {message.sender === 'bot' ? <Bot className="w-5 h-5" /> : <UserCircle2 className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[75%] ${message.sender === 'patient' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`rounded-2xl ${message.imageUrl ? 'p-2' : 'px-4 py-3'} shadow-sm ${
                        message.sender === 'patient' 
                          ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white' 
                          : message.sender === 'bot'
                          ? 'bg-white text-gray-900 border border-gray-200'
                          : 'bg-green-50 text-gray-900 border border-green-200'
                      }`}>
                        {message.sender !== 'patient' && (
                          <div className={`text-xs opacity-70 ${message.imageUrl || message.fileUrl ? 'px-2 pt-1 pb-2' : 'mb-1.5'}`}>{message.senderName}</div>
                        )}
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Uploaded image" 
                            className="rounded-lg max-w-full h-auto mb-2"
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                        {message.fileUrl && (
                          <div className="bg-gray-100 rounded-lg p-3 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{message.fileName}</div>
                              <div className="text-xs text-gray-500">{message.fileType} • {message.fileSize} KB</div>
                            </div>
                          </div>
                        )}
                        <div className={`text-sm leading-relaxed ${message.imageUrl || message.fileUrl ? 'px-2 pb-1' : ''}`}>{message.content}</div>
                      </div>
                      
                      {/* Send Confirmation Options (Yes/No) */}
                      {message.isRouted && waitingForSendConfirmation && index === chatMessages.length - 1 && (
                        <motion.div 
                          className="flex gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendConfirmation(true)}
                            className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 hover:border-teal-700"
                          >
                            Yes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendConfirmation(false)}
                            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400"
                          >
                            No
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Debug info */}
                      {index === chatMessages.length - 1 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: isRouted={String(message.isRouted)} | waiting={String(waitingForSendConfirmation)} | index={index} | length={chatMessages.length}
                        </div>
                      )}
                      
                      {/* Notification Preference Options */}
                      {message.isRouted && waitingForNotificationPreference && index === chatMessages.length - 1 && (
                        <motion.div 
                          className="flex flex-wrap gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {['Email', 'Text', 'Push'].map((method) => (
                            <Button
                              key={method}
                              variant="outline"
                              size="sm"
                              onClick={() => handleNotificationMethodSelect(method)}
                              className="bg-white hover:bg-teal-50 border-teal-300 text-teal-700 hover:border-teal-400"
                            >
                              {method}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                      
                      <div className="text-xs text-gray-400 px-2">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                    </motion.div>
                      </div>
                    );
                  })}
                  {/* Quick Suggestions (shown when chat is empty) */}
                  {chatMessages.length === 0 && (
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-sm text-gray-500 text-center mb-3">Quick actions:</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                          onClick={() => sendQuickMessage('I need to schedule an appointment')}
                        >
                          I need to schedule an appointment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                          onClick={() => sendQuickMessage('Can I reschedule my appointment?')}
                        >
                          Can I reschedule my appointment?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 hover:from-teal-700 hover:to-teal-800"
                          onClick={() => sendQuickMessage('cancel my appt')}
                        >
                          cancel my appt
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  {/* Invisible element to scroll to */}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
                </div>
              </ScrollArea>
            </div>

            {/* Input - Enhanced */}
            <motion.div 
              className="border-t bg-white shadow-lg flex-shrink-0 relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* In-app notification banner - above input */}
              <AnimatePresence>
                {inAppNotification && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute bottom-full left-4 right-4 mb-2"
                  >
                    <div className="bg-teal-700 text-white px-4 py-3 rounded-lg shadow-lg border border-teal-800 flex items-start gap-3">
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-sm">
                        {inAppNotification}
                      </div>
                      <button
                        onClick={() => setInAppNotification(null)}
                        className="text-white/80 hover:text-white flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Attachment Preview */}
              {(pendingImage || pendingFile) && (
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {pendingImage && (
                      <div className="relative">
                        <img 
                          src={pendingImage} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded border border-gray-300"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPendingImage(null)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {pendingFile && (
                      <div className="flex items-center gap-2 flex-1 bg-white rounded border border-gray-300 p-2">
                        <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{pendingFile.name}</div>
                          <div className="text-xs text-gray-500">{pendingFile.type} • {pendingFile.size} KB</div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPendingFile(null)}
                          className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  id="camera-upload"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleChatFileUpload}
                  className="hidden"
                />
                <motion.div
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Image className="w-4 h-4 text-gray-600" />
                  </Button>
                </motion.div>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById('camera-upload')?.click()}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </Button>
                </motion.div>
                <Input 
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 border-gray-300 focus:border-teal-500"
                />
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button 
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() && !pendingImage && !pendingFile}
                    className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-800 hover:to-teal-900 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              </div>
            </motion.div>

            {/* AI Chat Disclaimer Dialog - Custom overlay within mobile frame */}
            {showAiChatDisclaimer && (
              <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div 
                  className="bg-white rounded-lg shadow-xl max-w-[350px] w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-teal-600" />
                      <h3 className="font-medium">AI Assistant Notice</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Please review and accept the AI assistant terms before proceeding
                    </p>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      By clicking "Accept", I acknowledge that AI assistant can respond to some messages using 
                      healthcare data, but cannot provide medical advice or schedule, cancel, reschedule appointments. 
                      I understand there are limits to what this AI can answer and if unable to do so my message will 
                      be routed to my practice.
                    </p>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex gap-3 p-6 pt-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAiChatDisclaimer(false);
                        setCurrentScreen('home');
                      }}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => setShowAiChatDisclaimer(false)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Accept
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </MobileFrame>

        {/* Demo Instructions */}
        <Card className="max-w-md mx-auto bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-teal-900">Try asking:</p>
              <ul className="text-teal-800 space-y-1 ml-4 list-disc">
                <li>"When is my next appointment?" - Bot handles inquiry</li>
                <li>"I need to schedule an appointment" - Routes to staff</li>
                <li>"Prescription refill request" - Bot provides info</li>
                <li>"Question about my lab results" - Routes to clinical staff</li>
                <li>"I have a billing question" - Routes to billing dept</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Notifications Screen
  if (currentScreen === 'notifications') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Notifications</h2>
              <p className="text-gray-600 mt-1">
                Multi-channel patient notices and alerts
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col">
            {/* Header - Enhanced */}
            <motion.div 
              className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-4 flex items-center gap-3 shadow-lg"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                  onClick={() => setCurrentScreen('home')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </motion.div>
              <h3 className="text-white flex-1">Notifications</h3>
              <motion.div 
                className="text-sm text-teal-100"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {notifications.filter(n => !n.read).length} new
              </motion.div>
            </motion.div>

            {/* Notifications List - Enhanced */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full bg-gray-50">
                <div className="p-3 space-y-3 pb-6">
                  {notifications.map((notif, index) => {
                  const Icon = notif.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                          !notif.read ? 'border-teal-200 bg-teal-50/50 shadow-sm' : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            !notif.read ? 'bg-gradient-to-br from-teal-500 to-teal-600' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${!notif.read ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="text-sm flex items-center gap-2">
                                {notif.title}
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 hover:bg-teal-100 -mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notif.id);
                                }}
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <div className="text-xs text-gray-400">
                                {formatNotificationTime(notif.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    </motion.div>
                  );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </MobileFrame>

        {/* Notification Types Info */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-sm">Patient Notice Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="outline">Appointment Reminders</Badge>
              <Badge variant="outline">Lab Results</Badge>
              <Badge variant="outline">Prescription Ready</Badge>
              <Badge variant="outline">Staff Responses</Badge>
              <Badge variant="outline">Billing Updates</Badge>
              <Badge variant="outline">Survey Invites</Badge>
              <Badge variant="outline">Birthday Messages</Badge>
              <Badge variant="outline">Clinical Updates</Badge>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Delivered via Email, SMS, Push, In-App, and Voice
            </p>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // To-Do Checklist Screen
  if (currentScreen === 'todo-checklist') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-center flex-1">
                <h2>Pre-Visit To-Do List</h2>
                <p className="text-gray-600 mt-1">
                  Complete these tasks before your appointment
                </p>
              </div>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </motion.div>

          <MobileFrame viewMode={viewMode}>
            <div className="h-full flex flex-col bg-gray-50">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-5 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                    onClick={() => setCurrentScreen('home')}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-white flex-1">Pre-Visit Checklist</h3>
                </div>
                
                {/* Appointment Info */}
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Upcoming Appointment</span>
                  </div>
                  <div className="text-white/90 text-sm">
                    <div>November 30, 2025 at 2:00 PM</div>
                    <div>Dr. Sarah Chen - Annual Physical</div>
                    <div className="text-xs mt-1 text-white/75">Main Campus, Room 204</div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-4 bg-white border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Overall Progress</span>
                  <span className="text-sm text-blue-600">{insuranceCardFiles.length > 0 && photoIdFile ? '6' : '4'} of 6 complete</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: insuranceCardFiles.length > 0 && photoIdFile ? '100%' : '67%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Complete all tasks to help us prepare for your visit</p>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3 pb-24">
                  {/* Completed Tasks */}
                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">New Patient Intake Form</h4>
                            <Badge className="bg-green-600 text-white text-xs">Complete</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Medical history, current medications, allergies</p>
                          <div className="text-xs text-green-700">Completed on Nov 20, 2025</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">Financial Consent</h4>
                            <Badge className="bg-green-600 text-white text-xs">Complete</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Financial responsibility agreement</p>
                          <div className="text-xs text-green-700">Completed on Nov 20, 2025</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">HIPAA Privacy Notice</h4>
                            <Badge className="bg-green-600 text-white text-xs">Complete</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Privacy practices acknowledgment</p>
                          <div className="text-xs text-green-700">Completed on Nov 20, 2025</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">COVID-19 Screening</h4>
                            <Badge className="bg-green-600 text-white text-xs">Complete</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Pre-visit health screening</p>
                          <div className="text-xs text-green-700">Completed on Nov 23, 2025</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Tasks */}
                  <Card className={`border-2 shadow-sm ${insuranceCardFiles.length > 0 ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${insuranceCardFiles.length > 0 ? 'bg-green-500' : 'bg-orange-500'}`}>
                          {insuranceCardFiles.length > 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">Upload Insurance Card</h4>
                            <Badge className={`text-white text-xs ${insuranceCardFiles.length > 0 ? 'bg-green-600' : 'bg-orange-500'}`}>
                              {insuranceCardFiles.length > 0 ? 'Complete' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Front and back of your insurance card</p>
                          {insuranceCardFiles.length > 0 ? (
                            <>
                              <div className="text-xs text-green-700 mb-2">Completed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </>
                          ) : (
                            <>
                              <input
                                ref={insuranceCardInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length > 0) {
                                    setInsuranceCardFiles(files);
                                    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`);
                                    setTimeout(() => {
                                      toast.info('Form completion notification sent to staff');
                                    }, 1000);
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                className="bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs w-full"
                                onClick={() => insuranceCardInputRef.current?.click()}
                              >
                                <Camera className="w-3 h-3 mr-1" />
                                Upload Photos
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 shadow-sm ${photoIdFile ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${photoIdFile ? 'bg-green-500' : 'bg-orange-500'}`}>
                          {photoIdFile ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <IdCard className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">Upload Photo ID</h4>
                            <Badge className={`text-white text-xs ${photoIdFile ? 'bg-green-600' : 'bg-orange-500'}`}>
                              {photoIdFile ? 'Complete' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Driver's license or government-issued ID</p>
                          {photoIdFile ? (
                            <div className="text-xs text-green-700">Completed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          ) : (
                            <>
                              <input
                                ref={photoIdInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPhotoIdFile(file);
                                    toast.success('Photo ID uploaded successfully!');
                                    setTimeout(() => {
                                      toast.success('All forms complete! Staff has been notified.');
                                    }, 1000);
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                className="bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs w-full"
                                onClick={() => photoIdInputRef.current?.click()}
                              >
                                <Camera className="w-3 h-3 mr-1" />
                                Upload Photo
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Footer Info */}
              {insuranceCardFiles.length > 0 && photoIdFile ? (
                <div className="p-4 bg-green-50 border-t">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-800 font-medium">
                        All tasks completed!
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        You're all set for your appointment on November 30, 2025. We'll see you soon!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border-t">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Please complete all tasks at least 24 hours before your appointment. This helps us provide you with the best care.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Health Summary Screen
  if (currentScreen === 'health-summary') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Health Summary</h2>
              <p className="text-gray-600 mt-1">
                Your medical information from FHIR records
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center gap-4 shadow-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentScreen('home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Health Summary</h3>
            </div>

            {/* Health Summary Content */}
            <HealthSummary 
              patientId="patient-123" 
              useLiveData={false} 
              onNavigate={(screen) => setCurrentScreen(screen as DemoScreen)}
            />
          </div>
        </MobileFrame>
      </div>
    );
  }

  // Lab Results Screen
  if (currentScreen === 'lab-results') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Lab Results</h2>
              <p className="text-gray-600 mt-1">
                Your laboratory test results
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center gap-4 shadow-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentScreen('health-summary')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Lab Results</h3>
            </div>

            {/* Lab Results Content */}
            <LabResults patientId="patient-123" useLiveData={false} />
          </div>
        </MobileFrame>
      </div>
    );
  }

  // Medical History Screen
  if (currentScreen === 'medical-history') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Medical History</h2>
              <p className="text-gray-600 mt-1">
                Your conditions, medications, and procedures
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center gap-4 shadow-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentScreen('health-summary')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Medical History</h3>
            </div>

            {/* Medical History Content */}
            <MedicalHistory patientId="patient-123" useLiveData={false} />
          </div>
        </MobileFrame>
      </div>
    );
  }

  // Appointment History Screen
  if (currentScreen === 'appointment-history') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Appointment History</h2>
              <p className="text-gray-600 mt-1">
                Your past and upcoming visits
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center gap-4 shadow-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentScreen('health-summary')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Appointments</h3>
            </div>

            {/* Appointment History Content */}
            <AppointmentHistory patientId="patient-123" useLiveData={false} />
          </div>
        </MobileFrame>
      </div>
    );
  }

  // Visit Detail Screen
  if (currentScreen === 'visit-detail') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <h2>Visit Summary</h2>
              <p className="text-gray-600 mt-1">
                Detailed visit information
              </p>
            </div>
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </motion.div>

        <MobileFrame viewMode={viewMode}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center gap-4 shadow-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentScreen('health-summary')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Visit Summary</h3>
            </div>

            {/* Visit Detail Content */}
            <VisitDetail encounterId="encounter-123" patientId="patient-123" useLiveData={false} />
          </div>
        </MobileFrame>
      </div>
    );
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    const countries = ['United States', 'Canada', 'Mexico'];
    
    const formatPhoneDisplay = (phone: string) => {
      if (!phone || phone.length !== 10) return phone;
      return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
    };
    
    const handlePhoneInput = (value: string) => {
      return value.replace(/\D/g, '').slice(0, 10);
    };
    
    const handleZipInput = (value: string) => {
      return value.replace(/\D/g, '').slice(0, 5);
    };
    
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-center flex-1">
                <h2>Account Settings</h2>
                <p className="text-gray-600 mt-1">
                  {isEditingProfile ? 'Edit your settings' : 'Manage your account settings'}
                </p>
              </div>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </motion.div>

          <MobileFrame viewMode={viewMode}>
            <div className="h-full flex flex-col bg-gray-50 relative">
              {/* Header */}
              <div className="bg-teal-600 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setCurrentScreen('home');
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3>Account Settings</h3>
                </div>
                {!isEditingProfile && (settingsTab === 'personal' || settingsTab === 'contact') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-gray-200 shrink-0">
                <div className="flex">
                  <button
                    onClick={() => {
                      setSettingsTab('personal');
                      setIsEditingProfile(false);
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      settingsTab === 'personal'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => {
                      setSettingsTab('contact');
                      setIsEditingProfile(false);
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      settingsTab === 'contact'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => {
                      setSettingsTab('preferences');
                      setIsEditingProfile(false);
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      settingsTab === 'preferences'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Preferences
                  </button>
                  <button
                    onClick={() => {
                      setSettingsTab('security');
                      setIsEditingProfile(false);
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      settingsTab === 'security'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Security
                  </button>
                </div>
              </div>

              {/* Profile Content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4 pb-32">
                  
                  {/* Personal Tab */}
                  {settingsTab === 'personal' && (
                    <>
                  {/* Profile Picture */}
                  {isEditingProfile && (
                    <div className="bg-white rounded-xl p-6 space-y-4">
                      <h4 className="text-sm text-gray-700">Profile Picture</h4>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
                              <UserCircle2 className="w-16 h-16 text-teal-600" />
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.success('Upload feature coming soon')}
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <h4 className="text-sm text-gray-700">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">First Name</Label>
                        <Input 
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Middle Name</Label>
                        <Input 
                          value={profileData.middleName}
                          onChange={(e) => setProfileData({...profileData, middleName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Last Name</Label>
                        <Input 
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Preferred Name</Label>
                        <Input 
                          value={profileData.preferredName}
                          onChange={(e) => setProfileData({...profileData, preferredName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Date of Birth</Label>
                        <Input 
                          type="date"
                          value={profileData.dob}
                          onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mailing Address */}
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <h4 className="text-sm text-gray-700">Mailing Address</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Address 1</Label>
                        <Input 
                          value={profileData.address1}
                          onChange={(e) => setProfileData({...profileData, address1: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Address 2</Label>
                        <Input 
                          value={profileData.address2}
                          onChange={(e) => setProfileData({...profileData, address2: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">City</Label>
                        <Input 
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">State</Label>
                          {isEditingProfile ? (
                            <Select value={profileData.state} onValueChange={(value) => setProfileData({...profileData, state: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {usStates.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              value={profileData.state}
                              readOnly
                              className="bg-gray-50 text-gray-700"
                            />
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Zip</Label>
                          <Input 
                            value={profileData.zip}
                            onChange={(e) => setProfileData({...profileData, zip: handleZipInput(e.target.value)})}
                            maxLength={5}
                            readOnly={!isEditingProfile}
                            className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Country</Label>
                        {isEditingProfile ? (
                          <Select value={profileData.country} onValueChange={(value) => setProfileData({...profileData, country: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            value={profileData.country}
                            readOnly
                            className="bg-gray-50 text-gray-700"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                    </>
                  )}

                  {/* Contact Tab */}
                  {settingsTab === 'contact' && (
                    <>
                  {/* Personal Contact Information */}
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <h4 className="text-sm text-gray-700">Personal Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Primary Phone</Label>
                        <Input 
                          value={isEditingProfile ? profileData.primaryPhone : formatPhoneDisplay(profileData.primaryPhone)}
                          onChange={(e) => setProfileData({...profileData, primaryPhone: handlePhoneInput(e.target.value)})}
                          maxLength={isEditingProfile ? 10 : undefined}
                          placeholder="10 digits"
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Work Phone</Label>
                        <Input 
                          value={isEditingProfile ? profileData.workPhone : formatPhoneDisplay(profileData.workPhone)}
                          onChange={(e) => setProfileData({...profileData, workPhone: handlePhoneInput(e.target.value)})}
                          maxLength={isEditingProfile ? 10 : undefined}
                          placeholder="10 digits"
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Cell Phone</Label>
                        <Input 
                          value={isEditingProfile ? profileData.cellPhone : formatPhoneDisplay(profileData.cellPhone)}
                          onChange={(e) => setProfileData({...profileData, cellPhone: handlePhoneInput(e.target.value)})}
                          maxLength={isEditingProfile ? 10 : undefined}
                          placeholder="10 digits"
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Email</Label>
                        <Input 
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Information */}
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <h4 className="text-sm text-gray-700">Emergency Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">First Name</Label>
                        <Input 
                          value={profileData.emergencyFirstName}
                          onChange={(e) => setProfileData({...profileData, emergencyFirstName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Last Name</Label>
                        <Input 
                          value={profileData.emergencyLastName}
                          onChange={(e) => setProfileData({...profileData, emergencyLastName: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Phone Number</Label>
                        <Input 
                          value={isEditingProfile ? profileData.emergencyPhone : formatPhoneDisplay(profileData.emergencyPhone)}
                          onChange={(e) => setProfileData({...profileData, emergencyPhone: handlePhoneInput(e.target.value)})}
                          maxLength={isEditingProfile ? 10 : undefined}
                          placeholder="10 digits"
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Email</Label>
                        <Input 
                          type="email"
                          value={profileData.emergencyEmail}
                          onChange={(e) => setProfileData({...profileData, emergencyEmail: e.target.value})}
                          readOnly={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                        />
                      </div>
                    </div>
                  </div>
                    </>
                  )}

                  {/* Preferences Tab */}
                  {settingsTab === 'preferences' && (
                    <div className="space-y-4">
                      {/* Language Preference */}
                      <div className="bg-white rounded-xl p-4 space-y-3">
                        <h4 className="text-sm text-gray-700">Language</h4>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {settingsTab === 'security' && (
                    <div className="space-y-4">
                      {/* Username */}
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm text-gray-700">Username</h4>
                          {!isEditingUsername && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingUsername(true);
                                setTempUsername({ new: '', confirm: '' });
                                setUsernameError('');
                              }}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {!isEditingUsername ? (
                          <div className="py-2">
                            <div className="text-sm">{profileData.username}</div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-600">New Username</Label>
                              <Input 
                                value={tempUsername.new}
                                onChange={(e) => {
                                  setTempUsername({ ...tempUsername, new: e.target.value });
                                  setUsernameError('');
                                }}
                                placeholder="Enter new username"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Confirm Username</Label>
                              <Input 
                                value={tempUsername.confirm}
                                onChange={(e) => {
                                  setTempUsername({ ...tempUsername, confirm: e.target.value });
                                  setUsernameError('');
                                }}
                                placeholder="Confirm new username"
                              />
                            </div>
                            {usernameError && (
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                {usernameError}
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => {
                                  // Validate usernames match
                                  if (tempUsername.new !== tempUsername.confirm) {
                                    setUsernameError('Usernames do not match');
                                    return;
                                  }
                                  
                                  // Validate username requirements
                                  const validationError = validateUsername(tempUsername.new);
                                  if (validationError) {
                                    setUsernameError(validationError);
                                    return;
                                  }
                                  
                                  // Save the new username
                                  setProfileData({ ...profileData, username: tempUsername.new });
                                  setIsEditingUsername(false);
                                  setTempUsername({ new: '', confirm: '' });
                                  setUsernameError('');
                                  toast.success('Username changed successfully!');
                                }}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditingUsername(false);
                                  setTempUsername({ new: '', confirm: '' });
                                  setUsernameError('');
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Login Email */}
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm text-gray-700">Login Email</h4>
                          {!isEditingLoginEmail && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingLoginEmail(true);
                                setTempLoginEmail({ new: '', confirm: '' });
                                setLoginEmailError('');
                                setEmailVerificationPending(false);
                                setEmailChangeSuccess(false);
                                setPasswordAttempts(0);
                                setAccountLocked(false);
                                setVerificationPassword('');
                              }}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {!isEditingLoginEmail ? (
                          <div className="py-2">
                            <div className="text-sm">{profileData.loginEmail}</div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {emailChangeSuccess ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-600" />
                                  <div className="text-sm text-green-800">Login email successfully changed!</div>
                                </div>
                                <p className="text-xs text-green-700">A confirmation email has been sent to {tempLoginEmail.new}</p>
                                <Button
                                  onClick={() => {
                                    setIsEditingLoginEmail(false);
                                    setTempLoginEmail({ new: '', confirm: '' });
                                    setEmailChangeSuccess(false);
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-2"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : emailVerificationPending ? (
                              <div className="space-y-3">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-xs text-blue-800">
                                    A verification link has been sent to <span className="font-medium">{tempLoginEmail.new}</span>. Click the link in the email to continue.
                                  </p>
                                </div>
                                
                                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                                  <p className="text-xs text-gray-700">Enter your current password to verify this change:</p>
                                  <div>
                                    <Label className="text-xs text-gray-600">Current Password</Label>
                                    <Input 
                                      type="password"
                                      value={verificationPassword}
                                      onChange={(e) => setVerificationPassword(e.target.value)}
                                      placeholder="Enter current password"
                                      disabled={accountLocked}
                                    />
                                  </div>
                                  
                                  {accountLocked && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                      Account locked due to too many failed attempts. Please contact support.
                                    </div>
                                  )}
                                  
                                  {loginEmailError && !accountLocked && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                      {loginEmailError}
                                      <div className="mt-1 text-xs text-red-500">
                                        Attempts remaining: {5 - passwordAttempts}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={() => {
                                      if (accountLocked) return;
                                      
                                      // Simulate password verification (in real app, this would be "Password123!")
                                      if (verificationPassword === 'Password123!') {
                                        setEmailChangeSuccess(true);
                                        setProfileData({ ...profileData, loginEmail: tempLoginEmail.new });
                                        setLoginEmailError('');
                                        setEmailVerificationPending(false);
                                        toast.success('Login email changed successfully!');
                                      } else {
                                        const newAttempts = passwordAttempts + 1;
                                        setPasswordAttempts(newAttempts);
                                        
                                        if (newAttempts >= 5) {
                                          setAccountLocked(true);
                                          setLoginEmailError('Account locked. Too many failed attempts.');
                                        } else {
                                          setLoginEmailError('Incorrect password. Please try again.');
                                        }
                                      }
                                    }}
                                    disabled={accountLocked}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-300"
                                  >
                                    Verify
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsEditingLoginEmail(false);
                                      setTempLoginEmail({ new: '', confirm: '' });
                                      setEmailVerificationPending(false);
                                      setLoginEmailError('');
                                      setPasswordAttempts(0);
                                      setAccountLocked(false);
                                      setVerificationPassword('');
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs text-gray-600">New Login Email</Label>
                                  <Input 
                                    type="email"
                                    value={tempLoginEmail.new}
                                    onChange={(e) => {
                                      setTempLoginEmail({ ...tempLoginEmail, new: e.target.value });
                                      setLoginEmailError('');
                                    }}
                                    placeholder="Enter new login email"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-600">Confirm Login Email</Label>
                                  <Input 
                                    type="email"
                                    value={tempLoginEmail.confirm}
                                    onChange={(e) => {
                                      setTempLoginEmail({ ...tempLoginEmail, confirm: e.target.value });
                                      setLoginEmailError('');
                                    }}
                                    placeholder="Confirm new login email"
                                  />
                                </div>
                                {loginEmailError && (
                                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    {loginEmailError}
                                  </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={() => {
                                      // Validate emails match
                                      if (tempLoginEmail.new !== tempLoginEmail.confirm) {
                                        setLoginEmailError('Email addresses do not match');
                                        return;
                                      }
                                      
                                      // Validate email format
                                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                      if (!emailRegex.test(tempLoginEmail.new)) {
                                        setLoginEmailError('Please enter a valid email address');
                                        return;
                                      }
                                      
                                      // Send verification email and move to verification step
                                      setEmailVerificationPending(true);
                                      setLoginEmailError('');
                                    }}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                                  >
                                    Send Verification Email
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsEditingLoginEmail(false);
                                      setTempLoginEmail({ new: '', confirm: '' });
                                      setLoginEmailError('');
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Password */}
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm text-gray-700">Password</h4>
                          {!isEditingPassword && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingPassword(true);
                                setTempPassword({ current: '', new: '', confirm: '' });
                              }}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {!isEditingPassword ? (
                          <div className="py-2">
                            <div className="text-sm">••••••••</div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-600">Current Password</Label>
                              <Input 
                                type="password"
                                value={tempPassword.current}
                                onChange={(e) => setTempPassword({ ...tempPassword, current: e.target.value })}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">New Password</Label>
                              <Input 
                                type="password"
                                value={tempPassword.new}
                                onChange={(e) => setTempPassword({ ...tempPassword, new: e.target.value })}
                                placeholder="Enter new password"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Confirm New Password</Label>
                              <Input 
                                type="password"
                                value={tempPassword.confirm}
                                onChange={(e) => setTempPassword({ ...tempPassword, confirm: e.target.value })}
                                placeholder="Confirm new password"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => {
                                  if (tempPassword.new === tempPassword.confirm) {
                                    setIsEditingPassword(false);
                                    setTempPassword({ current: '', new: '', confirm: '' });
                                  }
                                }}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditingPassword(false);
                                  setTempPassword({ current: '', new: '', confirm: '' });
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Biometric Authentication */}
                      <div className="bg-white rounded-xl p-4 space-y-4 border border-gray-200 shadow-sm">
                        <div>
                          <h4 className="text-sm text-gray-700">Biometric Authentication</h4>
                          <p className="text-xs text-gray-600 mt-1">Use Face ID, Touch ID, or fingerprint to sign in quickly and securely.</p>
                        </div>

                        {biometricFlow === 'idle' && (
                          <>
                            {/* Status Display */}
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-gray-700">Status</span>
                              <Badge variant={biometricEnabled ? "default" : "secondary"} className={biometricEnabled ? "bg-green-600" : ""}>
                                {biometricEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>

                            {/* Enable/Disable Buttons */}
                            {!biometricEnabled ? (
                              <Button
                                onClick={() => setBiometricFlow('platform-select')}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                Enable Biometric Authentication
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setBiometricFlow('disabling')}
                                variant="outline"
                                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Disable Biometric Authentication
                              </Button>
                            )}
                          </>
                        )}

                        {/* Platform Selection */}
                        {biometricFlow === 'platform-select' && (
                          <div className="space-y-3">
                            <p className="text-sm">Select your device type:</p>
                            
                            <div className="space-y-3">
                              <button
                                onClick={() => {
                                  setBiometricPlatform('iphone');
                                  setBiometricFlow('iphone-setup');
                                }}
                                className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all"
                              >
                                <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                <div className="flex-1 text-left">
                                  <div className="text-sm">iPhone</div>
                                  <div className="text-xs text-gray-600">Use Face ID or Touch ID</div>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setBiometricPlatform('android');
                                  setBiometricFlow('android-setup');
                                }}
                                className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all"
                              >
                                <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                <div className="flex-1 text-left">
                                  <div className="text-sm">Android</div>
                                  <div className="text-xs text-gray-600">Use fingerprint or face unlock</div>
                                </div>
                              </button>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => setBiometricFlow('idle')}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {/* iPhone Setup Workflow */}
                        {biometricFlow === 'iphone-setup' && (
                          <div className="space-y-3">
                            {biometricSuccess ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-600" />
                                  <div className="text-sm text-green-800">Biometric authentication enabled!</div>
                                </div>
                                <p className="text-xs text-green-700">
                                  Face ID has been successfully configured for your account.
                                </p>
                                <Button
                                  onClick={() => {
                                    setBiometricEnabled(true);
                                    setBiometricFlow('idle');
                                    setBiometricSuccess(false);
                                    setBiometricPlatform(null);
                                    toast.success('Biometric authentication enabled!');
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                                  <p className="text-sm text-blue-800">iPhone Setup</p>
                                  <div className="space-y-2 text-xs text-blue-700">
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                                      <div className="flex-1">Position your face in the frame and move your head in a circle</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                                      <div className="flex-1">Continue moving your head to complete the circle</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                                      <div className="flex-1">Face ID setup is complete</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
                                  <div className="w-32 h-32 rounded-full border-4 border-teal-600 flex items-center justify-center mb-3">
                                    <User className="w-16 h-16 text-teal-600" />
                                  </div>
                                  <p className="text-sm text-gray-600 text-center">Position your face within the frame</p>
                                </div>

                                <Button
                                  onClick={() => setBiometricSuccess(true)}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Complete Face ID Setup
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setBiometricFlow('platform-select');
                                    setBiometricPlatform(null);
                                  }}
                                  className="w-full"
                                >
                                  Back
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Android Setup Workflow */}
                        {biometricFlow === 'android-setup' && (
                          <div className="space-y-3">
                            {biometricSuccess ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-600" />
                                  <div className="text-sm text-green-800">Biometric authentication enabled!</div>
                                </div>
                                <p className="text-xs text-green-700">
                                  Fingerprint authentication has been successfully configured for your account.
                                </p>
                                <Button
                                  onClick={() => {
                                    setBiometricEnabled(true);
                                    setBiometricFlow('idle');
                                    setBiometricSuccess(false);
                                    setBiometricPlatform(null);
                                    toast.success('Biometric authentication enabled!');
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                                  <p className="text-sm text-blue-800">Android Setup</p>
                                  <div className="space-y-2 text-xs text-blue-700">
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                                      <div className="flex-1">Touch the fingerprint sensor</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                                      <div className="flex-1">Lift and touch again to capture different parts of your fingerprint</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                                      <div className="flex-1">Fingerprint added successfully</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
                                  <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                                    <Fingerprint className="w-16 h-16 text-teal-600" />
                                  </div>
                                  <p className="text-sm text-gray-600 text-center">Touch the sensor to register your fingerprint</p>
                                </div>

                                <Button
                                  onClick={() => setBiometricSuccess(true)}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Complete Fingerprint Setup
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setBiometricFlow('platform-select');
                                    setBiometricPlatform(null);
                                  }}
                                  className="w-full"
                                >
                                  Back
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Disablement Workflow */}
                        {biometricFlow === 'disabling' && (
                          <div className="space-y-3">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-sm text-amber-800 mb-2">Are you sure you want to disable biometric authentication?</div>
                                  <p className="text-xs text-amber-700">
                                    Note: The system will rely on your username/email and password for subsequent logins.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => {
                                setBiometricEnabled(false);
                                setBiometricFlow('idle');
                                setBiometricPlatform(null);
                                toast.success('Biometric authentication disabled');
                              }}
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                              Yes, Disable Biometric Authentication
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => setBiometricFlow('idle')}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Multi-Factor Authentication */}
                      <div className="bg-white rounded-xl p-4 space-y-4 border border-gray-200 shadow-sm">
                        <div>
                          <h4 className="text-sm text-gray-700">Multi-Factor Authentication (MFA)</h4>
                          <p className="text-xs text-gray-600 mt-1">Add extra security by requiring a verification code when you sign in.</p>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                              This setting applies to MFA on every login. If the system detects a suspicious login, MFA will still be invoked for your security.
                            </p>
                          </div>
                        </div>

                        {mfaFlow === 'idle' && (
                          <>
                            {/* Status Display */}
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-gray-700">Status</span>
                              <Badge variant={mfaEnabled ? "default" : "secondary"} className={mfaEnabled ? "bg-green-600" : ""}>
                                {mfaEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>

                            {/* Enable/Disable Buttons */}
                            {!mfaEnabled ? (
                              <Button
                                onClick={() => setMfaFlow('enabling')}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                              >
                                Enable MFA
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setMfaFlow('disabling')}
                                variant="outline"
                                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Disable MFA
                              </Button>
                            )}
                          </>
                        )}

                        {/* Enablement Workflow - Factor Selection */}
                        {mfaFlow === 'enabling' && (
                          <div className="space-y-3">
                            <p className="text-sm">Select a verification method:</p>
                            
                            <div className="space-y-3">
                              {mfaFactors.map((factor) => (
                                <button
                                  key={factor.id}
                                  onClick={() => {
                                    setSelectedFactor(factor.id);
                                    setMfaFlow('otp-verification');
                                  }}
                                  className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all"
                                >
                                  {factor.type === 'email' ? (
                                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                  ) : (
                                    <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                  )}
                                  <div className="flex-1 text-left">
                                    <div className="text-sm">
                                      {factor.type === 'email' ? 'Email' : 'Text Message (SMS)'}
                                      {factor.primary && (
                                        <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600">{factor.value}</div>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => setMfaFlow('adding-factor')}
                              className="w-full"
                            >
                              + Add Alternative Factor
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => setMfaFlow('idle')}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {/* Adding New Factor */}
                        {mfaFlow === 'adding-factor' && (
                          <div className="space-y-3">
                            <p className="text-sm">Add a new verification method:</p>
                            
                            {!addingFactorType ? (
                              <div className="space-y-3">
                                <button
                                  onClick={() => setAddingFactorType('email')}
                                  className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all"
                                >
                                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                  <div className="flex-1 text-left">
                                    <div className="text-sm">Email</div>
                                    <div className="text-xs text-gray-600">Add an alternative email address</div>
                                  </div>
                                </button>

                                <button
                                  onClick={() => setAddingFactorType('sms')}
                                  className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-all"
                                >
                                  <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
                                  <div className="flex-1 text-left">
                                    <div className="text-sm">Text Message (SMS)</div>
                                    <div className="text-xs text-gray-600">Add a phone number</div>
                                  </div>
                                </button>

                                <Button
                                  variant="outline"
                                  onClick={() => setMfaFlow('enabling')}
                                  className="w-full"
                                >
                                  Back
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs text-gray-600">
                                    {addingFactorType === 'email' ? 'Email Address' : 'Phone Number'}
                                  </Label>
                                  <Input
                                    type={addingFactorType === 'email' ? 'email' : 'tel'}
                                    value={newFactorValue}
                                    onChange={(e) => setNewFactorValue(e.target.value)}
                                    placeholder={addingFactorType === 'email' ? 'email@example.com' : '+1 (555) 123-4567'}
                                  />
                                </div>

                                <Button
                                  onClick={() => {
                                    const newFactor = {
                                      id: mfaFactors.length + 1,
                                      type: addingFactorType,
                                      value: newFactorValue,
                                      primary: false
                                    };
                                    setMfaFactors([...mfaFactors, newFactor]);
                                    setSelectedFactor(newFactor.id);
                                    setMfaFlow('otp-verification');
                                    setAddingFactorType(null);
                                    setNewFactorValue('');
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Add & Send Verification Code
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAddingFactorType(null);
                                    setNewFactorValue('');
                                  }}
                                  className="w-full"
                                >
                                  Back
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* OTP Verification Page */}
                        {mfaFlow === 'otp-verification' && (
                          <div className="space-y-3">
                            {mfaSuccess ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-600" />
                                  <div className="text-sm text-green-800">MFA enabled successfully!</div>
                                </div>
                                <p className="text-xs text-green-700">
                                  You will now be required to enter a verification code when signing in.
                                </p>
                                <Button
                                  onClick={() => {
                                    setMfaEnabled(true);
                                    setMfaFlow('idle');
                                    setMfaSuccess(false);
                                    setMfaOtp('');
                                    setSelectedFactor(null);
                                    toast.success('MFA enabled successfully!');
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-xs text-blue-800">
                                    A verification code has been sent to{' '}
                                    <span className="font-medium">
                                      {mfaFactors.find(f => f.id === selectedFactor)?.value}
                                    </span>
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-xs text-gray-600">Enter Verification Code</Label>
                                  <Input
                                    type="text"
                                    value={mfaOtp}
                                    onChange={(e) => {
                                      setMfaOtp(e.target.value);
                                      setMfaOtpError('');
                                    }}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                  />
                                </div>

                                {mfaOtpError && (
                                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    {mfaOtpError}
                                  </div>
                                )}

                                <Button
                                  onClick={() => {
                                    // Simulate OTP verification (correct code is "123456")
                                    if (mfaOtp === '123456') {
                                      setMfaSuccess(true);
                                      setMfaOtpError('');
                                    } else {
                                      setMfaOtpError('Invalid verification code. Please try again.');
                                    }
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  Verify Code
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setMfaFlow('enabling');
                                    setMfaOtp('');
                                    setMfaOtpError('');
                                    setSelectedFactor(null);
                                  }}
                                  className="w-full"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Disablement Workflow */}
                        {mfaFlow === 'disabling' && (
                          <div className="space-y-3">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-sm text-amber-800 mb-2">Are you sure you want to disable MFA?</div>
                                  <p className="text-xs text-amber-700">
                                    Note: The system will still trigger an OTP if a suspicious login is detected, even with MFA disabled.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => {
                                setMfaEnabled(false);
                                setMfaFlow('idle');
                                toast.success('MFA disabled successfully');
                              }}
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                              Yes, Disable MFA
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => setMfaFlow('idle')}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Activity Log */}
                      <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                        <h4 className="text-sm text-gray-700">Activity Log</h4>
                        <div className="space-y-3">
                          <div className="py-2 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">Login successful</div>
                                <div className="text-xs text-gray-600">iPhone 14 Pro • Madison, CA</div>
                              </div>
                              <div className="text-xs text-gray-500">Nov 15</div>
                            </div>
                          </div>
                          <div className="py-2 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">Password changed</div>
                                <div className="text-xs text-gray-600">Web browser • Madison, CA</div>
                              </div>
                              <div className="text-xs text-gray-500">Nov 12</div>
                            </div>
                          </div>
                          <div className="py-2 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">Login successful</div>
                                <div className="text-xs text-gray-600">iPad Air • Madison, CA</div>
                              </div>
                              <div className="text-xs text-gray-500">Nov 10</div>
                            </div>
                          </div>
                          <div className="py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">Account created</div>
                                <div className="text-xs text-gray-600">iPhone 14 Pro • Madison, CA</div>
                              </div>
                              <div className="text-xs text-gray-500">Nov 8</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </ScrollArea>
              </div>

              {/* Fixed Action Buttons */}
              {isEditingProfile && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditingProfile(false);
                      toast.info('Changes discarded');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      // Basic email validation
                      if (profileData.email && !profileData.email.includes('@')) {
                        toast.error('Please enter a valid email address');
                        return;
                      }
                      if (profileData.emergencyEmail && !profileData.emergencyEmail.includes('@')) {
                        toast.error('Please enter a valid emergency contact email');
                        return;
                      }
                      
                      setIsEditingProfile(false);
                      toast.success('Profile updated successfully');
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </MobileFrame>
        </div>
      </>
    );
  }

  // Survey Screen
  if (currentScreen === 'survey') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Patient Satisfaction Survey</h2>
            <p className="text-gray-600 mt-1">
              Survey opens in mobile browser
            </p>
          </motion.div>

          <MobileFrame>
            <div className="h-full flex flex-col bg-white">
              {/* Browser Chrome */}
              <div className="bg-gray-100 border-b border-gray-300">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 pb-2">
                  <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-gray-600">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span>survey.maincampusmedical.com</span>
                  </div>
                </div>
              </div>

              {/* Survey Content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-8 pb-8">
                    {/* Header */}
                    <div className="text-center space-y-2 pb-4 border-b border-gray-200">
                      <h3 className="text-gray-900">Patient Satisfaction Survey</h3>
                      <p className="text-sm text-gray-600">Main Campus Medical Center</p>
                    </div>

                    {/* Appointment Scheduling Section */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <h4 className="text-sm text-gray-900">APPOINTMENT SCHEDULING</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">How easy was it to schedule your appointment?</Label>
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="scheduleEase"
                                value={value}
                                checked={surveyResponses.scheduleEase === value.toString()}
                                onChange={(e) => setSurveyResponses({...surveyResponses, scheduleEase: e.target.value})}
                                className="w-5 h-5 text-teal-600"
                              />
                              <span className="text-xs text-gray-500">{value}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">Were you offered a convenient appointment time?</Label>
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="convenientTime"
                                value={value}
                                checked={surveyResponses.convenientTime === value.toString()}
                                onChange={(e) => setSurveyResponses({...surveyResponses, convenientTime: e.target.value})}
                                className="w-5 h-5 text-teal-600"
                              />
                              <span className="text-xs text-gray-500">{value}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Office Environment Section */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <h4 className="text-sm text-gray-900">OFFICE ENVIRONMENT</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">How would you rate the cleanliness of our facility?</Label>
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="cleanliness"
                                value={value}
                                checked={surveyResponses.cleanliness === value.toString()}
                                onChange={(e) => setSurveyResponses({...surveyResponses, cleanliness: e.target.value})}
                                className="w-5 h-5 text-teal-600"
                              />
                              <span className="text-xs text-gray-500">{value}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">How comfortable was the waiting area?</Label>
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="waitingArea"
                                value={value}
                                checked={surveyResponses.waitingArea === value.toString()}
                                onChange={(e) => setSurveyResponses({...surveyResponses, waitingArea: e.target.value})}
                                className="w-5 h-5 text-teal-600"
                              />
                              <span className="text-xs text-gray-500">{value}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Wait Time Section */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <h4 className="text-sm text-gray-900">WAIT TIME</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">How long did you wait past your appointment time?</Label>
                        <div className="space-y-2">
                          {[
                            { label: '0-10 minutes', value: '0-10' },
                            { label: '11-20 minutes', value: '11-20' },
                            { label: '21-30 minutes', value: '21-30' },
                            { label: '31+ minutes', value: '31+' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input
                                type="radio"
                                name="waitTime"
                                value={option.value}
                                checked={surveyResponses.waitTime === option.value}
                                onChange={(e) => setSurveyResponses({...surveyResponses, waitTime: e.target.value})}
                                className="w-4 h-4 text-teal-600"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm text-gray-700">Was the wait time reasonable?</Label>
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name="waitTimeReasonable"
                                value={value}
                                checked={surveyResponses.waitTimeReasonable === value.toString()}
                                onChange={(e) => setSurveyResponses({...surveyResponses, waitTimeReasonable: e.target.value})}
                                className="w-5 h-5 text-teal-600"
                              />
                              <span className="text-xs text-gray-500">{value}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => {
                          toast.success('Thank you for your feedback!');
                          setTimeout(() => setCurrentScreen('notifications'), 1500);
                        }}
                      >
                        Submit Survey
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </MobileFrame>

          {/* Info Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-sm">Survey Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Survey invites can be sent via notifications. When clicked, they open in the device's browser for a familiar, native experience. Survey links can also be sent via SMS or email.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Appointments Screen
  if (currentScreen === 'appointments') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <div className="text-center">
          <h2>Appointments</h2>
          <p className="text-gray-600 mt-1">
            View your appointments (scheduling requires staff assistance)
          </p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 px-2"
                onClick={() => setCurrentScreen('home')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">My Appointments</h3>
            </div>

            {/* Info Banner */}
            <div className="bg-teal-50 border-b border-teal-200 p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-900">
                  To schedule, reschedule, or cancel appointments, please use the AI Assistant 
                  or call our office directly.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="flex-1 px-4 pb-4">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === 'upcoming').map((apt) => (
                      <Card key={apt.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-teal-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                              <div className="text-xs text-teal-600">
                                {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              </div>
                              <div className="text-lg text-teal-600">
                                {new Date(apt.date).getDate()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div>{apt.type}</div>
                              <div className="text-sm text-gray-600 mt-1">{apt.provider}</div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {apt.time}
                                </div>
                              </div>
                              <div className="flex items-start gap-1 mt-2 text-sm text-gray-500">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="text-xs">{apt.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => {
                                setCurrentScreen('chat');
                                setChatInput('I need to reschedule my appointment on ' + apt.date);
                              }}
                            >
                              Request Changes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="past" className="flex-1 px-4 pb-4">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === 'completed').map((apt) => (
                      <Card key={apt.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                              <div className="text-xs text-gray-600">
                                {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              </div>
                              <div className="text-lg text-gray-600">
                                {new Date(apt.date).getDate()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{apt.type}</span>
                                <Badge variant="outline" className="text-xs">Completed</Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{apt.provider}</div>
                              <div className="text-sm text-gray-500 mt-2">{apt.time}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Bottom Action */}
            <div className="p-4 border-t bg-gray-50">
              <Button 
                className="w-full"
                onClick={() => {
                  setCurrentScreen('chat');
                  setChatInput('I would like to schedule a new appointment');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Request New Appointment
              </Button>
            </div>
          </div>
        </MobileFrame>
      </div>
      </>
    );
  }

  // Messages Screen
  if (currentScreen === 'messages') {
    return (
      <>
        <Toaster />
        <div className="space-y-6">
        <div className="text-center">
          <h2>Secure Messages</h2>
          <p className="text-gray-600 mt-1">
            Communication history with your care team
          </p>
        </div>

        <MobileFrame>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-teal-700 px-2"
                onClick={() => setCurrentScreen('home')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-white flex-1">Messages</h3>
            </div>

            {/* Message Threads */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <UserCircle2 className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm">Dr. Michael Williams</div>
                        <div className="text-xs text-gray-400">2h ago</div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        Your lab results look good. Let's discuss them at your follow-up...
                      </p>
                      <Badge variant="outline" className="text-xs mt-2">Clinical</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-teal-100 text-teal-600">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm">AI Assistant</div>
                        <div className="text-xs text-gray-400">1d ago</div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        Your prescription refill has been approved and is ready...
                      </p>
                      <Badge variant="outline" className="text-xs mt-2">Automated</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Calendar className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm">Scheduling Team</div>
                        <div className="text-xs text-gray-400">2d ago</div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        Your appointment has been confirmed for January 14th...
                      </p>
                      <Badge variant="outline" className="text-xs mt-2">Scheduling</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        <FileText className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm">Billing Department</div>
                        <div className="text-xs text-gray-400">3d ago</div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        Your payment has been received. Thank you!
                      </p>
                      <Badge variant="outline" className="text-xs mt-2">Billing</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t bg-white">
              {/* Attachment Preview */}
              {(pendingImage || pendingFile) && (
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {pendingImage && (
                      <div className="relative">
                        <img 
                          src={pendingImage} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded border border-gray-300"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPendingImage(null)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {pendingFile && (
                      <div className="flex items-center gap-2 flex-1 bg-white rounded border border-gray-300 p-2">
                        <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{pendingFile.name}</div>
                          <div className="text-xs text-gray-500">{pendingFile.type} • {pendingFile.size} KB</div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPendingFile(null)}
                          className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="image-upload-messages"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload-messages')?.click()}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Image className="w-4 h-4 text-gray-600" />
                </Button>
                <Input 
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() && !pendingImage && !pendingFile}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              </div>
            </div>
          </div>
        </MobileFrame>

        {/* Routing Info */}
        <Card className="max-w-md mx-auto bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-purple-900">Smart Message Routing</p>
              <p className="text-purple-800">
                Messages are automatically routed to the appropriate department based on content:
              </p>
              <ul className="text-purple-800 space-y-1 ml-4 list-disc text-xs">
                <li>Clinical questions → Clinical staff</li>
                <li>Scheduling requests → Scheduling team</li>
                <li>Billing inquiries → Billing department</li>
                <li>General questions → AI Assistant</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      
      {/* Call Practice Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <span>Call Practice</span>
            </DialogTitle>
            <DialogDescription>
              Choose a department to call
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {/* Main Office */}
            <a 
              href="tel:+19165557654"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-300 transition-colors"
              onClick={() => {
                toast.success('Calling Main Office...');
                setShowCallDialog(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Main Office</div>
                  <div className="text-sm text-gray-600">(916) 555-7654</div>
                </div>
              </div>
              <Button 
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Call
              </Button>
            </a>

            {/* Scheduling */}
            <a 
              href="tel:+19165557655"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => {
                toast.success('Calling Scheduling...');
                setShowCallDialog(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Scheduling</div>
                  <div className="text-sm text-gray-600">(916) 555-7655</div>
                </div>
              </div>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Call
              </Button>
            </a>

            {/* Billing */}
            <a 
              href="tel:+19165557656"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              onClick={() => {
                toast.success('Calling Billing...');
                setShowCallDialog(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Billing</div>
                  <div className="text-sm text-gray-600">(916) 555-7656</div>
                </div>
              </div>
              <Button 
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Call
              </Button>
            </a>
          </div>
          
          <div className="flex justify-end pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCallDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}