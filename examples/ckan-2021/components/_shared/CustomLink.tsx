type LinkProps = {
  url: string;
  format: any;
};

const CustomLink: React.FC<LinkProps> = ({ url, format }: LinkProps) => (
  <a
    href={url}
    className="bg-white hover:bg-gray-200 border text-black font-semibold py-2 px-4 rounded"
  >
    {format}
  </a>
);

export default CustomLink;
