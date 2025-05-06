
"""
Automation Script: Generate Git Commit Message using OpenAI

- Analyzes current git status and file changes
- Sends the diff summary to OpenAI with a custom commit template prompt
- Prints a commit message that follows the project-specific format

Author: Nico D'Alessandro Calderon
Email:  nico.dalessandro@gmail.com
Date: 2025-05-06
Version: 1.0.0
License: MIT
"""

import os
import subprocess
from datetime import date
from openai import OpenAI
from shared.common_lib.emoji_logger import info, success, error

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()


# Load git status and staged diff
def get_git_diff_summary():
    """
    Get the summary of staged changes in the git repository.
    Returns:
        str: A summary of the staged changes.
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-status"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        error(f"Failed to get git diff: {e.stderr.strip()}")
        return ""

def run(model="gpt-4"):
    """
    Main function to run the script.
    Args:
        model (str): The OpenAI model to use for generating the commit message.
    """
    today = date.today().isoformat()
    diff_summary = get_git_diff_summary()

    if not diff_summary:
        error("No staged changes detected. Stage files with `git add` before running this script.")
        return

    # Prompt definition
    template_description = '''
    You are an expert in writing clean and expressive Git commit messages for professional software teams.

    Use the following template to create a commit message based on the staged file changes.

    Template format:

    <emoji> <TYPE> | <YYYY-MM-DD> | <Short Summary>

    - <Bullet 1: what was done + file/module affected>
    - <Bullet 2: why it was done or what problem it solves>
    - <Bullet 3: technical details or tools involved (optional)>

    <Optional final note explaining purpose, milestone reached, or broader impact>

    Available Types:
    🛠️ Setup, 📦 Feature, 🐛 Fix, 🔐 Config, 🗃️ DB, 📄 Docs, 🧪 Test, ♻️ Refactor, 🚀 Deploy
    '''

    prompt = f"""{template_description}

    Today's date: {today}

    The following files were staged for commit:
    {diff_summary}

    Please generate a well-structured commit message based on this.
    """

    try:
        info("Calling OpenAI to generate commit message...")
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that formats Git commit messages."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
        )
        message = response.choices[0].message.content
        success("Generated commit message:")
        print("\n" + message + "\n")
    except Exception as e:
        error(f"OpenAI API call failed: {e}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate a Git commit message from staged changes using OpenAI.")
    parser.add_argument("--model", type=str, default="gpt-4", help="OpenAI model to use")
    args = parser.parse_args()

    run(model=args.model)
