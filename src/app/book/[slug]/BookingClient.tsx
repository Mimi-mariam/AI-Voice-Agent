"use client";

import { useState } from "react";
import AssistantModal from "@/app/components/AssistantModal";
import Image from "next/image";
import Link from "next/link";

export default function BookingClient({ business, services, faqs }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative bg-[#FAFAFA] min-h-screen font-sans selection:bg-rose-200">
      {/* Navigation */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-8 py-6 z-20 mix-blend-difference text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
          <p className="text-xs uppercase tracking-widest mt-0.5 opacity-80">Hair • Beauty • Care</p>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.jpg" 
            alt="Salon Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight drop-shadow-lg">
            Your next appointment, <br/>
            <span className="text-rose-300 italic">your way.</span>
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
            Experience seamless booking. Talk to our AI Assistant to find the perfect time, or browse our curated services below.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Talk to AI Assistant
            </button>
            <a 
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full font-medium transition-all"
            >
              Browse Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold tracking-widest text-rose-500 uppercase mb-3">Our Offerings</h3>
          <h4 className="text-4xl font-serif text-gray-900">Curated Services</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any) => (
            <div key={service.id} className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h4>
              <p className="text-rose-600 font-medium text-sm mb-4">
                {service.content.split('.')[0]} 
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                {service.content.split('.').slice(1).join('.').trim()}
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-900 text-gray-900 hover:text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
              >
                Book now 
                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Questions */}
      <section className="px-6 py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h3 className="text-3xl font-serif text-gray-900 mb-4">Your appointment, made effortless.</h3>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Find a time, ask questions about our services, and book instantly with our intelligent AI Assistant. No more waiting on hold.
            </p>
            <div className="bg-rose-50/80 rounded-3xl p-8 border border-rose-100">
              <h4 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <span className="text-xl">✨</span> Try asking:
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  "How much is wig installation?",
                  "Do you have availability this Saturday?",
                  "Can I reschedule an appointment?"
                ].map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => setIsModalOpen(true)}
                    className="text-left bg-white px-5 py-3 rounded-2xl text-sm text-gray-700 hover:text-rose-600 hover:shadow-md transition-all shadow-sm border border-gray-50"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-orange-100 rounded-[3rem] blur-3xl opacity-30 -z-10" />
            <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full mix-blend-screen filter blur-[50px] opacity-50"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">AI Assistant</h4>
                  <p className="text-white/60 text-sm">Online & ready</p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm w-[85%] text-sm">
                  Hi there! I can help you find the perfect time for your visit or answer any questions about our services. How can I assist you today?
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-rose-50 transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-30">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 bg-rose-500 text-white rounded-full font-medium shadow-[0_10px_40px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Talk to AI Assistant
        </button>
      </div>

      <footer className="bg-gray-50 border-t border-gray-100 py-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {business.name}. Powered by AI.</p>
        <Link href="/login" className="mt-3 inline-block text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Owner Login
        </Link>
      </footer>

      {/* Modal */}
      <AssistantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        assistantId={business.vapiAssistantId}
        businessName={business.name}
      />
    </div>
  );
}
