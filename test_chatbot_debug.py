#!/usr/bin/env python3
"""Debug script to inspect the chat window DOM"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    print("Navigating to finance.maiyuri.com...")
    page.goto("https://finance.maiyuri.com", wait_until="networkidle")
    page.wait_for_timeout(2000)

    # Find and click chat button
    buttons = page.locator("button").all()
    print(f"\nFound {len(buttons)} buttons on page")

    chat_button = None
    for i, btn in enumerate(buttons):
        box = btn.bounding_box()
        if box and box["x"] > 1000 and box["y"] > 600:
            chat_button = btn
            print(f"Found chat button at ({box['x']}, {box['y']})")
            break

    if chat_button:
        print("\nClicking chat button...")
        chat_button.click()
        page.wait_for_timeout(2000)

        # Save screenshot
        page.screenshot(path="/tmp/chat_debug.png")
        print("Screenshot saved to /tmp/chat_debug.png")

        # Find all textareas
        textareas = page.locator("textarea").all()
        print(f"\nFound {len(textareas)} textarea(s)")
        for i, ta in enumerate(textareas):
            try:
                placeholder = ta.get_attribute("placeholder")
                visible = ta.is_visible()
                box = ta.bounding_box()
                print(f"  Textarea {i}: placeholder='{placeholder}', visible={visible}, box={box}")
            except Exception as e:
                print(f"  Textarea {i}: error - {e}")

        # Find all inputs
        inputs = page.locator("input").all()
        print(f"\nFound {len(inputs)} input(s)")
        for i, inp in enumerate(inputs):
            try:
                type_attr = inp.get_attribute("type")
                placeholder = inp.get_attribute("placeholder")
                visible = inp.is_visible()
                print(f"  Input {i}: type='{type_attr}', placeholder='{placeholder}', visible={visible}")
            except Exception as e:
                print(f"  Input {i}: error - {e}")

        # Check for the specific chat window structure
        print("\nChecking for chat window elements...")

        # Check for FI Assistant header
        fi_header = page.locator("text=FI Assistant").count()
        print(f"  'FI Assistant' header found: {fi_header > 0}")

        # Check for message area
        message_area = page.locator("[class*='overflow-y-auto']").count()
        print(f"  Message area found: {message_area > 0}")

        # Check for input area
        input_area = page.locator("[class*='border-t']").count()
        print(f"  Input area found: {input_area > 0}")

        # Print the HTML of the chat window
        print("\n--- Chat Window HTML Preview ---")
        try:
            chat_container = page.locator("[class*='fixed'][class*='bottom']").first
            html = chat_container.inner_html()
            # Print first 2000 chars
            print(html[:2000])
        except Exception as e:
            print(f"Error getting HTML: {e}")

    browser.close()
