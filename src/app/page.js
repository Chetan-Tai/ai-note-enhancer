"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("summarize");
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);

  // Load saved notes when the page loads
  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch("/api/saveNote"); // Fixed fetch URL
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
        setOutputText(data.output || "No output received."); // Added fallback
      } else {
        setOutputText("Error processing text: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      setOutputText("Server error. Please try again.");
    }
    setLoading(false);
  }

  // Save processed note
  async function saveNote() {
    if (!outputText.trim()) return;

    try {
      const response = await fetch("/api/saveNote", { // Fixed fetch URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: outputText }),
      });

      const data = await response.json();
      if (response.ok) {
        setSavedNotes((prevNotes) => [...prevNotes, outputText]); // Fixed state update
      } else {
        console.error("Error saving note:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function deleteNote(index) {
    try {
      const response = await fetch("/api/saveNote", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteIndex: index }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        setSavedNotes((prevNotes) => prevNotes.filter((_, i) => i !== index));
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
            <option value="paraphrase">Paraphrase</option> {/* Fixed value */}
          </select>
          <button
            className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
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
              {savedNotes.map((note, index) => (
                <li className="mt-4 p-2 border border-black rounded" key={index}>
                  {note}
                  <div>
                  <button 
                    className="bg-red-400 mt-1 p-2 border border-black rounded-xl text-white"
                    onClick={() => deleteNote(index)}>
                      Delete
                  </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}


// "use client";

// import React, { useState, useEffect } from "react";
// import callHuggingFace from "../../src/huggingface.js";

// const Page = () => {
//   const [inputText, setInputText] = useState("");
//   const [outputText, setOutputText] = useState("");
//   const [mode, setMode] = useState("summarize");
//   const [savedNotes, setSavedNotes] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Load notes from local storage on mount
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const notes = JSON.parse(localStorage.getItem("notes")) || [];
//       setSavedNotes(notes);
//     }
//   }, []);

//   // Save notes to local storage
//   const saveNote = () => {
//     if (outputText.trim() === "") return;
//     setSavedNotes((prevNotes) => {
//       const updatedNotes = [...prevNotes, outputText];
//       localStorage.setItem("notes", JSON.stringify(updatedNotes));
//       return updatedNotes;
//     });
//   };

//   const handleSubmit = async () => {
//     if (!inputText.trim()) return;
//     setLoading(true);
//     try {
//       const response = await callHuggingFace(inputText, mode);
//       setOutputText(response);
//     } catch (error) {
//       console.error("Error processing text:", error);
//       setOutputText("Failed to process the text. Please try again.");
//     }
//     setLoading(false);
//   };

//   const deleteNote = (index) => {
//     setSavedNotes((prevNotes) => {
//       const updatedNotes = prevNotes.filter((_, i) => i !== index);
//       localStorage.setItem("notes", JSON.stringify(updatedNotes));
//       return updatedNotes;
//     });
//   };

//   return (
//     <main className="p-4 min-h-screen bg-white text-black flex justify-center">
//       <div className="w-full max-w-3xl"> {/* Centered container with limited width */}
//         <h1 className="text-3xl font-bold mb-4">AI Note Enhancer</h1>
//         <textarea
//           className="w-full p-2 border border-black rounded"
//           rows="10"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           placeholder="Enter your text here..."
//         ></textarea>
//         <div className="flex gap-4 mt-2">
//           <select
//             className="border border-black p-2 rounded bg-white text-black"
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             <option value="summarize" className="text-black">Summarize</option>
//             <option value="rewrite" className="text-black">Reword</option>
//           </select>
//           <button
//             className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
//             onClick={handleSubmit}
//             disabled={loading || !inputText.trim()}
//           >
//             {loading ? "Processing..." : "Process"}
//           </button>
//           <button className="bg-green-500 text-white p-2 rounded" onClick={saveNote}>
//             Save Note
//           </button>
//         </div>
//         <div className="mt-4 p-2 border border-black rounded">
//           <h2 className="font-semibold">Output:</h2>
//           <p>{outputText}</p>
//         </div>
//         <div className="mt-4">
//           <h2 className="font-semibold">Saved Notes:</h2>
//           <ul className="list-disc pl-5">
//             {savedNotes.map((note, index) => (
//               <li key={index} className="border border-black p-2 rounded mt-2 flex justify-between">
//                 {note}
//                 <button className="text-red-500 ml-2" onClick={() => deleteNote(index)}>X</button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </main>
//   );
// };


// export default Page;
