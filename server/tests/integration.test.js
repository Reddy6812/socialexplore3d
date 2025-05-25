const assert = require('assert');
const driver = require('../db');
const { createUser, getUser, deleteAll } = require('../services/userService');
const { sendFriendRequest, acceptFriendRequest, getFriends, getPendingRequests } = require('../services/friendService');

describe('Neo4j Integration Tests', function() {
  // Increase timeout for DB operations
  this.timeout(10000);

  before(async () => {
    await deleteAll();
  });

  after(async () => {
    await deleteAll();
    await driver.close();
  });

  it('creates and retrieves a user', async () => {
    const user = await createUser('u1', 'User One');
    assert.strictEqual(user.id, 'u1');
    assert.strictEqual(user.name, 'User One');

    const fetched = await getUser('u1');
    assert.deepStrictEqual(fetched, user);
  });

  it('handles friend requests and acceptance', async () => {
    // Create a second user
    await createUser('u2', 'User Two');

    // Send and verify pending request
    await sendFriendRequest('u1', 'u2');
    const pending = await getPendingRequests('u2');
    assert.ok(Array.isArray(pending), 'pending should be an array');
    assert.ok(pending.some(u => u.id === 'u1' && u.name === 'User One'), 'pending should include u1');

    // Accept and verify friendship
    await acceptFriendRequest('u1', 'u2');
    const friendsOf1 = await getFriends('u1');
    assert.ok(friendsOf1.some(u => u.id === 'u2' && u.name === 'User Two'), 'friendsOf1 should include u2');

    const friendsOf2 = await getFriends('u2');
    assert.ok(friendsOf2.some(u => u.id === 'u1' && u.name === 'User One'), 'friendsOf2 should include u1');
  });
}); 