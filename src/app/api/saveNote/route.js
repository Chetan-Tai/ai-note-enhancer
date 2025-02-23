import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Path to the notes storage file
const NOTES_FILE = path.join(process.cwd(), "notes.json");

// Function to read saved notes
async function getSavedNotes() {
  try {
    const data = await fs.readFile(NOTES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist
  }
}

// Function to write notes to the file
async function saveNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

// **Save a note**
export async function POST(req) {
  try {
    const { note } = await req.json();
    if (!note) {
      return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
    }

    let notes = await getSavedNotes();
    notes.push(note);
    await saveNotes(notes);

    return NextResponse.json({ message: "Note saved successfully!" });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// **Get all saved notes**
export async function GET() {
  try {
    const notes = await getSavedNotes();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

// **Delete a specific note**
export async function DELETE(req) {
  try {
    const { noteIndex } = await req.json(); // Expecting index of note to delete

    let notes = await getSavedNotes();

    if (noteIndex < 0 || noteIndex >= notes.length) {
      return NextResponse.json({ error: "Invalid note index" }, { status: 400 });
    }

    notes.splice(noteIndex, 1); // Remove the note
    await saveNotes(notes); // Save updated notes

    return NextResponse.json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
