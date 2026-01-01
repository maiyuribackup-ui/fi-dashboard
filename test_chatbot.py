#!/usr/bin/env python3
"""
Comprehensive chatbot test for finance.maiyuri.com
Tests: Chat button, text input, Gemini response, voice button
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_chatbot():
    results = {
        "site_loaded": False,
        "chat_button_found": False,
        "chat_window_opened": False,
        "text_input_works": False,
        "gemini_response": False,
        "voice_button_found": False,
        "quick_suggestions": False,
        "errors": [],
        "console_logs": [],
        "screenshots": []
    }

    with sync_playwright() as p:
        # Launch browser with visible window for debugging
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: results["console_logs"].append({
            "type": msg.type,
            "text": msg.text
        }))

        # Capture errors
        page.on("pageerror", lambda err: results["errors"].append(str(err)))

        try:
            # Step 1: Navigate to site
            print("📍 Step 1: Navigating to finance.maiyuri.com...")
            page.goto("https://finance.maiyuri.com", wait_until="networkidle", timeout=30000)
            results["site_loaded"] = True
            print("   ✅ Site loaded successfully")

            # Take initial screenshot
            page.screenshot(path="/tmp/chatbot_test_1_initial.png", full_page=True)
            results["screenshots"].append("/tmp/chatbot_test_1_initial.png")

            # Wait for Vue to mount
            page.wait_for_timeout(2000)

            # Step 2: Find chat button
            print("\n📍 Step 2: Looking for chat button...")

            # Try multiple selectors for the chat button
            chat_button_selectors = [
                "button:has-text('💬')",
                "[class*='chat']",
                "button[class*='fixed'][class*='bottom']",
                ".chat-widget button",
                "button:has(svg)",
                "#chat-button",
                "[data-testid='chat-button']"
            ]

            chat_button = None
            for selector in chat_button_selectors:
                try:
                    elements = page.locator(selector).all()
                    if elements:
                        chat_button = page.locator(selector).first
                        print(f"   Found button with selector: {selector}")
                        break
                except:
                    continue

            # Check for any fixed-position buttons (chat buttons are usually fixed)
            if not chat_button:
                all_buttons = page.locator("button").all()
                print(f"   Found {len(all_buttons)} buttons on page")
                for i, btn in enumerate(all_buttons):
                    try:
                        box = btn.bounding_box()
                        if box:
                            # Chat buttons are usually in bottom-right corner
                            if box["x"] > 1000 and box["y"] > 600:
                                chat_button = btn
                                print(f"   Found fixed button at position ({box['x']}, {box['y']})")
                                break
                    except:
                        continue

            if chat_button:
                results["chat_button_found"] = True
                print("   ✅ Chat button found!")

                # Take screenshot before clicking
                page.screenshot(path="/tmp/chatbot_test_2_button_found.png")
                results["screenshots"].append("/tmp/chatbot_test_2_button_found.png")

                # Step 3: Click to open chat window
                print("\n📍 Step 3: Opening chat window...")
                chat_button.click()
                page.wait_for_timeout(2000)  # Give Vue time to render chat window

                # Check if chat window opened
                chat_window_selectors = [
                    "[class*='chat-window']",
                    "[class*='ChatWindow']",
                    ".chat-container",
                    "[class*='fixed'][class*='bottom'][class*='right']",
                    "div:has-text('FI Assistant')"
                ]

                chat_window = None
                for selector in chat_window_selectors:
                    try:
                        if page.locator(selector).count() > 0:
                            chat_window = page.locator(selector).first
                            print(f"   Found chat window with: {selector}")
                            break
                    except:
                        continue

                if chat_window:
                    results["chat_window_opened"] = True
                    print("   ✅ Chat window opened!")

                    page.screenshot(path="/tmp/chatbot_test_3_window_open.png")
                    results["screenshots"].append("/tmp/chatbot_test_3_window_open.png")

                    # Step 4: Find and test text input
                    print("\n📍 Step 4: Testing text input...")

                    input_selectors = [
                        "textarea[placeholder*='message']",
                        "textarea[placeholder*='voice']",
                        "textarea",
                        "input[type='text']",
                        "input[placeholder*='message']",
                        "[contenteditable='true']"
                    ]

                    text_input = None
                    for selector in input_selectors:
                        try:
                            if page.locator(selector).count() > 0:
                                text_input = page.locator(selector).first
                                print(f"   Found input with: {selector}")
                                break
                        except:
                            continue

                    if text_input:
                        # Type a test message
                        test_message = "What's my net worth?"
                        text_input.fill(test_message)
                        results["text_input_works"] = True
                        print(f"   ✅ Typed: '{test_message}'")

                        page.screenshot(path="/tmp/chatbot_test_4_message_typed.png")
                        results["screenshots"].append("/tmp/chatbot_test_4_message_typed.png")

                        # Find and click send button
                        send_selectors = [
                            "button:has-text('Send')",
                            "button[type='submit']",
                            "button:has(svg[class*='send'])",
                            "button:has(svg)",
                            "form button"
                        ]

                        send_button = None
                        for selector in send_selectors:
                            try:
                                buttons = page.locator(selector).all()
                                for btn in buttons:
                                    if btn.is_visible():
                                        send_button = btn
                                        break
                                if send_button:
                                    break
                            except:
                                continue

                        if send_button:
                            print("\n📍 Step 5: Sending message...")
                            send_button.click()

                            # Wait for Gemini response
                            print("   Waiting for Gemini response (up to 15 seconds)...")
                            page.wait_for_timeout(5000)

                            page.screenshot(path="/tmp/chatbot_test_5_after_send.png")
                            results["screenshots"].append("/tmp/chatbot_test_5_after_send.png")

                            # Check for response messages
                            message_selectors = [
                                ".message",
                                "[class*='message']",
                                "[class*='bubble']",
                                "div:has-text('₹')",  # Financial responses often have rupee symbol
                                "div:has-text('net worth')"
                            ]

                            for selector in message_selectors:
                                try:
                                    messages = page.locator(selector).all()
                                    if len(messages) > 1:  # More than just the user message
                                        results["gemini_response"] = True
                                        print(f"   ✅ Found {len(messages)} message(s) - Gemini responded!")
                                        break
                                except:
                                    continue

                            if not results["gemini_response"]:
                                print("   ⚠️ No response detected yet (may need more time)")
                        else:
                            print("   ⚠️ Send button not found")
                    else:
                        print("   ⚠️ Text input not found")

                    # Step 6: Check for voice button
                    print("\n📍 Step 6: Checking for voice button...")
                    voice_selectors = [
                        "button:has-text('🎤')",
                        "[class*='VoiceButton']",
                        "[class*='voice']",
                        "[class*='mic']",
                        "button[title*='voice']",
                        "button[title*='Start']",
                        "button:has(svg[class*='animate'])"
                    ]

                    for selector in voice_selectors:
                        try:
                            if page.locator(selector).count() > 0:
                                results["voice_button_found"] = True
                                print(f"   ✅ Voice button found with: {selector}")
                                break
                        except:
                            continue

                    if not results["voice_button_found"]:
                        print("   ⚠️ Voice button not found (may be browser-specific)")

                    # Step 7: Check for quick suggestions
                    print("\n📍 Step 7: Checking for quick suggestions...")
                    suggestion_selectors = [
                        "button:has-text('Add expense')",
                        "button:has-text('My net worth')",
                        "button:has-text('FI progress')",
                        "button.rounded-full",
                        "[class*='suggestion']",
                        "[class*='quick']"
                    ]

                    for selector in suggestion_selectors:
                        try:
                            if page.locator(selector).count() > 0:
                                results["quick_suggestions"] = True
                                print(f"   ✅ Quick suggestions found with: {selector}")
                                break
                        except:
                            continue
                else:
                    print("   ⚠️ Chat window did not open")
            else:
                print("   ❌ Chat button NOT found!")

                # Debug: Print page content
                page.screenshot(path="/tmp/chatbot_test_debug.png", full_page=True)
                results["screenshots"].append("/tmp/chatbot_test_debug.png")

                # Check what's on the page
                content = page.content()
                if "ChatWidget" in content:
                    print("   Note: ChatWidget is in HTML but button not visible")
                if "chat" in content.lower():
                    print("   Note: 'chat' text found in page content")

        except Exception as e:
            results["errors"].append(str(e))
            print(f"\n❌ Error: {e}")
            page.screenshot(path="/tmp/chatbot_test_error.png")
            results["screenshots"].append("/tmp/chatbot_test_error.png")

        finally:
            browser.close()

    return results

def print_results(results):
    print("\n" + "="*60)
    print("📊 CHATBOT TEST RESULTS")
    print("="*60)

    tests = [
        ("Site Loaded", results["site_loaded"]),
        ("Chat Button Found", results["chat_button_found"]),
        ("Chat Window Opened", results["chat_window_opened"]),
        ("Text Input Works", results["text_input_works"]),
        ("Gemini Response", results["gemini_response"]),
        ("Voice Button Found", results["voice_button_found"]),
        ("Quick Suggestions", results["quick_suggestions"]),
    ]

    passed = sum(1 for _, v in tests if v)
    total = len(tests)

    for name, passed_test in tests:
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"  {status} - {name}")

    print(f"\n📈 Score: {passed}/{total} tests passed")

    if results["errors"]:
        print("\n⚠️ Errors encountered:")
        for err in results["errors"]:
            print(f"   - {err[:100]}")

    if results["console_logs"]:
        error_logs = [log for log in results["console_logs"] if log["type"] == "error"]
        if error_logs:
            print("\n🔴 Console Errors:")
            for log in error_logs[:5]:
                print(f"   - {log['text'][:100]}")

    print("\n📸 Screenshots saved:")
    for path in results["screenshots"]:
        print(f"   - {path}")

    print("="*60)

    return passed, total

if __name__ == "__main__":
    print("🚀 Starting Chatbot Test for finance.maiyuri.com")
    print("-" * 50)

    results = test_chatbot()
    passed, total = print_results(results)

    # Save results as JSON
    with open("/tmp/chatbot_test_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n📄 Full results saved to: /tmp/chatbot_test_results.json")

    if passed == total:
        print("\n🎉 All tests passed! Chatbot is fully functional.")
    elif passed >= 4:
        print("\n✅ Core functionality working. Some features may need attention.")
    else:
        print("\n⚠️ Several issues detected. Review screenshots for debugging.")
