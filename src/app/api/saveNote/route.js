import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// MongoDB connection URI
const uri = "mongodb+srv://Chetan-Tai:Sairama$99IsGod@cluster0.iolz3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const database = client.db('notesDB');
    return database.collection('notes');
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

// **Save a note**
export async function POST(req) {
  try {
    const { note } = await req.json();
    if (!note) {
      return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
    }

    // Connect to MongoDB and save the note
    const notesCollection = await connectToDatabase();
    const result = await notesCollection.insertOne({ content: note });
    
    console.log(`New note saved with ID: ${result.insertedId}`);

    return NextResponse.json({ 
      message: "Note saved successfully!", 
      _id: result.insertedId
    });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// **Get all saved notes**
export async function GET() {
  try {
    const notesCollection = await connectToDatabase();
    const notes = await notesCollection.find().toArray();

    // Make sure to include _id with the content
    const notesWithId = notes.map(note => ({
      _id: note._id,  // Include MongoDB ObjectId
      content: note.content
    }));

    return NextResponse.json({ notes: notesWithId });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

// **Update a specific note**
export async function PUT(req) {
  try {
    const { noteId, updatedContent } = await req.json();

    const objectId = new ObjectId(noteId);
    const notesCollection = await connectToDatabase();

    const existingNote = await notesCollection.findOne({ _id: objectId });

    if(!existingNote){
      return new Response(JSON.stringify({ message: "Note not found" }), { status: 404 });
    }

    if(existingNote.content === updatedContent){
      return new Response(JSON.stringify({ message: "No changes detected" }), {status: 200});
    }

    const result = await notesCollection.updateOne(
      { _id: objectId },
      { $set: { content: updatedContent } }
    );

    return NextResponse.json("Notes updated successfully");
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

// **Delete a specific note**
export async function DELETE(req) {
  try {
    const { noteId } = await req.json(); // Expecting the note ID to delete

    // Ensure that noteId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }
    const objectId = new ObjectId(noteId);

    const notesCollection = await connectToDatabase();

    // Perform the deletion using the ObjectId
    const result = await notesCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 400 });
    }

    return NextResponse.json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
