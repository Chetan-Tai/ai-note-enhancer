const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://Chetan-Tai:Sairama$99IsGod@cluster0.iolz3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    // Use your database here
    const database = client.db("your_database_name"); // Replace with your actual database name
    // Perform database operations here

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    // Ensure the client closes after the operation
    await client.close();
  }
}

// Run the function to connect to the database
connectToDatabase().catch(console.error);
