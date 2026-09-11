import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  TwitterIcon,
  ArrowRightIcon
} from "@/Components/Shared/icons";
import type { FooterProps } from '@/hooks/types';
import { useToast } from "../Shared/ToastContext";

export const Footer = React.forwardRef<HTMLDivElement , FooterProps>(({ onNavLinkClick, id }, ref) => {
  const { addToast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({ message: `${label} copied to clipboard!`, type: "success" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    addToast({ message: "Thank you for subscribing to our newsletter!", type: "success" });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" } as any,
    }),
  };

   const quickLinks = [
    {name: "Home", id: "home"},
    { name: "Destinations", id: "destinations" },
    { name: "Services", id: "services" },
    { name: "About Us", id: "about" },
    { name: "Privacy Policy", href: "/" }, 
  ];

  return (
    <footer ref={ref} id={id} className="relative bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 overflow-hidden border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          
          {/* --- ABOUT SECTION  --- */}
          <motion.div
            className="lg:col-span-1" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} 
            custom={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  SafarNama
                </h1>
                <p className="text-[11px] text-amber-500 font-extrabold tracking-wide mt-1">
                  More than Just Routes
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              Your AI-powered travel partner for creating unforgettable journeys. Discover, plan, and explore with personalized route suggestions.
            </p>
            <div className="flex space-x-2 mt-6">
              {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/60 shadow-xs transition-all transform hover:scale-110 cursor-pointer"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- QUICK LINKS --- */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} custom={1}
          >
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.id ? (
                    <button onClick={() => onNavLinkClick(link.id!)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer duration-300 text-left w-50">
                      <ArrowRightIcon className="w-4 h-4 text-amber-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      <span className="transition-transform duration-300 group-hover:translate-x-2">{link.name}</span>
                    </button>
                  ) : (
                    <a href={link.href} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300 w-50">
                      <ArrowRightIcon className="w-4 h-4 text-amber-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      <span className="transition-transform duration-300 group-hover:translate-x-2">{link.name}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

         {/* --- CONTACT US --- */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} custom={2}
          >
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {[
                { icon: PhoneIcon, text: "+91 7666091322", label: "Phone number" },
                { icon: EmailIcon, text: "safarnama@gmail.com", label: "Email address" },
              ].map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleCopy(item.text, item.label)}
                  className="flex items-start space-x-3.5 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800/60 p-2.5 rounded-xl transition duration-200 border border-transparent hover:border-slate-300/60 dark:hover:border-slate-700/60"
                  title={`Click to copy ${item.label}`}
                >
                  <item.icon className="h-5 w-5 mt-0.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- NEWSLETTER --- */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} custom={3}
          >
             <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Join Our Newsletter</h3>
             <AnimatePresence mode="wait">
               {!subscribed ? (
                 <motion.div
                   key="subscribe-form"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   <p className="mb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                     Subscribe to receive our latest travel inspiration and exclusive road-trip routes.
                   </p>
                   <form onSubmit={handleSubscribe} className="relative">
                     <EmailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="Your email address"
                       className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-12 pr-14 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm shadow-xs"
                       required
                     />
                     <button
                       type="submit"
                       aria-label="Subscribe" 
                       className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold rounded-lg transition-all hover:scale-105 cursor-pointer shadow-md shadow-amber-500/25"
                     >
                       <ArrowRightIcon className="w-5 h-5" />
                     </button>
                   </form>
                 </motion.div>
               ) : (
                 <motion.div
                   key="subscribed-success"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4 }}
                   className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl text-center font-bold shadow-xs"
                 >
                   🎉 Subscribed successfully! Check your inbox.
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>
      </div>

        <motion.div
          className="bg-slate-200/70 dark:bg-slate-900/90 w-full py-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} custom={2}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            <p>&copy; {new Date().getFullYear()} SafarNama. All Rights Reserved.</p>
            <p className="mt-1">
              Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer">OpenStreetMap</a> contributors.
            </p>
          </div>
        </motion.div>
    </footer>
  );
}
);