"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("summarize");
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [editText, setEditText] = useState("");
  const [editNoteId, setEditNoteId] = useState("");

  // Load saved notes when the page loads
  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch("/api/saveNote"); // Fetch saved notes
        const data = await response.json();
        if (response.ok) {
          setSavedNotes(data.notes || []);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }
    fetchNotes();
  }, []);

  // Process input text using API
  async function handleSubmit() {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/processText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutputText(data.output || "No output received.");
      } else {
        setOutputText("Error processing text: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      setOutputText("Server error. Please try again.");
    }
    setLoading(false);
  }

  let isSaving = false; // Flag to prevent multiple submissions

  async function saveNote() {
    if (!outputText.trim()) return; // Ensure the output text isn't empty

    // If saving is already in progress, return early
    if (isSaving) return;

    isSaving = true; // Set the flag to true indicating a save is in progress

    // Check if the note is already saved (in the state)
    const noteExists = savedNotes.some(note => note.content === outputText);
    if (noteExists) {
      console.log("Note is already saved!");
      isSaving = false; // Reset the flag
      return;
    }

    try {
      const response = await fetch("/api/saveNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: outputText }),
      });

      const data = await response.json();
      if (response.ok) {
        // Add the saved note (with content and ID) to the list
        setSavedNotes((prevNotes) => [
          ...prevNotes,
          { content: outputText, _id: data._id }, // Assuming the response has the _id
        ]);
        console.log(data._id);
        setOutputText("");
      } else {
        console.error("Error saving note:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      isSaving = false; // Reset the flag after the save attempt
    }
  }

  async function updateNote(noteId){
    const response = await fetch("/api/saveNote", {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ noteId, updatedContent: editText }),
    })

    if (response.ok) {
      setSavedNotes((prevNotes) => prevNotes.map((note) => 
        note._id === noteId ? { ...note, content: editText } : note
      )
    );
    setEditNoteId(null);
    }
  }

  const startEditing = (note) => {
    setEditNoteId(note._id);
    setEditText(note.content);
  }

  async function deleteNote(noteId) {
    try {
      const response = await fetch("/api/saveNote", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }), // Send the noteId in the request body
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        // Remove the deleted note from the state
        setSavedNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      } else {
        const errorData = await response.json();
        console.error("Error deleting note:", errorData.error);
      }
    } catch (error) {
      console.error("Network error while deleting note:", error);
    }
  }

  return (
    <main className="p-4 min-h-screen bg-white text-black flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">AI Note Enhancer</h1>
        <textarea
          className="w-full p-2 border border-black rounded"
          rows="10"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text here..."
        ></textarea>
        <div className="flex gap-4 mt-2">
          <select
            className="border border-black p-2 rounded bg-white text-black"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="summarize">Summarize</option>
            <option value="paraphrase">Paraphrase</option>
          </select>
          <button
            className="bg-orange-400 text-white p-2 rounded"
            onClick={handleSubmit}
            disabled={loading || !inputText.trim()}
          >
            {loading ? "Processing..." : "Process"}
          </button>
          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={saveNote}
            disabled={!outputText.trim()}
          >
            Save Note
          </button>
        </div>
        <div className="mt-4 p-2 border border-black rounded">
          <h2 className="font-semibold">Output:</h2>
          <p>{outputText}</p>
        </div>
        <div className="mt-4">
          <h1 className="font-semibold">Saved Notes:</h1>
          {savedNotes.length === 0 ? (
            <p>No notes saved yet.</p>
          ) : (
            <ul>
              {savedNotes.map((note) => (
                <li className="mt-4 p-2 border border-black rounded" key={note._id}>
                  {editNoteId === note._id ? (
                    <>
                      <textarea
                        className="border p-2 w-full"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder={ editText }
                        rows="4"
                      ></textarea>
                      <div className="flex gap-2">
                        <button 
                          className="bg-gray-800 mt-1 p-2 border border-black rounded-xl text-white"
                          onClick={() => updateNote(note._id)}>
                            Update
                        </button>
                        <button 
                          className="bg-gray-400 mt-1 p-2 border border-black rounded-xl text-white"
                          onClick={() => setEditNoteId(null)}>
                            Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{note.content}</p>
                      <div className="flex gap-2">
                        <button
                          className="bg-red-400 mt-1 p-2 border border-black rounded-xl text-white"
                          onClick={() => deleteNote(note._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="bg-blue-400 mt-1 p-2 border border-black rounded-xl text-white"
                          onClick={() => startEditing(note)}
                        >
                          Edit Note
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
