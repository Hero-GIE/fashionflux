🧰 Tools & Technologies Used

MongoDB Atlas – Cloud database for storing data.

Node.js – Backend runtime environment.

Express.js – Web framework for building RESTful APIs.

JavaScript (ES6) – Main programming language for both frontend and backend.

.

🚀 Running the System

This project consists of two parts:

Frontend – Built using a modern JavaScript framework with Vite.

Backend – Built with Node.js and Express, connected to MongoDB Atlas.

Both need to be running for the system to work properly.

🧩 Step 1: Start the Backend

Open a terminal and navigate to the backend folder:

cd backend

Run the development server:

npm run dev

You should see output similar to:

[nodemon] starting `node index.js`
🚀 Server running on port 8000
📁 Upload directory: C:\Users\frank\Downloads\fashionflux\backend\uploads
🌍 Environment: development
✅ MongoDB connected

⚠️ Ignore warnings about useNewUrlParser and useUnifiedTopology; these are deprecated options and can safely be removed in the future.

🎨 Step 2: Start the Frontend

Open a new terminal (keep the backend running).

Navigate to the frontend folder:

cd frontend

Run the frontend server:

npm run dev

You’ll see something like:

VITE v7.1.9 ready in 4797 ms

➜ Local: http://localhost:5173/
➜ Network: use --host to expose
➜ press h + enter to show help

Open your browser and go to:

http://localhost:5173/

The frontend will now connect to the backend API running on port 8000.
