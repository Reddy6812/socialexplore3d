const driver = require('../db');

// Create a new job and link to a company
async function createJob(companyId, title, description = '', location = '') {
  const session = driver.session();
  const id = Date.now().toString();
  try {
    const result = await session.run(
      `MATCH (c:Company {id: $companyId})
       CREATE (j:Job {id: $id, title: $title, description: $description, location: $location, postedAt: datetime()})
       MERGE (c)-[:POSTED]->(j)
       RETURN j`,
      { companyId, id, title, description, location }
    );
    return result.records[0].get('j').properties;
  } finally {
    await session.close();
  }
}

// Retrieve all jobs for a company
async function getJobsForCompany(companyId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Company {id: $companyId})-[:POSTED]->(j:Job)
       RETURN j`,
      { companyId }
    );
    return result.records.map(r => r.get('j').properties);
  } finally {
    await session.close();
  }
}

// Delete a job by ID
async function deleteJob(jobId) {
  const session = driver.session();
  try {
    await session.run(
      'MATCH (j:Job {id: $jobId}) DETACH DELETE j',
      { jobId }
    );
  } finally {
    await session.close();
  }
}

// Student applies for a job
async function applyForJob(jobId, studentId) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {id: $studentId}), (j:Job {id: $jobId})
       MERGE (u)-[:APPLIED]->(j)`,
      { studentId, jobId }
    );
  } finally {
    await session.close();
  }
}

// Retrieve applicants for a job
async function getApplicantsForJob(jobId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User)-[:APPLIED]->(j:Job {id: $jobId})
       RETURN u`,
      { jobId }
    );
    return result.records.map(r => r.get('u').properties);
  } finally {
    await session.close();
  }
}

module.exports = { createJob, getJobsForCompany, deleteJob, applyForJob, getApplicantsForJob }; 