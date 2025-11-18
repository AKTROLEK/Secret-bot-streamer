import OpenAI from 'openai';
import config from '../../config/index.js';

let openai = null;

// Initialize OpenAI client
if (config.openai.apiKey) {
  openai = new OpenAI({
    apiKey: config.openai.apiKey,
  });
}

/**
 * Generate AI-powered content suggestions
 */
export async function generateContentSuggestions(streamerData, platform) {
  if (!openai) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `As a streaming content advisor, analyze this streamer's data and provide 3 specific content improvement suggestions:

Platform: ${platform}
Total Videos: ${streamerData.totalVideos}
Total Streams: ${streamerData.totalStreams}
Streaming Hours: ${streamerData.totalStreamingHours}
Rating: ${streamerData.rating}/100

Provide actionable, specific suggestions to improve their content and engagement.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert streaming content advisor.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return {
      suggestions: response.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Error generating content suggestions:', error.message);
    return { error: 'Failed to generate suggestions' };
  }
}

/**
 * Generate video title suggestions
 */
export async function generateTitleSuggestions(topic, platform) {
  if (!openai) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `Generate 5 catchy, engaging video titles for ${platform} about: ${topic}

Requirements:
- Eye-catching and click-worthy
- SEO-friendly
- Platform-appropriate
- Include relevant keywords
- Maximum 60 characters each`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert at creating viral video titles.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const titles = response.choices[0].message.content.trim().split('\n').filter(t => t.trim());
    return { titles };
  } catch (error) {
    console.error('Error generating title suggestions:', error.message);
    return { error: 'Failed to generate titles' };
  }
}

/**
 * Analyze content quality
 */
export async function analyzeContentQuality(contentDescription) {
  if (!openai) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `Analyze this content and provide a quality score (0-100) and brief feedback:

Content: ${contentDescription}

Provide:
1. Quality Score (0-100)
2. Strengths (2-3 points)
3. Areas for Improvement (2-3 points)
4. Overall Assessment (1 sentence)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a content quality analyst for streaming platforms.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    return {
      analysis: response.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Error analyzing content quality:', error.message);
    return { error: 'Failed to analyze content' };
  }
}

/**
 * Get optimal streaming time suggestions
 */
export async function getOptimalStreamingTime(streamerData, platform) {
  if (!openai) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `Based on this streamer's data, suggest the best day and time to stream on ${platform}:

Current Stats:
- Average viewers: ${streamerData.avgViewers || 'Unknown'}
- Best performing day: ${streamerData.bestDay || 'Unknown'}
- Timezone: ${streamerData.timezone || 'UTC'}
- Content type: ${streamerData.contentType || 'Gaming'}

Provide specific day and time recommendations with reasoning.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a streaming analytics expert.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });

    return {
      recommendation: response.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Error getting streaming time suggestions:', error.message);
    return { error: 'Failed to get recommendations' };
  }
}

/**
 * Detect potential rule violations
 */
export async function detectRuleViolations(contentText) {
  if (!openai) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `Review this content for potential rule violations:

Content: ${contentText}

Check for:
- Inappropriate language
- Spam or misleading content
- Copyright concerns
- Community guideline violations

Provide a risk assessment (Low/Medium/High) and explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a content moderation assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return {
      assessment: response.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Error detecting rule violations:', error.message);
    return { error: 'Failed to detect violations' };
  }
}

export default {
  generateContentSuggestions,
  generateTitleSuggestions,
  analyzeContentQuality,
  getOptimalStreamingTime,
  detectRuleViolations,
};
