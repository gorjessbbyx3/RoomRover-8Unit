import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import {
  Shield,
  Wifi,
  MapPin,
  Sun,
  Coffee,
  Bath,
  Check,
  Send,
  Heart,
  Sparkles,
  Clock,
  DollarSign,
  Star,
  Bell,
  Users,
  Home,
  Tv,
  Wind,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const inquirySchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  contact: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  referralSource: z.string()
    .min(1, "Please tell us who referred you")
    .max(200, "Referral source must be less than 200 characters"),
  clubhouse: z.string().min(1, 'Please select a property'),
  preferredPlan: z.string().min(1, 'Please select a stay duration'),
  message: z.string()
    .max(1000, "Message must be less than 1000 characters")
    .optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

/* ──── Room photo gallery ──── */
const roomPhotos = [
  {
    src: '/images/hero-934-door.jpg',
    caption: 'Welcome to 934 — neon-lit entrance with smart lock entry',
  },
  {
    src: '/images/room-1.jpeg',
    caption: 'Bright room with hardwood floors, ceiling fan & flat-screen TV',
  },
  {
    src: '/images/room-2.jpeg',
    caption: 'Cozy setup with blackout curtains, bamboo bench & smart lock',
  },
  {
    src: '/images/room-3.jpeg',
    caption: 'Clean room with built-in closet, A/C & ceiling fan',
  },
];

function RoomGallery() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c === 0 ? roomPhotos.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === roomPhotos.length - 1 ? 0 : c + 1));

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl">
      {/* Main image */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gray-900">
        <img
          src={roomPhotos[current].src}
          alt={roomPhotos[current].caption}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
        {/* Gradient overlay on bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Caption */}
        <p className="absolute bottom-4 left-5 right-16 text-white text-sm sm:text-base font-medium drop-shadow-lg">
          {roomPhotos[current].caption}
        </p>
        {/* Counter pill */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white/90 bg-black/40 backdrop-blur-sm">
          {current + 1} / {roomPhotos.length}
        </div>
      </div>

      {/* Nav buttons */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition"
        aria-label="Previous photo"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition"
        aria-label="Next photo"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-5 flex gap-1.5">
        {roomPhotos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50'}`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ──── Wave divider ──── */
function WaveDivider({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg className="w-full h-12 -mb-1 block" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="none">
      <path
        d="M0 48V16C120 4 240 0 360 4C480 8 600 20 720 24C840 28 960 24 1080 16C1200 8 1320 4 1380 2L1440 0V48H0Z"
        fill={color}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function Membership() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      referralSource: '',
      clubhouse: '',
      preferredPlan: 'monthly',
      message: '',
    },
  });

  const submitInquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      const response = await apiRequest('POST', '/api/inquiries', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      form.reset();
      toast({
        title: 'Inquiry Submitted!',
        description: `We received your request! Save this tracking token: ${data.trackerToken}`,
        duration: 10000,
      });
      setTimeout(() => setLocation('/track/success'), 3000);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'Something went wrong. Please try again.',
        duration: 8000,
      });
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    const requiredFields = ['name', 'contact', 'email', 'referralSource', 'clubhouse', 'preferredPlan'];
    const missingFields = requiredFields.filter(field => !data[field as keyof InquiryFormData]?.toString().trim());
    if (missingFields.length > 0) {
      toast({ variant: 'destructive', title: 'Missing Required Fields', description: `Please fill in: ${missingFields.join(', ')}`, duration: 5000 });
      return;
    }
    submitInquiryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fef9ef 0%, #fdf2e4 30%, #e8f4f0 60%, #daeef5 100%)' }}>

      {/* ═══════════════ HERO with 934 neon photo ═══════════════ */}
      <div className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-934-wide.jpg"
            alt="934 Kapahulu storefront at dusk"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,10,5,0.55) 0%, rgba(20,15,10,0.75) 60%, rgba(25,20,15,0.9) 100%)' }} />
        </div>

        {/* Warm glow particles matching neon */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${4 + i * 3}px`,
                height: `${4 + i * 3}px`,
                left: `${8 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                background: i % 2 === 0 ? 'rgba(255, 120, 80, 0.2)' : 'rgba(255, 200, 150, 0.15)',
                animation: `kp-glow ${2.5 + i * 0.4}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center">
          {/* Location pill */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <MapPin className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-medium text-white/90 tracking-wide">934 Kapahulu Ave &middot; Honolulu, O&#699;ahu</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif", letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            Your Island Home
            <br />
            <span style={{ color: '#ffb380' }}>Awaits</span>{' '}
            <span className="inline-block" style={{ animation: 'kp-float 3s ease-in-out infinite' }}>&#127802;</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ fontFamily: "'Georgia', serif", textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            Cozy private rooms for short stays or long-term living in the heart of Kapahulu.
            Shared kitchen &amp; bath, steps from Waik&#299;k&#299; &amp; Diamond Head.
          </p>

          {/* Quick feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Coffee, label: 'Shared Kitchen' },
              { icon: Bath, label: 'Shared Bath' },
              { icon: Wifi, label: 'Free WiFi' },
              { icon: Tv, label: 'Flat-Screen TV' },
              { icon: Wind, label: 'A/C & Ceiling Fan' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Icon className="h-4 w-4 text-amber-300" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* wave transition */}
        <WaveDivider color="#fef9ef" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══════════════ ROOM GALLERY ═══════════════ */}
        <section className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a3a4a', fontFamily: "'Georgia', serif" }}>
              Take a Peek Inside
            </h2>
            <p className="text-gray-500">Clean, furnished private rooms — each one ready for you to move in.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <RoomGallery />
          </div>

          {/* Room amenities quick list */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {[
              'Queen/Full Bed',
              'Flat-Screen TV',
              'Ceiling Fan',
              'A/C Unit',
              'Closet Space',
              'Smart Lock Entry',
              'Hardwood Floors',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════════ WHY KAPAHULU ═══════════════ */}
        <section className="py-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#1a3a4a', fontFamily: "'Georgia', serif" }}>
              Why 934 Kapahulu?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Prime location, affordable rates, and the aloha spirit you&#699;ve been looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: MapPin, title: 'Steps to Waik\u012Bk\u012B', desc: 'Walk to the beach, shops & restaurants in minutes.', color: '#3a7565', bg: '#e8f4f0' },
              { icon: Home, title: 'Comfy Rooms', desc: '8 furnished private rooms — your own cozy space.', color: '#c57b3a', bg: '#fef5eb' },
              { icon: Users, title: 'Community Living', desc: 'Shared kitchen & bath — meet great people, save money.', color: '#4a7ba5', bg: '#eaf2f8' },
              { icon: DollarSign, title: 'Flexible Rates', desc: 'Daily, weekly, or monthly — stay as long as you like.', color: '#6b8e5a', bg: '#eef5e9' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl p-6 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: bg, border: `1px solid ${color}22` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: `${color}20` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ PRICING CARDS ═══════════════ */}
        <section className="py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#1a3a4a', fontFamily: "'Georgia', serif" }}>
              Simple, Honest Pricing
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              No hidden fees. Pick the plan that fits &mdash; from a few nights to a few months.
            </p>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {properties?.map((property: any) => (
                <div key={property.id} className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Daily */}
                    <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Short Stay</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-extrabold text-gray-800">${property.rateDaily}</span>
                        <span className="text-gray-400 text-sm ml-1">/ night</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-5">Perfect for quick visits or trying us out.</p>
                      <ul className="space-y-2.5 text-sm text-gray-600">
                        {['Private furnished room', 'Shared kitchen & bath', 'Free WiFi & TV', 'Keyless smart lock'].map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weekly */}
                    <div className="relative rounded-2xl p-6 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ border: '2px solid #3a7565' }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-xs font-bold text-white tracking-wider" style={{ background: '#3a7565' }}>
                        POPULAR
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#3a7565' }}>Weekly Stay</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-extrabold text-gray-800">${property.rateWeekly}</span>
                        <span className="text-gray-400 text-sm ml-1">/ week</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-5">Great value for extended island visits.</p>
                      <ul className="space-y-2.5 text-sm text-gray-600">
                        {['Everything in Short Stay', 'Weekly linen refresh', 'Priority support', 'Save vs. nightly rate'].map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Monthly */}
                    <div className="relative rounded-2xl p-6 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #1a3a4a, #2d5f5f, #3a7565)' }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-xs font-bold tracking-wider" style={{ background: '#c57b3a', color: '#fff' }}>
                        BEST VALUE
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="h-5 w-5 text-amber-300" />
                        <span className="text-sm font-semibold text-amber-200 uppercase tracking-wider">Long-Term</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-extrabold">${property.rateMonthly}</span>
                        <span className="text-white/60 text-sm ml-1">/ month</span>
                      </div>
                      <p className="text-sm text-white/70 mb-5">Make Kapahulu your home. Best rate.</p>
                      <ul className="space-y-2.5 text-sm text-white/80">
                        {['Everything in Weekly', 'Bi-weekly housekeeping', 'Guaranteed room', 'Island life, locked in'].map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-300 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </section>

        {/* ═══════════════ INQUIRY FORM ═══════════════ */}
        <section className="py-8" id="inquiry">
          <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
            <CardHeader className="border-b-0 px-8 pt-8 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#3a756520' }}>
                  <Send className="h-5 w-5" style={{ color: '#3a7565' }} />
                </div>
                <CardTitle className="text-2xl font-bold" style={{ color: '#1a3a4a', fontFamily: "'Georgia', serif" }}>
                  Interested? Let&#699;s Talk!
                </CardTitle>
              </div>
              <p className="text-gray-500 mt-2 ml-[52px]">
                Fill this out and we&#699;ll get back to you with availability &amp; next steps.
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="membership-form">

                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <h4 className="font-medium text-red-800 mb-2">Please fix:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {Object.entries(form.formState.errors).map(([field, error]) => (
                          <li key={field}><strong>{field}:</strong> {error?.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Full Name *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" placeholder="Your name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contact" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Phone Number *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" placeholder="(808) 555-1234" {...field} data-testid="input-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" type="email" placeholder="you@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="referralSource" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Who Referred You? *</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400" placeholder="Name of who told you about us" {...field} data-testid="input-referral" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="clubhouse" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Property *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-gray-200" data-testid="select-clubhouse">
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties?.map((property: any) => (
                              <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="preferredPlan" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">How Long Are You Staying? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-gray-200" data-testid="select-plan">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Short Stay (Nightly)</SelectItem>
                            <SelectItem value="weekly">Weekly Stay</SelectItem>
                            <SelectItem value="monthly">Long-Term (Monthly) — Best Value</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Anything Else?</FormLabel>
                      <FormControl>
                        <Textarea
                          className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                          rows={4}
                          placeholder="Move-in date, questions, special needs... We're happy to help! Let us know if you'll be paying with cash or Cash App ($tag)."
                          {...field}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      Your info stays private — always.
                    </div>
                    <Button
                      type="submit"
                      disabled={submitInquiryMutation.isPending}
                      className="rounded-xl px-8 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #2d5f5f, #3a7565)' }}
                      data-testid="button-submit-inquiry"
                    >
                      {submitInquiryMutation.isPending ? (
                        <><Send className="h-4 w-4 mr-2 animate-pulse" /> Sending...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" /> Send My Inquiry</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════ TRACK EXISTING ═══════════════ */}
        <section className="py-4">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(58,117,101,0.15)' }}>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" style={{ color: '#3a7565' }} />
              <div>
                <p className="font-semibold text-gray-700">Already submitted an inquiry?</p>
                <p className="text-sm text-gray-400">Enter your tracking token to check your status.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
              onClick={() => {
                const token = prompt('Enter your tracking token:');
                if (token && token.trim()) setLocation(`/tracker/${token.trim()}`);
                else if (token === '') toast({ variant: 'destructive', title: 'Token Required', description: 'Please enter a valid tracking token.' });
              }}
            >
              Track My Request
            </Button>
          </div>
        </section>

        {/* ═══════════════ FEES ═══════════════ */}
        <section className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: '#eaf2f8', border: '1px solid #d0e3f0' }}>
              <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-700 mb-1">Security Deposit</h3>
                <p className="text-sm text-gray-500"><strong>$50 refundable deposit</strong> at move-in. Returned after checkout &amp; room inspection.</p>
              </div>
            </div>
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: '#fef5eb', border: '1px solid #f0dfca' }}>
              <span className="text-lg mt-0.5 flex-shrink-0">&#128062;</span>
              <div>
                <h3 className="font-bold text-gray-700 mb-1">Pet Fee</h3>
                <p className="text-sm text-gray-500"><strong>$50 non-refundable per pet.</strong> Furry friends welcome as long as they behave!</p>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl p-5 flex items-start gap-4" style={{ background: '#fdf8ef', border: '1px solid #f0e4c8' }}>
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-700 mb-1">Save Your Tracking Token</h3>
              <p className="text-sm text-gray-500">After you submit you&#699;ll get a unique token — <strong>save it!</strong> You&#699;ll need it to check your status later.</p>
            </div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="py-10 text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-300" />
            <span className="text-sm text-gray-400 tracking-wide">934 Kapahulu Ave &middot; Honolulu, HI 96816</span>
          </div>
          <p className="text-xs text-gray-300">&copy; {new Date().getFullYear()} Kapahulu Rooms &middot; Affordable island living on O&#699;ahu</p>
        </footer>
      </div>

      {/* ═══════════════ ANIMATIONS ═══════════════ */}
      <style>{`
        @keyframes kp-glow {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes kp-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
