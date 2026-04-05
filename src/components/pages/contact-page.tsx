'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin,
  Mail,
  Phone,
  Send,
  MessageSquare,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'HungerFree Foundation, New Delhi, India',
  },
  { icon: Mail, label: 'Email', value: 'contact@hungerfree.org' },
  { icon: Phone, label: 'Phone', value: '+91 11 4567 8900' },
  { icon: Clock, label: 'Working Hours', value: 'Mon - Sat, 9:00 AM - 6:00 PM' },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-50 hover:text-sky-500' },
  { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-50 hover:text-pink-600' },
  { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-50 hover:text-blue-700' },
];

const faqs = [
  {
    question: 'How can I donate food through HungerFree?',
    answer:
      'Simply create a free account, fill out the food donation form with details about the food item, quantity, expiry time, and pickup location. Once listed, nearby NGOs and volunteers can request the food for pickup and delivery.',
  },
  {
    question: 'Is there any cost involved in donating or receiving food?',
    answer:
      'No, HungerFree is completely free for donors, NGOs, and recipients. Our platform is supported by grants and partnerships. The only costs involved are logistics for volunteer deliveries, which are covered by our partner organizations.',
  },
  {
    question: 'How does the volunteer delivery system work?',
    answer:
      'Volunteers can browse available pickup requests in their area. They accept a request, go to the donor location to pick up the food, and deliver it to the requesting NGO or community center. All deliveries are tracked in real-time through the app.',
  },
  {
    question: 'Can farmers sell produce directly on the marketplace?',
    answer:
      'Yes! Our Farmer Marketplace allows small-scale farmers to list their produce with prices. Buyers can browse products, add items to cart, and contact farmers directly. This helps farmers get better prices while buyers get fresh, affordable produce.',
  },
];

export default function ContactPage() {
  const { setCurrentPage } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
      <FoodPatternBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>← Back to Home</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-3">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have questions or want to collaborate? We&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Contact Form + Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-8 mb-16 lg:grid-cols-5"
        >
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">
                          General Inquiry
                        </SelectItem>
                        <SelectItem value="Partnership">
                          Partnership
                        </SelectItem>
                        <SelectItem value="Technical Support">
                          Technical Support
                        </SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="contact-message"
                      className="text-sm font-medium"
                    >
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Write your message here..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <info.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {info.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <button
                      key={social.label}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-muted-foreground transition-colors ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50">
                <div className="flex flex-col items-center gap-2 text-emerald-600">
                  <MapPin className="h-8 w-8" />
                  <span className="text-sm font-medium">
                    Google Maps Integration
                  </span>
                  <span className="text-xs text-emerald-500">
                    New Delhi, India
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-2 sm:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-b last:border-b-0 px-4 sm:px-2"
                    >
                      <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
