import re

with open('/Users/akshit/Downloads/DataGem-main/datagem_frontend/src/components/Chat.jsx', 'r') as f:
    content = f.read()

# Task 1: Fix Light Mode Camouflage
# "Ensure all primary buttons have a dark background in light mode"
# Look for bg-gray-900 text-white ... wait let's find the primary buttons.
content = re.sub(r'bg-gray-100 dark:bg-gray-700 text-gray-700', 'bg-gray-100 dark:bg-gray-700 text-gray-900', content)
content = content.replace('text-white border border-gray-300', 'text-gray-900 dark:text-white border border-gray-300')
# Update sidebar chat history button active state
content = content.replace("bg-gray-900 dark:bg-gray-600 text-white border border-gray-300 dark:border-gray-700 dark:border-gray-700",
                          "bg-gray-900 text-white dark:bg-gray-600 border border-gray-900 dark:border-gray-600")

# Task 2: Whitespace is King
content = content.replace("px-6 py-8", "px-8 py-12")
content = content.replace("px-6 py-5", "px-8 py-6")
content = content.replace("space-y-6 pb-24", "space-y-8 pb-32")

# Task 3: Mac-style Frosted Glass
content = re.sub(r'w-80 bg-gray-50 dark:bg-\[#212121\]', 'w-80 backdrop-blur-xl bg-white/70 dark:bg-[#171717]/80', content)
content = re.sub(r'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md', 'backdrop-blur-xl bg-white/70 dark:bg-[#171717]/80', content)

# Task 4: Typography Polish
content = content.replace("prose prose-sm", "prose prose-sm leading-relaxed")
# Paragraphs use dark:text-gray-300
# It looks like ReactMarkdown already does p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>
# It's already fine.

# Task 5: Micro-interactions
content = re.sub(r'initial=\{index >= messages\.length - 2 \? \{ opacity: 0, y: 20, scale: 0\.95 \} : false\}\s*animate=\{\{ opacity: 1, y: 0, scale: 1 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, x: message\.role === \'user\' \? 100 : -100 \}\}\s*transition=\{\{[^\}]*\}\}', 
                 r'initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  transition={{ duration: 0.3, ease: "easeOut" }}', content)

with open('/Users/akshit/Downloads/DataGem-main/datagem_frontend/src/components/Chat.jsx', 'w') as f:
    f.write(content)
