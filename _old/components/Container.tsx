export default function Container({ children }) {
  return (
    <div className="lg:max-w-8xl mx-auto px-4 lg:px-8 xl:px-12 mb-32">
      {children}
    </div>
  );
}
