import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

export async function getMysteryWords() {
  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `We are playing a game called Just One where one word is selected to be the mystery word. One player is selected to guess this word and others are asked to provide a one-word hint.`,
        },
        { role: "user", content: `Provide 13 random interesting words for the team to use as the mystery word. All lowercase and no punctuation. Words should be separated by comma.` },
      ],
      stream: false,
    });

    return gptResponse.data?.choices?.[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function getHint(word: string, person: string) {
  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are role-playing ${person}. You know how they write and speak. From this, infer how they would think to reply to user prompt. Do no use punctuation and reply in lowercase.`,
        },
        { role: "user", content: `Give a one-word hint for the word: ${word}` },
      ],
      stream: false,
    });

    return gptResponse.data?.choices?.[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function getGuess(hints: string, person: string) {
  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are role-playing ${person}. You know how they write and speak. From this, infer how they would think to reply to user prompt. Use only lowercase and no punctuation.`,
        },
        { role: "user", content: `We are playing a game where you have to guess a word. Each player has given you a hint to help you out. The hints are (separated by comma): ${hints}. Can you make a guess? Reply with only one word.` },
      ],
      stream: false,
    });

    return gptResponse.data?.choices?.[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function audiHints(hints: string) {
  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You will be given a list of array in the format of "apple,Apple,airplane,air-plane,fan,drink". Remove words that are the same regardless of spelling mistake, typos or use of hyphen. In this example; you will return "fan,drink" and remove "apple,Apple,airplaneair-plane" as these words appear more than once in different forms.`,
        },
        { role: "user", content: `${hints}`},
      ],
      stream: false,
    });

    return gptResponse.data?.choices?.[0]?.message?.content;
  } catch (error) {
    console.log(error);
    return {};
  }
}

