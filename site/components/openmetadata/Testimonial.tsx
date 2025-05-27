import React from 'react';

export function Testimonial() {
  return (
    <div className="py-16 w-full">
      <section className="flex flex-col items-center w-full">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-10 text-center">
          What Our Clients Are Saying
        </h2>
        
        <div className="max-w-4xl mx-auto rounded-xl bg-white dark:bg-slate-800 shadow-xl p-8 md:p-12 relative">
          <div className="absolute top-6 left-8 text-7xl text-blue-300 opacity-40 font-serif">"</div>
          <div className="relative z-10">
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 italic mb-8 relative z-10">
              Before PortalJS, our OpenMetadata setup was technically sound but practically unusable for most of our team. Analysts and product leads struggled to find and understand the metadata they needed.
              <br /><br />
              With PortalJS, we launched a clean, branded portal tailored to each department — without touching the backend. Adoption shot up, support tickets dropped, and now even non-technical users explore metadata on their own. It's become a core part of how we work with data.
            </p>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
                NH
              </div>
              <div className="ml-4">
                <p className="font-medium text-slate-900 dark:text-white">Senior Data Manager</p>
                <p className="text-slate-500 dark:text-slate-400">National Health Data Organization</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}