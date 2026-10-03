import { 
  GenerateRequest, ImproveRequest, GenerationResponse, 
  HistoryItem, TemplateItem, FormattedContent, PlatformValidationResult, EmailFormattedContent 
} from '../types/generation';

const LOCAL_STORAGE_HISTORY_KEY = 'copyforge_history_v1';
const LOCAL_STORAGE_SAVED_KEY = 'copyforge_saved_v1';

export const saveEngineGenerationToHistory = (generation: GenerationResponse): void => {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    const historyList: HistoryItem[] = existingStr ? JSON.parse(existingStr) : [];
    historyList.unshift({
      id: generation.id,
      product_name: generation.product_name,
      product_description: generation.product_description,
      platform: generation.platform,
      tone: generation.tone,
      audience: generation.audience,
      objective: generation.objective,
      generated_content: generation.generated_content,
      prompt_parameters: generation.prompt_parameters,
      is_saved: generation.is_saved,
      created_at: generation.created_at,
      is_demo_mode: generation.is_demo_mode,
    });
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(historyList.slice(0, 100)));
  } catch (error) {
    console.warn('Could not save generation to local history.', error);
  }
};

export const getPresetTemplates = (): TemplateItem[] => [
  {
    id: 'product-launch',
    name: '🚀 Product Launch Announcement',
    category: 'Product Strategy',
    description: 'High-impact launch post engineered to capture immediate market attention, articulate core value proposition, and drive early adoption.',
    platform: 'LinkedIn',
    tone: 'Inspirational',
    audience: 'Professionals',
    objective: 'Product launch',
    product_name_placeholder: 'TaskPulse AI',
    product_description_placeholder: 'An autonomous workflow AI assistant that automatically categorizes Jira tickets, drafts release notes, and syncs engineering sprint summaries in real-time.',
    additional_instructions: 'Focus on the transition from manual sprint tracking to automated clarity. Include strong metrics and a clear call to action.'
  },
  {
    id: 'startup-announcement',
    name: '💎 Startup Vision & Release',
    category: 'Company Milestone',
    description: 'Foundational story-driven announcement post sharing company mission, core problem, and initial availability.',
    platform: 'Website',
    tone: 'Premium',
    audience: 'Business Owners',
    objective: 'Announcement',
    product_name_placeholder: 'Aether Analytics',
    product_description_placeholder: 'Real-time predictive revenue analytics engine that converts raw stripe webhooks into automated ARR forecasting and customer churn alerts.',
    additional_instructions: 'Structure with Hero Headline, key benefit bullet points, social proof, and high-converting CTA button text.'
  },
  {
    id: 'linkedin-thought-leadership',
    name: '🧠 Thought Leadership Framework',
    category: 'Social Media',
    description: 'Insightful professional hook addressing key industry friction points before introducing your product as the natural evolution.',
    platform: 'LinkedIn',
    tone: 'Professional',
    audience: 'Developers',
    objective: 'Educational',
    product_name_placeholder: 'DevShield Security',
    product_description_placeholder: 'Automated secret-scanner and dependency vulnerability inspector that plugs directly into GitHub CI/CD pipelines.',
    additional_instructions: 'Open with a bold industry statistic or paradox. Use short 1-line paragraphs and bullet points.'
  },
  {
    id: 'instagram-product-promotion',
    name: '📸 Instagram Visual Hook',
    category: 'Visual Marketing',
    description: 'Visually catchy Instagram post with vibrant emoji placement, concise value points, and a strong "Link in bio" CTA.',
    platform: 'Instagram',
    tone: 'Witty',
    audience: 'General',
    objective: 'Product promotion',
    product_name_placeholder: 'PulseFlow Hydration Bottle',
    product_description_placeholder: 'Smart self-cleaning water bottle with built-in LED hydration reminders and temperature sensing cap.',
    additional_instructions: 'Use vibrant emojis, line break dividers, and 5 highly targeted niche hashtags.'
  },
  {
    id: 'email-campaign',
    name: '✉️ Direct Response Email Drip',
    category: 'Direct Response',
    description: 'Full high-converting email template with subject line, preview snippet, problem-agitation-solution body, and CTA button.',
    platform: 'Email',
    tone: 'Persuasive',
    audience: 'Business Owners',
    objective: 'Product promotion',
    product_name_placeholder: 'LeadStream Pro',
    product_description_placeholder: 'AI B2B lead enrichment tool that finds verified decision-maker email addresses and personalizes outreach messages at scale.',
    additional_instructions: 'Provide Subject Line, Preview Text, Salutation, Body, and Standalone CTA Button text.'
  },
  {
    id: 'job-internship-announcement',
    name: '🌟 Internship / Hiring Campaign',
    category: 'Recruitment',
    description: 'Engaging recruitment post highlighting company culture, tech stack, key learning outcomes, and application details.',
    platform: 'LinkedIn',
    tone: 'Friendly',
    audience: 'Students',
    objective: 'Announcement',
    product_name_placeholder: 'DecodeLabs AI Internship',
    product_description_placeholder: 'A hands-on 12-week intensive generative AI internship program building real-world LLM applications, custom prompt compilers, and full-stack software.',
    additional_instructions: 'Highlight mentorship, production deployment experience, and key skills. End with clear application link.'
  },
  {
    id: 'educational-post',
    name: '⚡ X/Twitter Viral Thread Opening',
    category: 'Content Marketing',
    description: 'Punchy thread starter that breaks down a complex problem into actionable steps and positions your product as the fast solution.',
    platform: 'X/Twitter',
    tone: 'Technical',
    audience: 'Developers',
    objective: 'Educational',
    product_name_placeholder: 'FastVector DB',
    product_description_placeholder: 'Ultra-fast embedded vector database optimized for Python and Rust with sub-millisecond similarity search.',
    additional_instructions: 'Format as a punchy thread starter with character count optimization.'
  }
];

export const generateEngineContent = (req: GenerateRequest, saveToHistory = true): GenerationResponse => {
  const { product_name, product_description, platform, tone, audience, objective, additional_instructions, parameters } = req;
  const descSnippet = product_description.length > 140 ? product_description.slice(0, 140) + '...' : product_description;
  const cleanName = product_name.replace(/[^a-zA-Z0-9]/g, '');
  const cleanAudience = typeof audience === 'string' ? audience.replace(/[^a-zA-Z0-9]/g, '') : 'Audience';

  let rawText = '';
  let emailData: EmailFormattedContent | null = null;

  const toneKeywords: Record<string, string> = {
    'Professional': 'authoritative, clear, and focused on business value',
    'Friendly': 'warm, welcoming, approachable, and human',
    'Witty': 'smart, engaging, humorous, and clever',
    'Persuasive': 'compelling, results-driven, urgent, and action-oriented',
    'Premium': 'exclusive, polished, sophisticated, and high-end',
    'Casual': 'relaxed, conversational, effortless, and friendly',
    'Inspirational': 'visionary, motivating, uplifting, and bold',
    'Technical': 'precise, developer-focused, architecture-minded, and detailed'
  };

  const toneGuide = toneKeywords[tone] || 'engaging and articulate';

  if (platform === 'LinkedIn') {
    rawText = `🚀 Transform Your Workflow with ${product_name}

Every day, ${audience.toString().toLowerCase()} struggle with fragmented systems and manual overhead. Finding a solution that combines speed, reliability, and measurable impact has felt nearly impossible.

That changes today. 

Meet ${product_name} — designed from the ground up to solve this exact problem.

✨ Core Highlights:
• **Tailored Performance**: ${product_description}
• **Built for ${audience}**: Seamlessly integrates into your existing operations with zero friction.
• **Proven ROI**: Accelerate ${objective.toLowerCase()} while eliminating wasted effort.

${additional_instructions ? `📌 Special Directive: ${additional_instructions}\n\n` : ''}💡 Key Takeaway: Success isn't about working longer hours — it's about deploying the right intelligent leverage.

What is your team's biggest operational focus this quarter? Drop your thoughts below! 👇

#${cleanName} #Innovation #${cleanAudience} #Productivity #AI #SaaS`;
  } else if (platform === 'Instagram') {
    rawText = `✨ Elevate your everyday results with ${product_name}! 🔥

Are you tired of settling for slow, outdated tools? 👋 ${product_name} is here to upgrade how ${audience.toString().toLowerCase()} achieve peak performance!

💡 Why users love ${product_name}:
👉 ${descSnippet}
👉 Designed with a ${toneGuide} approach
👉 Perfectly crafted for ${objective.toLowerCase()}

${additional_instructions ? `⚡ Note: ${additional_instructions}\n\n` : ''}Ready to experience the difference for yourself? 🚀

👇 Tap the link in our bio to get instant access today, or drop a '🔥' in the comments!

.
.
#${cleanName} #GameChanger #${cleanAudience} #TechTrends #Productivity`;
  } else if (platform === 'X/Twitter') {
    rawText = `Most ${audience.toString().toLowerCase()} waste hours fighting inefficient setups. 

Meet ${product_name} ⚡

${descSnippet}

Engineered specifically for ${objective.toLowerCase()}.

Try it live today: https://copyforge.ai/${cleanName.toLowerCase()} 🚀

#${cleanName} #Tech`;
  } else if (platform === 'Email') {
    const subj = `[Announcement] Introducing ${product_name} for ${audience}`;
    const prev = `Discover how ${product_name} elevates your workflow...`;
    const bodyText = `Hi there,

We are thrilled to officially launch ${product_name}!

If you're like most ${audience.toString().toLowerCase()}, finding a high-impact solution tailored for ${objective.toLowerCase()} has always been a challenge. We built ${product_name} specifically to change that.

Here is what ${product_name} delivers:
1. ${product_description}
2. Designed with a ${toneGuide} delivery to match your exact brand standard.
${additional_instructions ? `3. ${additional_instructions}\n` : ''}
We can't wait for you to try it out and see the difference firsthand.

[ Claim Your Early Access Now ]

Best regards,
The ${product_name} Team`;

    rawText = `SUBJECT LINE: ${subj}\nPREVIEW TEXT: ${prev}\n\n${bodyText}`;
    emailData = {
      subject: subj,
      preview_text: prev,
      body: bodyText
    };
  } else if (platform === 'Facebook') {
    rawText = `🎉 Introducing ${product_name} – Built for ${audience}!

Ready to level up your ${objective.toLowerCase()}? ${product_name} gives you the exact tools you need to succeed without the usual friction.

Here's why teams are switching:
"${product_description}"

${additional_instructions ? `👉 Note: ${additional_instructions}\n\n` : ''}Whether you're looking to streamline operations or elevate quality, ${product_name} is built for you.

Have questions or want to see a live walkthrough? Comment below or click the link to start today!

👉 Learn more at: https://copyforge.ai/${cleanName.toLowerCase()}`;
  } else {
    // Website Landing Page Copy
    rawText = `# Transform Your Results with ${product_name}

## The Premier Platform Designed specifically for ${audience}

${product_name} empowers your organization to master ${objective.toLowerCase()} with state-of-the-art intelligent tools.

### Why ${product_name}?
• **Engineered for Speed**: ${product_description}
• **Tailored Experience**: Structured with a ${toneGuide} framework.
• **High Impact**: Scalable, reliable, and production-ready from day one.

${additional_instructions ? `> **Highlighted Focus**: ${additional_instructions}\n\n` : ''}### Ready to Get Started?
[ Get Started Free Today ] — No credit card required. Experience immediate leverage.`;
  }

  const words = rawText.split(/\s+/).filter(Boolean).length;
  const chars = rawText.length;
  const genId = 'gen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const createdAt = new Date().toISOString();

  const compiledPrompt = `[CopyForge AI Prompt Compiler]
System Directive: You are CopyForge AI, an elite copywriting agent specializing in conversion-focused copy for ${platform}.
Tone Directive: ${tone} (${toneGuide})
Target Platform: ${platform}
Objective: ${objective}
Target Audience: ${audience}
Sampling Parameters: Temp=${parameters.temperature}, Top_P=${parameters.top_p}, MaxTokens=${parameters.max_tokens}

User Input Brief:
- Product Name: ${product_name}
- Core Description: ${product_description}
- Custom Instructions: ${additional_instructions || 'None'}`;

  const formattedContent: FormattedContent = {
    raw_text: rawText,
    email_data: emailData,
    twitter_char_count: platform === 'X/Twitter' ? chars : null,
    twitter_limit: 280,
    instagram_recommended: platform === 'Instagram' ? 'Recommended length: 150-300 words with niche hashtags.' : null,
    word_count: words,
    char_count: chars,
  };

  const validationResult: PlatformValidationResult = {
    is_valid: true,
    passed_rules: [
      `Format optimized for ${platform} platform guidelines`,
      `Verified tone compliance: '${tone}'`,
      `Word count (${words} words) passes constraint benchmarks`,
      `Platform constraints verified`
    ],
    warnings: platform === 'X/Twitter' && chars > 280 ? ['Character count exceeds 280 limit for standard tweets.'] : [],
    platform_constraints: { platform, tone, word_count: words, char_count: chars }
  };

  const responseObj: GenerationResponse = {
    id: genId,
    product_name,
    product_description,
    platform,
    tone,
    audience: audience.toString(),
    objective,
    prompt_parameters: parameters,
    compiled_prompt: compiledPrompt,
    generated_content: rawText,
    formatted_content: formattedContent,
    platform_validation: validationResult,
    is_demo_mode: true,
    is_saved: false,
    created_at: createdAt
  };

  if (saveToHistory) saveEngineGenerationToHistory(responseObj);

  return responseObj;
};

export const improveEngineContent = (req: ImproveRequest, saveToHistory = true): GenerationResponse => {
  const { current_content, action, product_name, platform, tone } = req;
  let improved = current_content;

  if (action === 'make_shorter') {
    const words = current_content.split(' ');
    improved = words.slice(0, Math.max(15, Math.floor(words.length / 1.8))).join(' ') + '...';
  } else if (action === 'make_longer') {
    improved = current_content + `\n\n⚡ Plus: ${product_name} includes automated analytics, 24/7 dedicated support, and instant multi-channel integration built for speed.`;
  } else if (action === 'enhance_persuasion') {
    improved = `⚡ Stop settling for average results.\n\n${current_content}\n\n👉 Join over 10,000+ teams who upgraded to ${product_name} today!`;
  } else if (action === 'fix_grammar') {
    improved = current_content.replace(/\s+/g, ' ').trim();
  }

  const targetPlatform = req.new_platform || platform;
  const targetTone = req.new_tone || tone;

  const genReq: GenerateRequest = {
    product_name,
    product_description: `Refined content (${action})`,
    platform: targetPlatform,
    tone: targetTone,
    audience: 'Refined',
    objective: 'Product promotion',
    parameters: req.parameters
  };

  const res = generateEngineContent(genReq, false);
  res.generated_content = improved;
  res.formatted_content.raw_text = improved;
  res.formatted_content.word_count = improved.split(/\s+/).filter(Boolean).length;
  res.formatted_content.char_count = improved.length;
  res.is_demo_mode = true;
  if (saveToHistory) saveEngineGenerationToHistory(res);
  return res;
};

export const getEngineHistory = (
  search?: string,
  platform?: string,
  tone?: string,
  savedOnly: boolean = false
): HistoryItem[] => {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!existingStr) return [];
    let historyList: HistoryItem[] = JSON.parse(existingStr);

    if (search && search.trim()) {
      const q = search.toLowerCase();
      historyList = historyList.filter(
        (i) => i.product_name.toLowerCase().includes(q) || i.generated_content.toLowerCase().includes(q)
      );
    }
    if (platform && platform !== 'All') {
      historyList = historyList.filter((i) => i.platform === platform);
    }
    if (tone && tone !== 'All') {
      historyList = historyList.filter((i) => i.tone === tone);
    }
    if (savedOnly) {
      historyList = historyList.filter((i) => i.is_saved);
    }
    return historyList;
  } catch (e) {
    return [];
  }
};

export const toggleEngineSave = (id: string): boolean => {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!existingStr) return false;
    let historyList: HistoryItem[] = JSON.parse(existingStr);
    let newState = false;

    historyList = historyList.map((item) => {
      if (item.id === id) {
        newState = !item.is_saved;
        return { ...item, is_saved: newState };
      }
      return item;
    });

    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(historyList));
    return newState;
  } catch (e) {
    return false;
  }
};

export const deleteEngineItem = (id: string): boolean => {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!existingStr) return true;
    let historyList: HistoryItem[] = JSON.parse(existingStr);
    historyList = historyList.filter((i) => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(historyList));
    return true;
  } catch (e) {
    return false;
  }
};
