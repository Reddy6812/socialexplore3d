const driver = require('../db');

// Create a new company node
async function createCompany(id, name, industry, location) {
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (c:Company {id: $id, name: $name, industry: $industry, location: $location}) RETURN c',
      { id, name, industry, location }
    );
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
}

// Retrieve all companies
async function getCompanies() {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (c:Company) RETURN c'
    );
    return result.records.map(r => r.get('c').properties);
  } finally {
    await session.close();
  }
}

// Retrieve all employees for a company
async function getEmployeesForCompany(companyId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User)-[:WORKS_AT]->(c:Company {id: $companyId})
       RETURN u`,
      { companyId }
    );
    return result.records.map(r => r.get('u').properties);
  } finally {
    await session.close();
  }
}

// Hire a user to work at a company (create WORKS_AT relationship)
async function addEmployee(companyId, userId) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {id: $userId}), (c:Company {id: $companyId})
       MERGE (u)-[:WORKS_AT]->(c)`,
      { userId, companyId }
    );
  } finally {
    await session.close();
  }
}

// Export new functions
module.exports = { createCompany, getCompanies, getEmployeesForCompany, addEmployee }; 