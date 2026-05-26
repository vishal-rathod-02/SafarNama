import React from "react";
import { motion } from "framer-motion";
import {
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  TwitterIcon,
  ArrowRightIcon
} from "@/Components/Shared/icons";
import type { FooterProps } from '@/hooks/types';

export const Footer = React.forwardRef<HTMLDivElement , FooterProps>(({ onNavLinkClick, id }, ref) => {

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
    <footer ref={ref} id={id} className="relative bg-gray-900 text-gray-300 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_70%)]" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wider leading-none">
                  SafarNama
                </h1>
                <p className="text-[10px] sm:text-xs text-green-700 font-medium tracking-wide">
                  More than Just Routes
                </p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your AI-powered travel partner for creating unforgettable journeys. Discover, plan, and explore with personalized route suggestions.
            </p>
            <div className="flex space-x-2 mt-6">
              {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-all transform hover:scale-110">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- QUICK LINKS --- */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} custom={1}
          >
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.id ? (
                    <button onClick={() => onNavLinkClick(link.id!)} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer duration-300 text-left w-50 ">
                      <ArrowRightIcon className="w-4 h-4 text-green-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      <span className="transition-transform duration-300 group-hover:translate-x-2">{link.name}</span>
                    </button>
                  ) : (
                    <a href={link.href} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 w-50">
                      <ArrowRightIcon className="w-4 h-4 text-green-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
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
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              {[
                { icon: PhoneIcon, text: "+91 7666091322" },
                { icon: EmailIcon, text: "safarnama@gmail.com" },
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-4">
                  <item.icon className="h-5 w-5 mt-1 text-green-500 shrink-0" />
                  <span className="text-gray-400">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- NEWSLETTER --- */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} custom={3}
          >
             <h3 className="text-white font-bold text-lg mb-4">Join Our Newsletter</h3>
                <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                  Subscribe to receive our latest travel inspiration and exclusive offers.
                </p>
                <form className="relative">
                  <EmailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 " />
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 pl-12 pr-14 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe" 
                    className="absolute right-1.5  top-1/2 -translate-y-1/2 p-2 bg-green-600 text-white rounded-md transition-all hover:bg-green-500 transform hover:scale-110"
                  >
                    <ArrowRightIcon className="w-5 h-5 " />
                  </button>
                </form>
          </motion.div>
        </div>
      </div>

        <motion.div
          className="bg-gray-900/50 w-full py-4 my-5 border-t border-gray-700/50"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} custom={2}
        >
          <div className=" container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} SafarNama. All Rights Reserved.</p>
              <p className="mt-1">
            Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600 cursor-pointer">OpenStreetMap</a> contributors.
          </p>
          </div>
        </motion.div>
    </footer>
  );
}
);