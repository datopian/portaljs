export function Avatar({ name, img, href }) {
  const Component = href ? "a" : "div";
  return (
    <Component href={href} className="group block flex-shrink-0 mt-2">
      <div className="flex items-center space-x-2 ">
        <div>
          <img
            className="inline-block h-11 w-11 rounded-full "
            src={img}
            alt={name}
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {name}
          </p>
        </div>
      </div>
    </Component>
  );
}
