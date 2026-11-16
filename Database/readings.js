function createReadingsRepository({ getDatabase }) {
  async function saveReadings(readings) {
    const database = await getDatabase();
    const now = new Date();
    const documents = readings.map((reading) => ({
      deviceId: reading.deviceId,
      temperature: reading.temperature,
      humidity: reading.humidity,
      // The server supplies the time so ESP boards do not need a real-time clock.
      recordedAt: now,
    }));

    await database.collection('readings').insertMany(documents);
    return documents.length;
  }

  async function getLatestReadings() {
    const database = await getDatabase();
    return database.collection('readings').aggregate([
      { $sort: { recordedAt: -1 } },
      { $group: { _id: '$deviceId', reading: { $first: '$$ROOT' } } },
      { $replaceWith: '$reading' },
      { $sort: { deviceId: 1 } },
    ]).toArray();
  }

  async function getHistory(hours) {
    const database = await getDatabase();
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);
    return database.collection('readings').find(
      { recordedAt: { $gte: from } },
      { projection: { _id: 0, deviceId: 1, temperature: 1, humidity: 1, recordedAt: 1 } },
    ).sort({ recordedAt: 1 }).toArray();
  }

  return { saveReadings, getLatestReadings, getHistory };
}

module.exports = { createReadingsRepository };
