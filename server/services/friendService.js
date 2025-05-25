const driver = require('../db');

// Send a friend request (creates a pending relationship)
async function sendFriendRequest(fromId, toId) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (a:User {id: $fromId}), (b:User {id: $toId})
       MERGE (a)-[r:FRIEND_REQUESTED]->(b)
       RETURN r`,
      { fromId, toId }
    );
  } finally {
    await session.close();
  }
}

// Accept a friend request (removes pending and creates friendship)
async function acceptFriendRequest(fromId, toId) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (a:User {id: $fromId})-[r:FRIEND_REQUESTED]->(b:User {id: $toId})
       DELETE r
       MERGE (a)-[:FRIEND_OF]-(b)`,
      { fromId, toId }
    );
  } finally {
    await session.close();
  }
}

// Decline a friend request (removes pending relationship)
async function declineFriendRequest(fromId, toId) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (a:User {id: $fromId})-[r:FRIEND_REQUESTED]->(b:User {id: $toId})
       DELETE r`,
      { fromId, toId }
    );
  } finally {
    await session.close();
  }
}

// List friends for a user
async function getFriends(id) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $id})-[:FRIEND_OF]-(friend:User)
       RETURN friend`,
      { id }
    );
    return result.records.map(r => r.get('friend').properties);
  } finally {
    await session.close();
  }
}

// List pending friend requests to a user
async function getPendingRequests(toId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (a:User)-[:FRIEND_REQUESTED]->(b:User {id: $toId})
       RETURN a`,
      { toId }
    );
    return result.records.map(r => r.get('a').properties);
  } finally {
    await session.close();
  }
}

module.exports = { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends, getPendingRequests }; 