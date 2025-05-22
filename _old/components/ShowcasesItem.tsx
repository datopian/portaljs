export default function ShowcasesItem({ item }) {
  return (
    <div className="rounded overflow-hidden group relative border-1 shadow-lg">
      <div
        className="bg-cover bg-no-repeat bg-top aspect-video w-full group-hover:blur-sm group-hover:scale-105 transition-all duration-200"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div className="w-full h-full bg-black opacity-0 group-hover:opacity-50 transition-all duration-200"></div>
      </div>
      <div>
        <div className="opacity-0 group-hover:opacity-100 absolute top-0 bottom-0 right-0 left-0 transition-all duration-200 px-2 flex items-center justify-center">
          <div className="text-center text-primary-dark">
            <span className="text-xl font-semibold">{item.title}</span>
            <p className="text-base font-medium">{item.description}</p>
            <div className="flex justify-center mt-2 gap-2 ">
              {item.href && (
                <a
                  target="_blank"
                  className=" text-white w-8 h-8 p-1 bg-primary rounded-full hover:scale-110 transition cursor-pointer z-50"
                  rel="noreferrer"
                  href={item.href}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 420 420"
                    stroke="white"
                    fill="none"
                  >
                    <path stroke-width="26" d="M209,15a195,195 0 1,0 2,0z" />
                    <path
                      stroke-width="18"
                      d="m210,15v390m195-195H15M59,90a260,260 0 0,0 302,0 m0,240 a260,260 0 0,0-302,0M195,20a250,250 0 0,0 0,382 m30,0 a250,250 0 0,0 0-382"
                    />
                  </svg>
                </a>
              )}
              {item.repository && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 bg-black rounded-full p-1 hover:scale-110 transition cursor-pointer z-50"
                  href={item.repository}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
