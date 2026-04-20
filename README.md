🌾 Farm Management App
<p align="center">
  <img src="src/assets/farm-logo.png" alt="Farm Management Logo" width="250"/>
</p>
                                                                               "Every Farmer's Digital Companion"
<br>-->Farm Management App (KRISHI SATHI)is a simple and user-friendly application designed to help farmers handle their daily farm work more efficiently. Instead of managing everything manually, this app allows farmers to keep track of important activities in one place.

<br>-->With this app, farmers can easily record their expenses, maintain a daily farm diary, manage workers and tasks, and keep an eye on inventory levels. It also provides real-time weather updates, which helps in better planning of farm activities.

<br>-->The goal of this project is to make farm management easier, more organized, and less time-consuming by using technology in a practical way. It is especially useful for farmers who want a simple digital solution without complexity

🌟 Core Farm Management Features:-

1- 📊 Dashboard (Overview): A central screen where farmers can get a quick glance at their farm's status—including total expenses, today's     tasks, and remaining stock.
2- 💰 Expense Tracker: Easily add, edit, and track all farm-related spending (like seeds, fertilizers, and labor costs) to manage the budget effectively.
3- 📖 Farm Diary: A digital logbook to record daily farming activities, such as when crops were watered, what was planted, and how much yield was produced.
4- 👥 Labor Management (Admin-Only): Designed for scale (100+ workers). Owners log attendance, manage advance payments (Khata), and track wages all in one place without needing workers to ever install the app.
5- 📦 Inventory Tracker: Keep track of warehouse supplies (like urea, pesticides, etc.). It also alerts the user when the stock of a specific item is running low.
6- ⛅ Real-Time Weather: Integrates with the OpenWeatherMap API to show live weather updates, helping farmers plan their activities (like watering or harvesting) accordingly.

🛠️ Technical & App Capabilities:-

7- 🌐 Multi-Language Support: To make it accessible to local farmers, the app supports three languages: English, Hindi, and Bengali.
8- 📄 Data Export: Farmers can download and back up their entire farm data in PDF, CSV, or JSON formats (just like your farm_data (2).json file).
9- 🔄 Offline Sync functionality: The app is designed to work even without an internet connection. Data is saved locally on the device and is automatically "bulk synced" to the cloud database (MongoDB) once the internet is back online.
10- 🔐 Secure User Accounts & Roles: Secure registration and login system with Role-Based Access Control (RBAC). 'Admin' (Farm Owners) have full access to finances and settings, while 'Workers' only see their assigned daily tasks.

🛠️ Tech Stack (Short):-

Frontend: React + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB
API: OpenWeatherMap

🔮 Future Roadmap (Upcoming Features):-

11- 🏛️ Government Schemes: A dedicated section to browse local agricultural subsidies, loans, and support programs.
12- 🐄 Livestock Management: Track daily milk production, animal health, vaccination schedules, and feed inventory.
13- 🧪 Soil Health Tracker: Log soil test results (NPK values) to get automated fertilizer and nutrient recommendations.
14- 📈 Live Mandi Prices: Display real-time market prices for crops to help farmers sell at the most profitable rates.
15- 🤖 WhatsApp Bot Integration: Since laborers already use WhatsApp, the app acts as a smart bot. The owner assigns a task in the app -> Bot messages the WhatsApp group -> Worker replies "Done" on WhatsApp -> App automatically marks the task as complete!
16- 🚜 Equipment Rental (Peer-to-Peer): Allow farmers to rent out unused tractors and machinery to neighboring farms.
17- 🛒 Agri-Marketplace: A portal to buy seeds, fertilizers, and farming tools directly from verified wholesale suppliers.
18- 🗺️ GPS Farm Mapping: Visually map out farm boundaries and assign crops or tasks to specific geographic zones.
19- 👩‍🔬 Agronomist Consultation: An in-app chat or video call feature to consult agricultural experts for farming advice.
20- 🤖 AI Crop Disease Detection: Scan crop leaves with the mobile camera to identify diseases and get treatment suggestions.

� Run Locally (Steps):-
Clone project
git clone https://github.com/Biswaranjan456/farm-management.git
cd FarmManagement
Install dependencies
npm install
Start app
npm run dev

👉 Backend should run on: http://localhost:5001

👨‍💻 Author

Built with ❤️ to help farmers with technology.
