import { Organisation } from "../models/dataModels";

export const organisations: Organisation[] = [
  {
    id: "department-for-work-pensions",
    acronym: "blah",
    homepage: "www.somesite.com",
    name: "Department for Work and Pensions",
    title: "Department for Work and Pensions",
  },
  {
    id: "department-for-test",
    acronym: "blah2",
    homepage: "www.somesite.com",
    name: "Department for Test",
    title: "Department for Test",
  },
  {
    id: "department-for-test-test",
    acronym: "blah3",
    homepage: "www.somesite.com",
    name: "Department for Test Test",
    title: "Department for Test Test",
  },
];

export function generateFilters() {
  return organisations.map((org) => org.id);
}
