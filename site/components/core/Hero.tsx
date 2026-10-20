interface Button {
    title: string;
    href: string;
    type: 'filled' | 'text'
}

export interface HeroProps {
    title: string;
    subtitle?: string;
    announcement?: {
        title: string;
        href?: string;
    };
    buttons?: Array<Button>
}

const buttonStyle = {
    'filled': "rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
    'text': "text-sm font-semibold leading-6"
}


export const Hero: React.FC<HeroProps> = ({ title, subtitle, announcement, buttons }) => {

    return (
        <div className="text-primary dark:text-primary-dark">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                {/* <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#38bdf8] to-[#89a8fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div> */}
                <div className="mx-auto max-w-2xl py-16 sm:py-32 lg:py-40">
                    {announcement && (
                        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                            <div className="relative rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-primary/20 hover:ring-primary/30 dark:ring-primary-dark/30 dark:hover:ring-primary-dark/40">
                                {announcement.title}{' '}
                                <a href="#" className="font-semibold text-secondary">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Read more <span aria-hidden="true">&rarr;</span>
                                </a>
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-6 text-lg leading-8 text-primary/90 dark:text-primary-dark/80">
                                {subtitle}
                            </p>
                        )}
                        {buttons && buttons.length && (
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {buttons.map((b) => (
                                    <a
                                        href={b.href}
                                        className={buttonStyle[b.type]}
                                    >
                                        {b.title}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* <div
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#89a8fc] to-[#38bdf8] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div> */}
            </div>
        </div>
    )
}
