with open("datagem_frontend/src/components/Chat.jsx", "r") as f:
    content = f.read()

# Add styles for the glass-box
styles = """
<style>
.glass-box-step {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #94a3b8;
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.glass-box-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.glass-box-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
"""
if "glass-box-step" not in content:
    content = content.replace("export default function Chat() {", styles + "\nexport default function Chat() {")

# Write a replacement for message.content rendering
find_markdown = """{message.content && message.content.trim() ? ("""
replace_markdown = """{message.content && message.content.trim() ? (
                    <div>
                      {(() => {
                        const text = message.content;
                        const parts = text.split(/(\\[⚡ Returning instantaneous cached response.*?\\]|\\[🧠 AI Planner.*?\\]|🤖 \\*\\*Executing:\\*\\* `.*?`)/g);
                        return parts.map((part, i) => {
                          if (part.startsWith('[⚡ Returning')) {
                            return (
                              <div key={i} className="glass-box-step text-yellow-400 border-yellow-400/20 bg-yellow-900/10">
                                <div className="glass-box-icon">⚡</div>
                                <span>Cache Hit: Returning instantaneous response (Cost: $0.00)</span>
                              </div>
                            );
                          } else if (part.startsWith('[🧠 AI Planner')) {
                            return (
                              <div key={i} className="glass-box-step text-blue-400 border-blue-400/20 bg-blue-900/10">
                                <div className="glass-box-icon"><div className="glass-box-spinner"></div></div>
                                <span>AI Planner is evaluating execution strategy...</span>
                              </div>
                            );
                          } else if (part.startsWith('🤖 **Executing:**')) {
                            const toolMatch = part.match(/`(.*?)`/);
                            const toolName = toolMatch ? toolMatch[1] : 'script';
                            return (
                              <div key={i} className="glass-box-step text-emerald-400 border-emerald-400/20 bg-emerald-900/10">
                                <div className="glass-box-icon">⚙️</div>
                                <span>Sandboxed Execution: {toolName}()</span>
                              </div>
                            );
                          } else if (part.trim()) {
                            return ("""

find_markdown_end = """                            />
                          )
                        }
                      }}
                    />
                  ) : null}"""
replace_markdown_end = find_markdown_end + """
                          }
                          return null;
                        });
                      })()}
                    </div>
                  ) : null}"""

content = content.replace(find_markdown, replace_markdown)
content = content.replace(find_markdown_end, replace_markdown_end)

with open("datagem_frontend/src/components/Chat.jsx", "w") as f:
    f.write(content)
print("Glass-Box UI patched!")
