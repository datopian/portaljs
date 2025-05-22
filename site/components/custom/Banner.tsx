
export default function DatopianBanner() {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50 text-center p-2.5 align-middle">
      <span>Datahub Enterprise by</span>
      <a href="https://datopian.com/" target="_blank">
        <img src="https://www.datopian.com/wp-content/uploads/2020/09/datopian-bash-png.png"
             className="h-6 inline px-2 pb-1"
             alt="datopian logo"
        />
      </a>
      <span className="px-1">—</span>
      <span>We build solutions that unleash the potential of data</span>
      <span className="px-2">🚀</span>
      <span>Let's start with yours!</span>
      <a href="https://datopian.com" target="_blank" className="px-2 font-medium text-orange-500 underline">
        Learn more about us »
      </a>
    </div>
  )
}
