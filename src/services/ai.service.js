import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '#config/env.js'

const MODEL = 'gemini-3.5-flash-lite'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

/**
 * Helper to fetch a remote image and format it for Gemini's vision API
 * @param {string} url - The URL of the image (e.g., Cloudinary)
 */
async function urlToGenerativePart(url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType: response.headers.get('content-type') || 'image/jpeg'
        }
    }
}

/**
 * Transcribes handwritten lab notes from image URLs using Gemini vision.
 * @param {string[]} photoUrls - Array of URLs of the uploaded images
 * @param {string|null} editInstructions - Optional user edit instructions
 * @returns {Promise<string>} - The raw text transcript
 */
export const transcribeImage = async (photoUrls, editInstructions) => {
    const model = genAI.getGenerativeModel({ model: MODEL })
    
    const imageParts = await Promise.all(photoUrls.map(url => urlToGenerativePart(url)));
    const prompt = `
You are a professional lab assistant. Read the handwritten notes in the provided image(s) and produce a highly accurate raw text transcript.

TRANSCRIPTION RULES:
1. Transcribe exactly what is written — do not correct, normalize, or "fix" spelling, grammar, units, or apparent scientific/calculation errors. Preserve numbers, units, and chemical notation (subscripts, superscripts, arrows, degree symbols, etc.) exactly as written.
2. Preserve the original structure as closely as plain text allows — keep tables as rows/columns, keep values aligned with their labels, preserve line breaks and section groupings as they appear on the page.
3. If a word, digit, or symbol is ambiguous or smudged, flag it inline as [UNSURE: your best reading]. If it's fully illegible, use [UNSURE: illegible].
4. If text is crossed out and replaced, transcribe the final (uncrossed) value, and note the crossed-out value as [CROSSED OUT: text] immediately after it.
5. If the notes include a diagram, sketch, or drawn graph, do not attempt to transcribe it — insert a placeholder describing it, e.g. [DIAGRAM: setup sketch showing beaker and burette].
6. If multiple images are provided, transcribe them in the order given and mark the start of each with a page label, e.g. [PAGE 1].
7. Do not add any information not present in the notes, and do not summarize — this must be a full verbatim transcript, not a paraphrase.
8. Return only the transcript. No commentary, no explanation of your process.
9. If the user explicitly ask for improvement to any part you can, but you can't generate any part, you can only improve, modify, or add to an existing part, the user edit instruction is below, if NULL or UNDEFINED, it means the user did not specify anything and just continue with the transcription

USER EDIT INSTRUCTION
${editInstructions ?? 'None'}
`

    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    return response.text()
}

/**
 * Maps a raw transcript into structured JSON based on the template type.
 * @param {string} transcript - The raw text transcript
 * @param {string} template - The report template (e.g., 'titration')
 * @returns {Promise<string>} - The JSON string
 */
export const structureTranscript = async (transcript, template) => {
    const model = genAI.getGenerativeModel({ model: MODEL })
    
    const prompt = `
You are a professional data structuring assistant for a chemistry lab.
You will be given a raw transcript of handwritten lab notes. Extract the data and map it into the exact JSON structure below for a "${template}" report.

OUTPUT FORMAT (return exactly this shape, valid JSON, no trailing commas):
{
  "title": "string",
  "aim": "string"
  "introduction": "string",
  "materials": {
    "apparatus": ["string"],
    "reagents": ["string"]
  },
  "procedures": "string",
  "results": {
    "raw_data": "object for key-value pairs, or array for tabular rows — see rules",
    "tables": ["string"]
  },
  "observations": ["string"],
  "questions": [
    { "question": "string", "answer": "string" }
  ],
  "precautions": ["string"],
  "discussion": "string",
  "conclusion": "string"
}

FIELD RULES:
1. title / aim / objective — state as written in the notes.
2. introduction — combine preamble and theory into ONE brief, plain-language paragraph. Keep it short; do not pad it.
3. materials — split into apparatus and reagents exactly as listed.
4. procedures — write as a single paragraph (not numbered steps), in passive/third-person voice (e.g. "The solution was heated to 60°C," not "I heated the solution").
5. results — this is the most important section; do not treat it as an afterthought.
   - Use "raw_data" as a JSON object (key-value pairs) if the notes record standalone readings/measurements.
   - Use "raw_data" as a JSON array of row-objects if the notes contain tabular data.
   - Use "tables" only for tables that don't fit a clean raw_data structure (e.g. narrative tables) — represent each as a formatted string.
6. observations — extract only what's written. Do not invent plausible observations if none are present (see rule 9).
7. questions — extract each question with its answer from the notes.
8. precautions — extract as listed.
9. discussion / conclusion — summarize/extract only what the notes support. Do not invent a conclusion the notes don't contain (see rule 9).

DATA INTEGRITY RULES:
9. Never fabricate content. If a field or section is entirely absent from the notes, output "[MISSING]" for that field. This applies to every field, including conclusion and observations — do not generate plausible-sounding content to fill gaps (except it is explicitly specified in this prompt).
10. If the transcript contains a "[UNSURE: text]" tag, preserve it exactly in the output value.
11. If you are uncertain how to read a word or value yourself (e.g. illegible handwriting), do not guess silently — wrap your best-effort reading as "[UNSURE: your reading]" so a human can verify it.
12. Do not omit or downplay raw data — numeric/tabular results are as important as narrative sections like discussion or conclusion.

OUTPUT RULES:
13. Return ONLY raw JSON — no markdown code fences, no commentary before or after.
14. Before returning, mentally verify the JSON is syntactically valid (matched braces/brackets, no trailing commas, all keys quoted).
15. The order of each element in JSON object should be as in the example no one should come before the other.

RAW TRANSCRIPT:
${transcript}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}