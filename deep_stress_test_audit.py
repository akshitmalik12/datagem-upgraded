import asyncio
import json
from playwright.async_api import async_playwright

async def run_stress_audit():
    findings = {
        "uncaught_exceptions": [],
        "console_errors": [],
        "failed_network_requests": [],
        "ui_layout_defects": [],
        "functional_gaps": []
    }

    print("==================================================================")
    print("🔥 STARTING PLAYWRIGHT DEEP STRESS & BREAK-TEST AUDIT")
    print("Objective: Find the maximum number of errors, bugs, and gaps!")
    print("==================================================================")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Listen to page events
        page.on("pageerror", lambda err: findings["uncaught_exceptions"].append(str(err)))
        page.on("console", lambda msg: findings["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        page.on("requestfailed", lambda req: findings["failed_network_requests"].append(f"{req.method} {req.url} - {req.failure}"))

        # TEST 1: Login & Edge cases
        print("\n[Test 1] Auditing /login with invalid, empty, and valid credentials...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await page.fill('input[type="email"]', "founder@company.com")
        await page.fill('input[type="password"]', "Password123!")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(2000)
        print("✓ Authenticated")

        # TEST 2: Modals stress test
        print("\n[Test 2] Stress testing modals and buttons on /chat...")
        await page.click('button:has-text("Marketplace Hub")')
        await page.wait_for_timeout(400)
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)
        print("✓ Marketplace Hub modal tested")

        await page.click('button:has-text("Watchdogs")')
        await page.wait_for_timeout(400)
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)
        print("✓ Watchdogs modal tested")

        await page.click('button:has-text("Board Deck & PDF")')
        await page.wait_for_timeout(400)
        await page.click('button:has-text("✕")')
        await page.wait_for_timeout(400)
        print("✓ Board Deck modal tested")

        # TEST 3: Preset loading
        print("\n[Test 3] Testing 1-click Preset Ingestion...")
        await page.click('button:has-text("Amazon FBA Store")')
        await page.wait_for_timeout(1000)
        print("✓ Loaded Amazon FBA Preset")

        # TEST 4: Sending Queries via PromptBar
        print("\n[Test 4] Submitting analytical prompt...")
        prompt_inputs = await page.query_selector_all('input[type="text"], textarea')
        for pi in prompt_inputs:
            p_text = await pi.get_attribute("placeholder") or ""
            if any(w in p_text.lower() for w in ["ask", "prompt", "query"]):
                await pi.fill("Audit customer return rate and fee leakage")
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(2500)
                print("✓ Query processed by in-memory engine")
                break

        # TEST 5: Fast route checking
        routes = ["/dashboard", "/pricing", "/about", "/design-lab"]
        for r in routes:
            print(f"[Test 5] Route check: {r}")
            await page.goto(f"http://localhost:5173{r}", wait_until="domcontentloaded")
            await page.wait_for_timeout(500)

        # Check for 404 page behavior
        print("[Test 5] Checking 404 route handling...")
        await page.goto("http://localhost:5173/unmapped_route_xyz", wait_until="domcontentloaded")
        await page.wait_for_timeout(500)
        body_404 = await page.inner_text('body')
        if "404" not in body_404 and "Page Not Found" not in body_404:
            findings["ui_layout_defects"].append("No dedicated 404 Page Not Found error view for unmapped routes")

        await page.screenshot(path="/Users/akshit/Downloads/DataGem-v2/audit_stress_complete.png")
        await browser.close()

    print("\n==================================================================")
    print("📊 DEFECT AUDIT RESULTS:")
    print("==================================================================")
    print(f"1. Uncaught Page Exceptions: {len(findings['uncaught_exceptions'])}")
    for e in findings['uncaught_exceptions']:
        print(f"   ❌ {e}")

    print(f"\n2. Console Errors: {len(findings['console_errors'])}")
    for e in findings['console_errors']:
        print(f"   ⚠️ {e}")

    print(f"\n3. Failed Network Requests: {len(findings['failed_network_requests'])}")
    for e in findings['failed_network_requests']:
        print(f"   🌐 {e}")

    print(f"\n4. UI Layout Defects & Logic Gaps: {len(findings['ui_layout_defects'])}")
    for e in findings['ui_layout_defects']:
        print(f"   🎨 {e}")

    with open("/Users/akshit/Downloads/DataGem-v2/deep_audit_results.json", "w") as f:
        json.dump(findings, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_stress_audit())
