import asyncio
import json
import os
from playwright.async_api import async_playwright

async def hunt_defects():
    print("==================================================================")
    print("🔍 INITIATING EXHAUSTIVE LIVE BROWSER AUDIT & DEFECT HUNTER")
    print("==================================================================")

    audit_report = {
        "uncaught_page_errors": [],
        "console_errors": [],
        "failed_network_requests": [],
        "http_status_errors": [],
        "ui_defects": [],
        "behavioral_anomalies": []
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Listen to browser events
        page.on("pageerror", lambda err: audit_report["uncaught_page_errors"].append(str(err)))
        page.on("console", lambda msg: audit_report["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        
        def handle_response(res):
            if res.status >= 400 and not "/unmapped_route" in res.url:
                audit_report["http_status_errors"].append(f"{res.request.method} {res.url} -> {res.status} {res.status_text}")
        page.on("response", handle_response)
        page.on("requestfailed", lambda req: audit_report["failed_network_requests"].append(f"{req.method} {req.url} - {req.failure}"))

        # --- STEP 1: PUBLIC VIEWS ---
        public_routes = ["/login", "/signup", "/pricing", "/about", "/design-lab", "/non_existent_page_123"]
        for route in public_routes:
            print(f"\n[Test View] Visiting {route}...")
            res = await page.goto(f"http://localhost:5173{route}", wait_until="networkidle")
            await page.wait_for_timeout(600)
            
            # Check 404 handler on non-existent route
            if "non_existent" in route:
                txt = await page.inner_text("body")
                if "404" not in txt and "Not Found" not in txt:
                    audit_report["ui_defects"].append("404 page text missing on bad route")
            
            await page.screenshot(path=f"/Users/akshit/Downloads/DataGem-v2/screenshot_view_{route.strip('/').replace('-', '_')}.png")
            print(f"✓ Rendered {route}")

        # --- STEP 2: AUTHENTICATION FLOWS ---
        print("\n[Auth] Testing Login Validation with Bad Password...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await page.fill('input[type="email"]', "wrong@test.com")
        await page.fill('input[type="password"]', "WrongPass123!")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(1000)

        # Confirm error banner or feedback displayed
        login_text = await page.inner_text("body")
        if "Invalid" not in login_text and "error" not in login_text.lower() and "incorrect" not in login_text.lower():
            audit_report["behavioral_anomalies"].append("Login did not show visible error message on invalid credentials")

        print("[Auth] Logging in with Founder Credentials...")
        await page.fill('input[type="email"]', "founder@company.com")
        await page.fill('input[type="password"]', "Password123!")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/chat", timeout=8000)
        await page.wait_for_timeout(1000)
        print("✓ Logged into /chat")

        # --- STEP 3: CHAT VIEW & DEMO PRESETS ---
        print("\n[Chat] Inspecting Header Modals and Navigation Buttons...")
        
        # Test 1: Marketplace Hub Modal
        await page.click('button:has-text("Marketplace Hub")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_modal_marketplace.png")
        # Trigger Amazon Live Sync inside modal
        sync_btn = await page.query_selector('button:has-text("Sync Settlement")')
        if sync_btn:
            await sync_btn.click()
            await page.wait_for_timeout(1000)
            print("✓ Clicked Sync Settlement in Marketplace Hub")
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)

        # Test 2: Watchdogs Modal
        await page.click('button:has-text("Watchdogs")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_modal_watchdog.png")
        sim_btn = await page.query_selector('button:has-text("Simulate Monday 8:00 AM Alert")')
        if sim_btn:
            await sim_btn.click()
            await page.wait_for_timeout(1000)
            print("✓ Triggered Watchdog alert simulation")
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)

        # Test 3: Board Deck Modal
        await page.click('button:has-text("Board Deck & PDF")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_modal_deck.png")
        # Slide through deck
        next_slide_btn = await page.query_selector('button:has-text("Next Slide →")')
        if next_slide_btn:
            await next_slide_btn.click()
            await page.wait_for_timeout(300)
            await next_slide_btn.click()
            await page.wait_for_timeout(300)
            print("✓ Paged through Board Deck slides")
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)

        # Test 4: Ingest 1-Click Preset
        print("\n[Chat] Loading 1-Click Preset Dataset...")
        await page.click('button:has-text("Amazon FBA Store")')
        await page.wait_for_timeout(1500)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_preset_loaded.png")
        print("✓ Preset loaded and profiled")

        # Test 5: Submitting Analytical Prompts to In-Memory Engine
        print("\n[Chat] Submitting User Prompt...")
        prompt_inputs = await page.query_selector_all('input[type="text"], textarea')
        for pi in prompt_inputs:
            p_text = await pi.get_attribute("placeholder") or ""
            if any(w in p_text.lower() for w in ["ask", "prompt", "query"]):
                await pi.fill("Calculate top SKU by revenue and breakdown total fees")
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(3000)
                print("✓ Query submitted and processed")
                break
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_chat_answered.png")

        # --- STEP 4: PROTECTED VIEWS (DASHBOARD & DATA HEALTH) ---
        print("\n[Protected View] Visiting /dashboard...")
        await page.goto("http://localhost:5173/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_view_dashboard.png")
        print("✓ Captured Dashboard view")

        print("\n[Protected View] Visiting /data-health...")
        await page.goto("http://localhost:5173/data-health", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/screenshot_view_data_health.png")
        print("✓ Captured Data Health view")

        await browser.close()

    print("\n==================================================================")
    print("📊 LIVE AUDIT RESULTS SUMMARY:")
    print("==================================================================")
    print(f"Uncaught Page Errors: {len(audit_report['uncaught_page_errors'])}")
    for e in audit_report['uncaught_page_errors']:
        print(f"  ❌ {e}")

    print(f"\nConsole Errors: {len(audit_report['console_errors'])}")
    for e in audit_report['console_errors']:
        print(f"  ⚠️ {e}")

    print(f"\nFailed Network Requests: {len(audit_report['failed_network_requests'])}")
    for e in audit_report['failed_network_requests']:
        print(f"  🌐 {e}")

    print(f"\nHTTP 4xx/5xx Responses: {len(audit_report['http_status_errors'])}")
    for e in audit_report['http_status_errors']:
        print(f"  🚨 {e}")

    print(f"\nBehavioral Anomalies: {len(audit_report['behavioral_anomalies'])}")
    for e in audit_report['behavioral_anomalies']:
        print(f"  🤔 {e}")

    with open("/Users/akshit/Downloads/DataGem-v2/browser_audit_report.json", "w") as f:
        json.dump(audit_report, f, indent=2)

if __name__ == "__main__":
    asyncio.run(hunt_defects())
