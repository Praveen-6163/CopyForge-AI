import { 
  GenerateRequest, ImproveRequest, GenerationResponse, 
  HistoryItem, TemplateItem, FormattedContent, PlatformValidationResult, EmailFormattedContent 
} from '../types/generation';

const LOCAL_STORAGE_HISTORY_KEY = 'copyforge_history_v1';

export const getPresetTemplatesFallback = (): TemplateItem[] => [
  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'Product Strategy',
    description: 'High-energy announcement post designed to build immediate momentum and drive initial try-outs.',
    platform: 'LinkedIn',
    tone: 'Inspirational',
    audience: 'Professionals',
    objective: 'Product launch',
    product_name_placeholder: 'TaskPulse AI',
    product_description_placeholder: 'An autonomous workflow AI assistant that automatically categorizes Jira tickets, drafts release notes, and syncs engineering sprint summaries in real-time.',
    additional_instructions: 'Focus on the transition from manual sprint tracking to automated clarity. Include a strong call to action.'
  },
  {
    id: 'startup-announcement',
    name: 'Startup Announcement',
    category: 'Company Milestone',
    description: 'Foundational story post sharing company vision, problem statement, and launch announcement.',
    platform: 'Website',
    tone: 'Premium',
    audience: 'Business Owners',
    objective: 'Announcement',
    product_name_placeholder: 'Aether Analytics',
    product_description_placeholder: 'Real-time predictive revenue analytics engine that converts raw stripe webhooks into automated ARR forecasting and customer churn alerts.',
    additional_instructions: 'Structure with Hero Headline, key benefit bullet points, and high-converting CTA.'
  },
  {
    id: 'linkedin-thought-leadership',
    name: 'LinkedIn Thought Leadership',
    category: 'Social Media',
    description: 'Insightful professional framework addressing key industry friction points before introducing the product.',
    platform: 'LinkedIn',
    tone: 'Professional',
    audience: 'Developers',
    objective: 'Educational',
    product_name_placeholder: 'DevShield Security',
    product_description_placeholder: 'Automated secret-scanner and dependency vulnerability inspector that plugs directly into GitHub CI/CD pipelines.',
    additional_instructions: 'Open with a bold myth or statistic. Use short 1-line paragraphs and bullet points.'
  },
  {
    id: 'instagram-product-promotion',
    name: 'Instagram Product Promotion',
    category: 'Visual Marketing',
    description: 'Visually catchy Instagram post with vibrant emoji styling, clear benefit list, and "Link in bio" CTA.',
    platform: 'Instagram',
    tone: 'Witty',
    audience: 'General',
    objective: 'Product promotion',
    product_name_placeholder: 'PulseFlow Hydration Bottle',
    product_description_placeholder: 'Smart self-cleaning water bottle with built-in LED hydration reminders and temperature sensing cap.',
    additional_instructions: 'Use vibrant emojis, line break dividers, and 5 niche hashtags.'
  },
  {
    id: 'email-campaign',
    name: 'Email Campaign',
    category: 'Direct Response',
    description: 'Full email drip campaign with curiosity subject line, preview snippet, problem-solution body, and CTA button.',
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
    name: 'Job/Internship Announcement',
    category: 'Recruitment',
    description: 'Engaging recruitment post highlighting company culture, role responsibilities, and application link.',
    platform: 'LinkedIn',
    tone: 'Friendly',
    audience: 'Students',
    objective: 'Announcement',
    product_name_placeholder: 'DecodeLabs AI Internship',
    product_description_placeholder: 'A hands-on 12-week intensive generative AI internship program building real-world LLM applications, custom prompt compilers, and full-stack software.',
    additional_instructions: 'Highlight learning opportunities, mentorship, and key prerequisites. End with application link.'
  },
  {
    id: 'educational-post',
    name: 'Educational Post',
    category: 'Content Marketing',
    description: '5-step breakdown post providing immediate value and positioning product as the fastest solution.',
    platform: 'X/Twitter',
    tone: 'Technical',
    audience: 'Developers',
    objective: 'Educational',
    product_name_placeholder: 'FastVector DB',
    product_description_placeholder: 'Ultra-fast embedded vector database optimized for Python and Rust with sub-millisecond similarity search.',
    additional_instructions: 'Format as a punchy thread or concise post with code/step breakdown.'
  }
];

export const generateDemoContentFallback = (req: GenerateRequest): GenerationResponse => {
  const { product_name, product_description, platform, tone, audience, objective } = req;
  const descSnippet = product_description.length > 120 ? product_description.slice(0, 120) + '...' : product_description;
  const cleanName = product_name.replace(/\s+/g, '');
  const cleanAudience = typeof audience === 'string' ? audience.replace(/\s+/g, '') : 'Audience';

  let rawText = '';
  let emailData: EmailFormattedContent | null = null;

  if (platform === 'LinkedIn') {
    rawText = `🚀 Exciting News: Introducing ${product_name}!

Most ${audience.toString().toLowerCase()} face a constant challenge when trying to elevate their workflow and productivity. Traditional tools fall short, leaving teams scrambling for efficient solutions.

${product_name} changes the game.

Key features designed for modern teams:
• Built for speed: ${descSnippet}
• Automated efficiency designed specifically for ${audience}
• Seamless integration into your existing stack

Whether your goal is ${objective.toLowerCase()} or scaling your impact, ${product_name} empowers you to achieve more in less time.

What's your biggest hurdle in this domain right now? Let's discuss in the comments below! 👇

#Innovation #Technology #${cleanName} #Productivity #${cleanAudience}`;
  } else if (platform === 'Instagram') {
    rawText = `✨ Transform the way you work with ${product_name}! 🔥

Say goodbye to outdated workarounds! 👋 ${product_name} is here to revolutionize how ${audience.toString().toLowerCase()} approach every project.

💡 Why you'll love it:
👉 ${descSnippet}
👉 Designed for effortless results
👉 Tailored for ${objective.toLowerCase()}

Ready to take your results to the next level? 🚀

👇 Drop a '🔥' in the comments or click the link in our bio to learn more today!

.
.
#${cleanName} #Innovation #${cleanAudience} #Productivity #NewRelease`;
  } else if (platform === 'X/Twitter') {
    rawText = `Stop struggling with inefficient tools. Meet ${product_name} ⚡

${descSnippet}

Built specifically for ${audience.toString().toLowerCase()} focused on ${objective.toLowerCase()}.

Try it today and experience the difference: https://copyforge.ai/${product_name.toLowerCase().replace(/\s+/g, '-')} 🚀

#${cleanName} #Tech`;
  } else if (platform === 'Email') {
    const subj = `[Launch] Introducing ${product_name} – Designed for ${audience}`;
    const prev = `Experience ${descSnippet.slice(0, 50)}...`;
    const bodyText = `Hi there,

We are thrilled to announce the official release of ${product_name}!

If you're like most ${audience.toString().toLowerCase()}, finding a solution that balances power with ease of use has always been a challenge. We built ${product_name} specifically to solve this.

${product_description}

Here is what makes ${product_name} unique:
1. High-speed performance tailored to your exact needs.
2. Built-in intelligence that streamlines repetitive tasks.
3. Designed from the ground up for ${objective.toLowerCase()}.

CALL TO ACTION:
[ Claim Your Free Trial Now ]

SIGN-OFF:
Best regards,
The ${product_name} Team`;

    rawText = `SUBJECT LINE: ${subj}\nPREVIEW TEXT: ${prev}\n\n${bodyText}`;
    emailData = {
      subject: subj,
      preview_text: prev,
      body: bodyText
    };
  } else if (platform === 'Facebook') {
    rawText = `Meet ${product_name} – The ultimate solution for ${audience.toString().toLowerCase()}! 🎉

Are you ready to upgrade your daily routine? ${product_name} was engineered to help you master ${objective.toLowerCase()} without the headache.

Here's the takeaway:
"${descSnippet}"

We built this for people who demand quality, reliability, and speed.

Have questions about how ${product_name} can work for you? Send us a message or comment below and our team will get back to you!

👉 Learn more at: https://copyforge.ai/${product_name.toLowerCase().replace(/\s+/g, '-')}`;
  } else {
    // Website
    rawText = `# Elevate Your Experience with ${product_name}

## The Ultimate Solution Built for ${audience}

${product_name} empowers you to achieve ${objective.toLowerCase()} effortlessly with smart, modern tools designed for maximum impact.

### Key Benefits
• **Unmatched Efficiency**: ${descSnippet}
• **Tailored Workflow**: Seamlessly customized for ${audience.toString().toLowerCase()}.
• **Proven Reliability**: Built with production-grade engineering at every level.

### Call to Action
[ Start Your Free Trial Today ] — No credit card required.`;
  }

  const words = rawText.split(/\s+/).length;
  const chars = rawText.length;
  const genId = 'demo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const createdAt = new Date().toISOString();

  const compiledPrompt = `System: You are CopyForge AI, an elite AI Copywriter specialized in crafting high-converting marketing copy for ${platform}.
Tone Directive: ${tone} tone with high engagement.
Target Platform: ${platform}
Objective: ${objective}
Target Audience: ${audience}

User Content Brief:
- Product Name: ${product_name}
- Product Description: ${product_description}
- Custom Instructions: ${req.additional_instructions || 'None'}`;

  const formattedContent: FormattedContent = {
    raw_text: rawText,
    email_data: emailData,
    twitter_char_count: platform === 'X/Twitter' ? chars : null,
    twitter_limit: 280,
    instagram_recommended: platform === 'Instagram' ? 'Recommended caption length: 150-300 words.' : null,
    word_count: words,
    char_count: chars,
  };

  const validationResult: PlatformValidationResult = {
    is_valid: true,
    passed_rules: [
      `Output compiled for ${platform}`,
      `Non-empty response verified (${words} words)`,
      `Tone '${tone}' directives applied`
    ],
    warnings: [],
    platform_constraints: { platform, tone, target_words: words, target_chars: chars }
  };

  const responseObj: GenerationResponse = {
    id: genId,
    product_name,
    product_description,
    platform,
    tone,
    audience: audience.toString(),
    objective,
    prompt_parameters: req.parameters,
    compiled_prompt: compiledPrompt,
    generated_content: rawText,
    formatted_content: formattedContent,
    platform_validation: validationResult,
    is_demo_mode: true,
    is_saved: false,
    created_at: createdAt
  };

  // Save to LocalStorage History
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    const historyList: HistoryItem[] = existingStr ? JSON.parse(existingStr) : [];
    const historyItem: HistoryItem = {
      id: genId,
      product_name,
      product_description,
      platform,
      tone,
      audience: audience.toString(),
      objective,
      generated_content: rawText,
      prompt_parameters: req.parameters,
      is_saved: false,
      created_at: createdAt
    };
    historyList.unshift(historyItem);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(historyList.slice(0, 50)));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  return responseObj;
};

export const improveDemoContentFallback = (req: ImproveRequest): GenerationResponse => {
  const { current_content, action, product_name, platform, tone } = req;
  let improved = current_content;

  if (action === 'make_shorter') {
    const words = current_content.split(' ');
    improved = words.slice(0, Math.max(15, Math.floor(words.length / 2))).join(' ') + '...';
  } else if (action === 'make_longer') {
    improved = current_content + `\n\n🔥 Key Advantage: ${product_name} comes with 24/7 dedicated support and automated workflow integration built specifically for speed.`;
  } else if (action === 'enhance_persuasion') {
    improved = `⚡ Don't settle for average results. ${current_content}\n\n👉 Join over 10,000+ teams who upgraded to ${product_name} today!`;
  }

  const genReq: GenerateRequest = {
    product_name,
    product_description: `Refined (${action})`,
    platform: req.new_platform || platform,
    tone: req.new_tone || tone,
    audience: 'Refined',
    objective: 'Product promotion',
    parameters: req.parameters
  };

  const res = generateDemoContentFallback(genReq);
  res.generated_content = improved;
  res.formatted_content.raw_text = improved;
  res.formatted_content.word_count = improved.split(/\s+/).length;
  res.formatted_content.char_count = improved.length;
  return res;
};

export const getDemoHistoryFallback = (
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

export const toggleDemoSaveFallback = (id: string): boolean => {
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

export const deleteDemoItemFallback = (id: string): boolean => {
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
