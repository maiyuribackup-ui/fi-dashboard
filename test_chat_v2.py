#!/usr/bin/env python3
"""
Improved chatbot test - specifically looking for Vue components
"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    print("=" * 60)
    print("CHATBOT FUNCTIONALITY TEST")
    print("=" * 60)

    # Navigate
    print("\n📍 Step 1: Loading site...")
    page.goto("https://finance.maiyuri.com", wait_until="networkidle")
    page.wait_for_timeout(3000)
    print("   ✅ Site loaded")

    # Save initial state
    page.screenshot(path="/tmp/chat_v2_1_initial.png")

    # Look for the chat widget container (fixed bottom-6 right-6)
    print("\n📍 Step 2: Finding chat widget...")

    # The widget has class "fixed bottom-6 right-6 z-50"
    widget = page.locator(".fixed.bottom-6.right-6").first
    if widget.count() > 0:
        print("   ✅ Chat widget container found")
    else:
        # Try alternative
        widget = page.locator("[class*='z-50'][class*='fixed']").first

    # Find the toggle button (should be the one with gradient or slate bg)
    toggle_button = page.locator(".fixed.bottom-6.right-6 button").first
    if toggle_button.count() > 0:
        print("   ✅ Toggle button found")

        # Check for pulse animation (indicates closed state)
        pulse = page.locator(".animate-ping").count()
        print(f"   Pulse animation present: {pulse > 0} (indicates closed state)")

        # Click to open
        print("\n📍 Step 3: Opening chat window...")
        toggle_button.click()
        page.wait_for_timeout(2000)  # Wait for transition

        page.screenshot(path="/tmp/chat_v2_2_after_click.png")

        # Look for the ChatWindow (has bg-slate-800 rounded-2xl)
        chat_window = page.locator(".bg-slate-800.rounded-2xl").first
        if chat_window.count() > 0:
            print("   ✅ Chat window opened!")

            # Check for header with "FI Assistant"
            header = page.locator("h3:has-text('FI Assistant')").count()
            print(f"   FI Assistant header: {'Found' if header > 0 else 'Not found'}")

            # Check for the textarea in the input area
            textarea = page.locator("textarea").first
            if textarea.count() > 0:
                print("   ✅ Textarea found!")

                # Get placeholder
                placeholder = textarea.get_attribute("placeholder")
                print(f"   Placeholder: '{placeholder}'")

                # Type a message
                print("\n📍 Step 4: Testing message input...")
                textarea.fill("What's my net worth?")
                page.screenshot(path="/tmp/chat_v2_3_typed.png")
                print("   ✅ Typed test message")

                # Find send button (emerald bg)
                send_btn = page.locator("button.bg-emerald-600").first
                if send_btn.count() > 0:
                    print("   ✅ Send button found")

                    print("\n📍 Step 5: Sending message...")
                    send_btn.click()
                    print("   Message sent, waiting for response...")

                    # Wait for response (up to 15 seconds)
                    for i in range(15):
                        page.wait_for_timeout(1000)
                        # Check for message bubbles
                        messages = page.locator("[class*='rounded-2xl'][class*='px-4']").all()
                        # Filter to actual message bubbles (not the whole window)
                        if len(messages) > 1:
                            print(f"   ✅ Response received! Found {len(messages)} message bubbles")
                            break
                        print(f"   Waiting... ({i+1}s)")

                    page.screenshot(path="/tmp/chat_v2_4_response.png")
                else:
                    print("   ⚠️ Send button not found")
            else:
                print("   ⚠️ Textarea not found in chat window")

            # Check for voice button
            print("\n📍 Step 6: Checking voice button...")
            # VoiceButton has specific styling
            voice_buttons = page.locator("button").all()
            voice_found = False
            for btn in voice_buttons:
                try:
                    # Look for mic-related text or SVG
                    html = btn.inner_html()
                    if "listening" in html.lower() or "Start" in html:
                        voice_found = True
                        break
                except:
                    pass

            # Alternatively, look for button with specific styling near textarea
            voice_btn_area = page.locator(".flex.items-end.gap-2 button").first
            if voice_btn_area.count() > 0:
                voice_found = True

            print(f"   Voice button: {'Found' if voice_found else 'Not found'}")

            # Check quick suggestions
            print("\n📍 Step 7: Checking quick suggestions...")
            add_expense = page.locator("button:has-text('Add expense')").count()
            my_networth = page.locator("button:has-text('My net worth')").count()
            fi_progress = page.locator("button:has-text('FI progress')").count()

            suggestions_found = add_expense + my_networth + fi_progress
            print(f"   Quick suggestions found: {suggestions_found}/3")

        else:
            print("   ⚠️ Chat window did not open")

            # Debug: what elements exist in the widget?
            inner = widget.inner_html()
            print(f"\n   Widget HTML (first 500 chars):\n   {inner[:500]}")

    else:
        print("   ❌ Toggle button not found")

    # Final summary
    page.screenshot(path="/tmp/chat_v2_final.png")

    print("\n" + "=" * 60)
    print("📸 Screenshots saved to /tmp/chat_v2_*.png")
    print("   - chat_v2_1_initial.png")
    print("   - chat_v2_2_after_click.png")
    print("   - chat_v2_3_typed.png")
    print("   - chat_v2_4_response.png")
    print("   - chat_v2_final.png")
    print("=" * 60)

    browser.close()
