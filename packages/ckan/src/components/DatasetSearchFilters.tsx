import { Field, Form, Formik, useFormikContext } from "formik";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PackageSearchOptions, Tag, Group, Organization, FilterObj } from "../interfaces";

function AutoSubmit({
  setOptions,
}: {
  setOptions: Dispatch<SetStateAction<PackageSearchOptions>>;
}) {
  const { values } = useFormikContext<{
    tags: string[];
    orgs: string[];
    groups: string[];
  }>();
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      groups: values.groups,
      tags: values.tags,
      orgs: values.orgs,
    }));
  }, [values, setOptions]);
  return null;
}

export default function DatasetSearchFilters({
  tags,
  orgs,
  groups,
  setOptions,
  filtersName,
}: {
  tags: Array<Tag>;
  orgs: Array<Organization>;
  groups: Array<Group>;
  options: PackageSearchOptions;
  setOptions: Dispatch<SetStateAction<PackageSearchOptions>>;
  filtersName?: FilterObj | undefined;
}) {
  const [seeMoreOrgs, setSeeMoreOrgs] = useState(false);
  const [seeMoreTags, setSeeMoreTags] = useState(false);
  const [seeMoreGroups, setSeeMoreGroups] = useState(false);
  return (
    <Formik
      initialValues={{
        tags: [],
        orgs: [],
        groups: [],
      }}
      onSubmit={async (values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        <section className="bg-white rounded-lg xl:p-8 p-4 mb-4 max-h-[400px] overflow-y-auto">
          <h1 className="font-bold pb-4">Refine by {`${filtersName?.org || "Organization"}`}</h1>
          {orgs
            .filter((org) => org.title || org.id)
            .slice(0, seeMoreOrgs ? orgs.length : 5)
            .map((org) => (
              <div key={org.id}>
                <Field
                  type="checkbox"
                  id={org.id}
                  name="orgs"
                  value={org.name}
                ></Field>
                <label className="ml-1.5" htmlFor={org.id}>
                  {org.title || org.display_name}
                </label>
              </div>
            ))}
          {orgs.length > 5 && (
            <button
              className="bg-gray-300 px-2 rounded text-gray-600 mt-2"
              type="button"
              onClick={() => setSeeMoreOrgs(!seeMoreOrgs)}
            >
              Show {seeMoreOrgs ? "less" : "more"}
            </button>
          )}
        </section>
        <section className="bg-white rounded-lg xl:p-8 p-4 mb-4 max-h-[400px] overflow-y-auto">
          <h1 className="font-bold pb-4">Refine by {`${filtersName?.group || "Theme"}`}</h1>
          {groups.slice(0, seeMoreGroups ? groups.length : 5).map((group) => (
            <div key={group.id}>
              <Field
                type="checkbox"
                id={group.id}
                name="groups"
                value={group.name}
              ></Field>
              <label className="ml-1.5" htmlFor={group.id}>
                {group.display_name}
              </label>
            </div>
          ))}
          {groups.length > 5 && (
            <button
              onClick={() => setSeeMoreGroups(!seeMoreGroups)}
              type="button"
              className="bg-gray-300 px-2 rounded text-gray-600 mt-2"
            >
              See {seeMoreGroups ? "less" : "more..."}
            </button>
          )}
        </section>
        <section className="bg-white rounded-lg xl:p-8 p-4 mb-4 max-h-[400px] overflow-y-auto">
          <h1 className="font-bold pb-4">Refine by Keyword</h1>
          <div className="flex gap-2 flex-wrap">
            {tags.slice(0, seeMoreTags ? tags.length : 5).map((tag) => (
              <div key={tag.id}>
                <Field
                  type="checkbox"
                  className="hidden tag-checkbox"
                  id={tag.id}
                  name="tags"
                  value={tag.name}
                ></Field>
                <label
                  className="bg-gray-200 px-4 py-1 rounded-full text-xs block"
                  htmlFor={tag.id}
                >
                  {tag.display_name}
                </label>
              </div>
            ))}
          </div>
          {tags.length > 5 && (
            <button
              onClick={() => setSeeMoreTags(!seeMoreTags)}
              type="button"
              className="bg-gray-300 px-2 rounded text-gray-600 mt-2"
            >
              See {seeMoreTags ? "less" : "more..."}
            </button>
          )}
        </section>
        <AutoSubmit setOptions={setOptions} />
      </Form>
    </Formik>
  );
}
