import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Removed date-fns import as we're using only shadcn components
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Image,
  Shield,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  Upload,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker, DateRange } from '@/components/common/DateRangePicker';
import { FileUpload } from '@/components/common/FileUpload';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/utils';

// Complex validation schema with advanced rules
const comprehensiveFormSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z.string()
      .email('Please enter a valid email address')
      .refine((email) => !email.includes('+'), 'Plus signs are not allowed in email addresses'),
    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
      .min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string()
      .min(1, 'Date of birth is required')
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 120;
      }, 'You must be between 18 and 120 years old'),
    nationality: z.string().min(1, 'Please select your nationality'),
    profilePicture: z.any().optional(),
  }),

  // Address Information
  addressInfo: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string()
      .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (12345 or 12345-6789)'),
    country: z.string().min(1, 'Please select a country'),
    addressType: z.enum(['home', 'work', 'other'], {
      required_error: 'Please select an address type',
    }),
  }),

  // Professional Information
  professionalInfo: z.object({
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    position: z.string().min(2, 'Position must be at least 2 characters'),
    department: z.string().optional(),
    experience: z.number()
      .min(0, 'Experience cannot be negative')
      .max(60, 'Experience cannot exceed 60 years'),
    salary: z.number()
      .min(1, 'Salary must be greater than 0')
      .max(10000000, 'Salary seems unreasonably high'),
    skills: z.array(z.string()).min(1, 'Please select at least one skill'),
    portfolio: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedinProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    resume: z.any().optional(),
  }),

  // Financial Information
  financialInfo: z.object({
    bankAccount: z.string()
      .regex(/^\d{9,18}$/, 'Bank account must be 9-18 digits'),
    routingNumber: z.string()
      .regex(/^\d{9}$/, 'Routing number must be exactly 9 digits'),
    creditScore: z.number()
      .min(300, 'Credit score must be at least 300')
      .max(850, 'Credit score cannot exceed 850'),
    annualIncome: z.number()
      .min(0, 'Annual income cannot be negative')
      .max(50000000, 'Annual income seems unreasonably high'),
    hasDebt: z.boolean(),
    debtAmount: z.number().optional(),
  }),

  // Preferences & Settings
  preferences: z.object({
    communicationMethod: z.enum(['email', 'phone', 'sms', 'mail'], {
      required_error: 'Please select a communication method',
    }),
    newsletterSubscriptions: z.array(z.string()),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
      marketing: z.boolean(),
    }),
    privacy: z.object({
      profileVisible: z.boolean(),
      contactInfoVisible: z.boolean(),
      activityTracking: z.boolean(),
    }),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }),
    timezone: z.string().min(1, 'Please select a timezone'),
    language: z.string().min(1, 'Please select a language'),
  }),

  // Agreement & Legal
  agreements: z.object({
    termsOfService: z.boolean().refine(val => val === true, {
      message: 'You must accept the Terms of Service',
    }),
    privacyPolicy: z.boolean().refine(val => val === true, {
      message: 'You must accept the Privacy Policy',
    }),
    marketingEmails: z.boolean(),
    dataProcessing: z.boolean().refine(val => val === true, {
      message: 'You must consent to data processing',
    }),
  }),
}).refine((data) => {
  // Cross-field validation: if hasDebt is true, debtAmount is required
  if (data.financialInfo.hasDebt && !data.financialInfo.debtAmount) {
    return false;
  }
  return true;
}, {
  message: 'Debt amount is required when you have debt',
  path: ['financialInfo', 'debtAmount'],
});

type ComprehensiveFormData = z.infer<typeof comprehensiveFormSchema>;

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Other'
];

const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java',
  'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML/CSS', 'SQL', 'MongoDB',
  'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'DevOps', 'Testing',
  'UI/UX Design', 'Project Management', 'Agile', 'Scrum'
];

const TIMEZONES = [
  'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8 (PST)', 'UTC-7 (MST)',
  'UTC-6 (CST)', 'UTC-5 (EST)', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1',
  'UTC+0 (GMT)', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6',
  'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
];

export function ComprehensiveFormPage() {
  const { success, error, loading } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, isValid },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<ComprehensiveFormData>({
    resolver: zodResolver(comprehensiveFormSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
      },
      addressInfo: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        addressType: 'home',
      },
      professionalInfo: {
        company: '',
        position: '',
        department: '',
        experience: 0,
        salary: 0,
        skills: [],
        portfolio: '',
        linkedinProfile: '',
      },
      financialInfo: {
        bankAccount: '',
        routingNumber: '',
        creditScore: 600,
        annualIncome: 0,
        hasDebt: false,
        debtAmount: 0,
      },
      preferences: {
        communicationMethod: 'email',
        newsletterSubscriptions: [],
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false,
        },
        privacy: {
          profileVisible: true,
          contactInfoVisible: false,
          activityTracking: true,
        },
        dateRange: {
          from: undefined,
          to: undefined,
        },
        timezone: '',
        language: 'en',
      },
      agreements: {
        termsOfService: false,
        privacyPolicy: false,
        marketingEmails: false,
        dataProcessing: false,
      },
    },
    mode: 'onBlur',
  });

  const watchedValues = watch();

  const onSubmit = async (data: ComprehensiveFormData) => {
    try {
      const loadingToast = loading('Processing form...');
      
      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate validation errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Server validation failed');
      }

      console.log('Comprehensive Form Data:', {
        ...data,
        dateRange,
        skills: selectedSkills,
      });

      success('Form submitted successfully! All validations passed.');
      
    } catch (err) {
      error('Form submission failed. Please check your data and try again.');
    }
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    setValue('professionalInfo.skills', newSkills);
    trigger('professionalInfo.skills');
  };

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'address', title: 'Address', icon: MapPin },
    { id: 'professional', title: 'Professional', icon: Building },
    { id: 'financial', title: 'Financial', icon: CreditCard },
    { id: 'preferences', title: 'Preferences', icon: Shield },
    { id: 'agreements', title: 'Agreements', icon: FileText },
  ];

  const getFieldError = (fieldPath: string) => {
    const pathArray = fieldPath.split('.');
    let error: any = errors;
    for (const key of pathArray) {
      error = error?.[key];
      if (!error) break;
    }
    return error?.message;
  };

  const getCompletionPercentage = () => {
    const totalFields = Object.keys(touchedFields).length;
    const totalPossibleFields = 25; // Approximate number of required fields
    return Math.min((totalFields / totalPossibleFields) * 100, 100);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Comprehensive Form</h1>
        <p className="text-xl text-muted-foreground">
          Advanced form with validation, date filters, and comprehensive UI components
        </p>
        
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Form Completion</span>
            <span>{Math.round(getCompletionPercentage())}%</span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={steps[currentStep]?.id || 'personal'} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  onClick={() => setCurrentStep(index)}
                  className="flex flex-col items-center p-3"
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{step.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </Label>
                    <Controller
                      name="personalInfo.firstName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="Enter your first name"
                          className={getFieldError('personalInfo.firstName') ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {getFieldError('personalInfo.firstName') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.firstName')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </Label>
                    <Controller
                      name="personalInfo.lastName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Enter your last name"
                          className={getFieldError('personalInfo.lastName') ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {getFieldError('personalInfo.lastName') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.lastName')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Controller
                      name="personalInfo.email"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className={cn(
                              'pl-10',
                              getFieldError('personalInfo.email') ? 'border-red-500' : ''
                            )}
                          />
                        </div>
                      )}
                    />
                    {getFieldError('personalInfo.email') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.email')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Controller
                      name="personalInfo.phone"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className={cn(
                              'pl-10',
                              getFieldError('personalInfo.phone') ? 'border-red-500' : ''
                            )}
                          />
                        </div>
                      )}
                    />
                    {getFieldError('personalInfo.phone') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.phone')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth *
                    </Label>
                    <Controller
                      name="personalInfo.dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="dateOfBirth"
                            type="date"
                            className={cn(
                              'pl-10',
                              getFieldError('personalInfo.dateOfBirth') ? 'border-red-500' : ''
                            )}
                          />
                        </div>
                      )}
                    />
                    {getFieldError('personalInfo.dateOfBirth') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.dateOfBirth')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-medium">
                      Nationality *
                    </Label>
                    <Controller
                      name="personalInfo.nationality"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={getFieldError('personalInfo.nationality') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select your nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {getFieldError('personalInfo.nationality') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('personalInfo.nationality')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Profile Picture</Label>
                  <FileUpload
                    acceptedFileTypes={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                    maxFiles={1}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    onFilesChange={(files) => setValue('personalInfo.profilePicture', files[0])}
                    showPreview={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Date Range Example */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Preferences & Date Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Activity Date Range</Label>
                    <DateRangePicker
                      value={dateRange}
                      onChange={(range) => {
                        setDateRange(range);
                        setValue('preferences.dateRange', range);
                      }}
                      placeholder="Select date range for activity tracking"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose the date range for which you want to track activities
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Timezone *</Label>
                    <Controller
                      name="preferences.timezone"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={getFieldError('preferences.timezone') ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((timezone) => (
                              <SelectItem key={timezone} value={timezone}>
                                {timezone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {getFieldError('preferences.timezone') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('preferences.timezone')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                      { key: 'push', label: 'Push Notifications', description: 'Receive push notifications' },
                      { key: 'marketing', label: 'Marketing Emails', description: 'Receive marketing and promotional emails' },
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Controller
                          name={`preferences.notifications.${notification.key}` as any}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id={notification.key}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div className="space-y-0.5">
                          <Label
                            htmlFor={notification.key}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {notification.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Selection */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Skills & Expertise *</h3>
                  <p className="text-sm text-muted-foreground">
                    Select all skills that apply to you. You must select at least one skill.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SKILLS.map((skill) => (
                      <div
                        key={skill}
                        className={cn(
                          'flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors',
                          selectedSkills.includes(skill)
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-border'
                        )}
                        onClick={() => handleSkillToggle(skill)}
                      >
                        <Checkbox
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label className="text-sm cursor-pointer">{skill}</Label>
                      </div>
                    ))}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Skills ({selectedSkills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                            <span>{skill}</span>
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSkillToggle(skill);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {getFieldError('professionalInfo.skills') && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('professionalInfo.skills')}
                    </p>
                  )}
                </div>

                {/* Other professional fields would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      Company *
                    </Label>
                    <Controller
                      name="professionalInfo.company"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="company"
                          placeholder="Enter your company name"
                          className={getFieldError('professionalInfo.company') ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {getFieldError('professionalInfo.company') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('professionalInfo.company')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">
                      Position *
                    </Label>
                    <Controller
                      name="professionalInfo.position"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="position"
                          placeholder="Enter your position"
                          className={getFieldError('professionalInfo.position') ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {getFieldError('professionalInfo.position') && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError('professionalInfo.position')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agreements */}
          <TabsContent value="agreements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Legal Agreements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: 'termsOfService',
                    title: 'Terms of Service',
                    description: 'I agree to the Terms of Service and understand the conditions of use.',
                    required: true,
                  },
                  {
                    key: 'privacyPolicy',
                    title: 'Privacy Policy',
                    description: 'I have read and agree to the Privacy Policy regarding data handling.',
                    required: true,
                  },
                  {
                    key: 'dataProcessing',
                    title: 'Data Processing Consent',
                    description: 'I consent to the processing of my personal data as described.',
                    required: true,
                  },
                  {
                    key: 'marketingEmails',
                    title: 'Marketing Communications',
                    description: 'I would like to receive marketing emails and promotional content.',
                    required: false,
                  },
                ].map((agreement) => (
                  <div key={agreement.key} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Controller
                        name={`agreements.${agreement.key}` as any}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={agreement.key}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={getFieldError(`agreements.${agreement.key}`) ? 'border-red-500' : ''}
                          />
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor={agreement.key}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {agreement.title}
                          {agreement.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {agreement.description}
                        </p>
                      </div>
                    </div>
                    {getFieldError(`agreements.${agreement.key}`) && (
                      <p className="text-sm text-red-500 flex items-center ml-6">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getFieldError(`agreements.${agreement.key}`)}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedSkills([]);
                setDateRange({ from: undefined, to: undefined });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Form
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Form Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Completion Status</p>
                <div className="flex items-center space-x-2">
                  {isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>{isValid ? 'All fields valid' : 'Some fields need attention'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Selected Skills</p>
                <p>{selectedSkills.length} skills selected</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Date Range</p>
                <p>
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`
                    : 'Not selected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}