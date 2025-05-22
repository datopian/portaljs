import Link from "next/link";
import React from "react";

export default function ShowCaseMobile({ item }) {
  return (
    <div className="w-full md:w-1/2 xl:w-1/3 ">
      <div className=" rounded-lg overflow-hidden mb-10 border border-slate-400">
        <img src={item.image} alt={item.title} className="w-full " />
        <div className="p-2  text-primary dark:text-primary-dark    text-center">
          <p className="text-[1.1rem] font-bold my-1">{item.title}</p>
          <p className="text-sm font-semibold my-1 ">{item.subtitle}</p>

          <Link
            href={item.href || "#"}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              items-center
              justify-center
              my-2
              py-2
              px-6
              bg-primary
              text-white
              text-sm
              font-medium
              rounded-full
              hover:bg-opacity-90
              transition-all
              duration-300
            "
          >
            Go to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
