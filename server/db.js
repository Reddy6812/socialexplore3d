const neo4j = require('neo4j-driver');
require('dotenv').config();

// Use environment variables or default to localhost settings
const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'neo4j';

// Initialize Neo4j driver, disabling encryption locally but using defaults for remote
const auth = neo4j.auth.basic(user, password);
let driver;
if (uri.startsWith('bolt://') || uri.startsWith('neo4j://')) {
  driver = neo4j.driver(
    uri,
    auth,
    { encrypted: 'ENCRYPTION_OFF', trust: 'TRUST_ALL_CERTIFICATES' }
  );
} else {
  driver = neo4j.driver(uri, auth);
}

module.exports = driver; 