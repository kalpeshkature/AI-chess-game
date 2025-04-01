import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import type { Chess } from 'chess.js';
import type { LLMProvider } from '../types';

const SYSTEM_PROMPT = `You are a chess engine. Given a chess position in FEN notation, suggest the best move for the current player. You must respond with EXACTLY two squares in the format 'e2e4' or 'g8f6' (source square followed by target square). No other text or explanation is allowed.`;

export async function getLLMMove(
  game: Chess,
  provider: LLMProvider,
  apiKey: string
): Promise<string | null> {
  if (!provider || !apiKey) return null;

  const position = game.fen();
  const currentTurn = game.turn() === 'w' ? 'white' : 'black';
  const legalMoves = game.moves({ verbose: true });
  
  const prompt = `Current position FEN: ${position}
Available legal moves: ${legalMoves.map(m => `${m.from}${m.to}`).join(', ')}
Provide the best move for ${currentTurn} in the format 'e2e4'.`;

  try {
    let moveText: string | null = null;

    switch (provider) {
      case 'gemini': {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8,
          }
        });
        
        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'e2e4' }] },
            { role: 'user', parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8,
          }
        });

        if (!result.response.text) {
          throw new Error('Empty response from Gemini');
        }

        moveText = result.response.text.trim();
        break;
      }
      case 'gpt': {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 10
        });
        moveText = completion.choices[0].message.content?.trim() || null;
        break;
      }
      default:
        return null;
    }

    // Validate move format (e.g., "e2e4", "g8f6")
    if (moveText && /^[a-h][1-8][a-h][1-8]$/.test(moveText)) {
      const from = moveText.substring(0, 2);
      const to = moveText.substring(2, 4);
      
      // Verify if it's a legal move
      if (legalMoves.some(m => m.from === from && m.to === to)) {
        return moveText;
      }
    }

    console.error('Invalid move format received from LLM:', moveText);
    return null;
  } catch (error) {
    console.error('Error getting LLM move:', error);
    return null;
  }
}