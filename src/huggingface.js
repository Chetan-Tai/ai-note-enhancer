require("dotenv").config();
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

async function summarizeText(text) {
    try {
        const result = await hf.summarization({
            model: "facebook/bart-large-cnn",
            inputs: text,
        });
        console.log("Summarization Result:", result);
        return result.summary_text || "Summarization failed.";
    } catch (error) {
        console.error("Error in summarization:", error);
        return "Error: Summarization failed.";
    }
}

async function paraphraseText(text) {
    try {
        const result = await hf.textGeneration({
            model: "humarin/chatgpt_paraphraser_on_T5_base",
            inputs: text,
            parameters: { max_new_tokens: 100 }
        });
        console.log("Paraphrasing Result:", result);
        return result.generated_text || "Paraphrasing failed.";
    } catch (error) {
        console.error("Error in paraphrasing:", error);
        return "Error: Paraphrasing failed.";
    }
}

async function processText(text, mode) {
    if (mode === "summarize") {
        return await summarizeText(text);
    } else if (mode === "paraphrase") {
        return await paraphraseText(text);
    } else {
        return "Error: Invalid mode selected!";
    }
}

async function callHuggingFace(text, mode) {
    try {
        return await processText(text, mode);
    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        return "Error: Failed to process the text. Please try again.";
    }
}

module.exports = { callHuggingFace };
