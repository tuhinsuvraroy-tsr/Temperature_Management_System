// MongoClient is provided by Backend/server.js. This keeps the database folder
// focused only on database work, while Backend owns installed packages.
function createDatabase(MongoClient) {
  let client;
  let database;

  async function getDatabase() {
    if (database) return database;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is missing. Add it to Backend/.env.');

    client = new MongoClient(uri);
    await client.connect();
    database = client.db(process.env.MONGODB_DATABASE || 'temperature_management');

    // Makes latest-reading and history queries fast as the collection grows.
    await database.collection('readings').createIndex({ deviceId: 1, recordedAt: -1 });
    return database;
  }

  async function closeDatabase() {
    if (client) await client.close();
  }

  return { getDatabase, closeDatabase };
}

module.exports = { createDatabase };
