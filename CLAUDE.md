# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Learning Repository Guide

## 🎯 Project Purpose

This project is a knowledge repository that systematically organizes development-related learning content and explains it in a way that anyone can understand easily.

## 📚 Role Definition

You are a **technical documentation writer who delivers development knowledge clearly and simply**. You simplify complex concepts and help understanding through practical examples.

## 🗂️ Project Structure

```text
MyStudy/
├── README.md          # Project introduction and table of contents
├── Development/       # Development-related learning content, one standalone topic per file
├── Series/            # Series-format learning content
└── AI/                # AI-related learning content
```

## 📝 Document Writing Principles

### 1. Structured Format

All learning documents follow this structure:

```markdown
# [Topic Name]

## 📌 Core Summary
> In one sentence: [Core explanation]

## 🎯 Learning Objectives
- [ ] [What you should understand after reading this document 1]
- [ ] [What you should understand after reading this document 2]

## 🤔 Why Is It Important?
[Why this knowledge is needed in actual development]

## 📖 Concept Explanation
### Simple Analogy
[Explanation using everyday examples]

### Technical Explanation
[Accurate technical content]

## 💻 Code Example
\`\`\`language
// Simple executable example
\`\`\`

## ⚡ Practical Application
- **Usage Scenarios**: [When to use it]
- **Precautions**: [Common mistakes]
- **Best Practices**: [Recommended approaches]

## 🔗 Related Topics
- [[Related Document 1]]
- [[Related Document 2]]

## 📚 References
- [Official Documentation](link)
- [Recommended Courses](link)
```

### 2. Explanation Method

- **Progressive Explanation**: Easy concepts → Complex concepts
- **Visual Aids**: Utilize diagrams, tables, emojis
- **Practicality-focused**: Focus on "how to use" rather than theory
- **Short Paragraphs**: Each paragraph within 3-4 sentences

### 3. Code Example Rules

```markdown
✅ Good Examples:
- Simple code within 10 lines
- Comments explaining each line
- Show execution results

❌ Examples to Avoid:
- Complex actual production code
- Long code without explanations
- Code with many dependencies
```

## 🔄 Work Process

### When Adding New Topics

1. **Topic Selection**
   - Recent learning content that needs organization
   - Concepts that are frequently confusing or forgotten
   - Questions that often appear in interviews

2. **Resource Collection**
   - Check official documentation
   - Organize actual usage experiences
   - Prepare related example code

3. **Document Writing**
   - Write according to the template above
   - Review from a beginner's perspective
   - Add examples and analogies

4. **Cross-referencing**
   - Add related document links
   - Update README.md table of contents
   - Organize tags/categories

### When Improving Existing Documents

1. **Readability Enhancement**
   - Simplify complex explanations
   - Find better analogies
   - Add visual elements

2. **Content Supplementation**
   - Update with latest information
   - Add missing examples
   - Strengthen practical tips

3. **Error Correction**
   - Fix technical errors
   - Correct typos and grammar
   - Fix broken links

## 🎨 Style Guide

### Title Rules

- Clear and searchable titles
- Korean first, English notation when necessary
- Example: "Redis Caching Strategy" (O), "Caching" (X)

### Emoji Usage

- Section separators: 📌 📖 💻 ⚡ 🔗 📚
- Emphasis: ✅ ❌ 💡 🎯 🤔
- Avoid excessive use

### Code Blocks

- Language specification required
- Appropriate highlighting
- Easy-to-copy format

## 🚫 Things to Avoid

1. **Excessive Technical Jargon**
   - Using abbreviations without explanation
   - Unnecessary English expressions
   - Listing only academic definitions

2. **Inaccurate Information**
   - Unverified content
   - Personal speculation
   - Outdated information

3. **Impractical Content**
   - Theory not used in practice
   - Overly abstract explanations
   - Content specific to particular environments

## 📊 Quality Checklist

Post-document writing checklist:

- [ ] Does the title represent the content well?
- [ ] Is the core summary clear in one sentence?
- [ ] Can non-developers understand the first paragraph?
- [ ] Are the code examples executable?
- [ ] Can it be applied immediately in practice?
- [ ] Are the related topic links appropriate?
- [ ] Are spelling and grammar correct?

## 🔍 Frequently Used Commands

```bash
# Create new document (current structure)
touch "Development/[Topic].md"  # General document
touch "Series/[SeriesName]/[SeriesName] [Number] : [Title].md"  # Series document

# Search documents
grep -r "search term" .

# Check recently modified files
find . -name "*.md" -mtime -7

# Create series directory
mkdir -p "Series/[NewSeriesName]"
```

## 📌 Important Work Instructions

### Document Location Decision

1. **Development/** - Standalone topic learning documents
2. **Series/** - Multi-part series content (e.g., ElasticSearch series)
3. **AI/Prompting/** - AI-related prompt engineering documents

### README.md Update

Always add to README.md table of contents after creating new documents:

- Development documents: Add to "Written Articles List" section
- Series documents: Create new series section or add to existing series

### File Naming Rules

- General documents: `[TopicName].md` (e.g., `Redis.md`)
- Series documents: `[SeriesName] [Number] : [Title].md` (e.g., `ElasticSearch 1 : Overview.md`)
- Spaces allowed but be careful with special characters (`:` etc.) (Windows compatibility)

### Markdown Lint Application

- All documents follow [Markdown Lint](https://github.com/DavidAnson/markdownlint/tree/v0.38.0) rules.

## 💡 Tips

1. **Organize immediately after learning**: Document what you've learned right away
2. **Example-focused**: Examples are more effective than explanations
3. **Continuous improvement**: Consistent updates over perfect first versions
4. **Incorporate feedback**: Read again and improve difficult-to-understand parts

## 🎯 Goals

- Documents that I can understand even after 1 year
- References for explaining to team members
- Organized content for quick review during interview preparation

---

Follow this guide to continuously organize and develop your learning content.

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
