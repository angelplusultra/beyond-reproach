export default {
  getNextFriday() {
    const today = new Date();
    const day = today.getDay();
    const daysUntilFriday = 5 + ((7 - day) % 7); // Calculate the number of days until next Friday

    today.setDate(today.getDate() + daysUntilFriday); // Set the date to next Friday
    const nextFriday = today.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    return nextFriday;
  },
  getNextMonday() {
    const today = new Date();
    const day = today.getDay();
    const daysUntilMonday = 1 + ((7 - day) % 7); // Calculate the number of days until next Monday

    today.setDate(today.getDate() + daysUntilMonday); // Set the date to next Monday
    const nextMonday = today.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    return nextMonday;
  }
};
