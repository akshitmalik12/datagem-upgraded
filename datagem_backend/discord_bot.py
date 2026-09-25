"""
Discord Bot Integration for DataGem (Tier 5)
Handles Discord slash commands to query datasets and generate charts.
"""
import os
from dotenv import load_dotenv
load_dotenv()
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from chat.agentic_core import build_agent_graph
import discord
from discord.ext import commands

# Note: Requires `pip install discord.py`

class DataGemBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = False
        super().__init__(command_prefix="/", intents=intents)

    async def setup_hook(self):
        await self.tree.sync()
        print("Discord slash commands synced.")

bot = DataGemBot()

@bot.hybrid_command(name="analyze", description="Ask DataGem to analyze your data")
async def analyze(ctx, query: str):
    await ctx.send(f"🤖 **DataGem Thinking:** Analyzing request: `{query}`...")
    
    # Wire to LangGraph Agentic Core
    workflow = build_agent_graph()
    if not workflow:
        await ctx.send("❌ Error: LangGraph engine not initialized.")
        return
        
    initial_state = {"user_query": query, "dataset_schema": "Unknown", "execution_logs": [], "plan": []}
    
    # Run the state machine
    try:
        final_state = workflow.invoke(initial_state)
        
        # Format the dynamic response
        plan_str = "\n".join(final_state.get("plan", []))
        answer = final_state.get("final_answer", "")
        
        response_text = f"✅ **DataGem Analysis Complete**\n\n**Execution Plan:**\n{plan_str}\n\n**Conclusion:**\n{answer}"
        
        await ctx.send(response_text)
    except Exception as e:
        await ctx.send(f"❌ Execution Error: {e}")

if __name__ == "__main__":
    TOKEN = os.getenv("DISCORD_BOT_TOKEN")
    if TOKEN:
        print("Starting Discord Bot...")
        bot.run(TOKEN)
    else:
        print("ERROR: DISCORD_BOT_TOKEN not found in environment variables.")
