// import { google } from '@ai-sdk/google';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

import { GEMINI_API_KEY } from '$env/static/private';

const google =  createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});

export async function POST({ request }) {
  const { messages } = await request.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: 'Convert a temperature in fahrenheit to celsius',
        parameters: z.object({
          temperature: z
            .number()
            .describe('The temperature in fahrenheit to convert'),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}