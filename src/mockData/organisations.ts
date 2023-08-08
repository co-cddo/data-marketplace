import { Organisation } from "../models/dataModels";

export const organisations: Organisation[] = [
  {
      acronym: 'DWP',
      homepage: 'https://www.gov.uk/government/organisations/department-for-work-pensions',
      id: 'department-for-work-pensions',
      title: 'Department for Work & Pensions'
    },
    {
      acronym: 'test',
      homepage: 'https://www.test.com',
      id: 'department-for-test',
      title: 'Department for Test'
    },
    {
      acronym: 'TEST',
      homepage: 'https://www.test.uk/test/test/department-for-test-test',
      id: 'department-for-test-test',
      title: 'Department for test & test'
    },
    {
      acronym: 'XYZ',
      homepage: 'https://www.example.com',
      id: 'example-department',
      title: 'Example Department'
    },
    {
      acronym: 'ABC',
      homepage: 'https://www.exampleabc.com',
      id: 'exampleabc-department',
      title: 'Example ABC Department'
    },
    {
      acronym: 'XYZCORP',
      homepage: 'https://www.xyzcorp.com',
      id: 'xyzcorp-department',
      title: 'XYZ Corporation'
    },
    {
      acronym: 'ABC',
      homepage: 'https://www.abc-corp.com',
      id: 'abc-corp-department',
      title: 'ABC Corporation'
    },
    {
      acronym: 'ABC',
      homepage: 'https://www.example.org',
      id: 'example-organization',
      title: 'Example Organization'
    },
    {
      acronym: 'ABC',
      homepage: 'https://www.example-abc.org',
      id: 'example-abc-organization',
      title: 'Example ABC Organization'
    },
    {
      acronym: 'HDMT',
      homepage: 'https://www.healthdata.org',
      id: 'health-data-management',
      title: 'Health Data Management'
    },
    {
      acronym: 'EDMT',
      homepage: 'https://www.educationdata.org',
      id: 'education-data-management',
      title: 'Education Data Management'
    }
   ]


export function generateFilters() {
  return organisations.map((org) => org.id);
}
