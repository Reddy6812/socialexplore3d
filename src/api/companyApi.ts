const BASE_URL = '/api';

export interface ApiCompany {
  id: string;
  name: string;
  industry: string;
  location: string;
}

export interface ApiJob {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  postedAt?: string;
}

export async function getCompaniesApi(): Promise<ApiCompany[]> {
  const res = await fetch(`${BASE_URL}/companies`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCompanyApi(
  id: string,
  name: string,
  industry: string,
  location: string
): Promise<ApiCompany> {
  const res = await fetch(`${BASE_URL}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, industry, location })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCompanyJobsApi(companyId: string): Promise<ApiJob[]> {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/jobs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createJobApi(
  companyId: string,
  title: string,
  description?: string,
  location?: string
): Promise<ApiJob> {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, location })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteJobApi(jobId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

export async function applyJobApi(jobId: string, userId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getJobApplicantsApi(jobId: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Fetch employees who work at a specific company
export async function getCompanyEmployeesApi(companyId: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/employees`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Hire a user to work at a specific company
export async function addCompanyEmployeeApi(companyId: string, userId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error(await res.text());
} 