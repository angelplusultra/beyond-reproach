import ShipDay from 'shipday/integration';

export const shipday = new ShipDay(process.env.SHIPDAY_API_KEY as string, 10000);
