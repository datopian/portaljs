import React, { FC } from 'react';
import Link from 'next/link';

interface LearnCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  comingSoon?: boolean;
  underline?: boolean;
  href: string;
  compact?: boolean;
}

const LearnCard: FC<LearnCardProps> = ({
  icon,
  title,
  description,
  className = "",
  comingSoon = false,
  underline = false,
  href,
  compact = false,
}) => {
  const cardContent = (
    <>
      <div className={`absolute right-8 bottom-0 mb-6 ${compact ? 'text-2xl' : 'text-4xl'} opacity-0 group-hover:opacity-30 transition ease-in-out`}>
        {icon}
      </div>
      <h5 className={`${compact ? 'text-2xl' : 'text-5xl'} font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
        {title}
      </h5>
      {underline && <div className="h-1 w-32 bg-custom_blue mt-2 mb-3"></div>}
      <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-sm' : 'text-base'} leading-relaxed transition-colors duration-300`}>
        {description}
      </p>
      {comingSoon && (
        <div className="absolute right-4 top-4 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500 dark:text-blue-400">
          Coming Soon
        </div>
      )}
    </>
  );

  const heightClass = compact ? 'min-h-[300px]' : 'min-h-[400px] lg:min-h-[600px]';
  const paddingClass = compact ? 'p-6' : 'p-8';

  if (comingSoon) {
    return (
      <div className={`block relative overflow-hidden border border-zinc-200 dark:border-zinc-700 
           dark:bg-[#020817] ${paddingClass} transition-all duration-300 shadow-lg
          ${className} ${heightClass} group cursor-not-allowed opacity-75`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={href} className={`block relative overflow-hidden border border-zinc-200 dark:border-zinc-700 
         dark:bg-[#020817] ${paddingClass} transition-all duration-300 shadow-lg
        hover:bg-slate-100 dark:hover:bg-gray-800 ${className} ${heightClass} group`}>
      {cardContent}
    </Link>
  );
}

export default LearnCard;