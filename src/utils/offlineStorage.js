import Dexie from 'dexie';

class OfflineStorage {
  constructor() {
    this.db = new Dexie('FarmManagementDB');
    this.db.version(1).stores({
      expenses: '++id, date, category, description, amount',
      diary: '++id, date, activity, crop, yield, notes',
      labor: '++id, date, worker, task, hours',
      inventory: '++id, name, category, quantity, unit, minStock'
    });
  }

  // Check if online
  isOnline() {
    return navigator.onLine;
  }

  // Expenses operations
  async saveExpenseOffline(expense) {
    try {
      await this.db.expenses.add(expense);
    } catch (error) {
      console.error('Error saving expense offline:', error);
    }
  }

  async getExpensesOffline() {
    try {
      return await this.db.expenses.toArray();
    } catch (error) {
      console.error('Error getting expenses offline:', error);
      return [];
    }
  }

  async deleteExpenseOffline(id) {
    try {
      await this.db.expenses.delete(id);
    } catch (error) {
      console.error('Error deleting expense offline:', error);
    }
  }

  // Diary operations
  async saveDiaryOffline(entry) {
    try {
      await this.db.diary.add(entry);
    } catch (error) {
      console.error('Error saving diary offline:', error);
    }
  }

  async getDiaryOffline() {
    try {
      return await this.db.diary.toArray();
    } catch (error) {
      console.error('Error getting diary offline:', error);
      return [];
    }
  }

  async deleteDiaryOffline(id) {
    try {
      await this.db.diary.delete(id);
    } catch (error) {
      console.error('Error deleting diary offline:', error);
    }
  }

  // Labor operations
  async saveLaborOffline(task) {
    try {
      await this.db.labor.add(task);
    } catch (error) {
      console.error('Error saving labor offline:', error);
    }
  }

  async getLaborOffline() {
    try {
      return await this.db.labor.toArray();
    } catch (error) {
      console.error('Error getting labor offline:', error);
      return [];
    }
  }

  async deleteLaborOffline(id) {
    try {
      await this.db.labor.delete(id);
    } catch (error) {
      console.error('Error deleting labor offline:', error);
    }
  }

  // Inventory operations
  async saveInventoryOffline(item) {
    try {
      await this.db.inventory.add(item);
    } catch (error) {
      console.error('Error saving inventory offline:', error);
    }
  }

  async getInventoryOffline() {
    try {
      return await this.db.inventory.toArray();
    } catch (error) {
      console.error('Error getting inventory offline:', error);
      return [];
    }
  }

  async deleteInventoryOffline(id) {
    try {
      await this.db.inventory.delete(id);
    } catch (error) {
      console.error('Error deleting inventory offline:', error);
    }
  }

  // Sync data when online
  async syncDataToServer(userEmail, token) {
    if (!this.isOnline()) return;

    try {
      // Sync expenses
      const offlineExpenses = await this.getExpensesOffline();
      if (offlineExpenses.length > 0) {
        await fetch('/api/expenses/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ expenses: offlineExpenses, email: userEmail })
        });
        // Clear offline expenses after sync
        await this.db.expenses.clear();
      }

      // Sync diary
      const offlineDiary = await this.getDiaryOffline();
      if (offlineDiary.length > 0) {
        await fetch('/api/diary/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ diary: offlineDiary, email: userEmail })
        });
        await this.db.diary.clear();
      }

      // Sync labor
      const offlineLabor = await this.getLaborOffline();
      if (offlineLabor.length > 0) {
        await fetch('/api/labor/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ labor: offlineLabor, email: userEmail })
        });
        await this.db.labor.clear();
      }

      // Sync inventory
      const offlineInventory = await this.getInventoryOffline();
      if (offlineInventory.length > 0) {
        await fetch('/api/inventory/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ inventory: offlineInventory, email: userEmail })
        });
        await this.db.inventory.clear();
      }

      console.log('Data synced to server successfully');
    } catch (error) {
      console.error('Error syncing data to server:', error);
    }
  }

  // Load data from server when online
  async loadDataFromServer(userEmail, token) {
    if (!this.isOnline()) return;

    try {
      const response = await fetch(`/api/data/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Data is loaded into state, no need to store locally unless offline
      }
    } catch (error) {
      console.error('Error loading data from server:', error);
    }
  }
}

export default new OfflineStorage();