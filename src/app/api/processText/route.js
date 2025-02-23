import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { text, mode } = await req.json();

        let model;
        if (mode === "summarize") {
            model = "facebook/bart-large-cnn";
        } else if (mode === "paraphrase") {
            model = "humarin/chatgpt_paraphraser_on_T5_base";
        } else {
            throw new Error("Invalid mode");
        }

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              inputs: text,
              parameters: {
                  max_length: 512,   // Allow longer output
                  do_sample: true,    // Make results more varied
                  temperature: 0.7    // Reduce randomness slightly for better coherence
              }
          })
        });      

        const responseText = await response.text();
        console.log("Raw API Response:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            throw new Error("Invalid JSON response from Hugging Face API");
        }

        // Adjust handling based on model response format
        let output;
        if (mode === "summarize" && data[0]?.summary_text) {
            output = data[0].summary_text;
        } else if (mode === "paraphrase" && data[0]?.generated_text) {
            output = data[0].generated_text;
        } else {
            throw new Error("Failed to process text");
        }

        return NextResponse.json({ output }, { status: 200 });

    } catch (error) {
        console.error("Error processing text:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
