require("dotenv").config();
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

async function testSummarization() {
    try {
        const result = await hf.summarization({
            model: "facebook/bart-large-cnn",
            inputs: "Artificial intelligence (AI) has rapidly become an integral part of modern life, influencing industries ranging from healthcare and finance to transportation and entertainment. By leveraging machine learning algorithms and vast amounts of data, AI can identify patterns, make predictions, and automate complex tasks that were once exclusively performed by humans. In healthcare, AI assists in diagnosing diseases, personalizing treatment plans, and even predicting potential outbreaks. Financial institutions rely on AI for fraud detection, risk assessment, and automated trading. Meanwhile, autonomous vehicles and smart traffic systems are revolutionizing transportation by improving safety and efficiency. However, despite its numerous benefits, AI also raises ethical concerns, such as data privacy, bias in decision-making, and the impact on employment as automation continues to replace traditional jobs. As AI technology advances, it is crucial to strike a balance between innovation and responsible usage to ensure that its development benefits society as a whole.",
        });
        console.log("Summarization Output:", result);
    } catch (error) {
        console.error("Summarization Error:", error);
    }
}

async function testParaphrasing() {
    try {
        const result = await hf.textGeneration({
            model: "humarin/chatgpt_paraphraser_on_T5_base",
            inputs: "Artificial intelligence (AI) has rapidly become an integral part of modern life, influencing industries ranging from healthcare and finance to transportation and entertainment. By leveraging machine learning algorithms and vast amounts of data, AI can identify patterns, make predictions, and automate complex tasks that were once exclusively performed by humans. In healthcare, AI assists in diagnosing diseases, personalizing treatment plans, and even predicting potential outbreaks. Financial institutions rely on AI for fraud detection, risk assessment, and automated trading. Meanwhile, autonomous vehicles and smart traffic systems are revolutionizing transportation by improving safety and efficiency. However, despite its numerous benefits, AI also raises ethical concerns, such as data privacy, bias in decision-making, and the impact on employment as automation continues to replace traditional jobs. As AI technology advances, it is crucial to strike a balance between innovation and responsible usage to ensure that its development benefits society as a whole.",
            parameters: { max_new_tokens: 200 },
        });

        console.log("Paraphrased Output:", result.generated_text);
    } catch (error) {
        console.error("Paraphrasing Error:", error);
    }
}

testSummarization();
testParaphrasing();
