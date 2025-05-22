import { DocItem } from "@/components/DocItem.jsx";

export function DocsList({ docs }) {
  //  TODO: there must be a better way of handling
  //  this set of metadata
  const sections = {
    "getting-started": {
      title: "Getting Started",
      description: "Learn how to use DataHub!",
    },
    tutorials: {
      title: "Tutorials",
      description: "Learn DataHub features by tutorials!",
    },
    features: {
      title: "Features",
      description: "Discover DataHub features!",
    },
    "core-data": {
      title: "Core Data",
      description:
        "Important, commonly-used data as high quality, easy-to-use and open data packages",
    },
    "data-packages": {
      title: "Data Packages",
      description: "Learn about Data Packages!",
    },
    misc: {
      title: "Misc",
    },
  };

  let sectionsNames = Object.keys(sections);
  sectionsNames.forEach((name) => {
    sections[name].docs = docs.filter((doc) => doc.category == name);
  });

  return (
    <>
      <div className="md:pl-6">
        {sectionsNames.map((name) => {
          return (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-2xl">{sections[name].title}</h2>
                <p>{sections[name].description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {sections[name].docs.map((doc) => {
                  return <DocItem key={doc.url_path} doc={doc} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
