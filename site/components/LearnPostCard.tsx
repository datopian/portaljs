import React, { FC } from 'react';
import Link from 'next/link';

interface LearnPostCardProps {
  title: string;
  description: string;
  date?: string;
  readTime?: string;
  href: string;
  className?: string;
}

const LearnPostCard: FC<LearnPostCardProps> = ({
  title,
  description,
  date,
  readTime,
  href,
  className = "",
}) => {
  return (
    <Link href={href} className={`block border border-zinc-200 dark:border-zinc-700 
         dark:bg-[#020817] p-6 transition-all duration-300 shadow-sm
        hover:bg-slate-50 dark:hover:bg-gray-800 hover:shadow-md ${className} group`}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">
          {description}
        </p>
        {(date || readTime) && (
          <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 dark:text-gray-500">
            {date && <span>{date}</span>}
            {date && readTime && <span>•</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

export default LearnPostCard;