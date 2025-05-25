const driver = require('../db');

// Create a new user node
async function createUser(id, name) {
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (u:User {id: $id, name: $name}) RETURN u',
      { id, name }
    );
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
}

// Retrieve a user by ID
async function getUser(id) {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (u:User {id: $id}) RETURN u',
      { id }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
}

// Delete all nodes and relationships (for testing)
async function deleteAll() {
  const session = driver.session();
  try {
    await session.run('MATCH (n) DETACH DELETE n');
  } finally {
    await session.close();
  }
}

module.exports = { createUser, getUser, deleteAll }; 