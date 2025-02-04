import cron from 'node-cron';
import RentModel from '../models/rent';

cron.schedule('0 0 * * *', async () => {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const result = await RentModel.deleteMany({
      status: 'pending',
      createdAt: { $lt: threshold },
    });

    console.log(`Cleanup completed: ${result.deletedCount} expired pending rents removed.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

export default cron;
